import { getAllConfigs } from '@/modules/config/service';

const DEFAULT_OPENAI_BASE_URL = 'https://api.openai.com/v1';
const DEFAULT_MODEL = 'whisper-1';
const DEFAULT_MAX_BYTES = 25 * 1024 * 1024;
const REQUEST_TIMEOUT_MS = 60_000;
const MAX_MEDIA_REDIRECTS = 3;
const SUPPORTED_EXTENSIONS = new Set([
  'flac',
  'mp3',
  'mp4',
  'mpeg',
  'mpga',
  'm4a',
  'ogg',
  'wav',
  'webm',
]);

export type TranscriptSegment = {
  id: number;
  start: number;
  end: number;
  text: string;
};

export type TranscriptionResult = {
  text: string;
  language?: string;
  duration?: number;
  segments: TranscriptSegment[];
  model: string;
};

export class TranscriptionError extends Error {
  code: string;
  status: number;

  constructor(code: string, message: string, status = 502) {
    super(message);
    this.name = 'TranscriptionError';
    this.code = code;
    this.status = status;
  }
}

function getFilename(url: URL, contentType: string) {
  const pathName = url.pathname.split('/').pop() || '';
  const match = pathName.match(/\.([a-z0-9]+)$/i);
  const extension = match?.[1]?.toLowerCase();
  if (extension && SUPPORTED_EXTENSIONS.has(extension)) {
    return `video.${extension}`;
  }

  const typeExtension: Record<string, string> = {
    'audio/flac': 'flac',
    'audio/m4a': 'm4a',
    'audio/mp3': 'mp3',
    'audio/mpeg': 'mp3',
    'audio/mpga': 'mpga',
    'audio/ogg': 'ogg',
    'audio/wav': 'wav',
    'audio/x-wav': 'wav',
    'audio/webm': 'webm',
    'video/mp4': 'mp4',
    'video/mpeg': 'mpeg',
    'video/webm': 'webm',
  };
  return `video.${typeExtension[contentType] || 'mp4'}`;
}

function normalizeContentType(value: string | null) {
  return (value || '').split(';', 1)[0].trim().toLowerCase();
}

export function getTranscriptionMaxBytes(configs: Record<string, string>) {
  const value = Number.parseInt(
    configs.video_transcription_max_bytes ||
      process.env.VIDEO_TRANSCRIPTION_MAX_BYTES ||
      '',
    10
  );
  return Number.isFinite(value) && value > 0 ? value : DEFAULT_MAX_BYTES;
}

function isBlockedIpv4(host: string) {
  const parts = host.split('.');
  if (parts.length !== 4 || parts.some((part) => !/^\d+$/.test(part))) {
    return false;
  }

  const octets = parts.map(Number);
  if (octets.some((part) => part < 0 || part > 255)) return true;
  const [first, second, third] = octets;

  return (
    first === 0 ||
    first === 10 ||
    first === 127 ||
    (first === 100 && second >= 64 && second <= 127) ||
    (first === 169 && second === 254) ||
    (first === 172 && second >= 16 && second <= 31) ||
    (first === 192 && second === 0 && third === 0) ||
    (first === 192 && second === 0 && third === 2) ||
    (first === 192 && second === 168) ||
    (first === 198 && (second === 18 || second === 19)) ||
    (first === 198 && second === 51 && third === 100) ||
    (first === 203 && second === 0 && third === 113) ||
    first >= 224
  );
}

function assertPublicMediaUrl(rawUrl: string) {
  let url: URL;
  try {
    url = new URL(rawUrl);
  } catch {
    throw new TranscriptionError(
      'INVALID_MEDIA_URL',
      'Media URL is invalid.',
      400
    );
  }

  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    throw new TranscriptionError(
      'INVALID_MEDIA_URL',
      'Only HTTP and HTTPS media URLs are supported.',
      400
    );
  }

  if (url.username || url.password) {
    throw new TranscriptionError(
      'INVALID_MEDIA_URL',
      'Media URLs with embedded credentials are not supported.',
      400
    );
  }

  if (url.port && url.port !== '80' && url.port !== '443') {
    throw new TranscriptionError(
      'INVALID_MEDIA_URL',
      'Media URLs must use a standard HTTP or HTTPS port.',
      400
    );
  }

  const host = url.hostname.toLowerCase().replace(/\.$/, '');
  if (
    host === 'localhost' ||
    host.endsWith('.localhost') ||
    host.endsWith('.local') ||
    host.endsWith('.localdomain') ||
    host.endsWith('.internal') ||
    host.endsWith('.home.arpa') ||
    host.startsWith('[') ||
    isBlockedIpv4(host)
  ) {
    throw new TranscriptionError(
      'INVALID_MEDIA_URL',
      'Private media URLs are not supported.',
      400
    );
  }

  return url;
}

async function fetchPublicMedia(initialUrl: URL) {
  let mediaUrl = initialUrl;
  const signal = AbortSignal.timeout(REQUEST_TIMEOUT_MS);

  for (
    let redirectCount = 0;
    redirectCount <= MAX_MEDIA_REDIRECTS;
    redirectCount += 1
  ) {
    const response = await fetch(mediaUrl, {
      headers: { Accept: 'audio/*, video/*, application/octet-stream;q=0.9' },
      redirect: 'manual',
      signal,
    });

    if (![301, 302, 303, 307, 308].includes(response.status)) {
      return { mediaUrl, response };
    }

    const location = response.headers.get('location');
    await response.body?.cancel().catch(() => undefined);
    if (!location) {
      throw new TranscriptionError(
        'MEDIA_FETCH_FAILED',
        'The media server returned an invalid redirect.',
        502
      );
    }
    if (redirectCount === MAX_MEDIA_REDIRECTS) {
      throw new TranscriptionError(
        'MEDIA_FETCH_FAILED',
        'The media URL redirected too many times.',
        502
      );
    }

    mediaUrl = assertPublicMediaUrl(new URL(location, mediaUrl).toString());
  }

  throw new TranscriptionError(
    'MEDIA_FETCH_FAILED',
    'The media URL could not be fetched.',
    502
  );
}

async function readBodyWithLimit(response: Response, maxBytes: number) {
  if (!response.body) {
    throw new TranscriptionError(
      'MEDIA_UNAVAILABLE',
      'The media response did not contain a body.',
      502
    );
  }

  const contentLength = Number(response.headers.get('content-length') || 0);
  if (contentLength > maxBytes) {
    throw new TranscriptionError(
      'MEDIA_TOO_LARGE',
      `Media must be smaller than ${Math.round(maxBytes / 1024 / 1024)} MB.`,
      413
    );
  }

  const reader = response.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      if (!value) continue;
      total += value.byteLength;
      if (total > maxBytes) {
        await reader.cancel().catch(() => undefined);
        throw new TranscriptionError(
          'MEDIA_TOO_LARGE',
          `Media must be smaller than ${Math.round(maxBytes / 1024 / 1024)} MB.`,
          413
        );
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }

  const bytes = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return bytes;
}

function normalizeSegments(value: unknown): TranscriptSegment[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((segment, index) => {
      const item = segment as Record<string, unknown>;
      const start = Number(item.start);
      const end = Number(item.end);
      const text = typeof item.text === 'string' ? item.text.trim() : '';
      if (!text || !Number.isFinite(start) || !Number.isFinite(end)) {
        return null;
      }
      return {
        id: Number.isFinite(Number(item.id)) ? Number(item.id) : index,
        start: Math.max(0, start),
        end: Math.max(start, end),
        text,
      };
    })
    .filter((segment): segment is TranscriptSegment => Boolean(segment));
}

async function transcribeWithMedia(params: {
  configs: Record<string, string>;
  media: Blob;
  filename: string;
  language?: string;
  prompt?: string;
}): Promise<TranscriptionResult> {
  const { configs } = params;
  const apiKey = configs.openai_api_key?.trim();
  if (!apiKey) {
    throw new TranscriptionError(
      'TRANSCRIPTION_NOT_CONFIGURED',
      'Transcription is not configured yet. Ask the site administrator to add an OpenAI-compatible API key.',
      503
    );
  }

  const maxBytes = getTranscriptionMaxBytes(configs);
  if (params.media.size > maxBytes) {
    throw new TranscriptionError(
      'MEDIA_TOO_LARGE',
      `Media must be smaller than ${Math.round(maxBytes / 1024 / 1024)} MB.`,
      413
    );
  }

  const baseUrl = (
    configs.openai_base_url?.trim() || DEFAULT_OPENAI_BASE_URL
  ).replace(/\/+$/, '');
  const model =
    configs.video_transcription_model?.trim() ||
    process.env.VIDEO_TRANSCRIPTION_MODEL?.trim() ||
    DEFAULT_MODEL;

  if (!params.media.size) {
    throw new TranscriptionError(
      'MEDIA_EMPTY',
      'The media file is empty.',
      422
    );
  }

  const form = new FormData();
  form.append('file', params.media, params.filename);
  form.append('model', model);
  form.append('response_format', 'verbose_json');
  if (params.language && /^[a-z]{2,12}$/i.test(params.language.trim())) {
    form.append('language', params.language.trim().toLowerCase());
  }
  if (params.prompt?.trim()) {
    form.append('prompt', params.prompt.trim().slice(0, 500));
  }

  let response: Response;
  try {
    response = await fetch(`${baseUrl}/audio/transcriptions`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}` },
      body: form,
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
  } catch {
    throw new TranscriptionError(
      'TRANSCRIPTION_PROVIDER_TIMEOUT',
      'The transcription provider timed out. Please try again.',
      504
    );
  }

  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    const providerMessage =
      typeof payload?.error?.message === 'string'
        ? payload.error.message
        : `Transcription provider returned HTTP ${response.status}.`;
    throw new TranscriptionError(
      response.status === 401
        ? 'TRANSCRIPTION_AUTH_FAILED'
        : 'TRANSCRIPTION_FAILED',
      providerMessage,
      response.status === 401 ? 503 : 502
    );
  }

  const text = typeof payload?.text === 'string' ? payload.text.trim() : '';
  if (!text) {
    throw new TranscriptionError(
      'TRANSCRIPTION_EMPTY',
      'No speech was detected in this media.',
      422
    );
  }

  return {
    text,
    language:
      typeof payload?.language === 'string' ? payload.language : undefined,
    duration:
      typeof payload?.duration === 'number' && payload.duration > 0
        ? payload.duration
        : undefined,
    segments: normalizeSegments(payload?.segments),
    model,
  };
}

export async function transcribeMediaFile(params: {
  mediaFile: File;
  language?: string;
  prompt?: string;
}): Promise<TranscriptionResult> {
  const configs = await getAllConfigs();
  return transcribeWithMedia({
    configs,
    media: params.mediaFile,
    filename: params.mediaFile.name || 'video.mp4',
    language: params.language,
    prompt: params.prompt,
  });
}

export async function transcribeMediaUrl(params: {
  mediaUrl: string;
  language?: string;
  prompt?: string;
}): Promise<TranscriptionResult> {
  const configs = await getAllConfigs();
  const initialMediaUrl = assertPublicMediaUrl(params.mediaUrl.trim());
  const maxBytes = getTranscriptionMaxBytes(configs);

  let mediaUrl: URL;
  let mediaResponse: Response;
  try {
    const media = await fetchPublicMedia(initialMediaUrl);
    mediaUrl = media.mediaUrl;
    mediaResponse = media.response;
  } catch (error) {
    if (error instanceof TranscriptionError) throw error;
    throw new TranscriptionError(
      'MEDIA_FETCH_FAILED',
      'The media URL could not be fetched. It may have expired.',
      502
    );
  }

  if (!mediaResponse.ok) {
    throw new TranscriptionError(
      'MEDIA_FETCH_FAILED',
      `The media server returned HTTP ${mediaResponse.status}.`,
      502
    );
  }

  const contentType = normalizeContentType(
    mediaResponse.headers.get('content-type')
  );
  if (
    contentType &&
    !contentType.startsWith('audio/') &&
    !contentType.startsWith('video/') &&
    contentType !== 'application/octet-stream'
  ) {
    await mediaResponse.body?.cancel().catch(() => undefined);
    throw new TranscriptionError(
      'UNSUPPORTED_MEDIA_TYPE',
      'The URL did not return a supported audio or video file.',
      415
    );
  }
  const bytes = await readBodyWithLimit(mediaResponse, maxBytes);
  const blob = new Blob([bytes], { type: contentType || 'video/mp4' });
  if (!blob.size) {
    throw new TranscriptionError(
      'MEDIA_EMPTY',
      'The media file is empty.',
      422
    );
  }

  return transcribeWithMedia({
    configs,
    media: blob,
    filename: getFilename(mediaUrl, contentType),
    language: params.language,
    prompt: params.prompt,
  });
}
