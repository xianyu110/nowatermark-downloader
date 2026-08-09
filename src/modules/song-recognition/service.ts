import { getAllConfigs } from '@/modules/config/service';

const DEFAULT_AUDD_BASE_URL = 'https://api.audd.io';
const DEFAULT_MAX_URL_LENGTH = 4000;
const REQUEST_TIMEOUT_MS = 60_000;

export type SongRecognitionResult = {
  artist?: string;
  title?: string;
  album?: string;
  releaseDate?: string;
  label?: string;
  timecode?: string;
  songLink?: string;
  appleMusicUrl?: string;
  spotifyUrl?: string;
  deezerUrl?: string;
  isrc?: string;
  artworkUrl?: string;
  model: string;
  mediaUrl: string;
  sourceUrl?: string;
};

export class SongRecognitionError extends Error {
  code: string;
  status: number;

  constructor(code: string, message: string, status = 502) {
    super(message);
    this.name = 'SongRecognitionError';
    this.code = code;
    this.status = status;
  }
}

function parseCost(value: string | undefined) {
  const parsed = Number.parseInt(value || '', 10);
  return Number.isFinite(parsed) ? Math.max(0, parsed) : 1;
}

function normalizeUrl(value: string) {
  const url = value.trim();
  if (url.length > DEFAULT_MAX_URL_LENGTH) {
    throw new SongRecognitionError(
      'SONG_URL_TOO_LONG',
      'The media URL is too long.',
      400
    );
  }
  return url;
}

function firstString(...values: unknown[]) {
  return (
    values.find(
      (value): value is string =>
        typeof value === 'string' && Boolean(value.trim())
    ) || ''
  ).trim();
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
      // ignore invalid URLs
    }
  }
  return '';
}

export async function recognizeSong(params: {
  mediaUrl: string;
  sourceUrl?: string;
}): Promise<SongRecognitionResult> {
  const mediaUrl = normalizeUrl(params.mediaUrl);
  if (!/^https?:\/\//i.test(mediaUrl)) {
    throw new SongRecognitionError(
      'INVALID_MEDIA_URL',
      'A public media URL is required.',
      400
    );
  }

  const configs = await getAllConfigs();
  const apiToken =
    configs.audd_api_token?.trim() || process.env.AUDD_API_TOKEN?.trim();
  if (!apiToken) {
    throw new SongRecognitionError(
      'SONG_RECOGNITION_NOT_CONFIGURED',
      'Song recognition is not configured yet. Ask the site administrator to add an AudD API token.',
      503
    );
  }

  const baseUrl = (
    configs.audd_base_url?.trim() ||
    process.env.AUDD_BASE_URL?.trim() ||
    DEFAULT_AUDD_BASE_URL
  ).replace(/\/+$/, '');

  const form = new FormData();
  form.append('api_token', apiToken);
  form.append('url', mediaUrl);
  form.append('return', 'apple_music,spotify,deezer');

  let response: Response;
  try {
    response = await fetch(`${baseUrl}/`, {
      method: 'POST',
      body: form,
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
  } catch {
    throw new SongRecognitionError(
      'SONG_PROVIDER_TIMEOUT',
      'The music recognition provider timed out. Please try again.',
      504
    );
  }

  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    const providerMessage =
      typeof payload?.error?.message === 'string'
        ? payload.error.message
        : `Recognition provider returned HTTP ${response.status}.`;
    throw new SongRecognitionError(
      response.status === 401 ? 'SONG_AUTH_FAILED' : 'SONG_RECOGNITION_FAILED',
      providerMessage,
      response.status === 401 ? 503 : 502
    );
  }

  const result = payload?.result;
  if (!result || typeof result !== 'object') {
    throw new SongRecognitionError(
      'SONG_NOT_FOUND',
      'No matching song was found for the supplied audio.',
      404
    );
  }

  const artist = firstString(
    result.artist,
    result.artist_name,
    result.artistName
  );
  const title = firstString(result.title, result.name);
  const appleArtwork = firstString(result.apple_music?.artwork?.url);
  if (!artist && !title) {
    throw new SongRecognitionError(
      'SONG_NOT_FOUND',
      'No matching song was found for the supplied audio.',
      404
    );
  }

  return {
    artist: artist || undefined,
    title: title || undefined,
    album:
      firstString(result.album, result.album_name, result.albumName) ||
      undefined,
    releaseDate:
      firstString(result.release_date, result.releaseDate) || undefined,
    label: firstString(result.label, result.publisher) || undefined,
    timecode: firstString(result.timecode) || undefined,
    songLink: firstHttpUrl(result.song_link, result.songLink) || undefined,
    appleMusicUrl:
      firstHttpUrl(result.apple_music?.url, result.appleMusic?.url) ||
      undefined,
    spotifyUrl:
      firstHttpUrl(
        result.spotify?.external_urls?.spotify,
        result.spotify?.url
      ) || undefined,
    deezerUrl:
      firstHttpUrl(result.deezer?.link, result.deezer?.url) || undefined,
    isrc:
      firstString(
        result.apple_music?.isrc,
        result.spotify?.external_ids?.isrc,
        result.isrc
      ) || undefined,
    artworkUrl:
      firstHttpUrl(
        appleArtwork
          ? appleArtwork.replace('{w}', '1200').replace('{h}', '1200')
          : '',
        result.spotify?.album?.images?.[0]?.url,
        result.deezer?.album?.cover_big
      ) || undefined,
    model: 'audd',
    mediaUrl,
    sourceUrl: params.sourceUrl,
  };
}
