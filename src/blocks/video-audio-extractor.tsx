'use client';

import { useState } from 'react';
import {
  Check,
  Clipboard,
  Copy,
  Download,
  FileAudio,
  LoaderCircle,
  Play,
  Sparkles,
} from 'lucide-react';

import { useSession } from '@/core/auth/client';
import { normalizeLocale, type SiteLocale } from '@/config/locale';
import { getLocale } from '@/paraglide/runtime.js';
import { usePaidMembership } from '@/hooks/use-paid-membership';
import { Footer } from '@/blocks/footer';
import { Header } from '@/blocks/header';

type AudioResult = {
  provider: string;
  platform: string;
  title: string;
  desc?: string;
  author?: {
    name?: string;
    avatar?: string;
  };
  filename?: string;
  mediaType?: string;
  mediaUrl: string;
  videoUrl?: string;
  coverUrl?: string;
  duration?: number;
  sourceUrl: string;
  creditsRemaining?: number;
  freeParsesRemaining?: number;
};

type AudioCopy = {
  home: string;
  transcribe: string;
  summary: string;
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
  resultEyebrow: string;
  resultTitle: string;
  copyText: string;
  copied: string;
  openAudio: string;
  audioLabel: string;
  previewLabel: string;
  downloadText: string;
  fileLabel: string;
  providerLabel: string;
  sourceLabel: string;
  durationLabel: string;
  workflowTitle: string;
  workflow: string[];
  noteTitle: string;
  noteBody: string;
  remaining: (count: number) => string;
};

const copy: Partial<Record<SiteLocale, AudioCopy>> & { en: AudioCopy } = {
  en: {
    home: 'Downloader',
    transcribe: 'Video to text',
    summary: 'Video summary',
    tools: 'Video tools',
    pricing: 'Pricing',
    account: 'Account',
    signIn: 'Sign in',
    eyebrow: 'Paid member tool',
    title: 'Extract audio from public video links',
    description:
      'Paste a public video URL, extract the audio track, preview it, and copy the direct audio link.',
    inputLabel: 'Public video URL',
    inputPlaceholder:
      'Paste a TikTok, Instagram, YouTube, X, or other public video link',
    paste: 'Paste',
    extract: 'Extract audio',
    extracting: 'Extracting audio',
    pasteFailed: 'Clipboard access was blocked by the browser.',
    invalidUrl: 'Paste a valid public video URL first.',
    parseFailed: 'The public video could not be parsed right now.',
    accountRequired: 'Sign in before extracting audio.',
    membershipRequired: 'Audio extraction requires an active paid membership.',
    membershipTitle: 'Paid membership feature',
    membershipDescription:
      'Monthly members can extract audio, summarize transcripts, and unlock more AI tools.',
    membershipActive: 'Your membership is active',
    resultEyebrow: 'Audio ready',
    resultTitle: 'Extracted audio',
    copyText: 'Copy link',
    copied: 'Copied',
    openAudio: 'Open audio',
    audioLabel: 'Audio preview',
    previewLabel: 'Preview player',
    downloadText: 'Download file',
    fileLabel: 'File',
    providerLabel: 'Provider',
    sourceLabel: 'Source',
    durationLabel: 'Duration',
    workflowTitle: 'How audio extraction works',
    workflow: [
      'Paste a public video URL.',
      'Parse the source in audio mode.',
      'Preview or copy the direct audio link.',
    ],
    noteTitle: 'Best use case',
    noteBody:
      'This is a paid utility for turning a public video into a reusable audio file. It pairs naturally with the transcription and summary tools.',
    remaining: (count: number) => `${count} credits remaining`,
  },
  zh: {
    home: '视频下载',
    transcribe: '视频转文字',
    summary: '视频总结',
    tools: '视频工具',
    pricing: '价格',
    account: '账户',
    signIn: '登录',
    eyebrow: '付费会员工具',
    title: '从公开视频链接提取音频',
    description: '粘贴公开视频 URL，提取音轨，在线预览，并复制音频直链。',
    inputLabel: '公开视频链接',
    inputPlaceholder: '粘贴 TikTok、Instagram、YouTube、X 或其他公开视频链接',
    paste: '粘贴',
    extract: '提取音频',
    extracting: '正在提取音频',
    pasteFailed: '浏览器阻止了剪贴板访问。',
    invalidUrl: '请先粘贴有效的公开视频链接。',
    parseFailed: '当前无法解析这个公开视频，请稍后重试。',
    accountRequired: '请先登录，再提取音频。',
    membershipRequired: '音频提取仅限有效付费会员使用。',
    membershipTitle: '付费会员专属功能',
    membershipDescription: '月度会员可提取音频、视频总结，并解锁更多 AI 工具。',
    membershipActive: '你的会员权益已生效',
    resultEyebrow: '音频已准备好',
    resultTitle: '已提取的音频',
    copyText: '复制直链',
    copied: '已复制',
    openAudio: '打开音频',
    audioLabel: '音频预览',
    previewLabel: '预览播放器',
    downloadText: '下载文件',
    fileLabel: '文件',
    providerLabel: '解析来源',
    sourceLabel: '原始链接',
    durationLabel: '时长',
    workflowTitle: '音频提取的工作流',
    workflow: [
      '粘贴公开视频链接。',
      '使用音频模式解析。',
      '预览或复制音频直链。',
    ],
    noteTitle: '适用场景',
    noteBody:
      '这是把公开视频转成可复用音频文件的付费工具。它和视频转文字、视频总结可以形成一条完整工作流。',
    remaining: (count: number) => `账户剩余 ${count} 次额度`,
  },
};

function localizedPath(locale: SiteLocale, path: string) {
  if (locale === 'en') return path;
  if (path === '/') return `/${locale}`;
  return `/${locale}${path}`;
}

function formatDuration(seconds?: number) {
  if (!seconds || seconds <= 0) return '';
  const total = Math.round(seconds);
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const secs = total % 60;
  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }
  return `${minutes}:${String(secs).padStart(2, '0')}`;
}

export function VideoAudioExtractor({
  locale: localeOverride,
  pagePath = '/audio-extractor',
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
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<AudioResult | null>(null);
  const [copied, setCopied] = useState(false);

  const pricingHref = localizedPath(locale, '/pricing');
  const transcribeHref = localizedPath(locale, '/transcribe');
  const summaryHref = localizedPath(locale, '/video-summary');
  const accountHref = localizedPath(locale, '/settings');
  const signInHref = `${localizedPath(locale, '/sign-in')}?callbackUrl=${encodeURIComponent(
    localizedPath(locale, pagePath)
  )}`;
  const audioHref = result?.mediaUrl || '';
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

  async function extractAudio() {
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

    try {
      const response = await fetch('/api/parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, mode: 'audio', quality: '720' }),
      });
      const payload = await response.json().catch(() => null);
      if (!response.ok || payload?.code !== 0) {
        throw new Error(payload?.message || 'Audio extraction failed.');
      }
      setResult(payload.data as AudioResult);
    } catch (error) {
      setNotice(error instanceof Error ? error.message : t.parseFailed);
    } finally {
      setBusy(false);
    }
  }

  async function copyLink() {
    if (!audioHref) return;
    try {
      await navigator.clipboard.writeText(audioHref);
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
                <FileAudio size={16} />
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
            <div className="mb-4 flex items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold">{t.inputLabel}</h2>
                <p className="mt-1 text-sm text-[#536861]">{t.description}</p>
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
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={extractAudio}
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
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={copyLink}
                      className="inline-flex items-center gap-2 rounded-full border border-[#cde2db] bg-[#f8fcfa] px-4 py-2 text-sm font-semibold text-[#107b59]"
                    >
                      {copied ? <Check size={16} /> : <Copy size={16} />}
                      {copied ? t.copied : t.copyText}
                    </button>
                    <a
                      href={audioHref}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 rounded-full border border-[#cde2db] bg-[#f8fcfa] px-4 py-2 text-sm font-semibold text-[#107b59]"
                    >
                      <Download size={16} />
                      {t.openAudio}
                    </a>
                  </div>
                </div>

                <h3 className="text-2xl leading-tight font-bold">
                  {result.title}
                </h3>
                {result.desc ? (
                  <p className="mt-3 text-[15px] leading-7 text-[#3e514b]">
                    {result.desc}
                  </p>
                ) : null}

                <div className="mt-6 grid gap-3 rounded-2xl border border-[#dbe8e3] bg-[#f8fcfa] p-4 text-sm text-[#536861] sm:grid-cols-2">
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
                  <div>
                    <p className="text-xs font-semibold tracking-[0.16em] uppercase">
                      {t.durationLabel}
                    </p>
                    <p className="mt-1 font-medium text-[#10231d]">
                      {formatDuration(result.duration) || '--'}
                    </p>
                  </div>
                </div>

                <div className="mt-6 rounded-2xl border border-[#dbe8e3] bg-[#fbfdfc] p-4">
                  <p className="mb-3 text-sm font-semibold text-[#107b59]">
                    {t.audioLabel}
                  </p>
                  <audio
                    className="w-full"
                    controls
                    src={audioHref}
                    aria-label={t.previewLabel}
                  />
                </div>

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
                  <Play size={20} />
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
      </main>
      <Footer locale={locale} />
    </div>
  );
}
