import { createFileRoute } from '@tanstack/react-router';

import { getAuth } from '@/core/auth';
import { validate as validateApiKey } from '@/modules/apikeys/service';
import { getAllConfigs } from '@/modules/config/service';
import { consume, getBalance } from '@/modules/credits/service';
import { createParseHistory } from '@/modules/parse-history/service';
import { hasActivePaidMembership } from '@/modules/subscriptions/service';
import {
  getAnonymousRemaining,
  getAnonymousUsageContext,
  recordAnonymousSuccess,
  type AnonymousUsageContext,
} from '@/modules/usage/service';
import { enforceMinIntervalRateLimit } from '@/lib/rate-limit';
import { respData, respErr } from '@/lib/resp';

type ProviderPlatform = 'default' | 'instagram' | 'tiktok' | 'x' | 'youtube';

const DEFAULT_COBALT_API_URLS: Record<ProviderPlatform, readonly string[]> = {
  youtube: [
    'https://api.cobalt.liubquanti.click',
    'https://rue-cobalt.xenon.zone',
    'https://cobaltapi.cjs.nz',
  ],
  tiktok: [
    'https://cobaltapi.cjs.nz',
    'https://api.cobalt.liubquanti.click',
    'https://rue-cobalt.xenon.zone',
  ],
  instagram: [
    'https://rue-cobalt.xenon.zone',
    'https://api.cobalt.liubquanti.click',
  ],
  x: [
    'https://cobaltapi.cjs.nz',
    'https://api.cobalt.liubquanti.click',
    'https://rue-cobalt.xenon.zone',
  ],
  default: [
    'https://api.cobalt.liubquanti.click',
    'https://rue-cobalt.xenon.zone',
    'https://cobaltapi.cjs.nz',
  ],
};
const MAX_INPUT_LENGTH = 4000;
const REQUEST_TIMEOUT_MS = 12_000;
const MEDIA_VALIDATION_TIMEOUT_MS = 6_000;
const TOTAL_REQUEST_BUDGET_MS = 45_000;
const RETRY_COUNT = 1;
const YOUTUBE_RETRY_COUNT = 2;
const DOWNLOAD_MODES = ['auto', 'audio', 'mute'] as const;
const VIDEO_QUALITIES = [
  'max',
  '4320',
  '2160',
  '1440',
  '1080',
  '720',
  '480',
  '360',
  '240',
  '144',
] as const;

type DownloadMode = (typeof DOWNLOAD_MODES)[number];
type VideoQuality = (typeof VIDEO_QUALITIES)[number];

type ParseProvider = {
  name: string;
  kind: 'cobalt' | 'bugpk';
  url: string;
};

type CobaltAuth = {
  authorization: string;
} | null;

type ParseError = Error & {
  authRequired?: boolean;
  retryable?: boolean;
  retryAfterMs?: number;
  youtubeLoginRequired?: boolean;
};

const BUGPK_API_BASE = 'https://api.bugpk.com/api';
const BUGPK_AGGREGATE_VIDEO_ENDPOINTS = ['short_videos', 'svparse'] as const;
const BUGPK_MUSIC_ENDPOINTS = [
  '163_music',
  'qqmusic',
  'qsmusic',
  'kuwo',
  'music',
] as const;

const BUGPK_PLATFORM_ENDPOINTS = [
  { hosts: ['douyin.com', 'iesdouyin.com'], paths: ['douyin', 'dyzy'] },
  { hosts: ['kuaishou.com', 'gifshow.com'], paths: ['ksjx', 'kuaishou'] },
  {
    hosts: ['xiaohongshu.com', 'xhslink.com'],
    paths: ['xhsjx', 'xhs', 'xhsimg'],
  },
  { hosts: ['bilibili.com', 'b23.tv'], path: 'bilibili' },
  { hosts: ['weibo.com', 'weibo.cn'], paths: ['weibo', 'weibo_v'] },
  { hosts: ['toutiao.com', 'ixigua.com'], path: 'toutiao' },
  { hosts: ['doubao.com'], paths: ['dbvideos', 'dbduihua'] },
  { hosts: ['jimeng.jianying.com'], path: 'jimengai' },
  { hosts: ['pipix.com'], path: 'pipixia' },
  { hosts: ['pipigx.com'], path: 'pipigx' },
  { hosts: ['qianwen.com'], path: 'qianwenimg' },
  { hosts: ['xiaochuankeji.cn'], path: 'zuiyou' },
  {
    hosts: ['v.qq.com', 'iqiyi.com', 'youku.com', 'mgtv.com', '1905.com'],
    path: 'videosjx',
  },
] as const;

const BUGPK_MUSIC_PLATFORM_ENDPOINTS = [
  {
    hosts: ['music.163.com', 'y.music.163.com'],
    paths: ['163_music', 'music'],
  },
  { hosts: ['y.qq.com', 'i.y.qq.com'], paths: ['qqmusic', 'music'] },
  { hosts: ['qishui.douyin.com'], path: 'qsmusic' },
  { hosts: ['kuwo.cn'], path: 'kuwo' },
] as const;

function extractUrl(value: string) {
  const match = value.match(/https?:\/\/[^\s]+/i);
  return (match?.[0] || value).replace(/[)\]}>，。！？；、]+$/g, '');
}

function getApiKeyHeader(request: Request) {
  const header = request.headers.get('authorization')?.trim() || '';
  if (!header) return { present: false, key: '' };
  const match = header.match(/^Bearer\s+(.+)$/i);
  return { present: true, key: match?.[1]?.trim() || '' };
}

function invalidApiKeyResponse() {
  return respErr('Invalid or revoked API key.', {
    status: 401,
    headers: { 'WWW-Authenticate': 'Bearer' },
  });
}

function firstString(...values: unknown[]) {
  return (
    values.find(
      (value): value is string =>
        typeof value === 'string' && Boolean(value.trim())
    ) || ''
  );
}

function firstHttpUrl(...values: unknown[]) {
  for (const value of values) {
    if (typeof value !== 'string' || !value.trim()) continue;
    try {
      const parsed = new URL(value.trim());
      if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
        return parsed.toString();
      }
    } catch {
      // Third-party parser responses are untrusted input.
    }
  }
  return '';
}

function detectMediaType(
  type: unknown,
  mediaUrl: string,
  filename: string,
  requestedMode: DownloadMode
) {
  if (requestedMode === 'audio') return 'audio' as const;

  const normalizedType = typeof type === 'string' ? type.toLowerCase() : '';
  if (normalizedType.includes('audio')) return 'audio' as const;
  if (normalizedType.includes('image') || normalizedType === 'photo') {
    return 'image' as const;
  }
  if (normalizedType.includes('video')) return 'video' as const;

  const path = `${filename} ${mediaUrl}`;
  if (/\.(?:avif|gif|jpe?g|png|webp)(?:$|[?\s])/i.test(path)) {
    return 'image' as const;
  }
  if (/\.(?:aac|flac|m4a|mp3|ogg|opus|wav)(?:$|[?\s])/i.test(path)) {
    return 'audio' as const;
  }
  return 'video' as const;
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
    if (host.includes('youtube.com') || host.includes('youtu.be'))
      return 'YouTube';
    if (host.includes('x.com') || host.includes('twitter.com')) return 'X';
    if (host.includes('facebook.com') || host.includes('fb.watch'))
      return 'Facebook';
    if (host.includes('reddit.com') || host.includes('redd.it'))
      return 'Reddit';
    if (host.includes('music.163.com')) return 'NetEase Cloud Music';
    if (host.includes('y.qq.com')) return 'QQ Music';
    if (host.includes('qishui.douyin.com')) return 'Qishui Music';
    if (host.includes('kuwo.cn')) return 'Kuwo Music';
    return host.replace(/^www\./i, '');
  } catch {
    return 'Public source';
  }
}

function serviceLabelFromSource(sourceUrl: string) {
  return detectPlatform(sourceUrl);
}

function hostnameMatches(hostname: string, domain: string) {
  return hostname === domain || hostname.endsWith(`.${domain}`);
}

function bugpkApiUrl(path: string) {
  return `${BUGPK_API_BASE}/${path}`;
}

function getBugpkPlatformUrls(sourceUrl: string) {
  try {
    const hostname = new URL(sourceUrl).hostname.toLowerCase();
    const matched = [
      ...BUGPK_PLATFORM_ENDPOINTS,
      ...BUGPK_MUSIC_PLATFORM_ENDPOINTS,
    ].flatMap((item) => {
      if (!item.hosts.some((host) => hostnameMatches(hostname, host))) {
        return [];
      }
      return 'paths' in item ? item.paths : [item.path];
    });
    return matched.map(bugpkApiUrl);
  } catch {
    return [];
  }
}

function getBugpkEndpointName(providerUrl: string) {
  try {
    return new URL(providerUrl).pathname.split('/').filter(Boolean).pop() || '';
  } catch {
    return '';
  }
}

function isBugpkMusicEndpoint(providerUrl: string) {
  const endpoint = getBugpkEndpointName(providerUrl);
  return (BUGPK_MUSIC_ENDPOINTS as readonly string[]).includes(endpoint);
}

function extractNeteaseSongId(sourceUrl: string) {
  try {
    const parsed = new URL(sourceUrl);
    return (
      parsed.searchParams.get('id') ||
      parsed.pathname.match(/\/song\/(\d+)/)?.[1] ||
      ''
    );
  } catch {
    return '';
  }
}

function extractQqMusicId(sourceUrl: string) {
  try {
    const parsed = new URL(sourceUrl);
    return (
      parsed.pathname.match(/\/songDetail\/([A-Za-z0-9]+)/)?.[1] ||
      parsed.searchParams.get('songmid') ||
      parsed.searchParams.get('mid') ||
      ''
    );
  } catch {
    return '';
  }
}

function getBugpkMusicSource(sourceUrl: string) {
  try {
    const hostname = new URL(sourceUrl).hostname.toLowerCase();
    if (hostname.includes('music.163.com')) {
      return {
        id: extractNeteaseSongId(sourceUrl),
        media: 'netease' as const,
      };
    }
    if (hostname.includes('y.qq.com')) {
      return {
        id: extractQqMusicId(sourceUrl),
        media: 'tencent' as const,
      };
    }
  } catch {
    return null;
  }
  return null;
}

function applyBugpkMusicParams(endpoint: URL, sourceUrl: string) {
  const endpointName = getBugpkEndpointName(endpoint.toString());
  const source = getBugpkMusicSource(sourceUrl);
  if (!source) return;

  if (endpointName === '163_music') {
    endpoint.searchParams.set('type', 'music');
    if (source.id) {
      endpoint.searchParams.set('id', source.id);
      endpoint.searchParams.set('ids', source.id);
    }
    return;
  }

  if (endpointName === 'music') {
    endpoint.searchParams.set('type', 'song');
    endpoint.searchParams.set('media', source.media);
    if (source.id) {
      endpoint.searchParams.set('id', source.id);
      endpoint.searchParams.set('ids', source.id);
    }
  }
}

function detectProviderPlatform(value: string): ProviderPlatform {
  try {
    const host = new URL(value).hostname.toLowerCase();
    if (
      host === 'youtu.be' ||
      host === 'youtube.com' ||
      host.endsWith('.youtube.com')
    ) {
      return 'youtube';
    }
    if (host === 'tiktok.com' || host.endsWith('.tiktok.com')) return 'tiktok';
    if (host === 'instagram.com' || host.endsWith('.instagram.com')) {
      return 'instagram';
    }
    if (
      host === 'x.com' ||
      host.endsWith('.x.com') ||
      host === 'twitter.com' ||
      host.endsWith('.twitter.com') ||
      host === 't.co'
    ) {
      return 'x';
    }
  } catch {
    return 'default';
  }
  return 'default';
}

function splitProviderUrls(value: string | undefined) {
  return (value || '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

function getPlatformProviderConfig(platform: ProviderPlatform) {
  switch (platform) {
    case 'youtube':
      return {
        primary: process.env.VIDEO_PARSE_YOUTUBE_PRIMARY_URL?.trim(),
        fallbacks: splitProviderUrls(
          process.env.VIDEO_PARSE_YOUTUBE_FALLBACK_URLS
        ),
      };
    case 'tiktok':
      return {
        primary: process.env.VIDEO_PARSE_TIKTOK_PRIMARY_URL?.trim(),
        fallbacks: splitProviderUrls(
          process.env.VIDEO_PARSE_TIKTOK_FALLBACK_URLS
        ),
      };
    case 'instagram':
      return {
        primary: process.env.VIDEO_PARSE_INSTAGRAM_PRIMARY_URL?.trim(),
        fallbacks: splitProviderUrls(
          process.env.VIDEO_PARSE_INSTAGRAM_FALLBACK_URLS
        ),
      };
    case 'x':
      return {
        primary: process.env.VIDEO_PARSE_X_PRIMARY_URL?.trim(),
        fallbacks: splitProviderUrls(process.env.VIDEO_PARSE_X_FALLBACK_URLS),
      };
    default:
      return { primary: undefined, fallbacks: [] };
  }
}

function buildProviderChain(sourceUrl: string): ParseProvider[] {
  const providers: ParseProvider[] = [];
  const platform = detectProviderPlatform(sourceUrl);
  const platformConfig = getPlatformProviderConfig(platform);

  const primary = process.env.VIDEO_PARSE_PRIMARY_URL?.trim();
  const fallbackUrls = splitProviderUrls(process.env.VIDEO_PARSE_FALLBACK_URLS);
  const cobaltFallback = process.env.COBALT_API_URL?.trim();
  const legacyBugpk = process.env.BUGPK_WXSPH_API_URL?.trim();
  const bugpkPlatformUrls = getBugpkPlatformUrls(sourceUrl);

  for (const url of [
    ...bugpkPlatformUrls,
    platformConfig.primary,
    ...platformConfig.fallbacks,
    ...DEFAULT_COBALT_API_URLS[platform],
    primary,
    ...fallbackUrls,
    cobaltFallback,
    ...BUGPK_AGGREGATE_VIDEO_ENDPOINTS.map(bugpkApiUrl),
    legacyBugpk,
  ]) {
    if (!url || providers.some((provider) => provider.url === url)) continue;
    let hostname: string;
    try {
      hostname = new URL(url).hostname.replace(/^www\./i, '');
    } catch {
      console.error('[video/parse] ignored invalid provider URL');
      continue;
    }
    providers.push({
      name: hostname,
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

type BugpkMediaCandidate = {
  label: string;
  type: 'audio' | 'image' | 'video';
  url: string;
  thumb?: string;
};

function normalizeBugpkResult(
  payload: any,
  sourceUrl: string,
  providerUrl: string
) {
  const data = payload?.data ?? payload;
  const root = Array.isArray(data) ? (data[0] ?? {}) : data;
  const isMusic = isBugpkMusicEndpoint(providerUrl);
  const candidates: BugpkMediaCandidate[] = [];
  const seen = new Set<string>();
  const addCandidate = (
    value: unknown,
    type: BugpkMediaCandidate['type'],
    label: string,
    thumb?: unknown
  ) => {
    const url =
      typeof value === 'string'
        ? firstHttpUrl(value)
        : firstHttpUrl(
            (value as any)?.url,
            (value as any)?.audio,
            (value as any)?.music,
            (value as any)?.video,
            (value as any)?.image,
            (value as any)?.pic,
            (value as any)?.play_url,
            (value as any)?.download_url,
            (value as any)?.music_url
          );
    if (!url || seen.has(url)) return;
    seen.add(url);
    candidates.push({
      label: firstString((value as any)?.label, (value as any)?.quality, label),
      type,
      url,
      thumb: firstHttpUrl(
        (value as any)?.thumb,
        (value as any)?.cover,
        (value as any)?.pic,
        thumb
      ),
    });
  };
  const addArray = (
    value: unknown,
    type: BugpkMediaCandidate['type'],
    label: string
  ) => {
    if (!Array.isArray(value)) return;
    value.forEach((item, index) =>
      addCandidate(item, type, `${label} ${index + 1}`)
    );
  };

  addCandidate(
    firstHttpUrl(
      root?.url,
      root?.audio,
      root?.music_url,
      root?.video,
      root?.video_url,
      root?.play_url,
      root?.download_url
    ),
    isMusic ? 'audio' : 'video',
    isMusic ? 'Audio' : 'Video',
    root?.pic || root?.cover
  );
  addArray(root?.video_backup, 'video', 'Video');
  addArray(root?.videos, 'video', 'Video');
  addArray(root?.video_list, 'video', 'Video');
  addArray(
    root?.data,
    isMusic ? 'audio' : 'video',
    isMusic ? 'Audio' : 'Video'
  );
  addArray(data, isMusic ? 'audio' : 'video', isMusic ? 'Audio' : 'Video');
  addArray(root?.images, 'image', 'Image');
  addArray(root?.pics, 'image', 'Image');
  addArray(root?.image_list, 'image', 'Image');
  addArray(root?.live_photo, 'video', 'Live photo');
  if (Array.isArray(root?.live_photo)) {
    root.live_photo.forEach((item: any, index: number) =>
      addCandidate(item?.image, 'image', `Live photo image ${index + 1}`)
    );
  }
  addCandidate(root?.music?.url, 'audio', 'Audio', root?.music?.cover);

  const preferred =
    (isMusic ? candidates.find((item) => item.type === 'audio') : null) ||
    candidates.find((item) => item.type === 'video') ||
    candidates.find((item) => item.type === 'image') ||
    candidates.find((item) => item.type === 'audio');
  if (!preferred) return null;

  return {
    provider: 'BugPk',
    platform: serviceLabelFromSource(sourceUrl),
    title: firstString(root?.title, root?.name, root?.song_name),
    desc: firstString(
      root?.desc,
      root?.description,
      root?.content,
      root?.al_name,
      root?.album
    ),
    author: {
      name: firstString(
        root?.author?.name,
        root?.author,
        root?.nickname,
        root?.ar_name,
        root?.singer
      ),
      avatar: firstString(root?.author?.avatar, root?.avatar),
    },
    coverUrl: firstHttpUrl(
      root?.pic,
      root?.cover,
      root?.cover_url,
      root?.thumbnail,
      preferred.thumb,
      candidates.find((item) => item.type === 'image')?.url
    ),
    filename: firstString(root?.filename, root?.name, root?.song_name),
    mediaType: preferred.type,
    videoUrl: preferred.type === 'video' ? preferred.url : undefined,
    mediaUrl: preferred.url,
    duration: normalizeDuration(root?.duration),
    sourceUrl,
    alternates: candidates.map((item) => ({
      label: item.label,
      type: item.type,
      url: item.url,
      thumb: item.thumb,
    })),
  };
}

function normalizeCobaltResult(
  payload: any,
  sourceUrl: string,
  requestedMode: DownloadMode,
  requestedQuality: VideoQuality
) {
  if (!payload || payload.status === 'error') return null;

  const output = payload?.output ?? {};
  const metadata = output?.metadata ?? {};
  const picker = (Array.isArray(payload?.picker) ? payload.picker : [])
    .map((item: any) => ({
      ...item,
      thumb: firstHttpUrl(item?.thumb),
      url: firstHttpUrl(item?.url),
    }))
    .filter((item: any) => Boolean(item.url));
  const chosen =
    picker.find(
      (item: any) =>
        requestedMode === 'audio' && item?.type === 'audio' && item?.url
    ) ||
    picker.find(
      (item: any) =>
        requestedMode !== 'audio' && item?.type === 'video' && item?.url
    ) ||
    picker.find((item: any) => item?.url) ||
    null;

  const mediaUrl = firstHttpUrl(payload?.url, chosen?.url);

  if (!mediaUrl) return null;

  const filename = firstString(
    payload?.filename,
    output?.filename,
    chosen?.filename,
    chosen?.label
  );
  const mediaType = detectMediaType(
    output?.type || chosen?.type,
    mediaUrl,
    filename,
    requestedMode
  );

  return {
    provider: 'Cobalt',
    platform: firstString(payload?.service, serviceLabelFromSource(sourceUrl)),
    title: firstString(metadata?.title, payload?.title),
    desc: firstString(
      metadata?.copyright,
      metadata?.genre,
      payload?.description
    ),
    author: {
      name: firstString(metadata?.artist, metadata?.album_artist),
      avatar: '',
    },
    coverUrl: firstHttpUrl(payload?.thumb, chosen?.thumb),
    filename,
    mediaType,
    videoUrl: mediaType === 'video' ? mediaUrl : undefined,
    mediaUrl,
    duration: normalizeDuration(payload?.duration),
    sourceUrl,
    requestedMode,
    requestedQuality,
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

function isCobaltYoutubeLoginError(payload: any) {
  const code = firstString(payload?.error?.code, payload?.code);
  return code === 'error.api.youtube.login';
}

function isCobaltRetryableError(payload: any) {
  const code = firstString(payload?.error?.code, payload?.code);
  return code.startsWith('error.api.fetch.');
}

async function fetchWithRetry<T>(
  fn: (timeoutMs: number) => Promise<T>,
  deadline: number,
  retries = RETRY_COUNT
) {
  let lastError: unknown;
  for (let index = 0; index <= retries; index += 1) {
    const remainingBudget = deadline - Date.now();
    if (remainingBudget <= 0) break;
    try {
      return await fn(
        Math.max(1, Math.min(REQUEST_TIMEOUT_MS, remainingBudget))
      );
    } catch (error) {
      lastError = error;
      if ((error as ParseError)?.retryable === false) break;
      if (index < retries) {
        const retryAfterMs = (error as ParseError)?.retryAfterMs;
        await new Promise((resolve) =>
          setTimeout(resolve, retryAfterMs || 250 * (index + 1))
        );
      }
    }
  }
  throw lastError instanceof Error ? lastError : new Error('Request failed');
}

async function requestProvider(
  provider: ParseProvider,
  sourceUrl: string,
  cobaltAuth: CobaltAuth,
  options: { mode: DownloadMode; quality: VideoQuality },
  timeoutMs: number
) {
  if (provider.kind === 'bugpk') {
    if (options.mode !== 'auto') {
      const error = new Error(
        'BugPk does not support this download mode'
      ) as ParseError;
      error.retryable = false;
      throw error;
    }
    const endpoint = new URL(provider.url);
    endpoint.searchParams.set('url', sourceUrl);
    applyBugpkMusicParams(endpoint, sourceUrl);
    const apiKey = process.env.BUGPK_API_KEY || '';
    if (apiKey) endpoint.searchParams.set('key', apiKey);

    const response = await fetch(endpoint, {
      headers: { Accept: 'application/json' },
      signal: AbortSignal.timeout(timeoutMs),
    });
    const payload = await response.json().catch(() => null);

    if (!response.ok) {
      const error = new Error(`HTTP ${response.status}`) as ParseError;
      error.retryable = response.status === 429 || response.status >= 500;
      throw error;
    }

    const code = Number(payload?.code ?? payload?.status);
    if (code !== 0 && code !== 200) {
      const error = new Error(
        payload?.msg || payload?.message || 'BugPk parsing failed'
      ) as ParseError;
      error.retryable = code === 429 || code >= 500;
      const retryAfter = Number(payload?.data?.retry_after);
      if (Number.isFinite(retryAfter) && retryAfter > 0) {
        error.retryAfterMs = Math.min(retryAfter * 1000, 3000);
      }
      throw error;
    }

    const parsed = normalizeBugpkResult(payload, sourceUrl, provider.url);
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
      videoQuality: options.quality,
      downloadMode: options.mode,
      filenameStyle: 'basic',
      localProcessing: 'disabled',
      alwaysProxy: false,
    }),
    signal: AbortSignal.timeout(timeoutMs),
  });
  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    const error = new Error(
      payload?.error?.code || `HTTP ${response.status}`
    ) as ParseError;
    if (isCobaltAuthError(payload)) {
      error.authRequired = true;
    }
    if (isCobaltYoutubeLoginError(payload)) {
      error.youtubeLoginRequired = true;
    }
    error.retryable =
      response.status === 408 ||
      response.status === 425 ||
      response.status === 429 ||
      response.status >= 500 ||
      isCobaltRetryableError(payload);
    throw error;
  }
  if (payload?.status === 'error') {
    const error = new Error(
      payload?.error?.code || 'Cobalt parsing failed'
    ) as ParseError;
    if (isCobaltAuthError(payload)) {
      error.authRequired = true;
    }
    if (isCobaltYoutubeLoginError(payload)) {
      error.youtubeLoginRequired = true;
    }
    error.retryable = isCobaltRetryableError(payload);
    throw error;
  }

  const parsed = normalizeCobaltResult(
    payload,
    sourceUrl,
    options.mode,
    options.quality
  );
  if (!parsed) {
    throw new Error('Cobalt returned no media URL');
  }

  return parsed;
}

async function isMediaUrlUsable(mediaUrl: string, timeoutMs: number) {
  try {
    const response = await fetch(mediaUrl, {
      headers: {
        Accept: 'video/*, audio/*, image/*, application/octet-stream;q=0.9',
        Range: 'bytes=0-0',
      },
      redirect: 'follow',
      signal: AbortSignal.timeout(timeoutMs),
    });
    const contentLength = response.headers.get('content-length');
    const contentType =
      response.headers.get('content-type')?.toLowerCase() || '';
    const unusableType =
      contentType.includes('text/html') ||
      contentType.includes('application/json');
    const usable =
      response.ok &&
      contentLength !== '0' &&
      !unusableType &&
      Boolean(response.body);

    await response.body?.cancel().catch(() => undefined);
    return usable;
  } catch {
    return false;
  }
}

async function isMediaUrlUsableWithRetry(mediaUrl: string, deadline: number) {
  for (let attempt = 0; attempt < 2; attempt += 1) {
    const remainingBudget = deadline - Date.now();
    if (remainingBudget <= 0) return false;

    if (
      await isMediaUrlUsable(
        mediaUrl,
        Math.max(1, Math.min(MEDIA_VALIDATION_TIMEOUT_MS, remainingBudget))
      )
    ) {
      return true;
    }

    if (attempt === 0 && deadline - Date.now() > 250) {
      await new Promise((resolve) => setTimeout(resolve, 250));
    }
  }
  return false;
}

async function POST({ request }: { request: Request }) {
  const limited = enforceMinIntervalRateLimit(request, {
    intervalMs: 1200,
    keyPrefix: 'video-parse',
  });
  if (limited) return limited;

  const body = await request.json().catch(() => ({}));
  const rawUrl = typeof body?.url === 'string' ? body.url.trim() : '';
  const modeValue: unknown = body?.mode ?? 'auto';
  const qualityValue: unknown = body?.quality ?? '720';

  if (!rawUrl) return respErr('Paste a video URL first.');
  if (rawUrl.length > MAX_INPUT_LENGTH) {
    return respErr(
      'The pasted content is too long. Please use the full link only.'
    );
  }

  const sourceUrl = extractUrl(rawUrl);
  if (!/^https?:\/\//i.test(sourceUrl)) {
    return respErr('No valid URL was found in the pasted text.');
  }
  if (
    typeof modeValue !== 'string' ||
    !DOWNLOAD_MODES.includes(modeValue as DownloadMode)
  ) {
    return respErr('Unsupported download mode.');
  }
  if (
    typeof qualityValue !== 'string' ||
    !VIDEO_QUALITIES.includes(qualityValue as VideoQuality)
  ) {
    return respErr('Unsupported video quality.');
  }
  const requestedMode = modeValue as DownloadMode;
  const requestedQuality = qualityValue as VideoQuality;
  const batchRequested = body?.batch === true;

  const configs = await getAllConfigs();
  const apiKeyHeader = getApiKeyHeader(request);
  let authenticatedUserId: string | null = null;

  if (apiKeyHeader.present) {
    if (!/^sk_[A-Za-z0-9_-]{20,}$/.test(apiKeyHeader.key)) {
      return invalidApiKeyResponse();
    }
    authenticatedUserId = await validateApiKey(apiKeyHeader.key);
    if (!authenticatedUserId) return invalidApiKeyResponse();
  }

  const creditsEnabled = configs.video_parse_credits_enabled === 'true';
  const anonymousDailyLimit = Math.max(
    0,
    parseInt(configs.anonymous_free_daily_limit || '3') || 0
  );
  let session: Awaited<
    ReturnType<ReturnType<typeof getAuth>['api']['getSession']>
  > | null = null;
  let startingBalance: number | null = null;
  let anonymousUsageContext: AnonymousUsageContext | null = null;

  if (!authenticatedUserId) {
    const auth = getAuth(configs);
    session = await auth.api.getSession({ headers: request.headers });
    if (session?.user) {
      authenticatedUserId = session.user.id;
    }
  }

  const requiresPaidMembership =
    apiKeyHeader.present ||
    batchRequested ||
    requestedMode !== 'auto' ||
    requestedQuality === '1080' ||
    requestedQuality === 'max';
  if (
    requiresPaidMembership &&
    (!authenticatedUserId ||
      !(await hasActivePaidMembership(authenticatedUserId)))
  ) {
    return respErr(
      'An active paid membership is required for batch parsing, advanced formats, 1080p or best-quality downloads, and API access.',
      { status: 403 }
    );
  }

  if (creditsEnabled && authenticatedUserId) {
    startingBalance = await getBalance(authenticatedUserId);
    if (startingBalance < 1) {
      return respErr('You need at least 1 credit to parse this video.', {
        status: 402,
      });
    }
  } else if (creditsEnabled) {
    anonymousUsageContext = await getAnonymousUsageContext(request);
    const anonymousRemaining = await getAnonymousRemaining(
      anonymousUsageContext,
      anonymousDailyLimit
    );
    if (anonymousRemaining < 1) {
      return respErr(
        'Your free daily limit is used. Sign in to continue parsing.',
        { status: 401 }
      );
    }
  }

  const providers = buildProviderChain(sourceUrl);
  if (!providers.length) {
    return respErr('No parser providers are configured.', { status: 500 });
  }

  const cobaltAuth = buildCobaltAuth();
  const providerPlatform = detectProviderPlatform(sourceUrl);
  let authRequiredSeen = false;
  let youtubeLoginRequiredSeen = false;
  const requestDeadline = Date.now() + TOTAL_REQUEST_BUDGET_MS;
  for (const provider of providers) {
    if (requestDeadline - Date.now() <= 0) break;
    let parsed;
    try {
      parsed = await fetchWithRetry(
        (timeoutMs) =>
          requestProvider(
            provider,
            sourceUrl,
            cobaltAuth,
            { mode: requestedMode, quality: requestedQuality },
            timeoutMs
          ),
        requestDeadline,
        providerPlatform === 'youtube' ? YOUTUBE_RETRY_COUNT : RETRY_COUNT
      );
    } catch (error) {
      const parseError = error as ParseError;
      authRequiredSeen = authRequiredSeen || Boolean(parseError.authRequired);
      youtubeLoginRequiredSeen =
        youtubeLoginRequiredSeen || Boolean(parseError.youtubeLoginRequired);
      console.error('[video/parse] provider failed', provider.name, error);
      continue;
    }

    if (!(await isMediaUrlUsableWithRetry(parsed.mediaUrl, requestDeadline))) {
      console.error('[video/parse] provider returned unusable media', {
        provider: provider.name,
      });
      continue;
    }

    let creditsRemaining: number | undefined;
    let freeParsesRemaining: number | undefined;
    if (creditsEnabled && authenticatedUserId) {
      const consumed = await consume({
        userId: authenticatedUserId,
        userEmail: session?.user?.email,
        credits: 1,
        scene: 'video_parse',
        description: 'Successful video parse',
      });
      if (!consumed.success) {
        return respErr('Your credit balance changed. Please add credits.', {
          status: 402,
        });
      }
      creditsRemaining = Math.max(0, (startingBalance ?? 1) - 1);
    } else if (creditsEnabled && anonymousUsageContext) {
      const remaining = await recordAnonymousSuccess(
        anonymousUsageContext,
        anonymousDailyLimit
      );
      if (remaining === null) {
        return respErr(
          'Your free daily limit is used. Sign in to continue parsing.',
          { status: 401 }
        );
      }
      freeParsesRemaining = remaining;
    }

    const responseData = {
      ...parsed,
      sourceUrl,
      creditsRemaining,
      freeParsesRemaining,
    };

    if (authenticatedUserId) {
      try {
        await createParseHistory({
          userId: authenticatedUserId,
          result: responseData,
        });
      } catch (error) {
        // History is a convenience feature; it must not turn a valid download into a failure.
        console.error('[video/parse] failed to save history', error);
      }
    }

    return respData(responseData, {
      headers: { 'Cache-Control': 'no-store' },
    });
  }

  if (youtubeLoginRequiredSeen) {
    return respErr(
      'YouTube requires sign-in verification on the available parsers right now. Please try again shortly.',
      { status: 502 }
    );
  }

  if (authRequiredSeen && !cobaltAuth) {
    return respErr(
      'Configured Cobalt instances require Authorization. Set VIDEO_PARSE_AUTHORIZATION with an Api-Key or Bearer token, or point the app to a self-hosted public instance.',
      { status: 502 }
    );
  }

  return respErr(
    'No parser could process this public link right now. Please check that the video is public and try again shortly.',
    { status: 502 }
  );
}

export const Route = createFileRoute('/api/parse')({
  server: { handlers: { POST } },
});
