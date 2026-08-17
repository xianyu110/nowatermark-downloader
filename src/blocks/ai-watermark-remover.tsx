'use client';

import { useMemo, useState } from 'react';
import {
  AlertTriangle,
  Check,
  Copy,
  Download,
  FileImage,
  FileText,
  ShieldCheck,
  Sparkles,
  Upload,
} from 'lucide-react';

import { envConfigs } from '@/config';
import { localePath, type SiteLocale } from '@/config/locale';
import { Footer } from '@/blocks/footer';
import { Header } from '@/blocks/header';
import { JsonLd } from '@/components/json-ld';

type CleanerCopy = {
  nav: {
    home: string;
    tools: string;
    pricing: string;
  };
  heroEyebrow: string;
  heroTitle: string;
  heroDescription: string;
  privacyBadge: string;
  textTab: string;
  imageTab: string;
  textTitle: string;
  textDescription: string;
  textPlaceholder: string;
  pasteText: string;
  cleanText: string;
  copyCleaned: string;
  copied: string;
  downloadTxt: string;
  outputTitle: string;
  reportTitle: string;
  noMarks: string;
  imageTitle: string;
  imageDescription: string;
  imageDrop: string;
  imageHint: string;
  imageProcessing: string;
  imageReady: string;
  imageDownload: string;
  imageError: string;
  originalSize: string;
  cleanedSize: string;
  scopeTitle: string;
  scopeBody: string;
  scriptWarning: string;
  howTitle: string;
  howSteps: { title: string; body: string }[];
  limitsTitle: string;
  limits: string[];
  openSourceTitle: string;
  openSourceBody: string;
  openSourceUrl: string;
  relatedTitle: string;
  relatedDescription: string;
  relatedArticles: { slug: string; title: string }[];
};

const copy: Partial<Record<SiteLocale, CleanerCopy>> & {
  en: CleanerCopy;
  zh: CleanerCopy;
} = {
  en: {
    nav: {
      home: 'Downloader',
      tools: 'Tools',
      pricing: 'Pricing',
    },
    heroEyebrow: 'Local privacy tool',
    heroTitle: 'Free Claude Watermark Remover for hidden text characters',
    heroDescription:
      'Inspect and clean zero-width or hidden Unicode characters from text copied from Claude, or strip most image metadata locally in your browser.',
    privacyBadge: 'Runs locally. No upload.',
    textTab: 'Text cleaner',
    imageTab: 'Image metadata cleaner',
    textTitle: 'Clean invisible AI marks from text',
    textDescription:
      'Detect and remove zero-width characters, soft hyphens, bidi controls, tag characters, and unusual spacing often left by AI or publishing tools.',
    textPlaceholder:
      'Paste text here. The cleaner runs in your browser and does not send content to the server.',
    pasteText: 'Paste',
    cleanText: 'Clean text',
    copyCleaned: 'Copy cleaned text',
    copied: 'Copied',
    downloadTxt: 'Download TXT',
    outputTitle: 'Cleaned output',
    reportTitle: 'Detection report',
    noMarks: 'No suspicious invisible marks detected.',
    imageTitle: 'Strip image metadata locally',
    imageDescription:
      'Upload a PNG, JPEG, or WebP image. The browser redraws the pixels to a canvas and exports a new file without most EXIF/XMP metadata.',
    imageDrop: 'Choose an image',
    imageHint:
      'Best for screenshots, covers, and simple creator assets. Large images may take longer in the browser.',
    imageProcessing: 'Processing image...',
    imageReady: 'Clean image ready',
    imageDownload: 'Download cleaned image',
    imageError:
      'This image could not be processed in the browser. Try PNG, JPEG, or WebP.',
    originalSize: 'Original size',
    cleanedSize: 'Cleaned size',
    scopeTitle: 'What this Claude watermark remover actually cleans',
    scopeBody:
      'This tool removes character-level artifacts in copied Claude text, such as zero-width spaces, word joiners, soft hyphens, bidirectional controls, Unicode tag characters, and unusual spaces. These characters are not proof of an official Anthropic watermark. The tool does not rewrite your prose, remove a model-level statistical watermark, or guarantee a different AI-detector result.',
    scriptWarning:
      'Some invisible characters are meaningful in Arabic, Persian, Indic scripts, and emoji sequences. Review the cleaned output before publishing multilingual text.',
    howTitle: 'How the lightweight cleaner works',
    howSteps: [
      {
        title: '1. Local text scan',
        body: 'The page scans pasted text for invisible Unicode classes that can affect copy, indexing, or formatting.',
      },
      {
        title: '2. Browser image re-export',
        body: 'Images are decoded by the browser, redrawn to a canvas, and exported as a fresh file.',
      },
      {
        title: '3. No backend dependency',
        body: 'This lightweight version does not require Python, Docker, exiftool, qpdf, c2patool, or a VPS.',
      },
    ],
    limitsTitle: 'Important limits',
    limits: [
      'It does not remove visible watermarks, logos, or objects from pixels.',
      'It does not deeply rewrite PDF, DOCX, EPUB, or C2PA manifests.',
      'It does not bypass copyright, platform restrictions, DRM, or ownership rules.',
      'For advanced file cleaning, run a dedicated backend service and process only files you own or are authorized to handle.',
    ],
    openSourceTitle: 'Advanced backend option',
    openSourceBody:
      'For heavier server-side workflows, this page can later proxy to an open-source Python service such as watermarks-remover. The current lightweight tool intentionally stays browser-only.',
    openSourceUrl: 'https://github.com/guillaumemeyer/watermarks-remover',
    relatedTitle: 'Claude watermark and text cleaning guides',
    relatedDescription:
      'Use these practical guides to inspect copied Claude text, understand what a character cleaner can change, and prepare clean drafts for Word, Google Docs, and a CMS.',
    relatedArticles: [
      {
        slug: 'how-to-remove-claude-watermark-hidden-characters',
        title: 'How to remove Claude watermark characters safely',
      },
      {
        slug: 'claude-watermark-vs-ai-detector',
        title: 'Claude watermark vs AI detector: what is the difference?',
      },
      {
        slug: 'clean-claude-text-for-word-google-docs-cms',
        title: 'How to clean Claude text for Word, Google Docs, and a CMS',
      },
    ],
  },
  zh: {
    nav: {
      home: '下载器',
      tools: '工具',
      pricing: '价格',
    },
    heroEyebrow: '本地隐私工具',
    heroTitle: 'AI 水印清理：文本隐形标记与图片元数据',
    heroDescription:
      '在浏览器本地移除文本里的隐形 Unicode 标记，并通过 Canvas 重导出 PNG、JPEG、WebP 图片，清掉大部分 EXIF/XMP 元数据。',
    privacyBadge: '本地运行，不上传文件',
    textTab: '文本清理',
    imageTab: '图片元数据清理',
    textTitle: '清理文本里的隐形 AI 标记',
    textDescription:
      '检测并移除零宽字符、软连字符、双向文本控制符、Tag 字符和异常空格，适合清理 AI 输出、文档和网页文案。',
    textPlaceholder: '把文本粘贴到这里。清理过程只在浏览器本地执行。',
    pasteText: '粘贴',
    cleanText: '清理文本',
    copyCleaned: '复制清理结果',
    copied: '已复制',
    downloadTxt: '下载 TXT',
    outputTitle: '清理结果',
    reportTitle: '检测报告',
    noMarks: '没有检测到可疑隐形标记。',
    imageTitle: '本地清理图片元数据',
    imageDescription:
      '上传 PNG、JPEG 或 WebP 图片。浏览器会把像素重新绘制到 Canvas，再导出一个新的图片文件，从而移除大部分元数据。',
    imageDrop: '选择图片',
    imageHint: '适合截图、封面和普通创作者素材。大图会在浏览器中处理较久。',
    imageProcessing: '正在处理图片...',
    imageReady: '清理后的图片已生成',
    imageDownload: '下载清理图片',
    imageError: '浏览器无法处理这张图片。请尝试 PNG、JPEG 或 WebP。',
    originalSize: '原始大小',
    cleanedSize: '清理后大小',
    scopeTitle: '这个 AI 水印清理工具实际能清理什么',
    scopeBody:
      '本工具清理的是字符层面的痕迹，例如零宽空格、连接符、软连字符、双向文本控制符、Unicode Tag 字符和异常空格。它不会改写正文，不能移除模型级统计水印，也不保证改变 AI 检测器的判断。',
    scriptWarning:
      '部分隐形字符在阿拉伯语、波斯语、印度文字和 Emoji 组合中有实际作用。发布多语言内容前，请检查清理结果。',
    howTitle: '轻量版如何工作',
    howSteps: [
      {
        title: '1. 本地文本扫描',
        body: '页面会检查粘贴文本中的隐形 Unicode 字符，避免影响复制、索引和排版。',
      },
      {
        title: '2. 浏览器重导出图片',
        body: '图片由浏览器解码，重新绘制到 Canvas，再导出成新文件。',
      },
      {
        title: '3. 不依赖后端',
        body: '轻量版不需要 Python、Docker、exiftool、qpdf、c2patool 或 VPS。',
      },
    ],
    limitsTitle: '重要限制',
    limits: [
      '不能移除图片里肉眼可见的水印、Logo 或物体。',
      '不能深度改写 PDF、DOCX、EPUB 或 C2PA manifest。',
      '不能绕过版权、平台限制、DRM 或权属规则。',
      '高级文件清理应接独立后端服务，并且只处理你拥有或获得授权的文件。',
    ],
    openSourceTitle: '高级后端方案',
    openSourceBody:
      '如果后续要做重型服务，可以让本站代理到 watermarks-remover 这类开源 Python 服务。当前轻量版刻意保持纯浏览器本地处理。',
    openSourceUrl: 'https://github.com/guillaumemeyer/watermarks-remover',
    relatedTitle: 'Claude 水印与文本清理指南',
    relatedDescription:
      '阅读这些实用指南，了解如何检查 AI 复制文本、区分字符清理与 AI 检测，以及为 Word、Google Docs 和 CMS 准备干净文稿。',
    relatedArticles: [
      {
        slug: 'how-to-remove-claude-watermark-hidden-characters',
        title: '如何安全清理 Claude 隐形水印字符',
      },
      {
        slug: 'claude-watermark-vs-ai-detector',
        title: 'Claude 水印与 AI 检测器有什么区别？',
      },
      {
        slug: 'clean-claude-text-for-word-google-docs-cms',
        title: '如何为 Word、Google Docs 和 CMS 清理 Claude 文本',
      },
    ],
  },
};

const textMarkRules = [
  {
    key: 'zeroWidth',
    label: 'Zero-width characters',
    regex: /[\u200B-\u200D\uFEFF]/gu,
    replacement: '',
  },
  {
    key: 'bidi',
    label: 'Bidi controls',
    regex: /[\u200E\u200F\u202A-\u202E\u2066-\u2069]/gu,
    replacement: '',
  },
  {
    key: 'format',
    label: 'Soft hyphen / word joiners',
    regex: /[\u00AD\u2060-\u2064\u206A-\u206F]/gu,
    replacement: '',
  },
  {
    key: 'tag',
    label: 'Unicode tag characters',
    regex: /[\u{E0000}-\u{E007F}]/gu,
    replacement: '',
  },
  {
    key: 'space',
    label: 'Unusual spaces',
    regex: /[\u00A0\u1680\u180E\u2000-\u200A\u202F\u205F\u3000]/gu,
    replacement: ' ',
  },
] as const;

type ReportItem = {
  key: string;
  label: string;
  count: number;
};

function countMatches(value: string, regex: RegExp) {
  return value.match(regex)?.length || 0;
}

function cleanInvisibleText(value: string) {
  let cleaned = value;
  const report: ReportItem[] = textMarkRules.map((rule) => {
    const count = countMatches(value, rule.regex);
    cleaned = cleaned.replace(rule.regex, rule.replacement);
    return { key: rule.key, label: rule.label, count };
  });

  try {
    cleaned = cleaned.normalize('NFC');
  } catch {
    // Keep the original string when normalization is unavailable.
  }

  return { cleaned, report };
}

function formatBytes(bytes: number) {
  if (!Number.isFinite(bytes) || bytes <= 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const index = Math.min(
    units.length - 1,
    Math.floor(Math.log(bytes) / Math.log(1024))
  );
  return `${(bytes / 1024 ** index).toFixed(index === 0 ? 0 : 1)} ${units[index]}`;
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

type ImageResult = {
  name: string;
  type: string;
  originalSize: number;
  cleanedSize: number;
  url: string;
  blob: Blob;
};

export function AiWatermarkRemover({ locale }: { locale: SiteLocale }) {
  const t = copy[locale] || copy.en;
  const [activeTab, setActiveTab] = useState<'text' | 'image'>('text');
  const [text, setText] = useState('');
  const [copied, setCopied] = useState(false);
  const [imageResult, setImageResult] = useState<ImageResult | null>(null);
  const [imageError, setImageError] = useState('');
  const [imageProcessing, setImageProcessing] = useState(false);
  const { cleaned, report } = useMemo(() => cleanInvisibleText(text), [text]);
  const totalMarks = report.reduce((total, item) => total + item.count, 0);
  const appUrl = envConfigs.app_url.replace(/\/$/, '');
  const pageUrl = `${appUrl}${localePath(locale, '/tools/ai-watermark-remover')}`;
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'AI Watermark Cleaner',
    applicationCategory: 'UtilitiesApplication',
    operatingSystem: 'Web',
    url: pageUrl,
    description: t.heroDescription,
    featureList: [
      'Detect hidden Unicode characters',
      'Remove zero-width characters',
      'Normalize unusual spaces',
      'Strip most image metadata with a local re-export',
    ],
    isAccessibleForFree: true,
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
  };

  async function handlePaste() {
    const value = await navigator.clipboard.readText();
    setText(value);
  }

  async function handleCopy() {
    await navigator.clipboard.writeText(cleaned);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  function handleDownloadText() {
    downloadBlob(
      new Blob([cleaned], { type: 'text/plain;charset=utf-8' }),
      'cleaned-text.txt'
    );
  }

  async function handleImageFile(file: File | undefined) {
    if (!file) return;
    setImageError('');
    setImageResult((current) => {
      if (current) URL.revokeObjectURL(current.url);
      return null;
    });

    if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type)) {
      setImageError(t.imageError);
      return;
    }

    setImageProcessing(true);
    const objectUrl = URL.createObjectURL(file);
    const image = new Image();

    image.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = image.naturalWidth;
        canvas.height = image.naturalHeight;
        const context = canvas.getContext('2d');
        if (!context) throw new Error('Canvas is unavailable');
        context.drawImage(image, 0, 0);
        const outputType =
          file.type === 'image/jpeg' || file.type === 'image/webp'
            ? file.type
            : 'image/png';
        canvas.toBlob(
          (blob) => {
            URL.revokeObjectURL(objectUrl);
            setImageProcessing(false);
            if (!blob) {
              setImageError(t.imageError);
              return;
            }
            const cleanedUrl = URL.createObjectURL(blob);
            setImageResult({
              name: file.name.replace(/\.[^.]+$/, '') || 'image',
              type: outputType,
              originalSize: file.size,
              cleanedSize: blob.size,
              url: cleanedUrl,
              blob,
            });
          },
          outputType,
          0.92
        );
      } catch {
        URL.revokeObjectURL(objectUrl);
        setImageProcessing(false);
        setImageError(t.imageError);
      }
    };

    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      setImageProcessing(false);
      setImageError(t.imageError);
    };

    image.src = objectUrl;
  }

  function handleDownloadImage() {
    if (!imageResult) return;
    const extension =
      imageResult.type === 'image/jpeg'
        ? 'jpg'
        : imageResult.type === 'image/webp'
          ? 'webp'
          : 'png';
    downloadBlob(imageResult.blob, `${imageResult.name}.cleaned.${extension}`);
  }

  return (
    <div className="min-h-screen bg-[#f7faf9] text-[#10231d]">
      <JsonLd data={jsonLd} />
      <Header locale={locale} />
      <main>
        <section className="border-b border-[#dbe8e3] bg-white px-5 py-16 sm:px-8 sm:py-20">
          <div className="mx-auto max-w-6xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#cfe5dc] bg-[#f2faf7] px-4 py-2 text-sm font-semibold text-[#107b59]">
              <ShieldCheck size={16} />
              {t.privacyBadge}
            </div>
            <p className="mb-4 text-sm font-semibold tracking-[0.18em] text-[#107b59] uppercase">
              {t.heroEyebrow}
            </p>
            <h1 className="max-w-4xl text-4xl leading-tight font-bold sm:text-5xl">
              {t.heroTitle}
            </h1>
            <p className="mt-5 max-w-3xl text-lg leading-8 text-[#536861]">
              {t.heroDescription}
            </p>
            <nav className="mt-8 flex flex-wrap gap-3 text-sm font-semibold text-[#107b59]">
              <a href={localePath(locale, '/')}>{t.nav.home}</a>
              <span aria-hidden="true">/</span>
              <a href={localePath(locale, '/tools')}>{t.nav.tools}</a>
              <span aria-hidden="true">/</span>
              <a href={localePath(locale, '/pricing')}>{t.nav.pricing}</a>
            </nav>
          </div>
        </section>

        <div className="mx-auto max-w-6xl px-5 py-12 sm:px-8 sm:py-16">
          <div className="mb-6 flex flex-wrap gap-3">
            {(
              [
                ['text', t.textTab, FileText],
                ['image', t.imageTab, FileImage],
              ] as const
            ).map(([key, label, Icon]) => (
              <button
                key={key}
                type="button"
                onClick={() => setActiveTab(key)}
                className={`inline-flex items-center gap-2 rounded-md border px-4 py-2 text-sm font-semibold transition ${
                  activeTab === key
                    ? 'border-[#107b59] bg-[#107b59] text-white'
                    : 'border-[#d6e4df] bg-white text-[#2c443c] hover:border-[#91c8b5]'
                }`}
              >
                <Icon size={16} />
                {label}
              </button>
            ))}
          </div>

          {activeTab === 'text' ? (
            <section className="grid gap-6 lg:grid-cols-[1fr_0.85fr]">
              <div className="rounded-2xl border border-[#d6e4df] bg-white p-5 shadow-[0_12px_34px_rgba(16,77,57,0.06)] sm:p-6">
                <div className="mb-5 flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-bold">{t.textTitle}</h2>
                    <p className="mt-2 text-sm leading-6 text-[#63756f]">
                      {t.textDescription}
                    </p>
                  </div>
                  <Sparkles className="mt-1 text-[#107b59]" />
                </div>
                <textarea
                  value={text}
                  onChange={(event) => setText(event.target.value)}
                  placeholder={t.textPlaceholder}
                  className="min-h-72 w-full rounded-md border border-[#d6e4df] bg-[#fbfdfc] p-4 font-mono text-sm leading-6 outline-none focus:border-[#107b59] focus:ring-2 focus:ring-[#c7eadc]"
                />
                <div className="mt-4 flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={handlePaste}
                    className="inline-flex items-center gap-2 rounded-md border border-[#d6e4df] bg-white px-4 py-2 text-sm font-semibold text-[#2c443c] hover:border-[#91c8b5]"
                  >
                    <Copy size={16} />
                    {t.pasteText}
                  </button>
                  <button
                    type="button"
                    onClick={() => setText(cleaned)}
                    className="inline-flex items-center gap-2 rounded-md bg-[#107b59] px-4 py-2 text-sm font-semibold text-white hover:bg-[#0d684c]"
                  >
                    <Check size={16} />
                    {t.cleanText}
                  </button>
                </div>
              </div>

              <div className="space-y-6">
                <div className="rounded-2xl border border-[#d6e4df] bg-white p-5 sm:p-6">
                  <h2 className="text-xl font-bold">{t.reportTitle}</h2>
                  <div className="mt-4 space-y-3">
                    {totalMarks === 0 ? (
                      <div className="flex items-start gap-3 rounded-md bg-[#f2faf7] p-4 text-sm text-[#2f6856]">
                        <Check className="mt-0.5 shrink-0" size={16} />
                        {t.noMarks}
                      </div>
                    ) : (
                      report.map((item) => (
                        <div
                          key={item.key}
                          className="flex items-center justify-between rounded-md border border-[#d6e4df] px-4 py-3 text-sm"
                        >
                          <span>{item.label}</span>
                          <span className="font-mono font-semibold">
                            {item.count}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div className="rounded-2xl border border-[#d6e4df] bg-white p-5 sm:p-6">
                  <h2 className="text-xl font-bold">{t.outputTitle}</h2>
                  <pre className="mt-4 max-h-72 min-h-36 overflow-auto rounded-md border border-[#d6e4df] bg-[#fbfdfc] p-4 text-sm leading-6 whitespace-pre-wrap text-[#2c443c]">
                    {cleaned || t.textPlaceholder}
                  </pre>
                  <div className="mt-4 flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={handleCopy}
                      disabled={!cleaned}
                      className="inline-flex items-center gap-2 rounded-md bg-[#107b59] px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <Copy size={16} />
                      {copied ? t.copied : t.copyCleaned}
                    </button>
                    <button
                      type="button"
                      onClick={handleDownloadText}
                      disabled={!cleaned}
                      className="inline-flex items-center gap-2 rounded-md border border-[#d6e4df] bg-white px-4 py-2 text-sm font-semibold text-[#2c443c] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <Download size={16} />
                      {t.downloadTxt}
                    </button>
                  </div>
                </div>
              </div>
            </section>
          ) : (
            <section className="grid gap-6 lg:grid-cols-[1fr_0.85fr]">
              <div className="rounded-2xl border border-[#d6e4df] bg-white p-5 shadow-[0_12px_34px_rgba(16,77,57,0.06)] sm:p-6">
                <div className="mb-5">
                  <h2 className="text-2xl font-bold">{t.imageTitle}</h2>
                  <p className="mt-2 text-sm leading-6 text-[#63756f]">
                    {t.imageDescription}
                  </p>
                </div>
                <label className="flex min-h-64 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[#b8d8cc] bg-[#fbfdfc] p-8 text-center transition hover:border-[#107b59] hover:bg-[#f2faf7]">
                  <Upload className="mb-4 text-[#107b59]" size={36} />
                  <span className="text-lg font-semibold">{t.imageDrop}</span>
                  <span className="mt-2 max-w-md text-sm leading-6 text-[#63756f]">
                    {t.imageHint}
                  </span>
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    className="sr-only"
                    onChange={(event) =>
                      handleImageFile(event.target.files?.[0])
                    }
                  />
                </label>
              </div>

              <div className="rounded-2xl border border-[#d6e4df] bg-white p-5 sm:p-6">
                <h2 className="text-xl font-bold">{t.imageReady}</h2>
                {imageProcessing ? (
                  <p className="mt-4 text-sm text-[#63756f]">
                    {t.imageProcessing}
                  </p>
                ) : imageError ? (
                  <div className="mt-4 flex items-start gap-3 rounded-md bg-[#fff7ed] p-4 text-sm text-[#9a3412]">
                    <AlertTriangle className="mt-0.5 shrink-0" size={16} />
                    {imageError}
                  </div>
                ) : imageResult ? (
                  <div className="mt-4 space-y-4">
                    <img
                      src={imageResult.url}
                      alt=""
                      className="max-h-72 w-full rounded-md border border-[#d6e4df] object-contain"
                    />
                    <div className="grid gap-3 text-sm sm:grid-cols-2">
                      <div className="rounded-md bg-[#f2faf7] p-3">
                        <div className="text-[#63756f]">{t.originalSize}</div>
                        <div className="font-semibold">
                          {formatBytes(imageResult.originalSize)}
                        </div>
                      </div>
                      <div className="rounded-md bg-[#f2faf7] p-3">
                        <div className="text-[#63756f]">{t.cleanedSize}</div>
                        <div className="font-semibold">
                          {formatBytes(imageResult.cleanedSize)}
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleDownloadImage}
                      className="inline-flex items-center gap-2 rounded-md bg-[#107b59] px-4 py-2 text-sm font-semibold text-white hover:bg-[#0d684c]"
                    >
                      <Download size={16} />
                      {t.imageDownload}
                    </button>
                  </div>
                ) : (
                  <p className="mt-4 text-sm leading-6 text-[#63756f]">
                    {t.imageHint}
                  </p>
                )}
              </div>
            </section>
          )}

          <section className="mt-12 border-y border-[#d6e4df] py-10">
            <div className="max-w-4xl">
              <h2 className="text-2xl font-bold">{t.scopeTitle}</h2>
              <p className="mt-3 text-sm leading-7 text-[#536861]">
                {t.scopeBody}
              </p>
              <p className="mt-4 flex items-start gap-2 text-sm leading-6 text-[#8a4b0f]">
                <AlertTriangle className="mt-1 shrink-0" size={16} />
                <span>{t.scriptWarning}</span>
              </p>
            </div>
          </section>

          <section className="mt-12 grid gap-6 lg:grid-cols-3">
            <div className="rounded-2xl border border-[#d6e4df] bg-white p-6 lg:col-span-2">
              <h2 className="text-2xl font-bold">{t.howTitle}</h2>
              <div className="mt-6 grid gap-4 md:grid-cols-3">
                {t.howSteps.map((step) => (
                  <div
                    key={step.title}
                    className="rounded-xl border border-[#d6e4df] bg-[#fbfdfc] p-4"
                  >
                    <h3 className="font-semibold">{step.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-[#63756f]">
                      {step.body}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-[#d6e4df] bg-white p-6">
              <h2 className="text-2xl font-bold">{t.limitsTitle}</h2>
              <ul className="mt-5 space-y-3 text-sm leading-6 text-[#63756f]">
                {t.limits.map((limit) => (
                  <li key={limit} className="flex gap-2">
                    <AlertTriangle
                      className="mt-1 shrink-0 text-[#b45309]"
                      size={15}
                    />
                    <span>{limit}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          <section className="mt-6 rounded-2xl border border-[#d6e4df] bg-white p-6">
            <h2 className="text-2xl font-bold">{t.openSourceTitle}</h2>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-[#63756f]">
              {t.openSourceBody}
            </p>
            <a
              href={t.openSourceUrl}
              className="mt-4 inline-flex text-sm font-semibold text-[#107b59] underline-offset-4 hover:underline"
              target="_blank"
              rel="noreferrer"
            >
              {t.openSourceUrl}
            </a>
          </section>

          <section className="mt-12 border-t border-[#d6e4df] pt-10">
            <h2 className="text-2xl font-bold">{t.relatedTitle}</h2>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-[#63756f]">
              {t.relatedDescription}
            </p>
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              {t.relatedArticles.map((article) => {
                const href = `${appUrl}/blog/${article.slug}`;
                return (
                  <a
                    key={article.slug}
                    href={href}
                    className="min-w-0 rounded-md border border-[#d6e4df] bg-white p-5 transition hover:border-[#91c8b5] hover:shadow-[0_10px_30px_rgba(16,77,57,0.08)]"
                  >
                    <h3 className="leading-6 font-semibold">{article.title}</h3>
                    <span className="mt-3 block text-xs leading-5 break-all text-[#107b59]">
                      {href}
                    </span>
                  </a>
                );
              })}
            </div>
          </section>
        </div>
      </main>
      <Footer locale={locale} />
    </div>
  );
}
