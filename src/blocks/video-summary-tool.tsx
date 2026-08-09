'use client';

import { useState } from 'react';
import {
  Check,
  Clipboard,
  Copy,
  Download,
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

type SummaryResult = {
  title: string;
  summary: string;
  bullets: string[];
  keywords: string[];
  model: string;
  language?: string;
  creditsRemaining?: number;
};

type SummaryCopy = {
  home: string;
  transcribe: string;
  tools: string;
  pricing: string;
  account: string;
  signIn: string;
  eyebrow: string;
  title: string;
  description: string;
  transcriptLabel: string;
  transcriptPlaceholder: string;
  paste: string;
  summarize: string;
  summarizing: string;
  pasteFailed: string;
  emptyTranscript: string;
  accountRequired: string;
  membershipRequired: string;
  membershipTitle: string;
  membershipDescription: string;
  membershipActive: string;
  resultEyebrow: string;
  resultTitle: string;
  copyText: string;
  copied: string;
  downloadText: string;
  modelLabel: string;
  keywordsLabel: string;
  bulletsLabel: string;
  workflowTitle: string;
  workflow: string[];
  noteTitle: string;
  noteBody: string;
  transcribeHint: string;
  remaining: (count: number) => string;
};

const copy: Partial<Record<SiteLocale, SummaryCopy>> & { en: SummaryCopy } = {
  en: {
    home: 'Downloader',
    transcribe: 'Video to text',
    tools: 'Video tools',
    pricing: 'Pricing',
    account: 'Account',
    signIn: 'Sign in',
    eyebrow: 'Paid member tool',
    title: 'Turn transcripts into concise video summaries',
    description:
      'Paste a transcript from the transcription tool and get a structured summary, key bullets, and keywords.',
    transcriptLabel: 'Transcript text',
    transcriptPlaceholder:
      'Paste the transcript here. Best results come from the /transcribe page.',
    paste: 'Paste',
    summarize: 'Generate summary',
    summarizing: 'Generating summary',
    pasteFailed: 'Clipboard access was blocked by the browser.',
    emptyTranscript: 'Paste transcript text first.',
    accountRequired: 'Sign in before generating a summary.',
    membershipRequired: 'Video summary requires an active paid membership.',
    membershipTitle: 'Paid membership feature',
    membershipDescription:
      'Monthly members can summarize transcripts, unlock advanced formats, and use more AI tools.',
    membershipActive: 'Your membership is active',
    resultEyebrow: 'Summary ready',
    resultTitle: 'Structured summary',
    copyText: 'Copy summary',
    copied: 'Copied',
    downloadText: 'Download TXT',
    modelLabel: 'Model',
    keywordsLabel: 'Keywords',
    bulletsLabel: 'Key bullets',
    workflowTitle: 'How the summary flow works',
    workflow: [
      'Transcribe a public video first.',
      'Paste the transcript into this page.',
      'Generate a structured summary, bullets, and keywords.',
    ],
    noteTitle: 'Best use case',
    noteBody:
      'This is the second step of the paid video workflow. It turns the transcript into readable notes you can reuse for posts, scripts, or reports.',
    transcribeHint: 'Need a transcript first? Open the video-to-text tool.',
    remaining: (count: number) => `${count} credits remaining`,
  },
  zh: {
    home: '视频下载',
    transcribe: '视频转文字',
    tools: '视频工具',
    pricing: '价格',
    account: '账户',
    signIn: '登录',
    eyebrow: '付费会员工具',
    title: '把转写文本整理成精简视频总结',
    description: '把转写页生成的文本贴进来，自动得到结构化总结、要点和关键词。',
    transcriptLabel: '转写文本',
    transcriptPlaceholder: '把转写文本粘贴到这里，最好来自 /transcribe 页面。',
    paste: '粘贴',
    summarize: '生成总结',
    summarizing: '正在生成总结',
    pasteFailed: '浏览器阻止了剪贴板访问。',
    emptyTranscript: '请先粘贴转写文本。',
    accountRequired: '请先登录，再生成视频总结。',
    membershipRequired: '视频总结仅限有效付费会员使用。',
    membershipTitle: '付费会员专属功能',
    membershipDescription: '月度会员可使用视频总结、高级格式和更多 AI 工具。',
    membershipActive: '你的会员权益已生效',
    resultEyebrow: '总结完成',
    resultTitle: '结构化总结',
    copyText: '复制总结',
    copied: '已复制',
    downloadText: '下载 TXT',
    modelLabel: '模型',
    keywordsLabel: '关键词',
    bulletsLabel: '要点',
    workflowTitle: '视频总结的工作流',
    workflow: [
      '先完成视频转写。',
      '把转写结果贴到这里。',
      '生成结构化总结、要点和关键词。',
    ],
    noteTitle: '适用场景',
    noteBody:
      '这是付费视频工作流的第二步。它把转写文本整理成可复用的笔记，适合发帖、写脚本或做报告。',
    transcribeHint: '还没有转写文本？先打开视频转文字工具。',
    remaining: (count: number) => `账户剩余 ${count} 次额度`,
  },
};

function localizedPath(locale: SiteLocale, path: string) {
  if (locale === 'en') return path;
  if (path === '/') return `/${locale}`;
  return `/${locale}${path}`;
}

function downloadFile(contents: string, filename: string, type: string) {
  const href = URL.createObjectURL(new Blob([contents], { type }));
  const anchor = document.createElement('a');
  anchor.href = href;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(href);
}

function formatSummaryText(result: SummaryResult) {
  const lines = [
    result.title,
    '',
    result.summary,
    '',
    'Key bullets:',
    ...result.bullets.map((bullet) => `- ${bullet}`),
    '',
    'Keywords:',
    result.keywords.join(', '),
  ];
  return lines.join('\n');
}

export function VideoSummaryTool({
  locale: localeOverride,
  pagePath = '/video-summary',
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
  const [transcript, setTranscript] = useState('');
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<SummaryResult | null>(null);
  const [copied, setCopied] = useState(false);

  const homeHref = localizedPath(locale, '/');
  const pricingHref = localizedPath(locale, '/pricing');
  const transcribeHref = localizedPath(locale, '/transcribe');
  const accountHref = localizedPath(locale, '/settings');
  const signInHref = `${localizedPath(locale, '/sign-in')}?callbackUrl=${encodeURIComponent(
    localizedPath(locale, pagePath)
  )}`;

  const buttonLabel = membershipLoading
    ? t.summarizing
    : busy
      ? t.summarizing
      : t.summarize;

  async function pasteTranscript() {
    try {
      const value = await navigator.clipboard.readText();
      if (!value) return;
      setTranscript(value.trim());
      setNotice('');
    } catch {
      setNotice(t.pasteFailed);
    }
  }

  async function summarize() {
    const content = transcript.trim();
    if (!content) {
      setNotice(t.emptyTranscript);
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
      const response = await fetch('/api/video-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcript: content, locale }),
      });
      const payload = await response.json().catch(() => null);
      if (!response.ok || payload?.code !== 0) {
        throw new Error(payload?.message || 'Video summary failed.');
      }
      setResult(payload.data as SummaryResult);
    } catch (error) {
      setNotice(
        error instanceof Error ? error.message : 'Video summary failed.'
      );
    } finally {
      setBusy(false);
    }
  }

  async function copySummary() {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(formatSummaryText(result));
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
                <Sparkles size={16} />
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
                <h2 className="text-xl font-bold">{t.transcriptLabel}</h2>
                <p className="mt-1 text-sm text-[#536861]">
                  {t.transcribeHint}
                </p>
              </div>
              <button
                type="button"
                onClick={pasteTranscript}
                className="inline-flex items-center gap-2 rounded-full border border-[#cde2db] bg-[#f8fcfa] px-4 py-2 text-sm font-semibold text-[#107b59]"
              >
                <Clipboard size={16} />
                {t.paste}
              </button>
            </div>
            <textarea
              value={transcript}
              onChange={(event) => setTranscript(event.target.value)}
              placeholder={t.transcriptPlaceholder}
              className="min-h-[360px] w-full rounded-2xl border border-[#d7e4df] bg-[#fcfefe] p-4 text-[15px] leading-7 transition outline-none focus:border-[#8fc7b1]"
            />
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={summarize}
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
                      onClick={copySummary}
                      className="inline-flex items-center gap-2 rounded-full border border-[#cde2db] bg-[#f8fcfa] px-4 py-2 text-sm font-semibold text-[#107b59]"
                    >
                      {copied ? <Check size={16} /> : <Copy size={16} />}
                      {copied ? t.copied : t.copyText}
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        downloadFile(
                          formatSummaryText(result),
                          'video-summary.txt',
                          'text/plain;charset=utf-8'
                        )
                      }
                      className="inline-flex items-center gap-2 rounded-full border border-[#cde2db] bg-[#f8fcfa] px-4 py-2 text-sm font-semibold text-[#107b59]"
                    >
                      <Download size={16} />
                      {t.downloadText}
                    </button>
                  </div>
                </div>

                <h3 className="text-2xl leading-tight font-bold">
                  {result.title}
                </h3>
                <p className="mt-4 text-[15px] leading-7 whitespace-pre-line text-[#3e514b]">
                  {result.summary}
                </p>

                {result.bullets.length ? (
                  <div className="mt-6">
                    <h4 className="text-sm font-semibold tracking-[0.16em] text-[#6f867f] uppercase">
                      {t.bulletsLabel}
                    </h4>
                    <ul className="mt-3 space-y-3 text-[15px] leading-7 text-[#3e514b]">
                      {result.bullets.map((bullet) => (
                        <li key={bullet} className="flex gap-3">
                          <span className="mt-2 size-2 rounded-full bg-[#107b59]" />
                          <span className="flex-1">{bullet}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}

                {result.keywords.length ? (
                  <div className="mt-6">
                    <h4 className="text-sm font-semibold tracking-[0.16em] text-[#6f867f] uppercase">
                      {t.keywordsLabel}
                    </h4>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {result.keywords.map((keyword) => (
                        <span
                          key={keyword}
                          className="rounded-full border border-[#dbe8e3] bg-[#f8fcfa] px-3 py-1.5 text-sm text-[#536861]"
                        >
                          {keyword}
                        </span>
                      ))}
                    </div>
                  </div>
                ) : null}

                <div className="mt-6 rounded-2xl border border-[#dbe8e3] bg-[#f8fcfa] p-4 text-sm text-[#536861]">
                  <p>
                    {t.modelLabel}:{' '}
                    <span className="font-semibold">{result.model}</span>
                  </p>
                  {typeof result.creditsRemaining === 'number' ? (
                    <p className="mt-1">
                      {t.remaining(result.creditsRemaining)}
                    </p>
                  ) : null}
                </div>
              </div>
            ) : (
              <div className="flex h-full min-h-[360px] flex-col justify-center rounded-2xl border border-dashed border-[#dbe8e3] bg-[#fbfdfc] p-6 text-center">
                <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-[#e9f6f1] text-[#107b59]">
                  <Sparkles size={20} />
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

        <VideoToolSupportSection locale={locale} tool="summary" />
      </main>
      <Footer locale={locale} />
    </div>
  );
}
