import type { SiteLocale } from '@/config/locale';
import { getAllConfigs } from '@/modules/config/service';

const DEFAULT_OPENAI_BASE_URL = 'https://api.openai.com/v1';
const DEFAULT_MODEL = 'gpt-4o-mini';
const DEFAULT_MAX_CHARS = 40_000;
const REQUEST_TIMEOUT_MS = 60_000;

const languageLabels: Record<SiteLocale, string> = {
  en: 'English',
  zh: 'Chinese',
  es: 'Spanish',
  pt: 'Portuguese',
  fr: 'French',
  de: 'German',
  it: 'Italian',
  id: 'Indonesian',
  ja: 'Japanese',
  ko: 'Korean',
};

export type VideoSummaryResult = {
  title: string;
  summary: string;
  bullets: string[];
  keywords: string[];
  model: string;
  language?: string;
};

export class VideoSummaryError extends Error {
  code: string;
  status: number;

  constructor(code: string, message: string, status = 502) {
    super(message);
    this.name = 'VideoSummaryError';
    this.code = code;
    this.status = status;
  }
}

function parseMaxChars(value: string | undefined) {
  const parsed = Number.parseInt(value || '', 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : DEFAULT_MAX_CHARS;
}

function extractJsonObject(text: string) {
  const direct = text.trim();
  try {
    return JSON.parse(direct);
  } catch {
    // continue
  }

  const fenced = direct
    .replace(/^```(?:json)?/i, '')
    .replace(/```$/i, '')
    .trim();
  try {
    return JSON.parse(fenced);
  } catch {
    // continue
  }

  const start = direct.indexOf('{');
  const end = direct.lastIndexOf('}');
  if (start >= 0 && end > start) {
    try {
      return JSON.parse(direct.slice(start, end + 1));
    } catch {
      // continue
    }
  }
  return null;
}

function normalizeList(value: unknown) {
  if (Array.isArray(value)) {
    return value
      .map((item) => (typeof item === 'string' ? item.trim() : ''))
      .filter(Boolean)
      .slice(0, 10);
  }
  if (typeof value === 'string') {
    return value
      .split(/\n|•|;|,/g)
      .map((item) => item.trim())
      .filter(Boolean)
      .slice(0, 10);
  }
  return [];
}

function normalizeResponse(text: string, model: string): VideoSummaryResult {
  const parsed = extractJsonObject(text);
  if (parsed && typeof parsed === 'object') {
    const data = parsed as Record<string, unknown>;
    const title =
      typeof data.title === 'string' && data.title.trim()
        ? data.title.trim()
        : 'Video summary';
    const summary =
      typeof data.summary === 'string' && data.summary.trim()
        ? data.summary.trim()
        : typeof data.text === 'string' && data.text.trim()
          ? data.text.trim()
          : text.trim();
    const bullets = normalizeList(data.bullets);
    const keywords = normalizeList(data.keywords);
    return {
      title,
      summary,
      bullets,
      keywords,
      model,
      language:
        typeof data.language === 'string' && data.language.trim()
          ? data.language.trim()
          : undefined,
    };
  }

  const lines = text
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean);
  const title = lines.shift() || 'Video summary';
  return {
    title,
    summary: lines.join(' ') || text.trim(),
    bullets: lines.slice(0, 5),
    keywords: [],
    model,
  };
}

function buildPrompt(locale: SiteLocale, transcript: string) {
  const language = languageLabels[locale] || languageLabels.en;
  return [
    `Summarize the following public video transcript in ${language}.`,
    'Return JSON only with these keys:',
    '{"title":"short title","summary":"2-4 short paragraphs","bullets":["3-6 concise bullets"],"keywords":["5-10 keywords"]}',
    'Rules:',
    '- Keep the writing natural and concise.',
    '- Do not add markdown fences.',
    '- If the transcript is noisy, infer the main topic conservatively.',
    '- Do not invent facts not supported by the transcript.',
    '',
    'Transcript:',
    transcript,
  ].join('\n');
}

export async function summarizeTranscript(params: {
  transcript: string;
  locale: SiteLocale;
}): Promise<VideoSummaryResult> {
  const transcript = params.transcript.trim();
  if (!transcript) {
    throw new VideoSummaryError(
      'SUMMARY_EMPTY',
      'Transcript text is required.',
      400
    );
  }

  const configs = await getAllConfigs();
  const apiKey = configs.openai_api_key?.trim();
  if (!apiKey) {
    throw new VideoSummaryError(
      'SUMMARY_NOT_CONFIGURED',
      'Video summary is not configured yet. Ask the site administrator to add an OpenAI-compatible API key.',
      503
    );
  }

  const maxChars = parseMaxChars(
    configs.video_summary_max_chars || process.env.VIDEO_SUMMARY_MAX_CHARS
  );
  if (transcript.length > maxChars) {
    throw new VideoSummaryError(
      'SUMMARY_TOO_LARGE',
      `Transcript must be smaller than ${maxChars.toLocaleString()} characters.`,
      413
    );
  }

  const baseUrl = (
    configs.openai_base_url?.trim() || DEFAULT_OPENAI_BASE_URL
  ).replace(/\/+$/, '');
  const model =
    configs.video_summary_model?.trim() ||
    process.env.VIDEO_SUMMARY_MODEL?.trim() ||
    DEFAULT_MODEL;

  let response: Response;
  try {
    response = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        temperature: 0.2,
        max_tokens: 700,
        messages: [
          {
            role: 'system',
            content:
              'You are a precise assistant that summarizes video transcripts into structured JSON.',
          },
          {
            role: 'user',
            content: buildPrompt(params.locale, transcript),
          },
        ],
      }),
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
  } catch {
    throw new VideoSummaryError(
      'SUMMARY_PROVIDER_TIMEOUT',
      'The summary provider timed out. Please try again.',
      504
    );
  }

  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    const providerMessage =
      typeof payload?.error?.message === 'string'
        ? payload.error.message
        : `Summary provider returned HTTP ${response.status}.`;
    throw new VideoSummaryError(
      response.status === 401 ? 'SUMMARY_AUTH_FAILED' : 'SUMMARY_FAILED',
      providerMessage,
      response.status === 401 ? 503 : 502
    );
  }

  const content = String(
    payload?.choices?.[0]?.message?.content ?? payload?.choices?.[0]?.text ?? ''
  ).trim();
  if (!content) {
    throw new VideoSummaryError(
      'SUMMARY_EMPTY',
      'The summary provider returned an empty response.',
      502
    );
  }

  return normalizeResponse(content, model);
}
