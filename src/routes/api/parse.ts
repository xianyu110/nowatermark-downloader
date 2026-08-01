import { createFileRoute } from '@tanstack/react-router';

import { enforceMinIntervalRateLimit } from '@/lib/rate-limit';
import { respData, respErr } from '@/lib/resp';

const DEFAULT_BUGPK_API_URL = 'https://api.bugpk.com/api/wxsph';
const MAX_INPUT_LENGTH = 4000;
const REQUEST_TIMEOUT_MS = 20_000;
const RETRY_COUNT = 1;

type ParseProvider = {
  name: string;
  kind: 'cobalt' | 'bugpk';
  url: string;
};

type CobaltAuth =
  | {
      authorization: string;
    }
  | null;

type ParseError = Error & {
  authRequired?: boolean;
};

function extractUrl(value: string) {
  const match = value.match(/https?:\/\/[^\s]+/i);
  return (match?.[0] || value).replace(/[)\]}>，。！？；、]+$/g, '');
}

function firstString(...values: unknown[]) {
  return (
    values.find(
      (value): value is string =>
        typeof value === 'string' && Boolean(value.trim())
    ) || ''
  );
}

function normalizeDuration(value: unknown) {
  if (typeof value !== 'number' || Number.isNaN(value) || value <= 0) {
    return undefined;
  }
  return value > 1000 ? Math.round(value / 1000) : Math.round(value);
}

function detectPlatform(value: string) {
  try {
    const parsed = new URL(value);
    const host = parsed.hostname.toLowerCase();
    if (host.includes('tiktok.com')) return 'TikTok';
    if (host.includes('instagram.com')) return 'Instagram';
    if (host.includes('youtube.com') || host.includes('youtu.be')) return 'YouTube';
    if (host.includes('x.com') || host.includes('twitter.com')) return 'X';
    if (host.includes('facebook.com') || host.includes('fb.watch')) return 'Facebook';
    if (host.includes('reddit.com') || host.includes('redd.it')) return 'Reddit';
    return host.replace(/^www\./i, '');
  } catch {
    return 'Public source';
  }
}

function serviceLabelFromSource(sourceUrl: string) {
  return detectPlatform(sourceUrl);
}

function buildProviderChain(): ParseProvider[] {
  const providers: ParseProvider[] = [];

  const primary = process.env.VIDEO_PARSE_PRIMARY_URL?.trim();
  const fallbackUrls = (process.env.VIDEO_PARSE_FALLBACK_URLS || '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
  const cobaltFallback = process.env.COBALT_API_URL?.trim();
  const legacyBugpk = process.env.BUGPK_WXSPH_API_URL?.trim() || DEFAULT_BUGPK_API_URL;

  for (const url of [primary, ...fallbackUrls, cobaltFallback, legacyBugpk]) {
    if (!url || providers.some((provider) => provider.url === url)) continue;
    providers.push({
      name: new URL(url).hostname.replace(/^www\./i, ''),
      kind:
        /bugpk\.com/i.test(url) || /\/api\/wxsph(?:\/?|$)/i.test(url)
          ? 'bugpk'
          : 'cobalt',
      url,
    });
  }

  return providers;
}

function buildCobaltAuth(): CobaltAuth {
  const authorization = process.env.VIDEO_PARSE_AUTHORIZATION?.trim();
  if (authorization) {
    return { authorization };
  }

  const apiKey = process.env.VIDEO_PARSE_API_KEY?.trim();
  if (apiKey) {
    return { authorization: `Api-Key ${apiKey}` };
  }

  const bearerToken = process.env.VIDEO_PARSE_BEARER_TOKEN?.trim();
  if (bearerToken) {
    return { authorization: `Bearer ${bearerToken}` };
  }

  return null;
}

function normalizeBugpkResult(payload: any, sourceUrl: string) {
  const data = payload?.data ?? payload;
  const videoUrl = firstString(
    data?.url,
    data?.video,
    data?.video_url,
    data?.play_url,
    data?.download_url
  );

  if (!videoUrl) return null;

  return {
    provider: 'BugPk',
    platform: serviceLabelFromSource(sourceUrl),
    title: firstString(data?.title, data?.name),
    desc: firstString(data?.desc, data?.description, data?.content),
    author: {
      name: firstString(data?.author?.name, data?.author, data?.nickname),
      avatar: firstString(data?.author?.avatar, data?.avatar),
    },
    coverUrl: firstString(data?.cover, data?.cover_url, data?.thumbnail),
    videoUrl,
    mediaUrl: videoUrl,
    duration: normalizeDuration(data?.duration),
    sourceUrl,
  };
}

function normalizeCobaltResult(payload: any, sourceUrl: string) {
  if (!payload || payload.status === 'error') return null;

  const output = payload?.output ?? {};
  const metadata = output?.metadata ?? {};
  const picker = Array.isArray(payload?.picker) ? payload.picker : [];
  const chosen =
    picker.find((item: any) => item?.type === 'video' && item?.url) ||
    picker.find((item: any) => item?.url) ||
    null;

  const mediaUrl =
    firstString(payload?.url) || firstString(...(Array.isArray(payload?.tunnel) ? payload.tunnel : [])) || firstString(chosen?.url);

  if (!mediaUrl) return null;

  return {
    provider: 'Cobalt',
    platform: firstString(payload?.service, serviceLabelFromSource(sourceUrl)),
    title: firstString(metadata?.title, payload?.title, payload?.filename, chosen?.label),
    desc: firstString(metadata?.copyright, metadata?.genre, payload?.description),
    author: {
      name: firstString(metadata?.artist, metadata?.album_artist),
      avatar: '',
    },
    coverUrl: firstString(payload?.thumb, chosen?.thumb),
    videoUrl: mediaUrl,
    mediaUrl,
    duration: normalizeDuration(payload?.duration),
    sourceUrl,
    alternates: picker
      .map((item: any, index: number) => ({
        label: item?.type ? `${item.type} ${index + 1}` : `Option ${index + 1}`,
        url: item?.url,
        thumb: item?.thumb,
        type: item?.type,
      }))
      .filter((item: any) => Boolean(item?.url)),
  };
}

function isCobaltAuthError(payload: any) {
  const code = firstString(payload?.error?.code, payload?.code);
  return code.startsWith('api.auth.') || code.includes('auth.jwt.missing');
}

async function fetchWithRetry<T>(fn: () => Promise<T>, retries = RETRY_COUNT) {
  let lastError: unknown;
  for (let index = 0; index <= retries; index += 1) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (index < retries) {
        await new Promise((resolve) => setTimeout(resolve, 250 * (index + 1)));
      }
    }
  }
  throw lastError instanceof Error ? lastError : new Error('Request failed');
}

async function requestProvider(
  provider: ParseProvider,
  sourceUrl: string,
  cobaltAuth: CobaltAuth
) {
  if (provider.kind === 'bugpk') {
    const endpoint = new URL(provider.url);
    endpoint.searchParams.set('url', sourceUrl);
    const apiKey = process.env.BUGPK_API_KEY || '';
    if (apiKey) endpoint.searchParams.set('key', apiKey);

    const response = await fetch(endpoint, {
      headers: { Accept: 'application/json' },
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
    const payload = await response.json().catch(() => null);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const code = Number(payload?.code);
    if (code !== 0 && code !== 200) {
      throw new Error(payload?.msg || payload?.message || 'BugPk parsing failed');
    }

    const parsed = normalizeBugpkResult(payload, sourceUrl);
    if (!parsed) {
      throw new Error('BugPk returned no media URL');
    }

    return parsed;
  }

  const response = await fetch(provider.url, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...(cobaltAuth || {}),
    },
    body: JSON.stringify({
      url: sourceUrl,
      videoQuality: '1080',
      downloadMode: 'auto',
      filenameStyle: 'basic',
      localProcessing: 'preferred',
      alwaysProxy: true,
    }),
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });
  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    const error = new Error(payload?.error?.code || `HTTP ${response.status}`) as ParseError;
    if (isCobaltAuthError(payload)) {
      error.authRequired = true;
    }
    throw error;
  }
  if (payload?.status === 'error') {
    const error = new Error(payload?.error?.code || 'Cobalt parsing failed') as ParseError;
    if (isCobaltAuthError(payload)) {
      error.authRequired = true;
    }
    throw error;
  }

  const parsed = normalizeCobaltResult(payload, sourceUrl);
  if (!parsed) {
    throw new Error('Cobalt returned no media URL');
  }

  return parsed;
}

async function POST({ request }: { request: Request }) {
  const limited = enforceMinIntervalRateLimit(request, {
    intervalMs: 1200,
    keyPrefix: 'video-parse',
  });
  if (limited) return limited;

  const body = await request.json().catch(() => ({}));
  const rawUrl = typeof body?.url === 'string' ? body.url.trim() : '';

  if (!rawUrl) return respErr('Paste a video URL first.');
  if (rawUrl.length > MAX_INPUT_LENGTH) {
    return respErr('The pasted content is too long. Please use the full link only.');
  }

  const sourceUrl = extractUrl(rawUrl);
  if (!/^https?:\/\//i.test(sourceUrl)) {
    return respErr('No valid URL was found in the pasted text.');
  }

  const providers = buildProviderChain();
  if (!providers.length) {
    return respErr('No parser providers are configured.', { status: 500 });
  }

  const cobaltAuth = buildCobaltAuth();
  let authRequiredSeen = false;
  let lastError = 'Parsing failed';
  for (const provider of providers) {
    try {
      const parsed = await fetchWithRetry(() =>
        requestProvider(provider, sourceUrl, cobaltAuth)
      );
      return respData(
        { ...parsed, sourceUrl },
        {
          headers: { 'Cache-Control': 'no-store' },
        }
      );
    } catch (error) {
      const parseError = error as ParseError;
      lastError =
        error instanceof Error ? error.message : `${provider.name} failed`;
      authRequiredSeen = authRequiredSeen || Boolean(parseError.authRequired);
      console.error('[video/parse] provider failed', provider.name, error);
    }
  }

  if (authRequiredSeen && !cobaltAuth) {
    return respErr(
      'Configured Cobalt instances require Authorization. Set VIDEO_PARSE_AUTHORIZATION with an Api-Key or Bearer token, or point the app to a self-hosted public instance.',
      { status: 502 }
    );
  }

  return respErr(
    `All parsers failed. Last error: ${lastError}`,
    { status: 502 }
  );
}

export const Route = createFileRoute('/api/parse')({
  server: { handlers: { POST } },
});
