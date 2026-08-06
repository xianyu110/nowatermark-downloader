import { createFileRoute } from '@tanstack/react-router';

import { getAuth } from '@/core/auth';
import {
  AITaskStatus,
  createTask,
  findTask,
  updateTask,
} from '@/modules/ai-tasks/service';
import { validate as validateApiKey } from '@/modules/apikeys/service';
import { getAllConfigs } from '@/modules/config/service';
import { getBalance } from '@/modules/credits/service';
import { hasActivePaidMembership } from '@/modules/subscriptions/service';
import {
  transcribeMediaUrl,
  TranscriptionError,
} from '@/modules/transcription/service';
import { enforceMinIntervalRateLimit } from '@/lib/rate-limit';
import { respData, respErr } from '@/lib/resp';

const MAX_URL_LENGTH = 4000;
const MAX_PROMPT_LENGTH = 500;

function getBearerToken(request: Request) {
  const authorization = request.headers.get('authorization')?.trim() || '';
  if (!authorization) return { present: false, token: '' };
  const match = authorization.match(/^Bearer\s+(.+)$/i);
  return { present: true, token: match?.[1]?.trim() || '' };
}

function invalidApiKeyResponse() {
  return respErr('Invalid or revoked API key.', {
    status: 401,
    headers: { 'WWW-Authenticate': 'Bearer' },
  });
}

async function resolveUser(request: Request, configs: Record<string, string>) {
  const bearer = getBearerToken(request);
  if (bearer.present) {
    if (!/^sk_[A-Za-z0-9_-]{20,}$/.test(bearer.token)) {
      return { response: invalidApiKeyResponse() } as const;
    }
    const userId = await validateApiKey(bearer.token);
    if (!userId) return { response: invalidApiKeyResponse() } as const;
    return { userId, bearer } as const;
  }

  const session = await getAuth(configs).api.getSession({
    headers: request.headers,
  });
  if (!session?.user) {
    return {
      response: respErr('Sign in to use video transcription.', { status: 401 }),
    } as const;
  }
  return { userId: session.user.id, session } as const;
}

function parseCost(configs: Record<string, string>) {
  const value = Number.parseInt(
    configs.video_transcription_credit_cost ||
      process.env.VIDEO_TRANSCRIPTION_CREDIT_COST ||
      '1',
    10
  );
  return Number.isFinite(value) ? Math.max(0, value) : 1;
}

function parseTask(task: any) {
  let info: any = {};
  let result: any = {};
  try {
    info = task?.taskInfo ? JSON.parse(task.taskInfo) : {};
  } catch {
    info = {};
  }
  try {
    result = task?.taskResult ? JSON.parse(task.taskResult) : {};
  } catch {
    result = {};
  }
  return {
    id: task.id,
    status: task.status,
    createdAt: task.createdAt,
    updatedAt: task.updatedAt,
    ...info,
    ...(task.status === AITaskStatus.SUCCESS ? result : {}),
  };
}

async function GET({ request }: { request: Request }) {
  const configs = await getAllConfigs();
  const resolved = await resolveUser(request, configs);
  if ('response' in resolved) return resolved.response;

  if (!(await hasActivePaidMembership(resolved.userId))) {
    return respErr('Video transcription requires an active paid membership.', {
      status: 403,
    });
  }

  const taskId = new URL(request.url).searchParams.get('id')?.trim() || '';
  if (!taskId) return respErr('Task ID is required.', { status: 400 });

  const task = await findTask(taskId);
  if (
    !task ||
    task.userId !== resolved.userId ||
    task.mediaType !== 'transcription'
  ) {
    return respErr('Transcription task not found.', { status: 404 });
  }
  return respData(parseTask(task));
}

async function POST({ request }: { request: Request }) {
  const limited = enforceMinIntervalRateLimit(request, {
    intervalMs: 1500,
    keyPrefix: 'video-transcribe',
  });
  if (limited) return limited;

  const body = await request.json().catch(() => ({}));
  const mediaUrl =
    typeof body?.mediaUrl === 'string' ? body.mediaUrl.trim() : '';
  const language =
    typeof body?.language === 'string' ? body.language.trim() : '';
  const prompt = typeof body?.prompt === 'string' ? body.prompt.trim() : '';

  if (!mediaUrl)
    return respErr('A parsed media URL is required.', { status: 400 });
  if (mediaUrl.length > MAX_URL_LENGTH) {
    return respErr('The media URL is too long.', { status: 400 });
  }
  if (prompt.length > MAX_PROMPT_LENGTH) {
    return respErr('The transcription prompt is too long.', { status: 400 });
  }

  const configs = await getAllConfigs();
  const resolved = await resolveUser(request, configs);
  if ('response' in resolved) return resolved.response;

  if (!(await hasActivePaidMembership(resolved.userId))) {
    return respErr('Video transcription requires an active paid membership.', {
      status: 403,
    });
  }

  const costCredits = parseCost(configs);
  const startingBalance = await getBalance(resolved.userId);
  if (startingBalance < costCredits) {
    return respErr('You need more credits to transcribe this video.', {
      status: 402,
    });
  }

  let task: any;
  try {
    task = await createTask({
      userId: resolved.userId,
      mediaType: 'transcription',
      provider: 'openai-compatible',
      model:
        configs.video_transcription_model?.trim() ||
        process.env.VIDEO_TRANSCRIPTION_MODEL?.trim() ||
        'whisper-1',
      prompt: 'Transcribe the supplied video or audio.',
      costCredits,
      options: { mediaUrl, language: language || undefined },
    });
    await updateTask({ taskId: task.id, status: AITaskStatus.PROCESSING });

    const result = await transcribeMediaUrl({
      mediaUrl,
      language: language || undefined,
      prompt: prompt || undefined,
    });
    await updateTask({
      taskId: task.id,
      status: AITaskStatus.SUCCESS,
      taskResult: result,
    });

    return respData({
      taskId: task.id,
      status: AITaskStatus.SUCCESS,
      ...result,
      creditsRemaining: Math.max(0, startingBalance - costCredits),
    });
  } catch (error) {
    if (task?.id) {
      try {
        await updateTask({
          taskId: task.id,
          status: AITaskStatus.FAILED,
          taskResult: {
            errorCode:
              error instanceof TranscriptionError
                ? error.code
                : 'TRANSCRIPTION_FAILED',
            errorMessage:
              error instanceof Error ? error.message : 'Transcription failed.',
          },
        });
      } catch (updateError) {
        console.error('[video/transcribe] failed to update task', updateError);
      }
    }

    if (error instanceof TranscriptionError) {
      return respErr(error.message, {
        status: error.status,
      });
    }
    console.error('[video/transcribe] failed', error);
    return respErr('Video transcription failed. Please try again.', {
      status: 502,
    });
  }
}

export const Route = createFileRoute('/api/transcribe')({
  server: { handlers: { GET, POST } },
});
