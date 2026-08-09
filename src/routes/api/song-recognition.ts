import { createFileRoute } from '@tanstack/react-router';

import { getAuth } from '@/core/auth';
import {
  AITaskStatus,
  createTask,
  updateTask,
} from '@/modules/ai-tasks/service';
import { validate as validateApiKey } from '@/modules/apikeys/service';
import { getAllConfigs } from '@/modules/config/service';
import { getBalance } from '@/modules/credits/service';
import {
  recognizeSong,
  SongRecognitionError,
} from '@/modules/song-recognition/service';
import { hasActivePaidMembership } from '@/modules/subscriptions/service';
import { enforceMinIntervalRateLimit } from '@/lib/rate-limit';
import { respData, respErr } from '@/lib/resp';

const MAX_URL_LENGTH = 4000;

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
      response: respErr('Sign in to use song recognition.', { status: 401 }),
    } as const;
  }
  return { userId: session.user.id, session } as const;
}

function recognitionCost(configs: Record<string, string>) {
  const value = Number.parseInt(
    configs.song_recognition_credit_cost ||
      process.env.SONG_RECOGNITION_CREDIT_COST ||
      '1',
    10
  );
  return Number.isFinite(value) ? Math.max(0, value) : 1;
}

async function POST({ request }: { request: Request }) {
  const limited = enforceMinIntervalRateLimit(request, {
    intervalMs: 1500,
    keyPrefix: 'song-recognition',
  });
  if (limited) return limited;

  const body = await request.json().catch(() => ({}));
  const mediaUrl =
    typeof body?.mediaUrl === 'string' ? body.mediaUrl.trim() : '';
  const sourceUrl =
    typeof body?.sourceUrl === 'string' ? body.sourceUrl.trim() : '';

  if (!mediaUrl) return respErr('A media URL is required.', { status: 400 });
  if (mediaUrl.length > MAX_URL_LENGTH) {
    return respErr('The media URL is too long.', { status: 400 });
  }

  const configs = await getAllConfigs();
  const resolved = await resolveUser(request, configs);
  if ('response' in resolved) return resolved.response;

  if (!(await hasActivePaidMembership(resolved.userId))) {
    return respErr('Song recognition requires an active paid membership.', {
      status: 403,
    });
  }

  const costCredits = recognitionCost(configs);
  const startingBalance = await getBalance(resolved.userId);
  if (startingBalance < costCredits) {
    return respErr('You need more credits to recognize this song.', {
      status: 402,
    });
  }

  let task: any;
  try {
    task = await createTask({
      userId: resolved.userId,
      mediaType: 'song-recognition',
      provider: 'audd',
      model: 'audd',
      prompt: 'Recognize the song from the supplied audio or video URL.',
      costCredits,
      options: { mediaUrl, sourceUrl: sourceUrl || undefined },
    });
    await updateTask({ taskId: task.id, status: AITaskStatus.PROCESSING });

    const result = await recognizeSong({
      mediaUrl,
      sourceUrl: sourceUrl || undefined,
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
              error instanceof SongRecognitionError
                ? error.code
                : 'SONG_RECOGNITION_FAILED',
            errorMessage:
              error instanceof Error
                ? error.message
                : 'Song recognition failed.',
          },
        });
      } catch (updateError) {
        console.error('[song/recognition] failed to update task', updateError);
      }
    }

    if (error instanceof SongRecognitionError) {
      return respErr(error.message, { status: error.status });
    }
    console.error('[song/recognition] failed', error);
    return respErr('Song recognition failed. Please try again.', {
      status: 502,
    });
  }
}

export const Route = createFileRoute('/api/song-recognition')({
  server: { handlers: { POST } },
});
