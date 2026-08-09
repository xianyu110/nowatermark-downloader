'use client';

import { useState } from 'react';
import {
  Check,
  Clipboard,
  Copy,
  Download,
  Film,
  LoaderCircle,
  Sparkles,
} from 'lucide-react';

import { useSession } from '@/core/auth/client';
import { normalizeLocale, type SiteLocale } from '@/config/locale';
import { getLocale } from '@/paraglide/runtime.js';
import { usePaidMembership } from '@/hooks/use-paid-membership';
import { Footer } from '@/blocks/footer';
import { Header } from '@/blocks/header';
import { VideoToolSupportSection } from '@/blocks/video-tool-support';

type ParsedMedia = {
  provider: string;
  platform: string;
  title: string;
  filename?: string;
  mediaType?: string;
  mediaUrl: string;
  videoUrl?: string;
  sourceUrl: string;
  creditsRemaining?: number;
  freeParsesRemaining?: number;
};

type FrameItem = {
  time: number;
  dataUrl: string;
};

type FrameCopy = {
  home: string;
  transcribe: string;
  summary: string;
  audio: string;
  tools: string;
  pricing: string;
  account: string;
  signIn: string;
  eyebrow: string;
  title: string;
  description: string;
  inputLabel: string;
  inputPlaceholder: string;
  paste: string;
  extract: string;
  extracting: string;
  pasteFailed: string;
  invalidUrl: string;
  parseFailed: string;
  accountRequired: string;
  membershipRequired: string;
  membershipTitle: string;
  membershipDescription: string;
  membershipActive: string;
  intervalLabel: string;
  maxLabel: string;
  resultEyebrow: string;
  resultTitle: string;
  copyText: string;
  copied: string;
  openFrame: string;
  downloadText: string;
  sourceLabel: string;
  providerLabel: string;
  fileLabel: string;
  workflowTitle: string;
  workflow: string[];
  noteTitle: string;
  noteBody: string;
  noFrames: string;
  remaining: (count: number) => string;
};

const copy: Partial<Record<SiteLocale, FrameCopy>> & { en: FrameCopy } = {
  en: {
    home: 'Downloader',
    transcribe: 'Video to text',
    summary: 'Video summary',
    audio: 'Audio extraction',
    tools: 'Video tools',
    pricing: 'Pricing',
    account: 'Account',
    signIn: 'Sign in',
    eyebrow: 'Paid member tool',
    title: 'Extract key frames from public videos',
    description:
      'Paste a public video URL, parse it once, then capture thumbnails and key shots at chosen intervals.',
    inputLabel: 'Public video URL',
    inputPlaceholder:
      'Paste a TikTok, Instagram, YouTube, X, or other public video link',
    paste: 'Paste',
    extract: 'Extract frames',
    extracting: 'Extracting frames',
    pasteFailed: 'Clipboard access was blocked by the browser.',
    invalidUrl: 'Paste a valid public video URL first.',
    parseFailed: 'The public video could not be parsed right now.',
    accountRequired: 'Sign in before extracting frames.',
    membershipRequired: 'Frame extraction requires an active paid membership.',
    membershipTitle: 'Paid membership feature',
    membershipDescription:
      'Monthly members can extract frames, export thumbnails, and unlock more media tools.',
    membershipActive: 'Your membership is active',
    intervalLabel: 'Interval (seconds)',
    maxLabel: 'Max frames',
    resultEyebrow: 'Frames ready',
    resultTitle: 'Captured frames',
    copyText: 'Copy image',
    copied: 'Copied',
    openFrame: 'Open frame',
    downloadText: 'Download',
    sourceLabel: 'Source',
    providerLabel: 'Provider',
    fileLabel: 'Video',
    workflowTitle: 'How frame extraction works',
    workflow: [
      'Paste a public video URL.',
      'Parse the source in video mode.',
      'Capture thumbnails at regular intervals.',
    ],
    noteTitle: 'Best use case',
    noteBody:
      'This tool helps turn a public video into reusable visual references, thumbnail sets, or review boards.',
    noFrames:
      'No frames were captured. The video may block canvas access in this browser.',
    remaining: (count: number) => `${count} credits remaining`,
  },
  zh: {
    home: '视频下载',
    transcribe: '视频转文字',
    summary: '视频总结',
    audio: '音频提取',
    tools: '视频工具',
    pricing: '价格',
    account: '账户',
    signIn: '登录',
    eyebrow: '付费会员工具',
    title: '从公开视频中提取关键画面',
    description:
      '粘贴公开视频 URL，先解析一次，再按时间间隔截取缩略图和关键帧。',
    inputLabel: '公开视频链接',
    inputPlaceholder: '粘贴 TikTok、Instagram、YouTube、X 或其他公开视频链接',
    paste: '粘贴',
    extract: '开始抽帧',
    extracting: '正在抽帧',
    pasteFailed: '浏览器阻止了剪贴板访问。',
    invalidUrl: '请先粘贴有效的公开视频链接。',
    parseFailed: '当前无法解析这个公开视频，请稍后重试。',
    accountRequired: '请先登录，再进行抽帧。',
    membershipRequired: '视频抽帧仅限有效付费会员使用。',
    membershipTitle: '付费会员专属功能',
    membershipDescription: '月度会员可抽帧、导出缩略图并解锁更多媒体工具。',
    membershipActive: '你的会员权益已生效',
    intervalLabel: '间隔（秒）',
    maxLabel: '最大帧数',
    resultEyebrow: '抽帧完成',
    resultTitle: '已捕获的画面',
    copyText: '复制图片',
    copied: '已复制',
    openFrame: '打开图片',
    downloadText: '下载',
    sourceLabel: '来源链接',
    providerLabel: '解析来源',
    fileLabel: '视频文件',
    workflowTitle: '视频抽帧的工作流',
    workflow: [
      '粘贴公开视频链接。',
      '使用视频模式解析。',
      '按固定间隔捕获缩略图和关键帧。',
    ],
    noteTitle: '适用场景',
    noteBody: '这个工具适合把公开视频转成可复用的视觉素材、缩略图组或审核板。',
    noFrames: '没有捕获到任何帧。当前浏览器可能阻止了 canvas 访问该视频。',
    remaining: (count: number) => `账户剩余 ${count} 次额度`,
  },
};

function localizedPath(locale: SiteLocale, path: string) {
  if (locale === 'en') return path;
  if (path === '/') return `/${locale}`;
  return `/${locale}${path}`;
}

async function waitForEvent(target: EventTarget, event: string) {
  await new Promise<void>((resolve, reject) => {
    const onEvent = () => {
      cleanup();
      resolve();
    };
    const onError = () => {
      cleanup();
      reject(new Error('Video loading failed.'));
    };
    const cleanup = () => {
      target.removeEventListener(event, onEvent);
      target.removeEventListener('error', onError);
    };
    target.addEventListener(event, onEvent, { once: true });
    target.addEventListener('error', onError, { once: true });
  });
}

async function loadVideo(mediaUrl: string) {
  const video = document.createElement('video');
  video.crossOrigin = 'anonymous';
  video.preload = 'auto';
  video.playsInline = true;
  video.muted = true;
  video.src = mediaUrl;
  await waitForEvent(video, 'loadedmetadata');
  return video;
}

async function captureFrame(video: HTMLVideoElement, time: number) {
  return new Promise<FrameItem>((resolve, reject) => {
    const cleanup = () => {
      video.removeEventListener('seeked', onSeeked);
      video.removeEventListener('error', onError);
    };

    const onError = () => {
      cleanup();
      reject(new Error('Failed to seek video.'));
    };

    const onSeeked = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth || 1280;
        canvas.height = video.videoHeight || 720;
        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error('Canvas context is unavailable.');
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
        cleanup();
        resolve({ time, dataUrl });
      } catch (error) {
        cleanup();
        reject(
          error instanceof Error ? error : new Error('Frame capture failed.')
        );
      }
    };

    video.addEventListener('seeked', onSeeked, { once: true });
    video.addEventListener('error', onError, { once: true });
    video.currentTime = Math.max(0, time);
  });
}

async function extractFramesFromMedia(params: {
  mediaUrl: string;
  intervalSeconds: number;
  maxFrames: number;
}) {
  const video = await loadVideo(params.mediaUrl);
  const duration = Number.isFinite(video.duration) ? video.duration : 0;
  const frames: FrameItem[] = [];
  const interval = Math.max(1, params.intervalSeconds);
  const maxFrames = Math.max(1, params.maxFrames);

  for (let index = 0; index < maxFrames; index += 1) {
    const time = index * interval;
    if (duration && time > duration) break;
    const seekTime = duration
      ? Math.min(time, Math.max(0, duration - 0.15))
      : time;
    // eslint-disable-next-line no-await-in-loop
    const frame = await captureFrame(video, seekTime);
    frames.push(frame);
  }

  video.removeAttribute('src');
  video.load();
  return frames;
}

export function VideoFrameExtractor({
  locale: localeOverride,
  pagePath = '/frame-extractor',
}: {
  locale?: SiteLocale;
  pagePath?: string;
}) {
  const locale = localeOverride || normalizeLocale(getLocale());
  const t = copy[locale] || copy.en;
  const { data: session } = useSession();
  const membershipQuery = usePaidMembership(Boolean(session?.user));
  const isPaidMember = Boolean(membershipQuery.data);
  const membershipLoading = Boolean(session?.user) && membershipQuery.isPending;
  const [input, setInput] = useState('');
  const [intervalSeconds, setIntervalSeconds] = useState(5);
  const [maxFrames, setMaxFrames] = useState(8);
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<ParsedMedia | null>(null);
  const [frames, setFrames] = useState<FrameItem[]>([]);
  const [copied, setCopied] = useState(false);

  const pricingHref = localizedPath(locale, '/pricing');
  const transcribeHref = localizedPath(locale, '/transcribe');
  const summaryHref = localizedPath(locale, '/video-summary');
  const audioHref = localizedPath(locale, '/audio-extractor');
  const accountHref = localizedPath(locale, '/settings');
  const signInHref = `${localizedPath(locale, '/sign-in')}?callbackUrl=${encodeURIComponent(
    localizedPath(locale, pagePath)
  )}`;
  const buttonLabel = membershipLoading
    ? t.extracting
    : busy
      ? t.extracting
      : t.extract;

  async function pasteUrl() {
    try {
      const value = await navigator.clipboard.readText();
      if (!value) return;
      setInput(value.trim());
      setNotice('');
    } catch {
      setNotice(t.pasteFailed);
    }
  }

  async function extract() {
    const url = input.trim();
    if (!/^https?:\/\//i.test(url)) {
      setNotice(t.invalidUrl);
      return;
    }
    if (!session?.user) {
      setNotice(t.accountRequired);
      return;
    }
    if (membershipLoading) return;
    if (!isPaidMember) {
      setNotice(t.membershipRequired);
      return;
    }

    setBusy(true);
    setNotice('');
    setCopied(false);
    setFrames([]);

    try {
      const response = await fetch('/api/parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, mode: 'mute', quality: '720' }),
      });
      const payload = await response.json().catch(() => null);
      if (!response.ok || payload?.code !== 0) {
        throw new Error(payload?.message || 'Frame extraction failed.');
      }

      const media = payload.data as ParsedMedia;
      const mediaUrl = media.videoUrl || media.mediaUrl;
      if (!mediaUrl) throw new Error(t.parseFailed);

      setResult(media);
      const captured = await extractFramesFromMedia({
        mediaUrl,
        intervalSeconds,
        maxFrames,
      });
      setFrames(captured);
      if (!captured.length) setNotice(t.noFrames);
    } catch (error) {
      setNotice(error instanceof Error ? error.message : t.parseFailed);
    } finally {
      setBusy(false);
    }
  }

  async function copyFrame(dataUrl: string) {
    try {
      await navigator.clipboard.writeText(dataUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      setNotice(t.pasteFailed);
    }
  }

  return (
    <div className="min-h-screen bg-[#f7faf9] text-[#10231d]">
      <Header locale={locale} />
      <main className="mx-auto max-w-6xl px-5 py-14 sm:px-8 sm:py-16">
        <section className="grid gap-8 rounded-3xl border border-[#dbe8e3] bg-white p-6 shadow-[0_10px_40px_rgba(16,77,57,0.06)] lg:grid-cols-[1.2fr_0.8fr] lg:p-10">
          <div>
            <p className="mb-4 text-sm font-semibold text-[#107b59]">
              {t.eyebrow}
            </p>
            <h1 className="max-w-3xl text-4xl leading-tight font-bold sm:text-5xl">
              {t.title}
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-[#536861]">
              {t.description}
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href={transcribeHref}
                className="inline-flex items-center gap-2 rounded-full border border-[#cde2db] bg-white px-4 py-2 text-sm font-semibold text-[#107b59]"
              >
                <Sparkles size={16} />
                {t.transcribe}
              </a>
              <a
                href={summaryHref}
                className="inline-flex items-center gap-2 rounded-full border border-[#cde2db] bg-white px-4 py-2 text-sm font-semibold text-[#107b59]"
              >
                {t.summary}
              </a>
              <a
                href={audioHref}
                className="inline-flex items-center gap-2 rounded-full border border-[#cde2db] bg-white px-4 py-2 text-sm font-semibold text-[#107b59]"
              >
                {t.audio}
              </a>
              <a
                href={pricingHref}
                className="inline-flex items-center gap-2 rounded-full border border-transparent bg-[#107b59] px-4 py-2 text-sm font-semibold text-white"
              >
                {t.pricing}
              </a>
            </div>

            <div className="mt-8 rounded-2xl border border-[#dbe8e3] bg-[#f8fcfa] p-4 text-sm leading-6 text-[#536861]">
              <p className="font-semibold text-[#10231d]">{t.noteTitle}</p>
              <p className="mt-2">{t.noteBody}</p>
            </div>
          </div>

          <aside className="rounded-2xl border border-[#dbe8e3] bg-[#fbfdfc] p-5">
            <p className="text-sm font-semibold text-[#107b59]">
              {t.membershipTitle}
            </p>
            <p className="mt-3 text-sm leading-6 text-[#536861]">
              {t.membershipDescription}
            </p>
            <div className="mt-4 flex items-center gap-2 text-sm text-[#536861]">
              <span className="inline-flex size-8 items-center justify-center rounded-full bg-[#e9f6f1] text-[#107b59]">
                <Film size={16} />
              </span>
              <span>
                {session?.user
                  ? isPaidMember
                    ? t.membershipActive
                    : t.account
                  : t.signIn}
              </span>
            </div>
            <div className="mt-5 flex gap-3">
              <a
                href={session?.user ? accountHref : signInHref}
                className="inline-flex items-center gap-2 rounded-full bg-[#107b59] px-4 py-2 text-sm font-semibold text-white"
              >
                {session?.user ? t.account : t.signIn}
              </a>
              <a
                href={localizedPath(locale, '/tools')}
                className="inline-flex items-center gap-2 rounded-full border border-[#cde2db] bg-white px-4 py-2 text-sm font-semibold text-[#107b59]"
              >
                {t.tools}
              </a>
            </div>
          </aside>
        </section>

        <section className="mt-10 grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="rounded-2xl border border-[#dbe8e3] bg-white p-5 sm:p-6">
            <div className="mb-4 grid gap-4 sm:grid-cols-3">
              <div className="sm:col-span-3">
                <div className="mb-4 flex items-center justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-bold">{t.inputLabel}</h2>
                    <p className="mt-1 text-sm text-[#536861]">
                      {t.description}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={pasteUrl}
                    className="inline-flex items-center gap-2 rounded-full border border-[#cde2db] bg-[#f8fcfa] px-4 py-2 text-sm font-semibold text-[#107b59]"
                  >
                    <Clipboard size={16} />
                    {t.paste}
                  </button>
                </div>
                <input
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  placeholder={t.inputPlaceholder}
                  className="w-full rounded-2xl border border-[#d7e4df] bg-[#fcfefe] px-4 py-4 text-[15px] transition outline-none focus:border-[#8fc7b1]"
                />
              </div>

              <label className="text-sm text-[#536861]">
                <span className="mb-2 block font-semibold text-[#10231d]">
                  {t.intervalLabel}
                </span>
                <input
                  type="number"
                  min={1}
                  max={60}
                  value={intervalSeconds}
                  onChange={(event) =>
                    setIntervalSeconds(
                      Math.max(1, Number(event.target.value) || 1)
                    )
                  }
                  className="w-full rounded-2xl border border-[#d7e4df] bg-[#fcfefe] px-4 py-3 transition outline-none focus:border-[#8fc7b1]"
                />
              </label>
              <label className="text-sm text-[#536861]">
                <span className="mb-2 block font-semibold text-[#10231d]">
                  {t.maxLabel}
                </span>
                <input
                  type="number"
                  min={1}
                  max={24}
                  value={maxFrames}
                  onChange={(event) =>
                    setMaxFrames(Math.max(1, Number(event.target.value) || 1))
                  }
                  className="w-full rounded-2xl border border-[#d7e4df] bg-[#fcfefe] px-4 py-3 transition outline-none focus:border-[#8fc7b1]"
                />
              </label>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={extract}
                disabled={busy || membershipLoading}
                className="inline-flex items-center gap-2 rounded-full bg-[#107b59] px-5 py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
              >
                {busy ? (
                  <LoaderCircle size={16} className="animate-spin" />
                ) : null}
                {buttonLabel}
              </button>
              {notice ? (
                <p className="text-sm font-medium text-[#c2410c]">{notice}</p>
              ) : null}
            </div>
          </div>

          <div className="rounded-2xl border border-[#dbe8e3] bg-white p-5 sm:p-6">
            {result ? (
              <div>
                <div className="mb-4 flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-[#107b59]">
                      {t.resultEyebrow}
                    </p>
                    <h2 className="mt-1 text-2xl font-bold">{t.resultTitle}</h2>
                  </div>
                </div>

                <h3 className="text-2xl leading-tight font-bold">
                  {result.title}
                </h3>
                <div className="mt-6 grid gap-3 rounded-2xl border border-[#dbe8e3] bg-[#f8fcfa] p-4 text-sm text-[#536861]">
                  <div>
                    <p className="text-xs font-semibold tracking-[0.16em] uppercase">
                      {t.fileLabel}
                    </p>
                    <p className="mt-1 font-medium text-[#10231d]">
                      {result.filename || '(unknown)'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold tracking-[0.16em] uppercase">
                      {t.providerLabel}
                    </p>
                    <p className="mt-1 font-medium text-[#10231d]">
                      {result.provider} · {result.platform}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold tracking-[0.16em] uppercase">
                      {t.sourceLabel}
                    </p>
                    <p className="mt-1 font-medium break-all text-[#10231d]">
                      {result.sourceUrl}
                    </p>
                  </div>
                </div>

                {frames.length ? (
                  <div className="mt-6">
                    <div className="mb-3 flex items-center justify-between">
                      <p className="text-sm font-semibold tracking-[0.16em] text-[#6f867f] uppercase">
                        {t.resultTitle}
                      </p>
                      <p className="text-xs text-[#6f867f]">
                        {frames.length} frames
                      </p>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      {frames.map((frame) => (
                        <div
                          key={`${frame.time}-${frame.dataUrl.slice(0, 16)}`}
                          className="overflow-hidden rounded-2xl border border-[#dbe8e3] bg-[#fbfdfc]"
                        >
                          <img
                            src={frame.dataUrl}
                            alt={`${result.title} @ ${frame.time}s`}
                            className="aspect-video w-full object-cover"
                          />
                          <div className="space-y-3 p-3">
                            <p className="text-sm font-semibold text-[#10231d]">
                              {frame.time}s
                            </p>
                            <div className="flex flex-wrap gap-2">
                              <button
                                type="button"
                                onClick={() => copyFrame(frame.dataUrl)}
                                className="inline-flex items-center gap-2 rounded-full border border-[#cde2db] bg-white px-3 py-1.5 text-xs font-semibold text-[#107b59]"
                              >
                                {copied ? (
                                  <Check size={14} />
                                ) : (
                                  <Copy size={14} />
                                )}
                                {copied ? t.copied : t.copyText}
                              </button>
                              <a
                                href={frame.dataUrl}
                                download={`frame-${frame.time}s.jpg`}
                                className="inline-flex items-center gap-2 rounded-full border border-[#cde2db] bg-white px-3 py-1.5 text-xs font-semibold text-[#107b59]"
                              >
                                <Download size={14} />
                                {t.downloadText}
                              </a>
                              <a
                                href={frame.dataUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-2 rounded-full border border-[#cde2db] bg-white px-3 py-1.5 text-xs font-semibold text-[#107b59]"
                              >
                                {t.openFrame}
                              </a>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="mt-6 text-sm text-[#6f867f]">{t.noFrames}</p>
                )}

                <p className="mt-4 text-xs leading-6 text-[#6f867f]">
                  {typeof result.creditsRemaining === 'number'
                    ? t.remaining(result.creditsRemaining)
                    : typeof result.freeParsesRemaining === 'number'
                      ? t.remaining(result.freeParsesRemaining)
                      : null}
                </p>
              </div>
            ) : (
              <div className="flex h-full min-h-[360px] flex-col justify-center rounded-2xl border border-dashed border-[#dbe8e3] bg-[#fbfdfc] p-6 text-center">
                <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-[#e9f6f1] text-[#107b59]">
                  <Film size={20} />
                </div>
                <h2 className="mt-4 text-2xl font-bold">{t.resultTitle}</h2>
                <p className="mt-3 text-sm leading-6 text-[#536861]">
                  {t.description}
                </p>
              </div>
            )}
          </div>
        </section>

        <section className="mt-10 rounded-2xl border border-[#dbe8e3] bg-white p-6">
          <h2 className="text-2xl font-bold">{t.workflowTitle}</h2>
          <ol className="mt-5 grid gap-4 md:grid-cols-3">
            {t.workflow.map((item, index) => (
              <li
                key={item}
                className="rounded-2xl border border-[#dbe8e3] bg-[#fbfdfc] p-5 text-sm leading-6 text-[#536861]"
              >
                <div className="mb-3 inline-flex size-8 items-center justify-center rounded-full bg-[#e9f6f1] text-sm font-bold text-[#107b59]">
                  {index + 1}
                </div>
                {item}
              </li>
            ))}
          </ol>
        </section>

        <VideoToolSupportSection locale={locale} tool="frames" />
      </main>
      <Footer locale={locale} />
    </div>
  );
}
