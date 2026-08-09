import { createFileRoute } from '@tanstack/react-router';

import { getAuth } from '@/core/auth';
import { normalizeLocale, type SiteLocale } from '@/config/locale';
import {
  AITaskStatus,
  createTask,
  updateTask,
} from '@/modules/ai-tasks/service';
import { validate as validateApiKey } from '@/modules/apikeys/service';
import { getAllConfigs } from '@/modules/config/service';
import { getBalance } from '@/modules/credits/service';
import { hasActivePaidMembership } from '@/modules/subscriptions/service';
import {
  summarizeTranscript,
  VideoSummaryError,
} from '@/modules/video-summary/service';
import { enforceMinIntervalRateLimit } from '@/lib/rate-limit';
import { respData, respErr } from '@/lib/resp';

const MAX_TRANSCRIPT_LENGTH = 40_000;

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
      response: respErr('Sign in to use video summary.', { status: 401 }),
    } as const;
  }
  return { userId: session.user.id, session } as const;
}

function summaryCost(configs: Record<string, string>) {
  const value = Number.parseInt(
    configs.video_summary_credit_cost ||
      process.env.VIDEO_SUMMARY_CREDIT_COST ||
      '1',
    10
  );
  return Number.isFinite(value) ? Math.max(0, value) : 1;
}

async function POST({ request }: { request: Request }) {
  const limited = enforceMinIntervalRateLimit(request, {
    intervalMs: 1500,
    keyPrefix: 'video-summary',
  });
  if (limited) return limited;

  const body = await request.json().catch(() => ({}));
  const transcript =
    typeof body?.transcript === 'string' ? body.transcript.trim() : '';
  const locale = typeof body?.locale === 'string' ? body.locale.trim() : 'en';
  const summaryLocale = normalizeLocale(locale) as SiteLocale;

  if (!transcript) {
    return respErr('A transcript is required.', { status: 400 });
  }
  if (transcript.length > MAX_TRANSCRIPT_LENGTH) {
    return respErr('The transcript is too long.', { status: 400 });
  }

  const configs = await getAllConfigs();
  const resolved = await resolveUser(request, configs);
  if ('response' in resolved) return resolved.response;

  if (!(await hasActivePaidMembership(resolved.userId))) {
    return respErr('Video summary requires an active paid membership.', {
      status: 403,
    });
  }

  const costCredits = summaryCost(configs);
  const startingBalance = await getBalance(resolved.userId);
  if (startingBalance < costCredits) {
    return respErr('You need more credits to summarize this transcript.', {
      status: 402,
    });
  }

  let task: any;
  try {
    task = await createTask({
      userId: resolved.userId,
      mediaType: 'summary',
      provider: 'openai-compatible',
      model:
        configs.video_summary_model?.trim() ||
        process.env.VIDEO_SUMMARY_MODEL?.trim() ||
        'gpt-4o-mini',
      prompt: 'Summarize a public video transcript into structured notes.',
      costCredits,
      options: { transcriptLength: transcript.length, locale },
    });
    await updateTask({ taskId: task.id, status: AITaskStatus.PROCESSING });

    const result = await summarizeTranscript({
      transcript,
      locale: summaryLocale,
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
              error instanceof VideoSummaryError
                ? error.code
                : 'SUMMARY_FAILED',
            errorMessage:
              error instanceof Error ? error.message : 'Summary failed.',
          },
        });
      } catch (updateError) {
        console.error('[video/summary] failed to update task', updateError);
      }
    }

    if (error instanceof VideoSummaryError) {
      return respErr(error.message, {
        status: error.status,
      });
    }
    console.error('[video/summary] failed', error);
    return respErr('Video summary failed. Please try again.', {
      status: 502,
    });
  }
}

export const Route = createFileRoute('/api/video-summary')({
  server: { handlers: { POST } },
});
