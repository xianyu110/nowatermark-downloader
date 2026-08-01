'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowRight,
  Check,
  Clock3,
  Copy,
  Download,
  ExternalLink,
  Globe,
  History,
  Link2,
  LoaderCircle,
  Play,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Trash2,
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button, buttonVariants } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

type ParseResult = {
  provider?: string;
  platform?: string;
  title?: string;
  desc?: string;
  author?: { name?: string; avatar?: string };
  coverUrl?: string;
  videoUrl?: string;
  mediaUrl?: string;
  duration?: number;
  sourceUrl?: string;
  alternates?: { label?: string; url: string; thumb?: string; type?: string }[];
};

type HistoryItem = ParseResult & {
  id: string;
  createdAt: number;
};

const HISTORY_KEY = 'nowaterdownloader-history';
const DRAFT_KEY = 'nowaterdownloader-draft';

const PLATFORM_BADGES = [
  'TikTok',
  'Instagram',
  'YouTube',
  'X',
  'Facebook',
  'Reddit',
];

const SAMPLE_LINKS = [
  {
    label: 'TikTok',
    value: 'https://www.tiktok.com/@example/video/1234567890123456789',
  },
  {
    label: 'Instagram',
    value: 'https://www.instagram.com/reel/C123example/',
  },
  {
    label: 'YouTube Shorts',
    value: 'https://www.youtube.com/shorts/abc123example',
  },
  {
    label: 'X',
    value: 'https://x.com/example/status/1234567890123456789',
  },
];

function firstString(...values: unknown[]) {
  return (
    values.find(
      (value): value is string =>
        typeof value === 'string' && Boolean(value.trim())
    ) || ''
  );
}

function formatDuration(value?: number) {
  if (!value || value <= 0) return 'Unknown';
  const seconds = Math.round(value > 1000 ? value / 1000 : value);
  const minutes = Math.floor(seconds / 60);
  return `${minutes}:${String(seconds % 60).padStart(2, '0')}`;
}

function formatUrl(raw: string) {
  try {
    return new URL(raw).hostname.replace(/^www\./i, '');
  } catch {
    return raw;
  }
}

function extractUrl(value: string) {
  const match = value.match(/https?:\/\/[^\s]+/i);
  return (match?.[0] || value).replace(/[)\]}>，。！？；、]+$/g, '');
}

function detectPlatform(url: string) {
  try {
    const parsed = new URL(url);
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

function normalizeHistory(items: HistoryItem[]) {
  return items.slice(0, 8);
}

export function VideoDownloaderTool() {
  const resultSectionRef = useRef<HTMLElement | null>(null);
  const noticeTimerRef = useRef<number | null>(null);
  const shouldScrollToResultRef = useRef(false);

  const [input, setInput] = useState('');
  const [result, setResult] = useState<ParseResult | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState<{
    type: 'error' | 'success';
    text: string;
  } | null>(null);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [copiedCover, setCopiedCover] = useState(false);
  const [copiedSummary, setCopiedSummary] = useState(false);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(HISTORY_KEY);
      if (stored) setHistory(JSON.parse(stored));
      const draft = window.localStorage.getItem(DRAFT_KEY);
      if (draft) setInput(draft);
    } catch {
      // Local history is a convenience only.
    }

    return () => {
      if (noticeTimerRef.current) {
        window.clearTimeout(noticeTimerRef.current);
      }
    };
  }, []);

  const activeMediaUrl = result?.mediaUrl || result?.videoUrl || '';
  const coverImageUrl = result?.coverUrl?.trim() || '';
  const summaryText = [
    result?.title ? `Title: ${result.title}` : '',
    result?.desc ? `Description: ${result.desc}` : '',
    result?.author?.name ? `Author: ${result.author.name}` : '',
    activeMediaUrl ? `Media URL: ${activeMediaUrl}` : '',
    coverImageUrl ? `Cover URL: ${coverImageUrl}` : '',
    result?.sourceUrl ? `Source: ${result.sourceUrl}` : '',
  ]
    .filter(Boolean)
    .join('\n');

  const helperText = useMemo(() => {
    if (loading) return 'Trying the primary parser first, then falling back automatically...';
    if (notice?.type === 'error') return notice.text;
    if (notice?.type === 'success') return notice.text;
    if (result) return 'Result ready. Open the media URL or copy it to your clipboard.';
    return 'Paste a public video link. The server will try the configured provider chain and retry on failure.';
  }, [loading, notice, result]);

  useEffect(() => {
    if (!result || !shouldScrollToResultRef.current) return;
    shouldScrollToResultRef.current = false;
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        resultSectionRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
      });
    });
  }, [result]);

  function persistHistory(next: HistoryItem[] | ((current: HistoryItem[]) => HistoryItem[])) {
    setHistory((current) => {
      const resolved = typeof next === 'function' ? next(current) : next;
      const compact = normalizeHistory(resolved);
      window.localStorage.setItem(HISTORY_KEY, JSON.stringify(compact));
      return compact;
    });
  }

  function flashNotice(text: string) {
    if (noticeTimerRef.current) {
      window.clearTimeout(noticeTimerRef.current);
    }
    setNotice({ type: 'success', text });
    noticeTimerRef.current = window.setTimeout(() => {
      setNotice(null);
      noticeTimerRef.current = null;
    }, 1800);
  }

  async function copyText(value: string, markCopied: (value: boolean) => void, text: string) {
    try {
      await navigator.clipboard.writeText(value);
      markCopied(true);
      window.setTimeout(() => markCopied(false), 1400);
      flashNotice(text);
    } catch {
      setNotice({ type: 'error', text: 'Clipboard access is blocked by the browser.' });
    }
  }

  async function handlePaste() {
    try {
      const text = await navigator.clipboard.readText();
      if (!text) {
        setNotice({ type: 'error', text: 'Clipboard is empty.' });
        return;
      }
      setInput(text);
      flashNotice('Pasted content from the clipboard.');
    } catch {
      setNotice({ type: 'error', text: 'The browser blocked clipboard access.' });
    }
  }

  async function handleParse() {
    const value = input.trim();
    if (!value) {
      setNotice({ type: 'error', text: 'Paste a video link first.' });
      return;
    }

    const sourceUrl = extractUrl(value);
    if (!sourceUrl) {
      setNotice({ type: 'error', text: 'No valid URL was found in the pasted text.' });
      return;
    }

    setLoading(true);
    setNotice(null);
    setResult(null);
    shouldScrollToResultRef.current = true;
    setCopiedUrl(false);
    setCopiedCover(false);
    setCopiedSummary(false);

    try {
      const response = await fetch('/api/parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: value }),
      });
      const payload = await response.json().catch(() => null);

      if (!response.ok || payload?.code !== 0) {
        throw new Error(payload?.message || 'Parsing failed. Please try again.');
      }

      const parsed = payload.data as ParseResult;
      const nextItem: HistoryItem = {
        ...parsed,
        id: `${Date.now()}`,
        createdAt: Date.now(),
        sourceUrl,
      };

      setResult(parsed);
      persistHistory((current) => [
        nextItem,
        ...current.filter((item) => item.sourceUrl !== sourceUrl),
      ]);
      window.localStorage.setItem(DRAFT_KEY, value);
      flashNotice('Parsing complete. The result is ready below.');
      window.localStorage.removeItem(DRAFT_KEY);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Parsing failed. Please try again.';
      setNotice({ type: 'error', text: message });
    } finally {
      setLoading(false);
    }
  }

  function handleClearHistory() {
    persistHistory([]);
    setNotice({ type: 'success', text: 'Local history cleared.' });
  }

  return (
    <section className="bg-background text-foreground min-h-screen">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-lg border border-border bg-background shadow-sm">
              <img src="/logo.svg" alt="" className="size-6" />
            </span>
            <div>
              <p className="text-[11px] font-medium tracking-[0.2em] text-muted-foreground uppercase">
                NoWatermark Downloader
              </p>
              <p className="text-sm text-muted-foreground">
                Primary provider first, with automatic fallback retries.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {PLATFORM_BADGES.map((label) => (
              <Badge key={label} variant="outline" className="rounded-full">
                {label}
              </Badge>
            ))}
          </div>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_340px]">
          <div className="space-y-6">
            <div className="space-y-4">
              <Badge variant="secondary" className="rounded-full">
                <Sparkles className="mr-1.5 size-3.5" />
                Public video parser
              </Badge>
              <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
                Download public videos from a single link.
              </h1>
              <p className="max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
                Paste a public link from TikTok, Instagram, YouTube Shorts, X,
                Facebook, or Reddit. The backend tries the primary parser first
                and automatically retries fallbacks when the upstream fails.
              </p>
            </div>

            <div className="rounded-2xl border border-border bg-card p-4 shadow-sm sm:p-5">
              <Textarea
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder="Paste a video URL or share text here..."
                aria-label="Video URL"
                className="min-h-[164px] resize-none border-0 bg-transparent p-0 text-base shadow-none focus-visible:ring-0 sm:text-[15px]"
              />
              <div className="mt-4 flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handlePaste}
                  className="gap-2"
                >
                  <Link2 className="size-4" />
                  Paste
                </Button>
                <Button
                  type="button"
                  onClick={handleParse}
                  disabled={loading || !input.trim()}
                  className="gap-2"
                >
                  {loading ? (
                    <LoaderCircle className="size-4 animate-spin" />
                  ) : (
                    <ArrowRight className="size-4" />
                  )}
                  Analyze
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setInput('')}
                  className="gap-2"
                >
                  <Trash2 className="size-4" />
                  Clear
                </Button>
              </div>
              <p
                className={cn(
                  'mt-3 text-sm',
                  notice?.type === 'error'
                    ? 'text-destructive'
                    : 'text-muted-foreground'
                )}
              >
                {helperText}
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {SAMPLE_LINKS.map((sample) => (
                  <button
                    key={sample.label}
                    type="button"
                    onClick={() => setInput(sample.value)}
                    className="rounded-full border border-border bg-background px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  >
                    {sample.label}
                  </button>
                ))}
              </div>
            </div>

            {result && (
              <section
                ref={resultSectionRef}
                className="rounded-2xl border border-border bg-card p-4 shadow-sm sm:p-5"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-medium tracking-[0.18em] text-muted-foreground uppercase">
                      Result
                    </p>
                    <h2 className="mt-1 text-2xl font-semibold tracking-tight">
                      {result.title || 'Untitled media'}
                    </h2>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline" className="rounded-full">
                      {result.platform || 'Public source'}
                    </Badge>
                    <Badge variant="secondary" className="rounded-full">
                      {result.provider || 'Primary provider'}
                    </Badge>
                  </div>
                </div>

                <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1.2fr)_minmax(280px,0.8fr)]">
                  <div className="space-y-4">
                    <div className="overflow-hidden rounded-2xl border border-border bg-muted/40">
                      {coverImageUrl ? (
                        <img
                          src={coverImageUrl}
                          alt={result.title || 'Media cover'}
                          className="aspect-video w-full object-cover"
                        />
                      ) : activeMediaUrl ? (
                        <video
                          controls
                          playsInline
                          preload="metadata"
                          src={activeMediaUrl}
                          poster={coverImageUrl || undefined}
                          className="aspect-video w-full bg-black object-contain"
                        />
                      ) : (
                        <div className="flex aspect-video items-center justify-center text-sm text-muted-foreground">
                          No preview available.
                        </div>
                      )}
                    </div>

                    <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
                      {result.desc || 'The parser returned a direct media URL.'}
                    </p>

                    <div className="flex flex-wrap gap-2">
                      <a
                        href={activeMediaUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={buttonVariants({
                          variant: 'default',
                          size: 'default',
                        })}
                      >
                        <Play className="size-4" />
                        Open media
                      </a>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() =>
                          activeMediaUrl &&
                          copyText(
                            activeMediaUrl,
                            setCopiedUrl,
                            'Media URL copied.'
                          )
                        }
                        disabled={!activeMediaUrl}
                        className="gap-2"
                      >
                        {copiedUrl ? <Check className="size-4" /> : <Copy className="size-4" />}
                        Copy URL
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() =>
                          coverImageUrl &&
                          copyText(
                            coverImageUrl,
                            setCopiedCover,
                            'Cover URL copied.'
                          )
                        }
                        disabled={!coverImageUrl}
                        className="gap-2"
                      >
                        {copiedCover ? <Check className="size-4" /> : <Copy className="size-4" />}
                        Copy cover
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() =>
                          summaryText &&
                          copyText(
                            summaryText,
                            setCopiedSummary,
                            'Summary copied.'
                          )
                        }
                        disabled={!summaryText}
                        className="gap-2"
                      >
                        {copiedSummary ? (
                          <Check className="size-4" />
                        ) : (
                          <Download className="size-4" />
                        )}
                        Copy summary
                      </Button>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-border bg-background p-4">
                    <dl className="space-y-4 text-sm">
                      <div className="flex items-start justify-between gap-4">
                        <dt className="text-muted-foreground">Source</dt>
                        <dd className="text-right font-medium break-all">
                          {result.sourceUrl ? formatUrl(result.sourceUrl) : 'Unknown'}
                        </dd>
                      </div>
                      <div className="flex items-start justify-between gap-4">
                        <dt className="text-muted-foreground">Author</dt>
                        <dd className="text-right font-medium break-all">
                          {result.author?.name || 'Unknown'}
                        </dd>
                      </div>
                      <div className="flex items-start justify-between gap-4">
                        <dt className="text-muted-foreground">Duration</dt>
                        <dd className="text-right font-medium">
                          {formatDuration(result.duration)}
                        </dd>
                      </div>
                      <div className="flex items-start justify-between gap-4">
                        <dt className="text-muted-foreground">Media URL</dt>
                        <dd className="max-w-[190px] text-right font-medium break-all">
                          {activeMediaUrl || 'Unavailable'}
                        </dd>
                      </div>
                    </dl>

                    {result.alternates?.length ? (
                      <div className="mt-4 border-t border-border pt-4">
                        <p className="text-xs font-medium tracking-[0.18em] text-muted-foreground uppercase">
                          Alternate picks
                        </p>
                        <div className="mt-3 space-y-2">
                          {result.alternates.map((item, index) => (
                            <a
                              key={`${item.url}-${index}`}
                              href={item.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center justify-between gap-3 rounded-xl border border-border px-3 py-2 text-sm transition-colors hover:bg-muted"
                            >
                              <span className="min-w-0 truncate">
                                {item.label || item.type || `Option ${index + 1}`}
                              </span>
                              <ExternalLink className="size-4 shrink-0 text-muted-foreground" />
                            </a>
                          ))}
                        </div>
                      </div>
                    ) : null}
                  </div>
                </div>
              </section>
            )}

            <section id="supported" className="space-y-4">
              <div className="flex items-center gap-2">
                <Globe className="size-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold">Supported platforms</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {PLATFORM_BADGES.map((label) => (
                  <Badge key={label} variant="outline" className="rounded-full px-3 py-1">
                    {label}
                  </Badge>
                ))}
              </div>
            </section>

            <section id="faq" className="space-y-4">
              <div className="flex items-center gap-2">
                <History className="size-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold">How it works</h3>
              </div>
              <div className="grid gap-3 md:grid-cols-3">
                {[
                  {
                    title: 'Paste a link',
                    desc: 'Drop a public post URL or share text into the input box.',
                  },
                  {
                    title: 'Retry chain',
                    desc: 'The server tries the primary provider first, then retries fallbacks.',
                  },
                  {
                    title: 'Copy the result',
                    desc: 'Open the media URL directly or copy it for your own workflow.',
                  },
                ].map((item) => (
                  <div
                    key={item.title}
                    className="rounded-2xl border border-border bg-card p-4 shadow-sm"
                  >
                    <p className="font-medium">{item.title}</p>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                      {item.desc}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <aside className="space-y-4 lg:sticky lg:top-6 lg:self-start">
            <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
              <div className="flex items-center gap-2">
                <ShieldCheck className="size-4 text-muted-foreground" />
                <h3 className="font-semibold">Operational notes</h3>
              </div>
              <ul className="mt-3 space-y-3 text-sm leading-6 text-muted-foreground">
                <li>Primary provider runs first. Failures trigger a retry, then fallback.</li>
                <li>Use public URLs only. Private or login-gated content can fail upstream.</li>
                <li>Local history stays in your browser and never leaves the device.</li>
              </ul>
            </div>

            <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Clock3 className="size-4 text-muted-foreground" />
                  <h3 className="font-semibold">Recent results</h3>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleClearHistory}
                  disabled={!history.length}
                  className="gap-2"
                >
                  <RefreshCw className="size-4" />
                  Clear
                </Button>
              </div>

              <div className="mt-4 space-y-3">
                {history.length ? (
                  history.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        setInput(item.sourceUrl || '');
                        setResult(item);
                        shouldScrollToResultRef.current = true;
                      }}
                      className="w-full rounded-xl border border-border p-3 text-left transition-colors hover:bg-muted"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium">
                            {item.title || item.platform || 'Untitled media'}
                          </p>
                          <p className="mt-1 text-xs text-muted-foreground">
                            {item.platform || 'Public source'} ·{' '}
                            {new Date(item.createdAt).toLocaleString()}
                          </p>
                        </div>
                        <Badge variant="outline" className="rounded-full">
                          {item.provider || 'Parser'}
                        </Badge>
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="rounded-xl border border-dashed border-border px-3 py-6 text-sm text-muted-foreground">
                    Parsed links will appear here.
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
              <div className="flex items-center gap-2">
                <Download className="size-4 text-muted-foreground" />
                <h3 className="font-semibold">Quick actions</h3>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <a
                  href="#faq"
                  className={buttonVariants({ variant: 'outline', size: 'sm' })}
                >
                  FAQ
                </a>
                <a
                  href="#supported"
                  className={buttonVariants({ variant: 'outline', size: 'sm' })}
                >
                  Supported platforms
                </a>
                <a
                  href="/pricing"
                  className={buttonVariants({ variant: 'ghost', size: 'sm' })}
                >
                  View plans
                </a>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
