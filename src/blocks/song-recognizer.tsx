'use client';

import { useState } from 'react';
import {
  Check,
  Clipboard,
  Copy,
  Disc3,
  LoaderCircle,
  Music2,
  Play,
  Sparkles,
} from 'lucide-react';

import { useSession } from '@/core/auth/client';
import { normalizeLocale, type SiteLocale } from '@/config/locale';
import { getLocale } from '@/paraglide/runtime.js';
import { usePaidMembership } from '@/hooks/use-paid-membership';
import { Footer } from '@/blocks/footer';
import { Header } from '@/blocks/header';

type RecognizedSong = {
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
  creditsRemaining?: number;
};

type SongCopy = {
  home: string;
  transcribe: string;
  summary: string;
  audio: string;
  frame: string;
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
  recognize: string;
  recognizing: string;
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
  audioLabel: string;
  sourceLabel: string;
  providerLabel: string;
  fileLabel: string;
  artistLabel: string;
  titleLabel: string;
  albumLabel: string;
  labelLabel: string;
  releaseDateLabel: string;
  timecodeLabel: string;
  modelLabel: string;
  linksLabel: string;
  workflowTitle: string;
  workflow: string[];
  noteTitle: string;
  noteBody: string;
  remaining: (count: number) => string;
};

const copy: Partial<Record<SiteLocale, SongCopy>> & { en: SongCopy } = {
  en: {
    home: 'Downloader',
    transcribe: 'Video to text',
    summary: 'Video summary',
    audio: 'Audio extraction',
    frame: 'Frame extraction',
    tools: 'Video tools',
    pricing: 'Pricing',
    account: 'Account',
    signIn: 'Sign in',
    eyebrow: 'Paid member tool',
    title: 'Recognize the song behind a public clip',
    description:
      'Paste a public video URL, extract the audio track, and identify the song metadata from the clip.',
    inputLabel: 'Public video URL',
    inputPlaceholder:
      'Paste a TikTok, Instagram, YouTube, X, or other public video link',
    paste: 'Paste',
    recognize: 'Recognize song',
    recognizing: 'Recognizing song',
    pasteFailed: 'Clipboard access was blocked by the browser.',
    invalidUrl: 'Paste a valid public video URL first.',
    parseFailed: 'The public video could not be parsed right now.',
    accountRequired: 'Sign in before recognizing a song.',
    membershipRequired: 'Song recognition requires an active paid membership.',
    membershipTitle: 'Paid membership feature',
    membershipDescription:
      'Monthly members can recognize songs, extract audio, summarize transcripts, and unlock more media tools.',
    membershipActive: 'Your membership is active',
    resultEyebrow: 'Song identified',
    resultTitle: 'Recognition result',
    copyText: 'Copy link',
    copied: 'Copied',
    audioLabel: 'Audio track',
    sourceLabel: 'Source',
    providerLabel: 'Provider',
    fileLabel: 'File',
    artistLabel: 'Artist',
    titleLabel: 'Title',
    albumLabel: 'Album',
    labelLabel: 'Label',
    releaseDateLabel: 'Release date',
    timecodeLabel: 'Timecode',
    modelLabel: 'Model',
    linksLabel: 'Music links',
    workflowTitle: 'How song recognition works',
    workflow: [
      'Paste a public video URL.',
      'Parse the video into an audio URL.',
      'Send the audio to the recognition provider.',
    ],
    noteTitle: 'Best use case',
    noteBody:
      'This tool is meant for public clips where you need to identify the background song, track metadata, or music links for a reusable reference.',
    remaining: (count: number) => `${count} credits remaining`,
  },
  zh: {
    home: '视频下载',
    transcribe: '视频转文字',
    summary: '视频总结',
    audio: '音频提取',
    frame: '视频抽帧',
    tools: '视频工具',
    pricing: '价格',
    account: '账户',
    signIn: '登录',
    eyebrow: '付费会员工具',
    title: '识别公开视频片段里的歌曲',
    description: '粘贴公开视频 URL，先提取音轨，再识别片段里的歌曲信息。',
    inputLabel: '公开视频链接',
    inputPlaceholder: '粘贴 TikTok、Instagram、YouTube、X 或其他公开视频链接',
    paste: '粘贴',
    recognize: '开始识别',
    recognizing: '正在识别',
    pasteFailed: '浏览器阻止了剪贴板访问。',
    invalidUrl: '请先粘贴有效的公开视频链接。',
    parseFailed: '当前无法解析这个公开视频，请稍后重试。',
    accountRequired: '请先登录，再识别歌曲。',
    membershipRequired: '歌曲识别仅限有效付费会员使用。',
    membershipTitle: '付费会员专属功能',
    membershipDescription:
      '月度会员可识别歌曲、提取音频、视频总结，并解锁更多媒体工具。',
    membershipActive: '你的会员权益已生效',
    resultEyebrow: '歌曲已识别',
    resultTitle: '识别结果',
    copyText: '复制直链',
    copied: '已复制',
    audioLabel: '音轨',
    sourceLabel: '来源链接',
    providerLabel: '识别来源',
    fileLabel: '文件',
    artistLabel: '歌手',
    titleLabel: '歌曲',
    albumLabel: '专辑',
    labelLabel: '厂牌',
    releaseDateLabel: '发行日期',
    timecodeLabel: '时间点',
    modelLabel: '模型',
    linksLabel: '音乐链接',
    workflowTitle: '歌曲识别的工作流',
    workflow: [
      '粘贴公开视频链接。',
      '先解析成音频直链。',
      '把音频送入识别服务。',
    ],
    noteTitle: '适用场景',
    noteBody:
      '这个工具适合识别公开视频里的背景音乐、曲目信息，或提取可复用的音乐链接。',
    remaining: (count: number) => `账户剩余 ${count} 次额度`,
  },
};

function localizedPath(locale: SiteLocale, path: string) {
  if (locale === 'en') return path;
  if (path === '/') return `/${locale}`;
  return `/${locale}${path}`;
}

export function SongRecognizer({
  locale: localeOverride,
  pagePath = '/song-recognizer',
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
  const [result, setResult] = useState<RecognizedSong | null>(null);
  const [copied, setCopied] = useState(false);

  const pricingHref = localizedPath(locale, '/pricing');
  const transcribeHref = localizedPath(locale, '/transcribe');
  const summaryHref = localizedPath(locale, '/video-summary');
  const audioHref = localizedPath(locale, '/audio-extractor');
  const frameHref = localizedPath(locale, '/frame-extractor');
  const accountHref = localizedPath(locale, '/settings');
  const signInHref = `${localizedPath(locale, '/sign-in')}?callbackUrl=${encodeURIComponent(
    localizedPath(locale, pagePath)
  )}`;
  const buttonLabel = membershipLoading
    ? t.recognizing
    : busy
      ? t.recognizing
      : t.recognize;

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

  async function recognize() {
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
      const parsedResponse = await fetch('/api/parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, mode: 'audio', quality: '720' }),
      });
      const parsedPayload = await parsedResponse.json().catch(() => null);
      if (!parsedResponse.ok || parsedPayload?.code !== 0) {
        throw new Error(parsedPayload?.message || t.parseFailed);
      }
      const mediaUrl =
        parsedPayload?.data?.mediaUrl || parsedPayload?.data?.videoUrl;
      if (!mediaUrl) throw new Error(t.parseFailed);

      const recognitionResponse = await fetch('/api/song-recognition', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mediaUrl, sourceUrl: url }),
      });
      const recognitionPayload = await recognitionResponse
        .json()
        .catch(() => null);
      if (!recognitionResponse.ok || recognitionPayload?.code !== 0) {
        throw new Error(
          recognitionPayload?.message || 'Song recognition failed.'
        );
      }
      setResult(recognitionPayload.data as RecognizedSong);
    } catch (error) {
      setNotice(error instanceof Error ? error.message : t.parseFailed);
    } finally {
      setBusy(false);
    }
  }

  async function copyLink(link?: string) {
    if (!link) return;
    try {
      await navigator.clipboard.writeText(link);
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
                href={frameHref}
                className="inline-flex items-center gap-2 rounded-full border border-[#cde2db] bg-white px-4 py-2 text-sm font-semibold text-[#107b59]"
              >
                {t.frame}
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
                <Music2 size={16} />
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
                onClick={recognize}
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
                  {result.songLink ? (
                    <button
                      type="button"
                      onClick={() => copyLink(result.songLink)}
                      className="inline-flex items-center gap-2 rounded-full border border-[#cde2db] bg-[#f8fcfa] px-4 py-2 text-sm font-semibold text-[#107b59]"
                    >
                      {copied ? <Check size={16} /> : <Copy size={16} />}
                      {copied ? t.copied : t.copyText}
                    </button>
                  ) : null}
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex size-16 items-center justify-center overflow-hidden rounded-2xl border border-[#dbe8e3] bg-[#f8fcfa]">
                    {result.artworkUrl ? (
                      <img
                        src={result.artworkUrl}
                        alt={result.title || result.artist || 'Artwork'}
                        className="size-full object-cover"
                      />
                    ) : (
                      <Disc3 className="text-[#107b59]" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-2xl leading-tight font-bold">
                      {result.title || 'Unknown title'}
                    </h3>
                    <p className="mt-1 text-sm text-[#536861]">
                      {result.artist || 'Unknown artist'}
                    </p>
                  </div>
                </div>

                <div className="mt-6 grid gap-3 rounded-2xl border border-[#dbe8e3] bg-[#f8fcfa] p-4 text-sm text-[#536861] sm:grid-cols-2">
                  <div>
                    <p className="text-xs font-semibold tracking-[0.16em] uppercase">
                      {t.fileLabel}
                    </p>
                    <p className="mt-1 font-medium break-all text-[#10231d]">
                      {result.mediaUrl}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold tracking-[0.16em] uppercase">
                      {t.sourceLabel}
                    </p>
                    <p className="mt-1 font-medium break-all text-[#10231d]">
                      {result.sourceUrl || '--'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold tracking-[0.16em] uppercase">
                      {t.providerLabel}
                    </p>
                    <p className="mt-1 font-medium text-[#10231d]">AudD</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold tracking-[0.16em] uppercase">
                      {t.modelLabel}
                    </p>
                    <p className="mt-1 font-medium text-[#10231d]">
                      {result.model}
                    </p>
                  </div>
                  {result.album ? (
                    <div>
                      <p className="text-xs font-semibold tracking-[0.16em] uppercase">
                        {t.albumLabel}
                      </p>
                      <p className="mt-1 font-medium text-[#10231d]">
                        {result.album}
                      </p>
                    </div>
                  ) : null}
                  {result.releaseDate ? (
                    <div>
                      <p className="text-xs font-semibold tracking-[0.16em] uppercase">
                        {t.releaseDateLabel}
                      </p>
                      <p className="mt-1 font-medium text-[#10231d]">
                        {result.releaseDate}
                      </p>
                    </div>
                  ) : null}
                  {result.timecode ? (
                    <div>
                      <p className="text-xs font-semibold tracking-[0.16em] uppercase">
                        {t.timecodeLabel}
                      </p>
                      <p className="mt-1 font-medium text-[#10231d]">
                        {result.timecode}
                      </p>
                    </div>
                  ) : null}
                  {result.isrc ? (
                    <div>
                      <p className="text-xs font-semibold tracking-[0.16em] uppercase">
                        ISRC
                      </p>
                      <p className="mt-1 font-medium text-[#10231d]">
                        {result.isrc}
                      </p>
                    </div>
                  ) : null}
                </div>

                <div className="mt-6 rounded-2xl border border-[#dbe8e3] bg-[#fbfdfc] p-4">
                  <p className="mb-3 text-sm font-semibold text-[#107b59]">
                    {t.linksLabel}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {result.songLink ? (
                      <a
                        href={result.songLink}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 rounded-full border border-[#cde2db] bg-white px-3 py-1.5 text-xs font-semibold text-[#107b59]"
                      >
                        Song link
                      </a>
                    ) : null}
                    {result.appleMusicUrl ? (
                      <a
                        href={result.appleMusicUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 rounded-full border border-[#cde2db] bg-white px-3 py-1.5 text-xs font-semibold text-[#107b59]"
                      >
                        Apple Music
                      </a>
                    ) : null}
                    {result.spotifyUrl ? (
                      <a
                        href={result.spotifyUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 rounded-full border border-[#cde2db] bg-white px-3 py-1.5 text-xs font-semibold text-[#107b59]"
                      >
                        Spotify
                      </a>
                    ) : null}
                    {result.deezerUrl ? (
                      <a
                        href={result.deezerUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 rounded-full border border-[#cde2db] bg-white px-3 py-1.5 text-xs font-semibold text-[#107b59]"
                      >
                        Deezer
                      </a>
                    ) : null}
                  </div>
                </div>

                {typeof result.creditsRemaining === 'number' ? (
                  <p className="mt-4 text-xs leading-6 text-[#6f867f]">
                    {t.remaining(result.creditsRemaining)}
                  </p>
                ) : null}
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
