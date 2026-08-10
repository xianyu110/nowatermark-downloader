'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import {
  AudioLines,
  BadgeCheck,
  Captions,
  Check,
  ChevronDown,
  CircleUserRound,
  Clipboard,
  Copy,
  Crown,
  Download,
  ExternalLink,
  FileText,
  FileVideo,
  Image as ImageIcon,
  Link,
  List,
  LoaderCircle,
  Play,
  ShieldCheck,
  Sparkles,
  Video,
  VolumeX,
} from 'lucide-react';

import { useSession } from '@/core/auth/client';
import { envConfigs } from '@/config';
import { normalizeLocale, type SiteLocale } from '@/config/locale';
import { getLocale } from '@/paraglide/runtime.js';
import { usePaidMembership } from '@/hooks/use-paid-membership';
import { JsonLd } from '@/components/json-ld';
import { LocaleSelector } from '@/components/locale-selector';

import '@/styles/copypilot-downloader.css';

type ParseResult = {
  provider?: string;
  platform?: string;
  title?: string;
  desc?: string;
  author?: { name?: string; avatar?: string };
  coverUrl?: string;
  filename?: string;
  videoUrl?: string;
  mediaUrl?: string;
  mediaType?: 'audio' | 'image' | 'video';
  duration?: number;
  sourceUrl?: string;
  requestedMode?: 'audio' | 'auto' | 'mute';
  requestedQuality?: string;
  freeParsesRemaining?: number;
  creditsRemaining?: number;
  alternates?: { label?: string; url: string; thumb?: string; type?: string }[];
};

type DownloadMode = 'auto' | 'audio' | 'mute';
type VideoQuality = 'max' | '1080' | '720' | '480';

type BatchResult = {
  id: string;
  sourceUrl: string;
  status: 'error' | 'pending' | 'success';
  result?: ParseResult;
  error?: string;
};

const BATCH_MAX_ITEMS = 5;

const content = {
  en: {
    navigation: {
      home: 'Home',
      transcribe: 'Video to text',
      platforms: 'Platforms',
      blog: 'Blog',
      howItWorks: 'How it works',
      faq: 'FAQ',
      pricing: 'Pricing',
      apiDocs: 'API Docs',
      signIn: 'Sign in',
      account: 'Account',
      primaryLabel: 'Primary navigation',
      mobileLabel: 'Mobile navigation',
      homeLabel: 'NoWatermark Downloader home',
      switchLanguage: 'Switch to Chinese',
      switchLabel: '中文',
    },
    upgrade: {
      eyebrow: 'Paid membership',
      title: 'Unlock the complete creator workflow',
      description:
        'Monthly members get AI transcription, batch parsing, audio and mute exports, 1080p or best quality, and API access.',
      primary: 'View membership plans',
      secondary: 'Open account',
    },
    hero: {
      eyebrow: 'Free online video downloader',
      title: 'Download videos without watermarks for free',
      description:
        'Paste a public post link to get a clean video, direct media URL, cover, and metadata. 3 free downloads per day, no account required.',
      downloaderLabel: 'Video downloader',
      placeholder: 'Paste a TikTok, Instagram, YouTube, X, or Facebook link',
      inputLabel: 'Public video URL',
      extracting: 'Extracting',
      extract: 'Extract',
      paste: 'Paste',
      clear: 'Clear',
      singleMode: 'Single link',
      batchMode: 'Batch links',
      batchInputLabel: 'Public video links, one per line',
      batchPlaceholder: 'Paste up to 5 public links, one per line',
      batchExtract: 'Parse links',
      batchProgress: (current: number, total: number) =>
        `Parsing ${current} of ${total}`,
      optionsLabel: 'Output options',
      formatLabel: 'Format',
      qualityLabel: 'Quality',
      memberBadge: 'Pro',
      memberUnlock:
        'Unlock batch parsing, advanced formats, 1080p, best quality, AI transcription, and API access.',
      memberActive: 'Paid membership active',
      modes: {
        video: 'Video + audio',
        audio: 'Audio only',
        mute: 'Mute video',
      },
      qualities: {
        max: 'Best available',
        '1080': '1080p',
        '720': '720p',
        '480': '480p',
      },
      platformsLabel: 'Supported video platforms',
      toolsLabel: 'Popular video tools',
      chips: [
        'TikTok no watermark',
        'Instagram Reels',
        'YouTube Shorts',
        'Facebook video',
        'X / Twitter video',
      ],
    },
    errors: {
      emptyClipboard: 'Your clipboard is empty.',
      clipboardBlocked: 'Clipboard access was blocked by the browser.',
      emptyInput: 'Paste a public video link first.',
      invalidUrl: 'No valid public URL was found.',
      extractFailed: 'Extraction failed. Please try again.',
      providerUnavailable:
        'No download is available for this link right now. Make sure the video is public, then try again shortly.',
      retrying: 'Retrying parse...',
      retryParse: 'Retry parse',
      rateLimited: 'Too many requests. Please wait a moment and try again.',
      signInRequired: 'Your free daily limit is used. Sign in to continue.',
      creditsRequired: 'You need at least 1 credit to parse this video.',
      membershipRequired:
        'This feature requires an active paid membership. View monthly plans to continue.',
      batchRequiresAccount: 'Batch parsing requires an active paid membership.',
      batchEmpty: 'Paste at least one public link first.',
      batchLimit: 'Batch parsing supports up to 5 links at a time.',
      ready: 'Your download is ready.',
    },
    result: {
      ready: 'Download ready',
      title: 'Your video is ready',
      parsedFrom: 'Parsed from',
      coverAlt: 'Video cover',
      noPreview: 'Preview unavailable',
      platform: 'Platform',
      author: 'Author',
      duration: 'Duration',
      format: 'Format',
      quality: 'Quality',
      audioOnly: 'Audio only',
      muteVideo: 'Mute video',
      bestAvailable: 'Best available',
      automaticParser: 'Automatic parser',
      unknown: 'Unknown',
      downloadVideo: 'Download video',
      downloadAudio: 'Download audio',
      downloadImage: 'Download image',
      transcribeVideo: 'Transcribe video · Pro',
      batchReady: 'Batch results',
      batchSuccess: 'Ready',
      batchFailed: 'Failed',
      batchCompleted: (current: number, total: number) =>
        `${current} of ${total} completed`,
      copied: 'Copied',
      copyUrl: 'Copy URL',
      option: 'Option',
      publicVideo: 'Public video',
      freeRemaining: (count: number) =>
        `${count} free ${count === 1 ? 'download' : 'downloads'} remaining today`,
      creditsRemaining: (count: number) =>
        `${count} ${count === 1 ? 'credit' : 'credits'} remaining`,
    },
    featuresEyebrow: 'Free tool',
    featuresTitle: 'Turn public links into download-ready video assets',
    features: [
      {
        icon: BadgeCheck,
        title: 'Free to use',
        text: 'Download public videos without installing software or creating an account.',
      },
      {
        icon: Captions,
        title: 'Global platforms',
        text: 'Works with public links from TikTok, Instagram, YouTube, X, Facebook, and more.',
      },
      {
        icon: ShieldCheck,
        title: 'Automatic fallback',
        text: 'Retries the primary parser, then moves through healthy backup providers.',
      },
      {
        icon: Sparkles,
        title: 'Clean media links',
        text: 'Get a direct media URL, cover image, title, author, and available alternatives.',
      },
    ],
    stepsEyebrow: 'How it works',
    stepsTitle: 'Download a video in three steps',
    steps: [
      {
        title: 'Copy a link',
        text: 'Copy the public share link from the video platform.',
      },
      {
        title: 'Paste and extract',
        text: 'Paste it into the field and start the automatic parser chain.',
      },
      {
        title: 'Download the result',
        text: 'Preview the video, open the media file, or copy the direct URL.',
      },
    ],
    faqTitle: 'Frequently Asked Questions',
    faqDescription: 'Common questions about NoWatermark Downloader',
    faqs: [
      {
        question: 'Is NoWatermark Downloader free?',
        answer:
          'Free basic access is available for supported public video links. Optional usage plans are available for creators and teams that need more volume.',
      },
      {
        question: 'Which platforms are supported?',
        answer:
          'The parser supports many public links from TikTok, Instagram, YouTube, X, Facebook, Reddit, and other services handled by the configured providers.',
      },
      {
        question: 'How long does extraction take?',
        answer:
          'Most links finish within a few seconds. If a provider fails, automatic retries and fallback providers can take longer.',
      },
      {
        question: 'Why do some links fail?',
        answer:
          'Deleted, private, region-locked, login-only, or expired links may be unavailable to upstream parsers. Public links work best.',
      },
      {
        question: 'Do you store pasted links?',
        answer:
          'The downloader does not require an account. Parsed results stay in the current page unless your deployment enables separate account features.',
      },
    ],
    toolsEyebrow: 'Popular tools',
    toolsTitle: 'Find video tools by platform and workflow',
    toolGroups: [
      {
        title: 'Short video platforms',
        items: [
          { label: 'TikTok downloader', action: 'top' },
          { label: 'Instagram Reels', action: 'top' },
          { label: 'YouTube Shorts', action: 'top' },
          { label: 'Facebook video', action: 'top' },
        ],
      },
      {
        title: 'Social platforms',
        items: [
          { label: 'X / Twitter video', action: 'top' },
          { label: 'Reddit video', action: 'top' },
          { label: 'Threads video', action: 'top' },
          { label: 'Pinterest video', action: 'top' },
        ],
      },
      {
        title: 'Video tools',
        items: [
          { label: 'No-watermark download', action: 'top' },
          { label: 'Direct media link', action: 'top' },
          { label: 'Cover extraction', action: 'top' },
          { label: 'Video preview', action: 'top' },
        ],
      },
      {
        title: 'Resources',
        items: [
          { label: 'Supported platforms', action: 'top' },
          { label: 'Frequently asked questions', action: 'faq' },
          { label: 'Privacy policy', action: 'privacy' },
          { label: 'Terms of service', action: 'terms' },
        ],
      },
    ],
    footer: {
      description:
        'Free public video downloads with automatic provider retries.',
      core: 'Core',
      downloader: 'Downloader',
      pricing: 'Pricing',
      account: 'Account',
      popular: 'Popular',
      info: 'Info',
      privacy: 'Privacy',
      terms: 'Terms',
      refunds: 'Refunds',
      copyright: 'Copyright',
      deletion: 'Data deletion',
      contact: 'Contact',
      xSupport: 'Customer support on X',
    },
  },
  zh: {
    navigation: {
      home: '首页',
      transcribe: '视频转文字',
      platforms: '支持平台',
      blog: '博客',
      howItWorks: '使用方法',
      faq: '常见问题',
      pricing: '价格',
      apiDocs: 'API 文档',
      signIn: '登录',
      account: '账户',
      primaryLabel: '主导航',
      mobileLabel: '移动端导航',
      homeLabel: 'NoWatermark 视频下载器首页',
      switchLanguage: '切换到英文',
      switchLabel: 'EN',
    },
    upgrade: {
      eyebrow: '付费会员',
      title: '解锁完整创作者工作流',
      description:
        '月度会员可使用 AI 视频转文字、批量解析、仅音频和静音导出、1080P/最佳画质及公开 API。',
      primary: '查看会员套餐',
      secondary: '打开账户',
    },
    hero: {
      eyebrow: '免费在线视频下载器',
      title: '免费下载无水印视频',
      description:
        '粘贴公开帖子链接，即可获取无水印视频、媒体直链、封面和详细信息。无需登录，每天免费解析 3 次。',
      downloaderLabel: '视频下载器',
      placeholder: '粘贴 TikTok、Instagram、YouTube、X 或 Facebook 视频链接',
      inputLabel: '公开视频链接',
      extracting: '正在解析',
      extract: '开始解析',
      paste: '粘贴',
      clear: '清空',
      singleMode: '单条解析',
      batchMode: '批量解析',
      batchInputLabel: '公开视频链接，每行一条',
      batchPlaceholder: '最多粘贴 5 条公开视频链接，每行一条',
      batchExtract: '开始批量解析',
      batchProgress: (current: number, total: number) =>
        `正在解析 ${current}/${total}`,
      optionsLabel: '解析选项',
      formatLabel: '格式',
      qualityLabel: '清晰度',
      memberBadge: '会员',
      memberUnlock:
        '开通月度会员，解锁批量解析、高级格式、1080P/最佳画质、AI 转写和公开 API。',
      memberActive: '付费会员权益已生效',
      modes: {
        video: '视频 + 音频',
        audio: '仅音频',
        mute: '静音视频',
      },
      qualities: {
        max: '最佳可用',
        '1080': '1080P',
        '720': '720P',
        '480': '480P',
      },
      platformsLabel: '支持的视频平台',
      toolsLabel: '热门视频工具',
      chips: [
        'TikTok 无水印',
        'Instagram Reels',
        'YouTube Shorts',
        'Facebook 视频',
        'X / Twitter 视频',
      ],
    },
    errors: {
      emptyClipboard: '剪贴板中没有内容。',
      clipboardBlocked: '浏览器已阻止访问剪贴板。',
      emptyInput: '请先粘贴公开视频链接。',
      invalidUrl: '未找到有效的公开链接。',
      extractFailed: '视频解析失败，请稍后重试。',
      providerUnavailable:
        '当前暂无可用的下载结果。请确认视频为公开状态，稍后重试。',
      retrying: '正在重新解析...',
      retryParse: '重新解析',
      rateLimited: '请求过于频繁，请稍等片刻后重试。',
      signInRequired: '今日免费次数已用完，请登录后继续。',
      creditsRequired: '当前额度不足，请先购买解析次数。',
      membershipRequired: '该功能仅限有效付费会员，请先开通月度套餐。',
      batchRequiresAccount: '批量解析仅限有效付费会员。',
      batchEmpty: '请先粘贴至少一条公开视频链接。',
      batchLimit: '每次批量解析最多支持 5 条链接。',
      ready: '视频已解析完成。',
    },
    result: {
      ready: '视频已就绪',
      title: '你的视频已准备好',
      parsedFrom: '解析来源',
      coverAlt: '视频封面',
      noPreview: '暂无可用预览',
      platform: '平台',
      author: '作者',
      duration: '时长',
      format: '格式',
      quality: '清晰度',
      audioOnly: '仅音频',
      muteVideo: '静音视频',
      bestAvailable: '最佳可用',
      automaticParser: '自动解析器',
      unknown: '未知',
      downloadVideo: '下载视频',
      downloadAudio: '下载音频',
      downloadImage: '下载图片',
      transcribeVideo: '视频转文字 · 会员',
      batchReady: '批量解析结果',
      batchSuccess: '已就绪',
      batchFailed: '失败',
      batchCompleted: (current: number, total: number) =>
        `${current}/${total} 已完成`,
      copied: '已复制',
      copyUrl: '复制链接',
      option: '备选',
      publicVideo: '公开视频',
      freeRemaining: (count: number) => `今日剩余 ${count} 次免费解析`,
      creditsRemaining: (count: number) => `账户剩余 ${count} 次额度`,
    },
    featuresEyebrow: '免费工具',
    featuresTitle: '将公开链接转换为可下载的视频资源',
    features: [
      {
        icon: BadgeCheck,
        title: '免费使用',
        text: '无需安装软件或注册账号，即可下载公开视频。',
      },
      {
        icon: Captions,
        title: '支持全球平台',
        text: '支持 TikTok、Instagram、YouTube、X、Facebook 等平台的公开链接。',
      },
      {
        icon: ShieldCheck,
        title: '自动切换节点',
        text: '主解析器失败后会自动重试，并依次切换到可用的备用节点。',
      },
      {
        icon: Sparkles,
        title: '干净的媒体链接',
        text: '获取媒体直链、封面、标题、作者信息和可用的备选资源。',
      },
    ],
    stepsEyebrow: '使用方法',
    stepsTitle: '三步完成视频下载',
    steps: [
      {
        title: '复制链接',
        text: '从视频平台复制公开视频的分享链接。',
      },
      {
        title: '粘贴并解析',
        text: '将链接粘贴到输入框，启动自动解析链。',
      },
      {
        title: '下载解析结果',
        text: '预览视频、打开媒体文件，或复制直接下载链接。',
      },
    ],
    faqTitle: '常见问题',
    faqDescription: '关于 NoWatermark 视频下载器的常见疑问',
    faqs: [
      {
        question: 'NoWatermark 视频下载器免费吗？',
        answer:
          '支持的公开视频链接可免费基础使用。需要更高用量的创作者和团队可以选择次数包或月度套餐。',
      },
      {
        question: '支持哪些平台？',
        answer:
          '支持 TikTok、Instagram、YouTube、X、Facebook、Reddit 以及已配置解析节点所支持的其他服务。',
      },
      {
        question: '解析需要多长时间？',
        answer:
          '大多数链接可在几秒内完成。如果某个节点失败，自动重试和切换备用节点可能会需要更长时间。',
      },
      {
        question: '为什么有些链接无法解析？',
        answer:
          '已删除、私密、地区限制、需登录或已过期的内容可能无法被上游节点访问，请尽量使用公开链接。',
      },
      {
        question: '你们会保存我粘贴的链接吗？',
        answer:
          '下载器无需登录账号。解析结果仅保留在当前页面中，除非部署环境另行启用了账号功能。',
      },
    ],
    toolsEyebrow: '热门工具',
    toolsTitle: '按平台和使用场景查找视频工具',
    toolGroups: [
      {
        title: '短视频平台',
        items: [
          { label: 'TikTok 下载器', action: 'top' },
          { label: 'Instagram Reels', action: 'top' },
          { label: 'YouTube Shorts', action: 'top' },
          { label: 'Facebook 视频', action: 'top' },
        ],
      },
      {
        title: '社交平台',
        items: [
          { label: 'X / Twitter 视频', action: 'top' },
          { label: 'Reddit 视频', action: 'top' },
          { label: 'Threads 视频', action: 'top' },
          { label: 'Pinterest 视频', action: 'top' },
        ],
      },
      {
        title: '视频工具',
        items: [
          { label: '无水印下载', action: 'top' },
          { label: '媒体直链', action: 'top' },
          { label: '封面提取', action: 'top' },
          { label: '视频预览', action: 'top' },
        ],
      },
      {
        title: '相关资源',
        items: [
          { label: '支持的平台', action: 'top' },
          { label: '常见问题', action: 'faq' },
          { label: '隐私政策', action: 'privacy' },
          { label: '服务条款', action: 'terms' },
        ],
      },
    ],
    footer: {
      description: '免费下载公开视频，解析失败时自动重试并切换节点。',
      core: '核心功能',
      downloader: '视频下载器',
      pricing: '价格',
      account: '账户',
      popular: '热门平台',
      info: '其他信息',
      privacy: '隐私政策',
      terms: '服务条款',
      refunds: '退款政策',
      copyright: '版权与下架',
      deletion: '数据删除',
      contact: '联系我们',
      xSupport: 'X 客服',
    },
  },
} as const;

type Widen<T> = T extends (...args: infer Args) => infer Result
  ? (...args: Args) => Result
  : T extends readonly (infer Item)[]
    ? readonly Widen<Item>[]
    : T extends object
      ? { -readonly [Key in keyof T]: Widen<T[Key]> }
      : T extends string
        ? string
        : T extends number
          ? number
          : T;

type DownloaderCopy = Widen<typeof content.en>;

const localizedContent: Record<string, DownloaderCopy> = {
  en: content.en,
  zh: content.zh,
  es: {
    ...content.en,
    navigation: {
      ...content.en.navigation,
      home: 'Inicio',
      transcribe: 'Video a texto',
      platforms: 'Plataformas',
      blog: 'Blog',
      howItWorks: 'Cómo funciona',
      faq: 'FAQ',
      pricing: 'Precios',
      apiDocs: 'Docs API',
      signIn: 'Entrar',
      account: 'Cuenta',
      primaryLabel: 'Navegación principal',
      mobileLabel: 'Navegación móvil',
      homeLabel: 'Inicio de NoWatermark Downloader',
      switchLanguage: 'Cambiar idioma',
      switchLabel: 'PT',
    },
    upgrade: {
      eyebrow: 'Membresía de pago',
      title: 'Desbloquea el flujo completo para creadores',
      description:
        'Los miembros mensuales obtienen transcripción con IA, análisis por lotes, exportación de audio o video sin sonido, 1080p o mejor calidad y acceso API.',
      primary: 'Ver planes',
      secondary: 'Abrir cuenta',
    },
    hero: {
      ...content.en.hero,
      eyebrow: 'Descargador de videos online gratis',
      title: 'Descarga videos sin marca de agua gratis',
      description:
        'Pega un enlace público para obtener un video limpio, URL directa, portada y metadatos. 3 descargas gratis al día sin cuenta.',
      downloaderLabel: 'Descargador de videos',
      placeholder: 'Pega un enlace de TikTok, Instagram, YouTube, X o Facebook',
      inputLabel: 'URL pública del video',
      extracting: 'Extrayendo',
      extract: 'Extraer',
      paste: 'Pegar',
      clear: 'Limpiar',
      singleMode: 'Un enlace',
      batchMode: 'Lotes',
      batchInputLabel: 'Enlaces públicos, uno por línea',
      batchPlaceholder: 'Pega hasta 5 enlaces públicos, uno por línea',
      batchExtract: 'Analizar enlaces',
      batchProgress: (current: number, total: number) =>
        `Analizando ${current} de ${total}`,
      optionsLabel: 'Opciones de salida',
      formatLabel: 'Formato',
      qualityLabel: 'Calidad',
      memberBadge: 'Pro',
      memberUnlock:
        'Desbloquea lotes, formatos avanzados, 1080p, mejor calidad, transcripción con IA y API.',
      memberActive: 'Membresía de pago activa',
      modes: {
        video: 'Video + audio',
        audio: 'Solo audio',
        mute: 'Video sin sonido',
      },
      qualities: {
        max: 'Mejor disponible',
        '1080': '1080p',
        '720': '720p',
        '480': '480p',
      },
      platformsLabel: 'Plataformas compatibles',
      toolsLabel: 'Herramientas populares',
      chips: [
        'TikTok sin marca de agua',
        'Instagram Reels',
        'YouTube Shorts',
        'Video de Facebook',
        'Video de X / Twitter',
      ],
    },
    errors: {
      ...content.en.errors,
      emptyClipboard: 'El portapapeles está vacío.',
      clipboardBlocked: 'El navegador bloqueó el acceso al portapapeles.',
      emptyInput: 'Pega primero un enlace público.',
      invalidUrl: 'No se encontró una URL pública válida.',
      extractFailed: 'La extracción falló. Inténtalo de nuevo.',
      providerUnavailable:
        'No hay descarga disponible para este enlace ahora. Verifica que el video sea público e inténtalo en breve.',
      retrying: 'Reintentando análisis...',
      retryParse: 'Reintentar',
      rateLimited: 'Demasiadas solicitudes. Espera un momento.',
      signInRequired:
        'Usaste el límite gratuito diario. Inicia sesión para continuar.',
      creditsRequired: 'Necesitas al menos 1 crédito para analizar este video.',
      membershipRequired: 'Esta función requiere una membresía de pago activa.',
      batchRequiresAccount:
        'El análisis por lotes requiere una membresía de pago activa.',
      batchEmpty: 'Pega al menos un enlace público.',
      batchLimit: 'El lote admite hasta 5 enlaces por vez.',
      ready: 'Tu descarga está lista.',
    },
    result: {
      ...content.en.result,
      ready: 'Descarga lista',
      title: 'Tu video está listo',
      parsedFrom: 'Analizado desde',
      coverAlt: 'Portada del video',
      noPreview: 'Vista previa no disponible',
      platform: 'Plataforma',
      author: 'Autor',
      duration: 'Duración',
      format: 'Formato',
      quality: 'Calidad',
      audioOnly: 'Solo audio',
      muteVideo: 'Video sin sonido',
      bestAvailable: 'Mejor disponible',
      automaticParser: 'Analizador automático',
      unknown: 'Desconocido',
      downloadVideo: 'Descargar video',
      downloadAudio: 'Descargar audio',
      downloadImage: 'Descargar imagen',
      transcribeVideo: 'Transcribir video · Pro',
      batchReady: 'Resultados del lote',
      batchSuccess: 'Listo',
      batchFailed: 'Falló',
      batchCompleted: (current: number, total: number) =>
        `${current} de ${total} completados`,
      copied: 'Copiado',
      copyUrl: 'Copiar URL',
      option: 'Opción',
      publicVideo: 'Video público',
      freeRemaining: (count: number) =>
        `${count} descarga${count === 1 ? '' : 's'} gratis restante${count === 1 ? '' : 's'} hoy`,
      creditsRemaining: (count: number) =>
        `${count} crédito${count === 1 ? '' : 's'} restante${count === 1 ? '' : 's'}`,
    },
    featuresEyebrow: 'Herramienta gratis',
    featuresTitle: 'Convierte enlaces públicos en videos listos para descargar',
    features: [
      {
        icon: BadgeCheck,
        title: 'Gratis y sin registro',
        text: 'Descarga videos públicos sin instalar programas ni crear una cuenta.',
      },
      {
        icon: Captions,
        title: 'Plataformas globales',
        text: 'Compatible con enlaces públicos de TikTok, Instagram, YouTube, X, Facebook y más.',
      },
      {
        icon: ShieldCheck,
        title: 'Alternativas automáticas',
        text: 'Si el analizador principal falla, reintenta y cambia automáticamente a proveedores disponibles.',
      },
      {
        icon: Sparkles,
        title: 'Enlaces multimedia directos',
        text: 'Obtén la URL directa, la portada, el título, el autor y las alternativas disponibles.',
      },
    ],
    stepsEyebrow: 'Cómo funciona',
    stepsTitle: 'Descarga un video en tres pasos',
    steps: [
      {
        title: 'Copia el enlace',
        text: 'Copia el enlace público para compartir desde la plataforma de video.',
      },
      {
        title: 'Pega y analiza',
        text: 'Pégalo en el campo e inicia el análisis automático.',
      },
      {
        title: 'Descarga el resultado',
        text: 'Previsualiza el video, abre el archivo o copia la URL directa.',
      },
    ],
    faqTitle: 'Preguntas frecuentes',
    faqDescription: 'Preguntas comunes sobre NoWatermark Downloader',
    faqs: [
      {
        question: '¿NoWatermark Downloader es gratis?',
        answer:
          'Los enlaces públicos compatibles tienen acceso básico gratuito. También hay planes para creadores y equipos que necesitan más volumen.',
      },
      {
        question: '¿Qué plataformas son compatibles?',
        answer:
          'El analizador admite muchos enlaces públicos de TikTok, Instagram, YouTube, X, Facebook, Reddit y otros servicios compatibles.',
      },
      {
        question: '¿Cuánto tarda el análisis?',
        answer:
          'La mayoría de los enlaces termina en unos segundos. Los reintentos y proveedores alternativos pueden tardar un poco más.',
      },
      {
        question: '¿Por qué fallan algunos enlaces?',
        answer:
          'Los enlaces eliminados, privados, restringidos por región, que exigen inicio de sesión o que han caducado pueden no estar disponibles.',
      },
      {
        question: '¿Se guardan los enlaces que pego?',
        answer:
          'El descargador no requiere una cuenta. Los resultados permanecen en la página actual salvo que el sitio habilite funciones de cuenta adicionales.',
      },
    ],
    toolsEyebrow: 'Herramientas populares',
    toolsTitle: 'Encuentra herramientas por plataforma y flujo de trabajo',
    toolGroups: [
      {
        title: 'Plataformas de video corto',
        items: [
          { label: 'Descargador de TikTok', action: 'top' },
          { label: 'Instagram Reels', action: 'top' },
          { label: 'YouTube Shorts', action: 'top' },
          { label: 'Video de Facebook', action: 'top' },
        ],
      },
      {
        title: 'Redes sociales',
        items: [
          { label: 'Video de X / Twitter', action: 'top' },
          { label: 'Video de Reddit', action: 'top' },
          { label: 'Video de Threads', action: 'top' },
          { label: 'Video de Pinterest', action: 'top' },
        ],
      },
      {
        title: 'Herramientas de video',
        items: [
          { label: 'Descarga sin marca de agua', action: 'top' },
          { label: 'Enlace multimedia directo', action: 'top' },
          { label: 'Extraer portada', action: 'top' },
          { label: 'Vista previa del video', action: 'top' },
        ],
      },
      {
        title: 'Recursos',
        items: [
          { label: 'Plataformas compatibles', action: 'top' },
          { label: 'Preguntas frecuentes', action: 'faq' },
          { label: 'Política de privacidad', action: 'privacy' },
          { label: 'Términos del servicio', action: 'terms' },
        ],
      },
    ],
    footer: {
      description:
        'Descargas de videos públicos con reintentos automáticos de proveedor.',
      core: 'Principal',
      downloader: 'Descargador',
      pricing: 'Precios',
      account: 'Cuenta',
      popular: 'Popular',
      info: 'Info',
      privacy: 'Privacidad',
      terms: 'Términos',
      refunds: 'Reembolsos',
      copyright: 'Copyright',
      deletion: 'Eliminación de datos',
      contact: 'Contacto',
      xSupport: 'Soporte en X',
    },
  },
  pt: {
    ...content.en,
    navigation: {
      ...content.en.navigation,
      home: 'Início',
      transcribe: 'Vídeo para texto',
      platforms: 'Plataformas',
      blog: 'Blog',
      howItWorks: 'Como funciona',
      faq: 'FAQ',
      pricing: 'Preços',
      apiDocs: 'Docs API',
      signIn: 'Entrar',
      account: 'Conta',
      primaryLabel: 'Navegação principal',
      mobileLabel: 'Navegação móvel',
      homeLabel: 'Início do NoWatermark Downloader',
      switchLanguage: 'Trocar idioma',
      switchLabel: 'EN',
    },
    upgrade: {
      eyebrow: 'Assinatura paga',
      title: 'Desbloqueie o fluxo completo para criadores',
      description:
        'Assinantes mensais têm transcrição com IA, análise em lote, exportação de áudio ou vídeo mudo, 1080p ou melhor qualidade e acesso à API.',
      primary: 'Ver planos',
      secondary: 'Abrir conta',
    },
    hero: {
      ...content.en.hero,
      eyebrow: 'Baixador de vídeos online grátis',
      title: 'Baixe vídeos sem marca d’água grátis',
      description:
        'Cole um link público para obter vídeo limpo, URL direta, capa e metadados. 3 downloads grátis por dia sem conta.',
      downloaderLabel: 'Baixador de vídeos',
      placeholder: 'Cole um link do TikTok, Instagram, YouTube, X ou Facebook',
      inputLabel: 'URL pública do vídeo',
      extracting: 'Extraindo',
      extract: 'Extrair',
      paste: 'Colar',
      clear: 'Limpar',
      singleMode: 'Um link',
      batchMode: 'Lote',
      batchInputLabel: 'Links públicos, um por linha',
      batchPlaceholder: 'Cole até 5 links públicos, um por linha',
      batchExtract: 'Analisar links',
      batchProgress: (current: number, total: number) =>
        `Analisando ${current} de ${total}`,
      optionsLabel: 'Opções de saída',
      formatLabel: 'Formato',
      qualityLabel: 'Qualidade',
      memberBadge: 'Pro',
      memberUnlock:
        'Desbloqueie lote, formatos avançados, 1080p, melhor qualidade, transcrição com IA e API.',
      memberActive: 'Assinatura paga ativa',
      modes: {
        video: 'Vídeo + áudio',
        audio: 'Somente áudio',
        mute: 'Vídeo mudo',
      },
      qualities: {
        max: 'Melhor disponível',
        '1080': '1080p',
        '720': '720p',
        '480': '480p',
      },
      platformsLabel: 'Plataformas compatíveis',
      toolsLabel: 'Ferramentas populares',
      chips: [
        'TikTok sem marca d’água',
        'Instagram Reels',
        'YouTube Shorts',
        'Vídeo do Facebook',
        'Vídeo do X / Twitter',
      ],
    },
    errors: {
      ...content.en.errors,
      emptyClipboard: 'A área de transferência está vazia.',
      clipboardBlocked:
        'O navegador bloqueou o acesso à área de transferência.',
      emptyInput: 'Cole primeiro um link público.',
      invalidUrl: 'Nenhuma URL pública válida foi encontrada.',
      extractFailed: 'A extração falhou. Tente novamente.',
      providerUnavailable:
        'Nenhum download está disponível para este link agora. Verifique se o vídeo é público e tente novamente em breve.',
      retrying: 'Reanalisando...',
      retryParse: 'Tentar novamente',
      rateLimited: 'Muitas solicitações. Aguarde um momento.',
      signInRequired:
        'Seu limite gratuito diário acabou. Entre para continuar.',
      creditsRequired:
        'Você precisa de pelo menos 1 crédito para analisar este vídeo.',
      membershipRequired: 'Este recurso exige uma assinatura paga ativa.',
      batchRequiresAccount:
        'A análise em lote exige uma assinatura paga ativa.',
      batchEmpty: 'Cole pelo menos um link público.',
      batchLimit: 'O lote aceita até 5 links por vez.',
      ready: 'Seu download está pronto.',
    },
    result: {
      ...content.en.result,
      ready: 'Download pronto',
      title: 'Seu vídeo está pronto',
      parsedFrom: 'Analisado de',
      coverAlt: 'Capa do vídeo',
      noPreview: 'Prévia indisponível',
      platform: 'Plataforma',
      author: 'Autor',
      duration: 'Duração',
      format: 'Formato',
      quality: 'Qualidade',
      audioOnly: 'Somente áudio',
      muteVideo: 'Vídeo mudo',
      bestAvailable: 'Melhor disponível',
      automaticParser: 'Analisador automático',
      unknown: 'Desconhecido',
      downloadVideo: 'Baixar vídeo',
      downloadAudio: 'Baixar áudio',
      downloadImage: 'Baixar imagem',
      transcribeVideo: 'Transcrever vídeo · Pro',
      batchReady: 'Resultados do lote',
      batchSuccess: 'Pronto',
      batchFailed: 'Falhou',
      batchCompleted: (current: number, total: number) =>
        `${current} de ${total} concluídos`,
      copied: 'Copiado',
      copyUrl: 'Copiar URL',
      option: 'Opção',
      publicVideo: 'Vídeo público',
      freeRemaining: (count: number) =>
        `${count} download${count === 1 ? '' : 's'} grátis restante${count === 1 ? '' : 's'} hoje`,
      creditsRemaining: (count: number) =>
        `${count} crédito${count === 1 ? '' : 's'} restante${count === 1 ? '' : 's'}`,
    },
    featuresEyebrow: 'Ferramenta grátis',
    featuresTitle: 'Transforme links públicos em vídeos prontos para baixar',
    features: [
      {
        icon: BadgeCheck,
        title: 'Grátis e sem cadastro',
        text: 'Baixe vídeos públicos sem instalar programas nem criar uma conta.',
      },
      {
        icon: Captions,
        title: 'Plataformas globais',
        text: 'Compatível com links públicos do TikTok, Instagram, YouTube, X, Facebook e muito mais.',
      },
      {
        icon: ShieldCheck,
        title: 'Alternativas automáticas',
        text: 'Se o analisador principal falhar, o sistema tenta novamente e muda para provedores disponíveis.',
      },
      {
        icon: Sparkles,
        title: 'Links diretos de mídia',
        text: 'Obtenha a URL direta, a capa, o título, o autor e as alternativas disponíveis.',
      },
    ],
    stepsEyebrow: 'Como funciona',
    stepsTitle: 'Baixe um vídeo em três etapas',
    steps: [
      {
        title: 'Copie o link',
        text: 'Copie o link público de compartilhamento na plataforma de vídeo.',
      },
      {
        title: 'Cole e analise',
        text: 'Cole o link no campo e inicie a análise automática.',
      },
      {
        title: 'Baixe o resultado',
        text: 'Visualize o vídeo, abra o arquivo ou copie a URL direta.',
      },
    ],
    faqTitle: 'Perguntas frequentes',
    faqDescription: 'Perguntas comuns sobre o NoWatermark Downloader',
    faqs: [
      {
        question: 'O NoWatermark Downloader é grátis?',
        answer:
          'Links públicos compatíveis têm acesso básico gratuito. Também há planos para criadores e equipes que precisam de mais volume.',
      },
      {
        question: 'Quais plataformas são compatíveis?',
        answer:
          'O analisador aceita muitos links públicos do TikTok, Instagram, YouTube, X, Facebook, Reddit e outros serviços compatíveis.',
      },
      {
        question: 'Quanto tempo leva a análise?',
        answer:
          'A maioria dos links fica pronta em poucos segundos. Novas tentativas e provedores alternativos podem levar um pouco mais de tempo.',
      },
      {
        question: 'Por que alguns links falham?',
        answer:
          'Links removidos, privados, bloqueados por região, que exigem login ou que expiraram podem não estar disponíveis.',
      },
      {
        question: 'Vocês armazenam os links colados?',
        answer:
          'O baixador não exige uma conta. Os resultados permanecem na página atual, a menos que o site habilite recursos adicionais de conta.',
      },
    ],
    toolsEyebrow: 'Ferramentas populares',
    toolsTitle: 'Encontre ferramentas por plataforma e fluxo de trabalho',
    toolGroups: [
      {
        title: 'Plataformas de vídeos curtos',
        items: [
          { label: 'Baixador do TikTok', action: 'top' },
          { label: 'Instagram Reels', action: 'top' },
          { label: 'YouTube Shorts', action: 'top' },
          { label: 'Vídeo do Facebook', action: 'top' },
        ],
      },
      {
        title: 'Redes sociais',
        items: [
          { label: 'Vídeo do X / Twitter', action: 'top' },
          { label: 'Vídeo do Reddit', action: 'top' },
          { label: 'Vídeo do Threads', action: 'top' },
          { label: 'Vídeo do Pinterest', action: 'top' },
        ],
      },
      {
        title: 'Ferramentas de vídeo',
        items: [
          { label: 'Download sem marca d’água', action: 'top' },
          { label: 'Link direto de mídia', action: 'top' },
          { label: 'Extrair capa', action: 'top' },
          { label: 'Prévia do vídeo', action: 'top' },
        ],
      },
      {
        title: 'Recursos',
        items: [
          { label: 'Plataformas compatíveis', action: 'top' },
          { label: 'Perguntas frequentes', action: 'faq' },
          { label: 'Política de privacidade', action: 'privacy' },
          { label: 'Termos de serviço', action: 'terms' },
        ],
      },
    ],
    footer: {
      description:
        'Downloads de vídeos públicos com reintentos automáticos de provedor.',
      core: 'Principal',
      downloader: 'Baixador',
      pricing: 'Preços',
      account: 'Conta',
      popular: 'Popular',
      info: 'Info',
      privacy: 'Privacidade',
      terms: 'Termos',
      refunds: 'Reembolsos',
      copyright: 'Copyright',
      deletion: 'Exclusão de dados',
      contact: 'Contato',
      xSupport: 'Suporte no X',
    },
  },
  fr: {
    ...content.en,
    navigation: {
      ...content.en.navigation,
      home: 'Accueil',
      transcribe: 'Vidéo en texte',
      platforms: 'Plateformes',
      blog: 'Blog',
      howItWorks: 'Comment ça marche',
      faq: 'FAQ',
      pricing: 'Tarifs',
      apiDocs: 'Documentation API',
      signIn: 'Se connecter',
      account: 'Compte',
      primaryLabel: 'Navigation principale',
      mobileLabel: 'Navigation mobile',
      homeLabel: 'Accueil de NoWatermark Downloader',
      switchLanguage: 'Changer de langue',
      switchLabel: 'EN',
    },
    upgrade: {
      eyebrow: 'Abonnement payant',
      title: 'Débloquez le flux de travail complet des créateurs',
      description:
        'Les abonnés mensuels profitent de la transcription par IA, du traitement par lots, des exports audio ou vidéo muette, de la qualité 1080p ou maximale et de l’accès API.',
      primary: 'Voir les abonnements',
      secondary: 'Ouvrir le compte',
    },
    hero: {
      ...content.en.hero,
      eyebrow: 'Téléchargeur de vidéos en ligne gratuit',
      title: 'Téléchargez gratuitement des vidéos sans filigrane',
      description:
        'Collez le lien d’une publication publique pour obtenir une vidéo sans filigrane, son URL directe, sa miniature et ses informations. 3 téléchargements gratuits par jour, sans compte.',
      downloaderLabel: 'Téléchargeur de vidéos',
      placeholder: 'Collez un lien TikTok, Instagram, YouTube, X ou Facebook',
      inputLabel: 'URL de la vidéo publique',
      extracting: 'Extraction en cours',
      extract: 'Extraire',
      paste: 'Coller',
      clear: 'Effacer',
      singleMode: 'Un lien',
      batchMode: 'Plusieurs liens',
      batchInputLabel: 'Liens publics, un par ligne',
      batchPlaceholder: 'Collez jusqu’à 5 liens publics, un par ligne',
      batchExtract: 'Analyser les liens',
      batchProgress: (current: number, total: number) =>
        `Analyse de ${current} sur ${total}`,
      optionsLabel: 'Options de sortie',
      formatLabel: 'Format',
      qualityLabel: 'Qualité',
      memberBadge: 'Pro',
      memberUnlock:
        'Débloquez le traitement par lots, les formats avancés, le 1080p, la qualité maximale, la transcription par IA et l’API.',
      memberActive: 'Abonnement payant actif',
      modes: {
        video: 'Vidéo + audio',
        audio: 'Audio uniquement',
        mute: 'Vidéo muette',
      },
      qualities: {
        max: 'Meilleure qualité disponible',
        '1080': '1080p',
        '720': '720p',
        '480': '480p',
      },
      platformsLabel: 'Plateformes vidéo compatibles',
      toolsLabel: 'Outils vidéo populaires',
      chips: [
        'TikTok sans filigrane',
        'Instagram Reels',
        'YouTube Shorts',
        'Vidéo Facebook',
        'Vidéo X / Twitter',
      ],
    },
    errors: {
      ...content.en.errors,
      emptyClipboard: 'Votre presse-papiers est vide.',
      clipboardBlocked: 'Le navigateur a bloqué l’accès au presse-papiers.',
      emptyInput: 'Collez d’abord un lien de vidéo publique.',
      invalidUrl: 'Aucune URL publique valide n’a été trouvée.',
      extractFailed: 'L’extraction a échoué. Veuillez réessayer.',
      providerUnavailable:
        'Aucun téléchargement n’est disponible pour ce lien. Vérifiez que la vidéo est publique, puis réessayez dans quelques instants.',
      retrying: 'Nouvelle tentative d’analyse...',
      retryParse: 'Réessayer',
      rateLimited: 'Trop de requêtes. Patientez un instant avant de réessayer.',
      signInRequired:
        'Votre quota gratuit du jour est épuisé. Connectez-vous pour continuer.',
      creditsRequired: 'Il faut au moins 1 crédit pour analyser cette vidéo.',
      membershipRequired:
        'Cette fonctionnalité nécessite un abonnement payant actif.',
      batchRequiresAccount:
        'Le traitement par lots nécessite un abonnement payant actif.',
      batchEmpty: 'Collez au moins un lien public.',
      batchLimit: 'Vous pouvez analyser jusqu’à 5 liens à la fois.',
      ready: 'Votre téléchargement est prêt.',
    },
    result: {
      ...content.en.result,
      ready: 'Téléchargement prêt',
      title: 'Votre vidéo est prête',
      parsedFrom: 'Analysée depuis',
      coverAlt: 'Miniature de la vidéo',
      noPreview: 'Aperçu indisponible',
      platform: 'Plateforme',
      author: 'Auteur',
      duration: 'Durée',
      format: 'Format',
      quality: 'Qualité',
      audioOnly: 'Audio uniquement',
      muteVideo: 'Vidéo muette',
      bestAvailable: 'Meilleure qualité disponible',
      automaticParser: 'Analyseur automatique',
      unknown: 'Inconnu',
      downloadVideo: 'Télécharger la vidéo',
      downloadAudio: 'Télécharger l’audio',
      downloadImage: 'Télécharger l’image',
      transcribeVideo: 'Transcrire la vidéo · Pro',
      batchReady: 'Résultats du lot',
      batchSuccess: 'Prêt',
      batchFailed: 'Échec',
      batchCompleted: (current: number, total: number) =>
        `${current} sur ${total} terminés`,
      copied: 'Copié',
      copyUrl: 'Copier l’URL',
      option: 'Option',
      publicVideo: 'Vidéo publique',
      freeRemaining: (count: number) =>
        `${count} téléchargement${count > 1 ? 's' : ''} gratuit${count > 1 ? 's' : ''} restant${count > 1 ? 's' : ''} aujourd’hui`,
      creditsRemaining: (count: number) =>
        `${count} crédit${count > 1 ? 's' : ''} restant${count > 1 ? 's' : ''}`,
    },
    featuresEyebrow: 'Outil gratuit',
    featuresTitle:
      'Transformez les liens publics en vidéos prêtes à télécharger',
    features: [
      {
        icon: BadgeCheck,
        title: 'Gratuit et sans compte',
        text: 'Téléchargez des vidéos publiques sans installer de logiciel ni créer de compte.',
      },
      {
        icon: Captions,
        title: 'Plateformes internationales',
        text: 'Compatible avec les liens publics de TikTok, Instagram, YouTube, X, Facebook et plus encore.',
      },
      {
        icon: ShieldCheck,
        title: 'Solutions de secours automatiques',
        text: 'En cas d’échec, le système réessaie puis passe automatiquement à un autre fournisseur disponible.',
      },
      {
        icon: Sparkles,
        title: 'Liens directs propres',
        text: 'Obtenez l’URL directe, la miniature, le titre, l’auteur et les autres versions disponibles.',
      },
    ],
    stepsEyebrow: 'Comment ça marche',
    stepsTitle: 'Téléchargez une vidéo en trois étapes',
    steps: [
      {
        title: 'Copiez le lien',
        text: 'Copiez le lien de partage public depuis la plateforme vidéo.',
      },
      {
        title: 'Collez et analysez',
        text: 'Collez-le dans le champ et lancez l’analyse automatique.',
      },
      {
        title: 'Téléchargez le résultat',
        text: 'Prévisualisez la vidéo, ouvrez le fichier ou copiez l’URL directe.',
      },
    ],
    faqTitle: 'Questions fréquentes',
    faqDescription: 'Questions courantes sur NoWatermark Downloader',
    faqs: [
      {
        question: 'NoWatermark Downloader est-il gratuit ?',
        answer:
          'Un accès de base gratuit est disponible pour les liens publics compatibles. Des offres existent pour les créateurs et les équipes ayant besoin de plus de volume.',
      },
      {
        question: 'Quelles plateformes sont compatibles ?',
        answer:
          'L’analyseur accepte de nombreux liens publics de TikTok, Instagram, YouTube, X, Facebook, Reddit et d’autres services compatibles.',
      },
      {
        question: 'Combien de temps prend l’extraction ?',
        answer:
          'La plupart des liens sont traités en quelques secondes. Les nouvelles tentatives et les fournisseurs de secours peuvent prendre un peu plus de temps.',
      },
      {
        question: 'Pourquoi certains liens échouent-ils ?',
        answer:
          'Les liens supprimés, privés, bloqués par région, soumis à connexion ou expirés peuvent être indisponibles.',
      },
      {
        question: 'Conservez-vous les liens collés ?',
        answer:
          'Le téléchargeur ne nécessite pas de compte. Les résultats restent sur la page actuelle, sauf si des fonctions de compte supplémentaires sont activées.',
      },
    ],
    toolsEyebrow: 'Outils populaires',
    toolsTitle: 'Trouvez un outil selon la plateforme et votre besoin',
    toolGroups: [
      {
        title: 'Plateformes de vidéos courtes',
        items: [
          { label: 'Téléchargeur TikTok', action: 'top' },
          { label: 'Instagram Reels', action: 'top' },
          { label: 'YouTube Shorts', action: 'top' },
          { label: 'Vidéo Facebook', action: 'top' },
        ],
      },
      {
        title: 'Réseaux sociaux',
        items: [
          { label: 'Vidéo X / Twitter', action: 'top' },
          { label: 'Vidéo Reddit', action: 'top' },
          { label: 'Vidéo Threads', action: 'top' },
          { label: 'Vidéo Pinterest', action: 'top' },
        ],
      },
      {
        title: 'Outils vidéo',
        items: [
          { label: 'Téléchargement sans filigrane', action: 'top' },
          { label: 'Lien multimédia direct', action: 'top' },
          { label: 'Extraire la miniature', action: 'top' },
          { label: 'Aperçu vidéo', action: 'top' },
        ],
      },
      {
        title: 'Ressources',
        items: [
          { label: 'Plateformes compatibles', action: 'top' },
          { label: 'Questions fréquentes', action: 'faq' },
          { label: 'Politique de confidentialité', action: 'privacy' },
          { label: 'Conditions d’utilisation', action: 'terms' },
        ],
      },
    ],
    footer: {
      description:
        'Téléchargements gratuits de vidéos publiques avec nouvelles tentatives automatiques.',
      core: 'Essentiel',
      downloader: 'Téléchargeur',
      pricing: 'Tarifs',
      account: 'Compte',
      popular: 'Populaire',
      info: 'Informations',
      privacy: 'Confidentialité',
      terms: 'Conditions',
      refunds: 'Remboursements',
      copyright: 'Droits d’auteur',
      deletion: 'Suppression des données',
      contact: 'Contact',
      xSupport: 'Assistance sur X',
    },
  },
  de: {
    ...content.en,
    navigation: {
      ...content.en.navigation,
      home: 'Startseite',
      transcribe: 'Video zu Text',
      platforms: 'Plattformen',
      blog: 'Blog',
      howItWorks: 'So funktioniert es',
      faq: 'FAQ',
      pricing: 'Preise',
      apiDocs: 'API-Dokumentation',
      signIn: 'Anmelden',
      account: 'Konto',
      primaryLabel: 'Hauptnavigation',
      mobileLabel: 'Mobile Navigation',
      homeLabel: 'NoWatermark Downloader Startseite',
      switchLanguage: 'Sprache wechseln',
      switchLabel: 'EN',
    },
    upgrade: {
      eyebrow: 'Kostenpflichtige Mitgliedschaft',
      title: 'Der komplette Workflow für Creator',
      description:
        'Monatsmitglieder erhalten KI-Transkription, Stapelverarbeitung, Audio- und Stummvideo-Export, 1080p oder beste Qualität sowie API-Zugriff.',
      primary: 'Tarife ansehen',
      secondary: 'Konto öffnen',
    },
    hero: {
      ...content.en.hero,
      eyebrow: 'Kostenloser Online-Video-Downloader',
      title: 'Videos ohne Wasserzeichen kostenlos herunterladen',
      description:
        'Füge den Link eines öffentlichen Beitrags ein und erhalte das Video ohne Wasserzeichen, die direkte Medien-URL, das Vorschaubild und weitere Angaben. 3 kostenlose Downloads pro Tag, ohne Konto.',
      downloaderLabel: 'Video-Downloader',
      placeholder:
        'TikTok-, Instagram-, YouTube-, X- oder Facebook-Link einfügen',
      inputLabel: 'Öffentliche Video-URL',
      extracting: 'Wird analysiert',
      extract: 'Analysieren',
      paste: 'Einfügen',
      clear: 'Leeren',
      singleMode: 'Ein Link',
      batchMode: 'Mehrere Links',
      batchInputLabel: 'Öffentliche Videolinks, einer pro Zeile',
      batchPlaceholder: 'Bis zu 5 öffentliche Links einfügen, einen pro Zeile',
      batchExtract: 'Links analysieren',
      batchProgress: (current: number, total: number) =>
        `${current} von ${total} werden analysiert`,
      optionsLabel: 'Ausgabeoptionen',
      formatLabel: 'Format',
      qualityLabel: 'Qualität',
      memberBadge: 'Pro',
      memberUnlock:
        'Stapelverarbeitung, erweiterte Formate, 1080p, beste Qualität, KI-Transkription und API-Zugriff freischalten.',
      memberActive: 'Mitgliedschaft aktiv',
      modes: {
        video: 'Video + Audio',
        audio: 'Nur Audio',
        mute: 'Video ohne Ton',
      },
      qualities: {
        max: 'Beste verfügbare Qualität',
        '1080': '1080p',
        '720': '720p',
        '480': '480p',
      },
      platformsLabel: 'Unterstützte Videoplattformen',
      toolsLabel: 'Beliebte Video-Tools',
      chips: [
        'TikTok ohne Wasserzeichen',
        'Instagram Reels',
        'YouTube Shorts',
        'Facebook-Video',
        'X-/Twitter-Video',
      ],
    },
    errors: {
      ...content.en.errors,
      emptyClipboard: 'Die Zwischenablage ist leer.',
      clipboardBlocked:
        'Der Browser hat den Zugriff auf die Zwischenablage blockiert.',
      emptyInput: 'Füge zuerst einen öffentlichen Videolink ein.',
      invalidUrl: 'Keine gültige öffentliche URL gefunden.',
      extractFailed:
        'Die Analyse ist fehlgeschlagen. Bitte versuche es erneut.',
      providerUnavailable:
        'Für diesen Link ist derzeit kein Download verfügbar. Prüfe, ob das Video öffentlich ist, und versuche es später erneut.',
      retrying: 'Analyse wird wiederholt...',
      retryParse: 'Erneut versuchen',
      rateLimited: 'Zu viele Anfragen. Bitte warte einen Moment.',
      signInRequired:
        'Dein kostenloses Tageslimit ist aufgebraucht. Melde dich an, um fortzufahren.',
      creditsRequired:
        'Du benötigst mindestens 1 Guthaben, um dieses Video zu analysieren.',
      membershipRequired:
        'Diese Funktion erfordert eine aktive kostenpflichtige Mitgliedschaft.',
      batchRequiresAccount:
        'Die Stapelverarbeitung erfordert eine aktive kostenpflichtige Mitgliedschaft.',
      batchEmpty: 'Füge mindestens einen öffentlichen Link ein.',
      batchLimit: 'Bis zu 5 Links können gleichzeitig analysiert werden.',
      ready: 'Dein Download ist bereit.',
    },
    result: {
      ...content.en.result,
      ready: 'Download bereit',
      title: 'Dein Video ist bereit',
      parsedFrom: 'Analysiert von',
      coverAlt: 'Video-Vorschaubild',
      noPreview: 'Keine Vorschau verfügbar',
      platform: 'Plattform',
      author: 'Autor',
      duration: 'Dauer',
      format: 'Format',
      quality: 'Qualität',
      audioOnly: 'Nur Audio',
      muteVideo: 'Video ohne Ton',
      bestAvailable: 'Beste verfügbare Qualität',
      automaticParser: 'Automatische Analyse',
      unknown: 'Unbekannt',
      downloadVideo: 'Video herunterladen',
      downloadAudio: 'Audio herunterladen',
      downloadImage: 'Bild herunterladen',
      transcribeVideo: 'Video transkribieren · Pro',
      batchReady: 'Stapelergebnisse',
      batchSuccess: 'Bereit',
      batchFailed: 'Fehlgeschlagen',
      batchCompleted: (current: number, total: number) =>
        `${current} von ${total} abgeschlossen`,
      copied: 'Kopiert',
      copyUrl: 'URL kopieren',
      option: 'Option',
      publicVideo: 'Öffentliches Video',
      freeRemaining: (count: number) =>
        `Heute noch ${count} kostenlose${count === 1 ? 'r Download' : ' Downloads'}`,
      creditsRemaining: (count: number) => `Noch ${count} Guthaben`,
    },
    featuresEyebrow: 'Kostenloses Tool',
    featuresTitle: 'Öffentliche Links in downloadbereite Videos umwandeln',
    features: [
      {
        icon: BadgeCheck,
        title: 'Kostenlos und ohne Konto',
        text: 'Öffentliche Videos ohne Softwareinstallation oder Registrierung herunterladen.',
      },
      {
        icon: Captions,
        title: 'Globale Plattformen',
        text: 'Funktioniert mit öffentlichen Links von TikTok, Instagram, YouTube, X, Facebook und weiteren Diensten.',
      },
      {
        icon: ShieldCheck,
        title: 'Automatische Ausweichanbieter',
        text: 'Bei einem Fehler wird die Analyse wiederholt und automatisch zu verfügbaren Anbietern gewechselt.',
      },
      {
        icon: Sparkles,
        title: 'Direkte Medienlinks',
        text: 'Direkte URL, Vorschaubild, Titel, Autor und verfügbare Alternativen abrufen.',
      },
    ],
    stepsEyebrow: 'So funktioniert es',
    stepsTitle: 'Video in drei Schritten herunterladen',
    steps: [
      {
        title: 'Link kopieren',
        text: 'Kopiere den öffentlichen Freigabelink von der Videoplattform.',
      },
      {
        title: 'Einfügen und analysieren',
        text: 'Füge ihn in das Feld ein und starte die automatische Analyse.',
      },
      {
        title: 'Ergebnis herunterladen',
        text: 'Sieh dir das Video an, öffne die Datei oder kopiere die direkte URL.',
      },
    ],
    faqTitle: 'Häufig gestellte Fragen',
    faqDescription: 'Häufige Fragen zum NoWatermark Downloader',
    faqs: [
      {
        question: 'Ist NoWatermark Downloader kostenlos?',
        answer:
          'Für unterstützte öffentliche Videolinks gibt es einen kostenlosen Basiszugang. Für Creator und Teams mit höherem Bedarf stehen zusätzliche Tarife bereit.',
      },
      {
        question: 'Welche Plattformen werden unterstützt?',
        answer:
          'Die Analyse unterstützt viele öffentliche Links von TikTok, Instagram, YouTube, X, Facebook, Reddit und weiteren Diensten.',
      },
      {
        question: 'Wie lange dauert die Analyse?',
        answer:
          'Die meisten Links sind in wenigen Sekunden fertig. Wiederholungen und Ausweichanbieter können etwas länger dauern.',
      },
      {
        question: 'Warum funktionieren manche Links nicht?',
        answer:
          'Gelöschte, private, regional gesperrte, anmeldepflichtige oder abgelaufene Links sind möglicherweise nicht verfügbar.',
      },
      {
        question: 'Werden eingefügte Links gespeichert?',
        answer:
          'Der Downloader erfordert kein Konto. Ergebnisse bleiben auf der aktuellen Seite, sofern keine zusätzlichen Kontofunktionen aktiviert sind.',
      },
    ],
    toolsEyebrow: 'Beliebte Tools',
    toolsTitle: 'Video-Tools nach Plattform und Aufgabe finden',
    toolGroups: [
      {
        title: 'Kurzvideo-Plattformen',
        items: [
          { label: 'TikTok-Downloader', action: 'top' },
          { label: 'Instagram Reels', action: 'top' },
          { label: 'YouTube Shorts', action: 'top' },
          { label: 'Facebook-Video', action: 'top' },
        ],
      },
      {
        title: 'Soziale Netzwerke',
        items: [
          { label: 'X-/Twitter-Video', action: 'top' },
          { label: 'Reddit-Video', action: 'top' },
          { label: 'Threads-Video', action: 'top' },
          { label: 'Pinterest-Video', action: 'top' },
        ],
      },
      {
        title: 'Video-Tools',
        items: [
          { label: 'Download ohne Wasserzeichen', action: 'top' },
          { label: 'Direkter Medienlink', action: 'top' },
          { label: 'Vorschaubild extrahieren', action: 'top' },
          { label: 'Video-Vorschau', action: 'top' },
        ],
      },
      {
        title: 'Ressourcen',
        items: [
          { label: 'Unterstützte Plattformen', action: 'top' },
          { label: 'Häufige Fragen', action: 'faq' },
          { label: 'Datenschutzrichtlinie', action: 'privacy' },
          { label: 'Nutzungsbedingungen', action: 'terms' },
        ],
      },
    ],
    footer: {
      description:
        'Kostenlose Downloads öffentlicher Videos mit automatischen Wiederholungen.',
      core: 'Kernfunktionen',
      downloader: 'Downloader',
      pricing: 'Preise',
      account: 'Konto',
      popular: 'Beliebt',
      info: 'Informationen',
      privacy: 'Datenschutz',
      terms: 'Bedingungen',
      refunds: 'Rückerstattungen',
      copyright: 'Urheberrecht',
      deletion: 'Datenlöschung',
      contact: 'Kontakt',
      xSupport: 'Kundensupport auf X',
    },
  },
  it: {
    ...content.en,
    navigation: {
      ...content.en.navigation,
      home: 'Home',
      transcribe: 'Video in testo',
      platforms: 'Piattaforme',
      blog: 'Blog',
      howItWorks: 'Come funziona',
      faq: 'FAQ',
      pricing: 'Prezzi',
      apiDocs: 'Documentazione API',
      signIn: 'Accedi',
      account: 'Account',
      primaryLabel: 'Navigazione principale',
      mobileLabel: 'Navigazione mobile',
      homeLabel: 'Home di NoWatermark Downloader',
      switchLanguage: 'Cambia lingua',
      switchLabel: 'EN',
    },
    upgrade: {
      eyebrow: 'Abbonamento a pagamento',
      title: 'Sblocca il flusso di lavoro completo per creator',
      description:
        'Gli abbonati mensili ottengono trascrizione AI, analisi in batch, esportazione solo audio o video muto, qualità 1080p o massima e accesso API.',
      primary: 'Vedi gli abbonamenti',
      secondary: 'Apri account',
    },
    hero: {
      ...content.en.hero,
      eyebrow: 'Downloader video online gratuito',
      title: 'Scarica gratis video senza filigrana',
      description:
        'Incolla il link di un post pubblico per ottenere il video senza filigrana, l’URL diretto, la copertina e i metadati. 3 download gratuiti al giorno, senza account.',
      downloaderLabel: 'Downloader video',
      placeholder: 'Incolla un link TikTok, Instagram, YouTube, X o Facebook',
      inputLabel: 'URL del video pubblico',
      extracting: 'Analisi in corso',
      extract: 'Analizza',
      paste: 'Incolla',
      clear: 'Cancella',
      singleMode: 'Un link',
      batchMode: 'Più link',
      batchInputLabel: 'Link pubblici, uno per riga',
      batchPlaceholder: 'Incolla fino a 5 link pubblici, uno per riga',
      batchExtract: 'Analizza i link',
      batchProgress: (current: number, total: number) =>
        `Analisi di ${current} su ${total}`,
      optionsLabel: 'Opzioni di output',
      formatLabel: 'Formato',
      qualityLabel: 'Qualità',
      memberBadge: 'Pro',
      memberUnlock:
        'Sblocca analisi in batch, formati avanzati, 1080p, qualità massima, trascrizione AI e accesso API.',
      memberActive: 'Abbonamento attivo',
      modes: {
        video: 'Video + audio',
        audio: 'Solo audio',
        mute: 'Video muto',
      },
      qualities: {
        max: 'Migliore disponibile',
        '1080': '1080p',
        '720': '720p',
        '480': '480p',
      },
      platformsLabel: 'Piattaforme video supportate',
      toolsLabel: 'Strumenti video popolari',
      chips: [
        'TikTok senza filigrana',
        'Instagram Reels',
        'YouTube Shorts',
        'Video Facebook',
        'Video X / Twitter',
      ],
    },
    errors: {
      ...content.en.errors,
      emptyClipboard: 'Gli appunti sono vuoti.',
      clipboardBlocked: 'Il browser ha bloccato l’accesso agli appunti.',
      emptyInput: 'Incolla prima un link video pubblico.',
      invalidUrl: 'Non è stato trovato un URL pubblico valido.',
      extractFailed: 'Analisi non riuscita. Riprova.',
      providerUnavailable:
        'Al momento non è disponibile alcun download per questo link. Verifica che il video sia pubblico e riprova tra poco.',
      retrying: 'Nuovo tentativo di analisi...',
      retryParse: 'Riprova',
      rateLimited: 'Troppe richieste. Attendi un momento e riprova.',
      signInRequired:
        'Hai esaurito il limite gratuito giornaliero. Accedi per continuare.',
      creditsRequired: 'Serve almeno 1 credito per analizzare questo video.',
      membershipRequired:
        'Questa funzione richiede un abbonamento a pagamento attivo.',
      batchRequiresAccount:
        'L’analisi in batch richiede un abbonamento a pagamento attivo.',
      batchEmpty: 'Incolla almeno un link pubblico.',
      batchLimit: 'Puoi analizzare fino a 5 link alla volta.',
      ready: 'Il download è pronto.',
    },
    result: {
      ...content.en.result,
      ready: 'Download pronto',
      title: 'Il video è pronto',
      parsedFrom: 'Analizzato da',
      coverAlt: 'Copertina del video',
      noPreview: 'Anteprima non disponibile',
      platform: 'Piattaforma',
      author: 'Autore',
      duration: 'Durata',
      format: 'Formato',
      quality: 'Qualità',
      audioOnly: 'Solo audio',
      muteVideo: 'Video muto',
      bestAvailable: 'Migliore disponibile',
      automaticParser: 'Analizzatore automatico',
      unknown: 'Sconosciuto',
      downloadVideo: 'Scarica video',
      downloadAudio: 'Scarica audio',
      downloadImage: 'Scarica immagine',
      transcribeVideo: 'Trascrivi video · Pro',
      batchReady: 'Risultati batch',
      batchSuccess: 'Pronto',
      batchFailed: 'Non riuscito',
      batchCompleted: (current: number, total: number) =>
        `${current} di ${total} completati`,
      copied: 'Copiato',
      copyUrl: 'Copia URL',
      option: 'Opzione',
      publicVideo: 'Video pubblico',
      freeRemaining: (count: number) =>
        `${count} download gratuit${count === 1 ? 'o' : 'i'} rimast${count === 1 ? 'o' : 'i'} oggi`,
      creditsRemaining: (count: number) =>
        `${count} credit${count === 1 ? 'o' : 'i'} rimanent${count === 1 ? 'e' : 'i'}`,
    },
    featuresEyebrow: 'Strumento gratuito',
    featuresTitle: 'Trasforma i link pubblici in video pronti da scaricare',
    features: [
      {
        icon: BadgeCheck,
        title: 'Gratis e senza account',
        text: 'Scarica video pubblici senza installare software né creare un account.',
      },
      {
        icon: Captions,
        title: 'Piattaforme globali',
        text: 'Funziona con link pubblici da TikTok, Instagram, YouTube, X, Facebook e molti altri servizi.',
      },
      {
        icon: ShieldCheck,
        title: 'Alternative automatiche',
        text: 'Se l’analizzatore principale non riesce, il sistema riprova e passa a un provider disponibile.',
      },
      {
        icon: Sparkles,
        title: 'Link multimediali diretti',
        text: 'Ottieni URL diretto, copertina, titolo, autore e alternative disponibili.',
      },
    ],
    stepsEyebrow: 'Come funziona',
    stepsTitle: 'Scarica un video in tre passaggi',
    steps: [
      {
        title: 'Copia il link',
        text: 'Copia il link pubblico di condivisione dalla piattaforma video.',
      },
      {
        title: 'Incolla e analizza',
        text: 'Incollalo nel campo e avvia l’analisi automatica.',
      },
      {
        title: 'Scarica il risultato',
        text: 'Guarda l’anteprima, apri il file o copia l’URL diretto.',
      },
    ],
    faqTitle: 'Domande frequenti',
    faqDescription: 'Domande comuni su NoWatermark Downloader',
    faqs: [
      {
        question: 'NoWatermark Downloader è gratuito?',
        answer:
          'È disponibile un accesso base gratuito per i link video pubblici supportati. Sono disponibili anche piani per creator e team che necessitano di più volume.',
      },
      {
        question: 'Quali piattaforme sono supportate?',
        answer:
          'L’analizzatore supporta molti link pubblici da TikTok, Instagram, YouTube, X, Facebook, Reddit e altri servizi.',
      },
      {
        question: 'Quanto dura l’analisi?',
        answer:
          'La maggior parte dei link viene elaborata in pochi secondi. I nuovi tentativi e i provider alternativi possono richiedere più tempo.',
      },
      {
        question: 'Perché alcuni link non funzionano?',
        answer:
          'I link eliminati, privati, bloccati per area geografica, che richiedono accesso o scaduti potrebbero non essere disponibili.',
      },
      {
        question: 'Memorizzate i link incollati?',
        answer:
          'Il downloader non richiede un account. I risultati restano nella pagina corrente, salvo l’attivazione di funzioni account aggiuntive.',
      },
    ],
    toolsEyebrow: 'Strumenti popolari',
    toolsTitle: 'Trova strumenti video per piattaforma e utilizzo',
    toolGroups: [
      {
        title: 'Piattaforme di video brevi',
        items: [
          { label: 'Downloader TikTok', action: 'top' },
          { label: 'Instagram Reels', action: 'top' },
          { label: 'YouTube Shorts', action: 'top' },
          { label: 'Video Facebook', action: 'top' },
        ],
      },
      {
        title: 'Social network',
        items: [
          { label: 'Video X / Twitter', action: 'top' },
          { label: 'Video Reddit', action: 'top' },
          { label: 'Video Threads', action: 'top' },
          { label: 'Video Pinterest', action: 'top' },
        ],
      },
      {
        title: 'Strumenti video',
        items: [
          { label: 'Download senza filigrana', action: 'top' },
          { label: 'Link multimediale diretto', action: 'top' },
          { label: 'Estrai copertina', action: 'top' },
          { label: 'Anteprima video', action: 'top' },
        ],
      },
      {
        title: 'Risorse',
        items: [
          { label: 'Piattaforme supportate', action: 'top' },
          { label: 'Domande frequenti', action: 'faq' },
          { label: 'Informativa sulla privacy', action: 'privacy' },
          { label: 'Termini di servizio', action: 'terms' },
        ],
      },
    ],
    footer: {
      description:
        'Download gratuiti di video pubblici con tentativi automatici.',
      core: 'Funzioni principali',
      downloader: 'Downloader',
      pricing: 'Prezzi',
      account: 'Account',
      popular: 'Popolari',
      info: 'Informazioni',
      privacy: 'Privacy',
      terms: 'Termini',
      refunds: 'Rimborsi',
      copyright: 'Copyright',
      deletion: 'Eliminazione dati',
      contact: 'Contatti',
      xSupport: 'Assistenza clienti su X',
    },
  },
  id: {
    ...content.en,
    navigation: {
      ...content.en.navigation,
      home: 'Beranda',
      transcribe: 'Video ke teks',
      platforms: 'Platform',
      blog: 'Blog',
      howItWorks: 'Cara kerja',
      faq: 'FAQ',
      pricing: 'Harga',
      apiDocs: 'Dokumentasi API',
      signIn: 'Masuk',
      account: 'Akun',
      primaryLabel: 'Navigasi utama',
      mobileLabel: 'Navigasi seluler',
      homeLabel: 'Beranda NoWatermark Downloader',
      switchLanguage: 'Ganti bahasa',
      switchLabel: 'EN',
    },
    upgrade: {
      eyebrow: 'Keanggotaan berbayar',
      title: 'Buka alur kerja lengkap untuk kreator',
      description:
        'Anggota bulanan mendapatkan transkripsi AI, pemrosesan massal, ekspor audio atau video tanpa suara, kualitas 1080p atau terbaik, serta akses API.',
      primary: 'Lihat paket',
      secondary: 'Buka akun',
    },
    hero: {
      ...content.en.hero,
      eyebrow: 'Pengunduh video online gratis',
      title: 'Unduh video tanpa watermark secara gratis',
      description:
        'Tempel tautan posting publik untuk mendapatkan video tanpa watermark, URL media langsung, sampul, dan metadata. 3 unduhan gratis per hari tanpa akun.',
      downloaderLabel: 'Pengunduh video',
      placeholder: 'Tempel tautan TikTok, Instagram, YouTube, X, atau Facebook',
      inputLabel: 'URL video publik',
      extracting: 'Sedang memproses',
      extract: 'Proses',
      paste: 'Tempel',
      clear: 'Hapus',
      singleMode: 'Satu tautan',
      batchMode: 'Banyak tautan',
      batchInputLabel: 'Tautan video publik, satu per baris',
      batchPlaceholder: 'Tempel hingga 5 tautan publik, satu per baris',
      batchExtract: 'Proses tautan',
      batchProgress: (current: number, total: number) =>
        `Memproses ${current} dari ${total}`,
      optionsLabel: 'Opsi hasil',
      formatLabel: 'Format',
      qualityLabel: 'Kualitas',
      memberBadge: 'Pro',
      memberUnlock:
        'Buka pemrosesan massal, format lanjutan, 1080p, kualitas terbaik, transkripsi AI, dan akses API.',
      memberActive: 'Keanggotaan berbayar aktif',
      modes: {
        video: 'Video + audio',
        audio: 'Audio saja',
        mute: 'Video tanpa suara',
      },
      qualities: {
        max: 'Kualitas terbaik tersedia',
        '1080': '1080p',
        '720': '720p',
        '480': '480p',
      },
      platformsLabel: 'Platform video yang didukung',
      toolsLabel: 'Alat video populer',
      chips: [
        'TikTok tanpa watermark',
        'Instagram Reels',
        'YouTube Shorts',
        'Video Facebook',
        'Video X / Twitter',
      ],
    },
    errors: {
      ...content.en.errors,
      emptyClipboard: 'Papan klip Anda kosong.',
      clipboardBlocked: 'Akses papan klip diblokir oleh browser.',
      emptyInput: 'Tempel tautan video publik terlebih dahulu.',
      invalidUrl: 'URL publik yang valid tidak ditemukan.',
      extractFailed: 'Pemrosesan gagal. Silakan coba lagi.',
      providerUnavailable:
        'Unduhan untuk tautan ini belum tersedia. Pastikan video bersifat publik, lalu coba lagi sebentar lagi.',
      retrying: 'Mencoba memproses ulang...',
      retryParse: 'Coba lagi',
      rateLimited: 'Terlalu banyak permintaan. Tunggu sebentar lalu coba lagi.',
      signInRequired:
        'Batas gratis harian Anda telah habis. Masuk untuk melanjutkan.',
      creditsRequired:
        'Anda memerlukan minimal 1 kredit untuk memproses video ini.',
      membershipRequired:
        'Fitur ini memerlukan keanggotaan berbayar yang aktif.',
      batchRequiresAccount:
        'Pemrosesan massal memerlukan keanggotaan berbayar yang aktif.',
      batchEmpty: 'Tempel minimal satu tautan publik.',
      batchLimit: 'Maksimal 5 tautan dapat diproses sekaligus.',
      ready: 'Unduhan Anda siap.',
    },
    result: {
      ...content.en.result,
      ready: 'Unduhan siap',
      title: 'Video Anda siap',
      parsedFrom: 'Diproses dari',
      coverAlt: 'Sampul video',
      noPreview: 'Pratinjau tidak tersedia',
      platform: 'Platform',
      author: 'Pembuat',
      duration: 'Durasi',
      format: 'Format',
      quality: 'Kualitas',
      audioOnly: 'Audio saja',
      muteVideo: 'Video tanpa suara',
      bestAvailable: 'Kualitas terbaik tersedia',
      automaticParser: 'Pemroses otomatis',
      unknown: 'Tidak diketahui',
      downloadVideo: 'Unduh video',
      downloadAudio: 'Unduh audio',
      downloadImage: 'Unduh gambar',
      transcribeVideo: 'Transkripsikan video · Pro',
      batchReady: 'Hasil massal',
      batchSuccess: 'Siap',
      batchFailed: 'Gagal',
      batchCompleted: (current: number, total: number) =>
        `${current} dari ${total} selesai`,
      copied: 'Disalin',
      copyUrl: 'Salin URL',
      option: 'Pilihan',
      publicVideo: 'Video publik',
      freeRemaining: (count: number) =>
        `${count} unduhan gratis tersisa hari ini`,
      creditsRemaining: (count: number) => `${count} kredit tersisa`,
    },
    featuresEyebrow: 'Alat gratis',
    featuresTitle: 'Ubah tautan publik menjadi video siap unduh',
    features: [
      {
        icon: BadgeCheck,
        title: 'Gratis tanpa akun',
        text: 'Unduh video publik tanpa memasang perangkat lunak atau membuat akun.',
      },
      {
        icon: Captions,
        title: 'Platform global',
        text: 'Berfungsi dengan tautan publik dari TikTok, Instagram, YouTube, X, Facebook, dan lainnya.',
      },
      {
        icon: ShieldCheck,
        title: 'Cadangan otomatis',
        text: 'Jika pemroses utama gagal, sistem mencoba kembali lalu berpindah ke penyedia lain yang tersedia.',
      },
      {
        icon: Sparkles,
        title: 'Tautan media langsung',
        text: 'Dapatkan URL langsung, sampul, judul, pembuat, dan pilihan lain yang tersedia.',
      },
    ],
    stepsEyebrow: 'Cara kerja',
    stepsTitle: 'Unduh video dalam tiga langkah',
    steps: [
      {
        title: 'Salin tautan',
        text: 'Salin tautan berbagi publik dari platform video.',
      },
      {
        title: 'Tempel dan proses',
        text: 'Tempel di kolom lalu mulai pemrosesan otomatis.',
      },
      {
        title: 'Unduh hasilnya',
        text: 'Pratinjau video, buka file media, atau salin URL langsung.',
      },
    ],
    faqTitle: 'Pertanyaan umum',
    faqDescription: 'Pertanyaan umum tentang NoWatermark Downloader',
    faqs: [
      {
        question: 'Apakah NoWatermark Downloader gratis?',
        answer:
          'Akses dasar gratis tersedia untuk tautan video publik yang didukung. Paket tambahan tersedia bagi kreator dan tim yang memerlukan volume lebih besar.',
      },
      {
        question: 'Platform apa saja yang didukung?',
        answer:
          'Pemroses mendukung banyak tautan publik dari TikTok, Instagram, YouTube, X, Facebook, Reddit, dan layanan lainnya.',
      },
      {
        question: 'Berapa lama prosesnya?',
        answer:
          'Sebagian besar tautan selesai dalam beberapa detik. Percobaan ulang dan penyedia cadangan dapat memerlukan waktu lebih lama.',
      },
      {
        question: 'Mengapa beberapa tautan gagal?',
        answer:
          'Tautan yang dihapus, privat, dibatasi wilayah, memerlukan login, atau kedaluwarsa mungkin tidak tersedia.',
      },
      {
        question: 'Apakah tautan yang ditempel disimpan?',
        answer:
          'Pengunduh tidak memerlukan akun. Hasil tetap berada di halaman saat ini kecuali fitur akun tambahan diaktifkan.',
      },
    ],
    toolsEyebrow: 'Alat populer',
    toolsTitle: 'Temukan alat video berdasarkan platform dan kebutuhan',
    toolGroups: [
      {
        title: 'Platform video pendek',
        items: [
          { label: 'Pengunduh TikTok', action: 'top' },
          { label: 'Instagram Reels', action: 'top' },
          { label: 'YouTube Shorts', action: 'top' },
          { label: 'Video Facebook', action: 'top' },
        ],
      },
      {
        title: 'Media sosial',
        items: [
          { label: 'Video X / Twitter', action: 'top' },
          { label: 'Video Reddit', action: 'top' },
          { label: 'Video Threads', action: 'top' },
          { label: 'Video Pinterest', action: 'top' },
        ],
      },
      {
        title: 'Alat video',
        items: [
          { label: 'Unduh tanpa watermark', action: 'top' },
          { label: 'Tautan media langsung', action: 'top' },
          { label: 'Ambil sampul', action: 'top' },
          { label: 'Pratinjau video', action: 'top' },
        ],
      },
      {
        title: 'Sumber informasi',
        items: [
          { label: 'Platform yang didukung', action: 'top' },
          { label: 'Pertanyaan umum', action: 'faq' },
          { label: 'Kebijakan privasi', action: 'privacy' },
          { label: 'Ketentuan layanan', action: 'terms' },
        ],
      },
    ],
    footer: {
      description: 'Unduh video publik gratis dengan percobaan ulang otomatis.',
      core: 'Fitur utama',
      downloader: 'Pengunduh',
      pricing: 'Harga',
      account: 'Akun',
      popular: 'Populer',
      info: 'Informasi',
      privacy: 'Privasi',
      terms: 'Ketentuan',
      refunds: 'Pengembalian dana',
      copyright: 'Hak cipta',
      deletion: 'Penghapusan data',
      contact: 'Kontak',
      xSupport: 'Dukungan pelanggan di X',
    },
  },
  ko: {
    ...content.en,
    navigation: {
      ...content.en.navigation,
      home: '홈',
      transcribe: '동영상 텍스트 변환',
      platforms: '지원 플랫폼',
      blog: '블로그',
      howItWorks: '사용 방법',
      faq: '자주 묻는 질문',
      pricing: '요금제',
      apiDocs: 'API 문서',
      signIn: '로그인',
      account: '계정',
      primaryLabel: '주 메뉴',
      mobileLabel: '모바일 메뉴',
      homeLabel: 'NoWatermark Downloader 홈',
      switchLanguage: '언어 변경',
      switchLabel: 'EN',
    },
    upgrade: {
      eyebrow: '유료 멤버십',
      title: '크리에이터를 위한 전체 워크플로 잠금 해제',
      description:
        '월간 멤버는 AI 전사, 일괄 분석, 오디오 전용 및 무음 동영상 내보내기, 1080p 또는 최고 화질, API를 이용할 수 있습니다.',
      primary: '멤버십 요금제 보기',
      secondary: '계정 열기',
    },
    hero: {
      ...content.en.hero,
      eyebrow: '무료 온라인 동영상 다운로더',
      title: '워터마크 없는 동영상을 무료로 다운로드',
      description:
        '공개 게시물 링크를 붙여 넣으면 워터마크 없는 동영상, 미디어 직접 URL, 커버와 메타데이터를 받을 수 있습니다. 계정 없이 하루 3회 무료로 이용하세요.',
      downloaderLabel: '동영상 다운로더',
      placeholder: 'TikTok, Instagram, YouTube, X 또는 Facebook 링크 붙여 넣기',
      inputLabel: '공개 동영상 URL',
      extracting: '분석 중',
      extract: '분석하기',
      paste: '붙여 넣기',
      clear: '지우기',
      singleMode: '단일 링크',
      batchMode: '여러 링크',
      batchInputLabel: '공개 동영상 링크(한 줄에 하나)',
      batchPlaceholder: '공개 링크를 최대 5개까지 한 줄에 하나씩 붙여 넣기',
      batchExtract: '링크 분석하기',
      batchProgress: (current: number, total: number) =>
        `${total}개 중 ${current}개 분석 중`,
      optionsLabel: '출력 옵션',
      formatLabel: '형식',
      qualityLabel: '화질',
      memberBadge: 'Pro',
      memberUnlock:
        '일괄 분석, 고급 형식, 1080p, 최고 화질, AI 전사 및 API를 이용하세요.',
      memberActive: '유료 멤버십 활성화됨',
      modes: {
        video: '동영상 + 오디오',
        audio: '오디오만',
        mute: '무음 동영상',
      },
      qualities: {
        max: '사용 가능한 최고 화질',
        '1080': '1080p',
        '720': '720p',
        '480': '480p',
      },
      platformsLabel: '지원되는 동영상 플랫폼',
      toolsLabel: '인기 동영상 도구',
      chips: [
        'TikTok 워터마크 제거',
        'Instagram Reels',
        'YouTube Shorts',
        'Facebook 동영상',
        'X / Twitter 동영상',
      ],
    },
    errors: {
      ...content.en.errors,
      emptyClipboard: '클립보드가 비어 있습니다.',
      clipboardBlocked: '브라우저가 클립보드 접근을 차단했습니다.',
      emptyInput: '먼저 공개 동영상 링크를 붙여 넣으세요.',
      invalidUrl: '유효한 공개 URL을 찾을 수 없습니다.',
      extractFailed: '분석에 실패했습니다. 다시 시도해 주세요.',
      providerUnavailable:
        '현재 이 링크에서 다운로드할 수 없습니다. 동영상이 공개 상태인지 확인한 후 잠시 뒤 다시 시도해 주세요.',
      retrying: '다시 분석하는 중...',
      retryParse: '다시 분석',
      rateLimited: '요청이 너무 많습니다. 잠시 후 다시 시도해 주세요.',
      signInRequired:
        '오늘의 무료 한도를 모두 사용했습니다. 계속하려면 로그인하세요.',
      creditsRequired: '이 동영상을 분석하려면 크레딧이 1개 이상 필요합니다.',
      membershipRequired: '이 기능을 사용하려면 활성 유료 멤버십이 필요합니다.',
      batchRequiresAccount: '일괄 분석에는 활성 유료 멤버십이 필요합니다.',
      batchEmpty: '공개 링크를 하나 이상 붙여 넣으세요.',
      batchLimit: '한 번에 최대 5개의 링크를 분석할 수 있습니다.',
      ready: '다운로드할 준비가 되었습니다.',
    },
    result: {
      ...content.en.result,
      ready: '다운로드 준비 완료',
      title: '동영상이 준비되었습니다',
      parsedFrom: '분석 출처',
      coverAlt: '동영상 커버',
      noPreview: '미리보기를 사용할 수 없음',
      platform: '플랫폼',
      author: '작성자',
      duration: '길이',
      format: '형식',
      quality: '화질',
      audioOnly: '오디오만',
      muteVideo: '무음 동영상',
      bestAvailable: '사용 가능한 최고 화질',
      automaticParser: '자동 분석기',
      unknown: '알 수 없음',
      downloadVideo: '동영상 다운로드',
      downloadAudio: '오디오 다운로드',
      downloadImage: '이미지 다운로드',
      transcribeVideo: '동영상 텍스트 변환 · Pro',
      batchReady: '일괄 분석 결과',
      batchSuccess: '준비됨',
      batchFailed: '실패',
      batchCompleted: (current: number, total: number) =>
        `${total}개 중 ${current}개 완료`,
      copied: '복사됨',
      copyUrl: 'URL 복사',
      option: '옵션',
      publicVideo: '공개 동영상',
      freeRemaining: (count: number) => `오늘 무료 다운로드 ${count}회 남음`,
      creditsRemaining: (count: number) => `크레딧 ${count}개 남음`,
    },
    featuresEyebrow: '무료 도구',
    featuresTitle: '공개 링크를 다운로드 가능한 동영상으로 변환',
    features: [
      {
        icon: BadgeCheck,
        title: '무료, 계정 불필요',
        text: '소프트웨어를 설치하거나 계정을 만들지 않고 공개 동영상을 다운로드하세요.',
      },
      {
        icon: Captions,
        title: '다양한 글로벌 플랫폼',
        text: 'TikTok, Instagram, YouTube, X, Facebook 등의 공개 링크를 지원합니다.',
      },
      {
        icon: ShieldCheck,
        title: '자동 대체 처리',
        text: '기본 분석에 실패하면 자동으로 재시도하고 이용 가능한 다른 제공업체로 전환합니다.',
      },
      {
        icon: Sparkles,
        title: '깔끔한 미디어 링크',
        text: '직접 미디어 URL, 커버, 제목, 작성자와 사용 가능한 대체 리소스를 받으세요.',
      },
    ],
    stepsEyebrow: '사용 방법',
    stepsTitle: '세 단계로 동영상 다운로드',
    steps: [
      {
        title: '링크 복사',
        text: '동영상 플랫폼에서 공개 공유 링크를 복사하세요.',
      },
      {
        title: '붙여 넣고 분석',
        text: '입력란에 붙여 넣고 자동 분석을 시작하세요.',
      },
      {
        title: '결과 다운로드',
        text: '동영상을 미리 보거나 파일을 열고 직접 URL을 복사하세요.',
      },
    ],
    faqTitle: '자주 묻는 질문',
    faqDescription: 'NoWatermark Downloader에 관한 자주 묻는 질문',
    faqs: [
      {
        question: 'NoWatermark Downloader는 무료인가요?',
        answer:
          '지원되는 공개 동영상 링크는 무료로 기본 이용할 수 있습니다. 더 많은 작업이 필요한 크리에이터와 팀을 위한 요금제도 있습니다.',
      },
      {
        question: '어떤 플랫폼을 지원하나요?',
        answer:
          'TikTok, Instagram, YouTube, X, Facebook, Reddit 및 설정된 제공업체가 처리할 수 있는 다양한 공개 링크를 지원합니다.',
      },
      {
        question: '분석에는 얼마나 걸리나요?',
        answer:
          '대부분의 링크는 몇 초 안에 완료됩니다. 제공업체 재시도와 대체 처리가 진행되면 더 오래 걸릴 수 있습니다.',
      },
      {
        question: '일부 링크가 실패하는 이유는 무엇인가요?',
        answer:
          '삭제되었거나 비공개, 지역 제한, 로그인 필요 또는 만료된 링크는 처리할 수 없을 수 있습니다. 공개 링크를 사용하세요.',
      },
      {
        question: '붙여 넣은 링크를 저장하나요?',
        answer:
          '다운로더는 계정이 필요하지 않습니다. 별도의 계정 기능을 활성화하지 않았다면 결과는 현재 페이지에만 유지됩니다.',
      },
    ],
    toolsEyebrow: '인기 도구',
    toolsTitle: '플랫폼과 사용 목적에 맞는 동영상 도구 찾기',
    toolGroups: [
      {
        title: '숏폼 동영상 플랫폼',
        items: [
          { label: 'TikTok 다운로더', action: 'top' },
          { label: 'Instagram Reels', action: 'top' },
          { label: 'YouTube Shorts', action: 'top' },
          { label: 'Facebook 동영상', action: 'top' },
        ],
      },
      {
        title: '소셜 플랫폼',
        items: [
          { label: 'X / Twitter 동영상', action: 'top' },
          { label: 'Reddit 동영상', action: 'top' },
          { label: 'Threads 동영상', action: 'top' },
          { label: 'Pinterest 동영상', action: 'top' },
        ],
      },
      {
        title: '동영상 도구',
        items: [
          { label: '워터마크 없이 다운로드', action: 'top' },
          { label: '직접 미디어 링크', action: 'top' },
          { label: '커버 추출', action: 'top' },
          { label: '동영상 미리보기', action: 'top' },
        ],
      },
      {
        title: '리소스',
        items: [
          { label: '지원 플랫폼', action: 'top' },
          { label: '자주 묻는 질문', action: 'faq' },
          { label: '개인정보 처리방침', action: 'privacy' },
          { label: '서비스 약관', action: 'terms' },
        ],
      },
    ],
    footer: {
      description: '자동 재시도를 지원하는 무료 공개 동영상 다운로드.',
      core: '주요 기능',
      downloader: '다운로더',
      pricing: '요금제',
      account: '계정',
      popular: '인기',
      info: '정보',
      privacy: '개인정보',
      terms: '약관',
      refunds: '환불',
      copyright: '저작권',
      deletion: '데이터 삭제',
      contact: '문의',
      xSupport: 'X 고객 지원',
    },
  },
  ja: {
    ...content.en,
    navigation: {
      ...content.en.navigation,
      home: 'ホーム',
      transcribe: '動画を文字起こし',
      platforms: '対応サイト',
      blog: 'ブログ',
      howItWorks: '使い方',
      faq: 'よくある質問',
      pricing: '料金',
      apiDocs: 'API ドキュメント',
      signIn: 'ログイン',
      account: 'アカウント',
      primaryLabel: 'メインナビゲーション',
      mobileLabel: 'モバイルナビゲーション',
      homeLabel: 'NoWatermark Downloader ホーム',
      switchLanguage: '言語を切り替える',
      switchLabel: 'EN',
    },
    upgrade: {
      eyebrow: '有料プラン',
      title: 'クリエイター向けの全機能を利用できます',
      description:
        '月額会員は、AI 文字起こし、一括解析、音声のみ・無音動画の書き出し、1080p または最高画質、API を利用できます。',
      primary: '料金プランを見る',
      secondary: 'アカウントを開く',
    },
    hero: {
      ...content.en.hero,
      eyebrow: '無料オンライン動画ダウンローダー',
      title: 'ウォーターマークなしの動画を無料でダウンロード',
      description:
        '公開投稿のリンクを貼り付けるだけで、ウォーターマークなしの動画、メディアの直接 URL、カバー画像、詳細情報を取得できます。アカウント登録不要で、1 日 3 回まで無料です。',
      downloaderLabel: '動画ダウンローダー',
      placeholder: 'TikTok、Instagram、YouTube、X、Facebook のリンクを貼り付け',
      inputLabel: '公開動画の URL',
      extracting: '解析中',
      extract: '解析する',
      paste: '貼り付け',
      clear: 'クリア',
      singleMode: '1 件のリンク',
      batchMode: '複数のリンク',
      batchInputLabel: '公開動画のリンク（1 行に 1 件）',
      batchPlaceholder: '公開リンクを最大 5 件、1 行に 1 件ずつ貼り付け',
      batchExtract: 'まとめて解析',
      batchProgress: (current: number, total: number) =>
        `${total} 件中 ${current} 件を解析中`,
      optionsLabel: '出力オプション',
      formatLabel: '形式',
      qualityLabel: '画質',
      memberBadge: 'Pro',
      memberUnlock:
        '複数リンクの解析、高度な形式、1080p・最高画質、AI 文字起こし、API を利用できます。',
      memberActive: '有料プランを利用中',
      modes: {
        video: '動画 + 音声',
        audio: '音声のみ',
        mute: '無音動画',
      },
      qualities: {
        max: '利用可能な最高画質',
        '1080': '1080p',
        '720': '720p',
        '480': '480p',
      },
      platformsLabel: '対応動画サイト',
      toolsLabel: '人気の動画ツール',
      chips: [
        'TikTok ウォーターマークなし',
        'Instagram Reels',
        'YouTube Shorts',
        'Facebook 動画',
        'X / Twitter 動画',
      ],
    },
    errors: {
      ...content.en.errors,
      emptyClipboard: 'クリップボードは空です。',
      clipboardBlocked:
        'ブラウザによってクリップボードへのアクセスが拒否されました。',
      emptyInput: '公開動画のリンクを貼り付けてください。',
      invalidUrl: '有効な公開 URL が見つかりませんでした。',
      extractFailed: '解析に失敗しました。もう一度お試しください。',
      providerUnavailable:
        '現在このリンクから動画を取得できません。動画が公開されていることを確認し、しばらくしてからもう一度お試しください。',
      retrying: '再解析しています...',
      retryParse: '再解析する',
      rateLimited: 'リクエストが多すぎます。しばらくしてからお試しください。',
      signInRequired:
        '本日の無料回数を使い切りました。ログインして続行してください。',
      creditsRequired: 'この動画を解析するには 1 クレジット以上必要です。',
      membershipRequired: 'この機能の利用には有効な有料プランが必要です。',
      batchRequiresAccount: '複数リンクの解析には有効な有料プランが必要です。',
      batchEmpty: '公開リンクを 1 件以上貼り付けてください。',
      batchLimit: '一度に解析できるリンクは最大 5 件です。',
      ready: 'ダウンロードの準備ができました。',
    },
    result: {
      ...content.en.result,
      ready: 'ダウンロード準備完了',
      title: '動画の準備ができました',
      parsedFrom: '解析元',
      coverAlt: '動画のカバー画像',
      noPreview: 'プレビューできません',
      platform: 'サイト',
      author: '投稿者',
      duration: '長さ',
      format: '形式',
      quality: '画質',
      audioOnly: '音声のみ',
      muteVideo: '無音動画',
      bestAvailable: '利用可能な最高画質',
      automaticParser: '自動解析',
      unknown: '不明',
      downloadVideo: '動画をダウンロード',
      downloadAudio: '音声をダウンロード',
      downloadImage: '画像をダウンロード',
      transcribeVideo: '動画を文字起こし · Pro',
      batchReady: '一括解析結果',
      batchSuccess: '準備完了',
      batchFailed: '失敗',
      batchCompleted: (current: number, total: number) =>
        `${total} 件中 ${current} 件が完了`,
      copied: 'コピーしました',
      copyUrl: 'URL をコピー',
      option: '候補',
      publicVideo: '公開動画',
      freeRemaining: (count: number) =>
        `本日の無料ダウンロードは残り ${count} 回です`,
      creditsRemaining: (count: number) => `残り ${count} クレジットです`,
    },
    featuresEyebrow: '無料ツール',
    featuresTitle: '公開リンクからダウンロード可能な動画を取得',
    features: [
      {
        icon: BadgeCheck,
        title: '無料で利用可能',
        text: 'ソフトのインストールやアカウント登録なしで公開動画をダウンロードできます。',
      },
      {
        icon: Captions,
        title: '幅広いサイトに対応',
        text: 'TikTok、Instagram、YouTube、X、Facebook などの公開リンクに対応しています。',
      },
      {
        icon: ShieldCheck,
        title: '自動フォールバック',
        text: '最初の解析に失敗した場合は自動で再試行し、利用可能な別の解析サービスに切り替えます。',
      },
      {
        icon: Sparkles,
        title: '直接メディア URL',
        text: 'メディアの直接 URL、カバー画像、タイトル、投稿者、利用可能な別候補を取得できます。',
      },
    ],
    stepsEyebrow: '使い方',
    stepsTitle: '3 ステップで動画をダウンロード',
    steps: [
      {
        title: 'リンクをコピー',
        text: '動画サイトから公開動画の共有リンクをコピーします。',
      },
      {
        title: '貼り付けて解析',
        text: '入力欄にリンクを貼り付け、自動解析を開始します。',
      },
      {
        title: '動画をダウンロード',
        text: '動画をプレビューし、メディアファイルを開くか、直接 URL をコピーします。',
      },
    ],
    faqTitle: 'よくある質問',
    faqDescription: 'NoWatermark Downloader に関するよくある質問',
    faqs: [
      {
        question: 'NoWatermark Downloader は無料ですか？',
        answer:
          '対応している公開動画リンクは無料で利用できます。より多く利用するクリエイターやチーム向けに、有料プランも用意しています。',
      },
      {
        question: 'どのサイトに対応していますか？',
        answer:
          'TikTok、Instagram、YouTube、X、Facebook、Reddit など、設定された解析サービスが扱う多くの公開リンクに対応しています。',
      },
      {
        question: '解析にはどのくらい時間がかかりますか？',
        answer:
          '多くのリンクは数秒で完了します。解析サービスが失敗し、自動再試行や切り替えが行われる場合は、さらに時間がかかることがあります。',
      },
      {
        question: '一部のリンクを解析できないのはなぜですか？',
        answer:
          '削除済み、非公開、地域制限、ログイン必須、期限切れのリンクは解析できない場合があります。公開リンクをご利用ください。',
      },
      {
        question: '貼り付けたリンクは保存されますか？',
        answer:
          'ダウンローダーはアカウント登録なしで利用できます。別途アカウント機能が有効化されていない限り、解析結果は現在のページにのみ保持されます。',
      },
    ],
    toolsEyebrow: '人気のツール',
    toolsTitle: 'サイトや用途から動画ツールを探す',
    toolGroups: [
      {
        title: 'ショート動画サイト',
        items: [
          { label: 'TikTok ダウンローダー', action: 'top' },
          { label: 'Instagram Reels', action: 'top' },
          { label: 'YouTube Shorts', action: 'top' },
          { label: 'Facebook 動画', action: 'top' },
        ],
      },
      {
        title: 'ソーシャルメディア',
        items: [
          { label: 'X / Twitter 動画', action: 'top' },
          { label: 'Reddit 動画', action: 'top' },
          { label: 'Threads 動画', action: 'top' },
          { label: 'Pinterest 動画', action: 'top' },
        ],
      },
      {
        title: '動画ツール',
        items: [
          { label: 'ウォーターマークなしで保存', action: 'top' },
          { label: 'メディアの直接 URL', action: 'top' },
          { label: 'カバー画像を取得', action: 'top' },
          { label: '動画プレビュー', action: 'top' },
        ],
      },
      {
        title: '関連情報',
        items: [
          { label: '対応サイト', action: 'top' },
          { label: 'よくある質問', action: 'faq' },
          { label: 'プライバシーポリシー', action: 'privacy' },
          { label: '利用規約', action: 'terms' },
        ],
      },
    ],
    footer: {
      description:
        '公開動画を無料でダウンロード。解析に失敗した場合は自動で再試行します。',
      core: '主な機能',
      downloader: 'ダウンローダー',
      pricing: '料金',
      account: 'アカウント',
      popular: '人気サイト',
      info: 'ご案内',
      privacy: 'プライバシー',
      terms: '利用規約',
      refunds: '返金ポリシー',
      copyright: '著作権',
      deletion: 'データ削除',
      contact: 'お問い合わせ',
      xSupport: 'X でのカスタマーサポート',
    },
  },
};

function localizedPath(locale: SiteLocale, path: string) {
  if (locale === 'en') return path;
  if (path === '/') return `/${locale}`;
  return `/${locale}${path}`;
}

function extractUrl(value: string) {
  const match = value.match(/https?:\/\/[^\s]+/i);
  return (match?.[0] || value).replace(/[)\]}>.,!?;]+$/g, '');
}

function extractUrls(value: string) {
  return Array.from(
    new Set(
      (value.match(/https?:\/\/[^\s]+/gi) || [])
        .map((url) => url.replace(/[)\]}>.,!?;]+$/g, ''))
        .filter(Boolean)
    )
  );
}

function wait(ms: number) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

function formatDuration(value: number | undefined, unknownLabel: string) {
  if (!value || value <= 0) return unknownLabel;
  const seconds = Math.round(value > 1000 ? value / 1000 : value);
  const minutes = Math.floor(seconds / 60);
  return `${minutes}:${String(seconds % 60).padStart(2, '0')}`;
}

export function CopypilotDownloader() {
  const locale = normalizeLocale(getLocale());
  // Locales without published editorial copy use the complete English version.
  const t = localizedContent[locale] || content.en;
  const { data: session } = useSession();
  const membershipQuery = usePaidMembership(Boolean(session?.user));
  const isPaidMember = Boolean(membershipQuery.data);
  const membershipLoading = Boolean(session?.user) && membershipQuery.isPending;
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement | null>(null);
  const resultRef = useRef<HTMLElement | null>(null);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState<{
    type: 'error' | 'success';
    text: string;
  } | null>(null);
  const [result, setResult] = useState<ParseResult | null>(null);
  const [openFaq, setOpenFaq] = useState(0);
  const [copied, setCopied] = useState(false);
  const [downloadMode, setDownloadMode] = useState<DownloadMode>('auto');
  const [quality, setQuality] = useState<VideoQuality>('720');
  const [batchMode, setBatchMode] = useState(false);
  const [retrying, setRetrying] = useState(false);
  const [batchResults, setBatchResults] = useState<BatchResult[]>([]);
  const [batchProgress, setBatchProgress] = useState<{
    current: number;
    total: number;
  } | null>(null);

  const mediaUrl = result?.mediaUrl || result?.videoUrl || '';
  const mediaType = result?.mediaType || 'video';
  const resultFormat =
    mediaType === 'audio'
      ? t.result.audioOnly
      : mediaType === 'image'
        ? t.result.downloadImage
        : result?.requestedMode === 'mute'
          ? t.result.muteVideo
          : t.result.downloadVideo;
  const resultQuality =
    result?.requestedMode === 'audio'
      ? t.result.audioOnly
      : result?.requestedQuality === 'max'
        ? t.result.bestAvailable
        : result?.requestedQuality
          ? `${result.requestedQuality}p`
          : t.result.unknown;
  const pricingHref = localizedPath(locale, '/pricing');
  const transcribeHref = localizedPath(locale, '/transcribe');
  const accountHref = localizedPath(locale, '/settings');
  const homeHref = localizedPath(locale, '/');
  const apiDocsHref = localizedPath(locale, '/api-docs');
  const blogHref = localizedPath(locale, '/blog');
  const toolsHref = localizedPath(locale, '/tools');
  const wechatArticleHref = localizedPath(
    locale,
    '/tools/wechat-article-parser'
  );
  const musicToolHref = localizedPath(locale, '/tools/music-downloader');
  const signInHref = `${localizedPath(locale, '/sign-in')}?callbackUrl=${encodeURIComponent(homeHref)}`;
  const localizedResourceHref = (path: string) => localizedPath(locale, path);
  const wechatArticlePromo = {
    en: {
      eyebrow: 'New content tool',
      title: 'WeChat article parser',
      description:
        'Extract public mp.weixin.qq.com articles into clean text, Markdown, images, and exposed video sources.',
      action: 'Open parser',
    },
    zh: {
      eyebrow: '新内容工具',
      title: '公众号文章解析',
      description:
        '提取公开 mp.weixin.qq.com 文章正文、Markdown、图片和页面暴露的视频源。',
      action: '打开解析器',
    },
    es: {
      eyebrow: 'Nueva herramienta de contenido',
      title: 'Analizador de artículos WeChat',
      description:
        'Extrae artículos públicos de mp.weixin.qq.com como texto limpio, Markdown, imágenes y videos expuestos.',
      action: 'Abrir',
    },
    pt: {
      eyebrow: 'Nova ferramenta de conteúdo',
      title: 'Analisador de artigos WeChat',
      description:
        'Extraia artigos públicos do mp.weixin.qq.com como texto limpo, Markdown, imagens e vídeos expostos.',
      action: 'Abrir parser',
    },
    fr: {
      eyebrow: 'Nouvel outil de contenu',
      title: 'Analyseur d’articles WeChat',
      description:
        'Extrayez les articles publics mp.weixin.qq.com en texte propre, Markdown, images et vidéos exposées.',
      action: 'Ouvrir',
    },
    de: {
      eyebrow: 'Neues Content-Tool',
      title: 'WeChat-Artikel-Parser',
      description:
        'Extrahiere öffentliche mp.weixin.qq.com-Artikel als sauberen Text, Markdown, Bilder und sichtbare Videoquellen.',
      action: 'Öffnen',
    },
    it: {
      eyebrow: 'Nuovo strumento contenuti',
      title: 'Parser articoli WeChat',
      description:
        'Estrai articoli pubblici mp.weixin.qq.com come testo pulito, Markdown, immagini e video esposti.',
      action: 'Apri parser',
    },
    id: {
      eyebrow: 'Alat konten baru',
      title: 'Parser artikel WeChat',
      description:
        'Ekstrak artikel publik mp.weixin.qq.com menjadi teks bersih, Markdown, gambar, dan video yang terekspos.',
      action: 'Buka parser',
    },
    ja: {
      eyebrow: '新しいコンテンツツール',
      title: 'WeChat記事解析',
      description:
        '公開 mp.weixin.qq.com 記事を本文、Markdown、画像、公開動画ソースとして抽出します。',
      action: '開く',
    },
    ko: {
      eyebrow: '새 콘텐츠 도구',
      title: 'WeChat 글 파서',
      description:
        '공개 mp.weixin.qq.com 글을 정리된 텍스트, Markdown, 이미지, 노출된 동영상 소스로 추출합니다.',
      action: '열기',
    },
  }[locale] || {
    eyebrow: 'New content tool',
    title: 'WeChat article parser',
    description:
      'Extract public mp.weixin.qq.com articles into clean text, Markdown, images, and exposed video sources.',
    action: 'Open parser',
  };
  const musicToolPromo = {
    en: {
      eyebrow: 'Music tool',
      title: 'Music parser',
      description:
        'Parse public NetEase Cloud Music, QQ Music, Kuwo Music, and Qishui links into song metadata, covers, lyrics, and audio URLs.',
      action: 'Open music tools',
    },
    zh: {
      eyebrow: '音乐工具',
      title: '音乐解析',
      description:
        '解析公开的网易云、QQ 音乐、酷我音乐和汽水音乐链接，提取歌曲信息、封面、歌词和音频直链。',
      action: '打开音乐工具',
    },
    es: {
      eyebrow: 'Herramienta musical',
      title: 'Analizador de música',
      description:
        'Analiza enlaces públicos de NetEase, QQ Music, Kuwo y Qishui para obtener metadatos, portada, letra y audio directo.',
      action: 'Abrir',
    },
    pt: {
      eyebrow: 'Ferramenta musical',
      title: 'Analisador de música',
      description:
        'Analise links públicos do NetEase, QQ Music, Kuwo e Qishui para obter metadados, capa, letra e áudio direto.',
      action: 'Abrir música',
    },
    fr: {
      eyebrow: 'Outil musical',
      title: 'Analyseur de musique',
      description:
        'Analysez les liens publics NetEase, QQ Music, Kuwo et Qishui pour obtenir les métadonnées, la pochette, les paroles et l’audio.',
      action: 'Ouvrir',
    },
    de: {
      eyebrow: 'Musik-Tool',
      title: 'Musik-Parser',
      description:
        'Analysiere öffentliche NetEase-, QQ-Music-, Kuwo- und Qishui-Links und erhalte Metadaten, Cover, Lyrics und Audio-URLs.',
      action: 'Öffnen',
    },
    it: {
      eyebrow: 'Strumento musicale',
      title: 'Parser musicale',
      description:
        'Analizza link pubblici NetEase, QQ Music, Kuwo e Qishui per ottenere metadati, copertina, testo e URL audio.',
      action: 'Apri musica',
    },
    id: {
      eyebrow: 'Alat musik',
      title: 'Parser musik',
      description:
        'Ekstrak tautan publik NetEase, QQ Music, Kuwo, dan Qishui menjadi metadata lagu, cover, lirik, dan URL audio.',
      action: 'Buka musik',
    },
    ja: {
      eyebrow: '音楽ツール',
      title: '音楽解析',
      description:
        '公開された NetEase、QQ Music、Kuwo、Qishui のリンクから曲情報、カバー、歌詞、音声 URL を抽出します。',
      action: '音楽ツールを開く',
    },
    ko: {
      eyebrow: '음악 도구',
      title: '음악 파서',
      description:
        '공개 NetEase, QQ Music, Kuwo, Qishui 링크에서 곡 정보, 커버, 가사, 오디오 URL을 추출합니다.',
      action: '음악 도구 열기',
    },
  }[locale] || {
    eyebrow: 'Music tool',
    title: 'Music parser',
    description:
      'Parse public NetEase Cloud Music, QQ Music, Kuwo Music, and Qishui links into song metadata, covers, lyrics, and audio URLs.',
    action: 'Open music tools',
  };

  const platformLabel = useMemo(() => {
    const source = result?.sourceUrl || extractUrl(input);
    try {
      return new URL(source).hostname.replace(/^www\./, '');
    } catch {
      return result?.platform || t.result.publicVideo;
    }
  }, [input, result, t.result.publicVideo]);

  useEffect(() => {
    const url = new URL(window.location.href);
    const sharedUrl = url.searchParams.get('url')?.trim() || '';
    if (!sharedUrl || !/^https?:\/\//i.test(sharedUrl)) return;

    setInput(sharedUrl);
    url.searchParams.delete('url');
    window.history.replaceState(
      window.history.state,
      '',
      `${url.pathname}${url.search}${url.hash}`
    );

    // Platform landing pages hand off their submitted URL here; continue the
    // requested extraction so the user does not need to submit twice.
    setLoading(true);
    void parseCurrentSource(sharedUrl).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!result) return;
    window.requestAnimationFrame(() => {
      resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }, [result]);

  async function handlePaste() {
    try {
      const value = await navigator.clipboard.readText();
      if (!value) {
        setNotice({ type: 'error', text: t.errors.emptyClipboard });
        return;
      }
      setInput(value);
      setNotice(null);
      inputRef.current?.focus();
    } catch {
      setNotice({
        type: 'error',
        text: t.errors.clipboardBlocked,
      });
    }
  }

  function getParseErrorMessage(response: Response, payload: any) {
    return response.status === 429
      ? t.errors.rateLimited
      : response.status === 401
        ? t.errors.signInRequired
        : response.status === 402
          ? t.errors.creditsRequired
          : response.status === 403
            ? t.errors.membershipRequired
            : response.status >= 500
              ? t.errors.providerUnavailable
              : payload?.message || t.errors.extractFailed;
  }

  async function parseSource(sourceUrl: string, batch = false) {
    const response = await fetch('/api/parse', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        batch,
        mode: downloadMode,
        quality,
        url: sourceUrl,
      }),
    });
    const payload = await response.json().catch(() => null);

    if (!response.ok || payload?.code !== 0) {
      throw new Error(getParseErrorMessage(response, payload));
    }

    return payload.data as ParseResult;
  }

  async function parseCurrentSource(sourceUrl: string) {
    setRetrying(true);
    setNotice(null);
    try {
      const parsed = await parseSource(sourceUrl);
      setResult({ ...parsed, sourceUrl });
      setNotice({ type: 'success', text: t.errors.ready });
    } catch (error) {
      setNotice({
        type: 'error',
        text: error instanceof Error ? error.message : t.errors.extractFailed,
      });
    } finally {
      setRetrying(false);
    }
  }

  async function handleBatchExtract(value: string) {
    if (!isPaidMember) {
      setNotice({ type: 'error', text: t.errors.batchRequiresAccount });
      return;
    }

    const urls = extractUrls(value);
    if (!urls.length) {
      setNotice({ type: 'error', text: t.errors.batchEmpty });
      return;
    }
    if (urls.length > BATCH_MAX_ITEMS) {
      setNotice({ type: 'error', text: t.errors.batchLimit });
      return;
    }

    setLoading(true);
    setNotice(null);
    setResult(null);
    setBatchResults(
      urls.map((sourceUrl, index) => ({
        id: `${Date.now()}-${index}`,
        sourceUrl,
        status: 'pending',
      }))
    );
    setBatchProgress({ current: 0, total: urls.length });
    let successCount = 0;

    try {
      for (const [index, sourceUrl] of urls.entries()) {
        if (index > 0) await wait(1300);
        setBatchProgress({ current: index + 1, total: urls.length });
        try {
          const parsed = await parseSource(sourceUrl, true);
          successCount += 1;
          setBatchResults((current) =>
            current.map((item, itemIndex) =>
              itemIndex === index
                ? {
                    ...item,
                    result: { ...parsed, sourceUrl },
                    status: 'success',
                  }
                : item
            )
          );
        } catch (error) {
          setBatchResults((current) =>
            current.map((item, itemIndex) =>
              itemIndex === index
                ? {
                    ...item,
                    error:
                      error instanceof Error
                        ? error.message
                        : t.errors.extractFailed,
                    status: 'error',
                  }
                : item
            )
          );
        }
      }
      setNotice({
        type: successCount ? 'success' : 'error',
        text: successCount ? t.result.batchReady : t.errors.providerUnavailable,
      });
    } finally {
      setLoading(false);
      setBatchProgress(null);
    }
  }

  async function handleExtract() {
    const value = input.trim();
    if (!value) {
      setNotice({
        type: 'error',
        text: batchMode ? t.errors.batchEmpty : t.errors.emptyInput,
      });
      inputRef.current?.focus();
      return;
    }

    if (batchMode) {
      await handleBatchExtract(value);
      return;
    }

    const sourceUrl = extractUrl(value);
    if (!/^https?:\/\//i.test(sourceUrl)) {
      setNotice({ type: 'error', text: t.errors.invalidUrl });
      return;
    }

    setLoading(true);
    setNotice(null);
    setResult(null);
    setBatchResults([]);

    try {
      await parseCurrentSource(sourceUrl);
    } finally {
      setLoading(false);
    }
  }

  async function handleRetry() {
    const sourceUrl = result?.sourceUrl || extractUrl(input.trim());
    if (!sourceUrl || retrying) return;
    setLoading(true);
    try {
      await parseCurrentSource(sourceUrl);
    } finally {
      setLoading(false);
    }
  }

  async function copyMediaUrl() {
    if (!mediaUrl) return;
    try {
      await navigator.clipboard.writeText(mediaUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      setNotice({
        type: 'error',
        text: t.errors.clipboardBlocked,
      });
    }
  }

  const applicationSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    '@id': `${envConfigs.app_url.replace(/\/$/, '')}/#application`,
    name: 'NoWatermark Downloader',
    url: `${envConfigs.app_url.replace(/\/$/, '')}${homeHref}`,
    applicationCategory: 'MultimediaApplication',
    operatingSystem: 'Web',
    inLanguage: locale,
    description: t.hero.description,
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    featureList: [
      'Public video link parsing',
      'No-watermark media downloads',
      'Direct media URL and metadata',
      'Video transcription for active members',
    ],
  };

  return (
    <main className="cp-site">
      <JsonLd data={applicationSchema} />
      <header className="cp-header">
        <a className="cp-logo" href="#top" aria-label={t.navigation.homeLabel}>
          <span className="cp-logo-mark" aria-hidden="true">
            <FileVideo size={23} />
          </span>
          <span>NoWatermark</span>
        </a>
        <nav className="cp-desktop-nav" aria-label={t.navigation.primaryLabel}>
          <a href="#top">{t.navigation.home}</a>
          <a href={transcribeHref}>{t.navigation.transcribe}</a>
          <a href={toolsHref}>{t.navigation.platforms}</a>
          <a href={blogHref}>{t.navigation.blog}</a>
          <a href={apiDocsHref}>{t.navigation.apiDocs}</a>
          <a href="#steps">{t.navigation.howItWorks}</a>
          <a href="#faq">{t.navigation.faq}</a>
          <a href={pricingHref}>{t.navigation.pricing}</a>
        </nav>
        <div className="cp-header-actions">
          <a
            className="cp-account-link"
            href={session?.user ? accountHref : signInHref}
          >
            <CircleUserRound size={18} />
            <span>
              {session?.user ? t.navigation.account : t.navigation.signIn}
            </span>
          </a>
          <LocaleSelector variant="pill" className="cp-locale-pill" />
        </div>
      </header>

      <nav className="cp-mobile-nav" aria-label={t.navigation.mobileLabel}>
        <a href="#top">{t.navigation.home}</a>
        <a href={transcribeHref}>{t.navigation.transcribe}</a>
        <a href={toolsHref}>{t.navigation.platforms}</a>
        <a href={blogHref}>{t.navigation.blog}</a>
        <a href={apiDocsHref}>{t.navigation.apiDocs}</a>
        <a href="#steps">{t.navigation.howItWorks}</a>
        <a href="#faq">{t.navigation.faq}</a>
        <a href={pricingHref}>{t.navigation.pricing}</a>
        <a href={session?.user ? accountHref : signInHref}>
          {session?.user ? t.navigation.account : t.navigation.signIn}
        </a>
      </nav>

      <section className="cp-hero" id="top">
        <div className="cp-hero-accent" aria-hidden="true" />
        <div className="cp-hero-copy">
          <p className="cp-eyebrow">
            <FileVideo size={18} />
            {t.hero.eyebrow}
          </p>
          <h1>{t.hero.title}</h1>
          <p className="cp-hero-description">{t.hero.description}</p>
        </div>

        <section className="cp-extract-box" aria-label={t.hero.downloaderLabel}>
          <div className="cp-workflow-switch" role="group">
            <button
              className={!batchMode ? 'is-active' : ''}
              type="button"
              aria-pressed={!batchMode}
              disabled={loading}
              onClick={() => {
                setBatchMode(false);
                setBatchResults([]);
                setNotice(null);
              }}
            >
              <Link size={16} />
              {t.hero.singleMode}
            </button>
            <button
              className={batchMode ? 'is-active' : ''}
              type="button"
              aria-pressed={batchMode}
              disabled={loading || membershipLoading}
              onClick={() => {
                if (!isPaidMember) {
                  setNotice({
                    type: 'error',
                    text: t.errors.batchRequiresAccount,
                  });
                  return;
                }
                setBatchMode(true);
                setResult(null);
                setNotice(null);
              }}
            >
              <List size={16} />
              {t.hero.batchMode}
              {!isPaidMember ? <Crown size={13} aria-hidden="true" /> : null}
            </button>
          </div>
          {batchMode ? (
            <textarea
              ref={(node) => {
                inputRef.current = node;
              }}
              className="cp-batch-input"
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder={t.hero.batchPlaceholder}
              aria-label={t.hero.batchInputLabel}
              rows={4}
            />
          ) : (
            <input
              ref={(node) => {
                inputRef.current = node;
              }}
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') void handleExtract();
              }}
              placeholder={t.hero.placeholder}
              aria-label={t.hero.inputLabel}
            />
          )}
          <div className="cp-parse-options" aria-label={t.hero.optionsLabel}>
            <fieldset className="cp-option-group">
              <legend>{t.hero.formatLabel}</legend>
              <div className="cp-segmented-control" role="group">
                <button
                  className={downloadMode === 'auto' ? 'is-active' : ''}
                  type="button"
                  aria-pressed={downloadMode === 'auto'}
                  onClick={() => setDownloadMode('auto')}
                >
                  <Video size={16} />
                  {t.hero.modes.video}
                </button>
                <button
                  className={downloadMode === 'audio' ? 'is-active' : ''}
                  type="button"
                  aria-pressed={downloadMode === 'audio'}
                  onClick={() => {
                    if (!isPaidMember) {
                      setNotice({
                        type: 'error',
                        text: t.errors.membershipRequired,
                      });
                      return;
                    }
                    setDownloadMode('audio');
                  }}
                >
                  <AudioLines size={16} />
                  {t.hero.modes.audio}
                  {!isPaidMember ? (
                    <Crown size={12} aria-hidden="true" />
                  ) : null}
                </button>
                <button
                  className={downloadMode === 'mute' ? 'is-active' : ''}
                  type="button"
                  aria-pressed={downloadMode === 'mute'}
                  onClick={() => {
                    if (!isPaidMember) {
                      setNotice({
                        type: 'error',
                        text: t.errors.membershipRequired,
                      });
                      return;
                    }
                    setDownloadMode('mute');
                  }}
                >
                  <VolumeX size={16} />
                  {t.hero.modes.mute}
                  {!isPaidMember ? (
                    <Crown size={12} aria-hidden="true" />
                  ) : null}
                </button>
              </div>
            </fieldset>
            <label className="cp-option-group cp-quality-control">
              <span>{t.hero.qualityLabel}</span>
              <select
                value={quality}
                disabled={downloadMode === 'audio'}
                onChange={(event) =>
                  setQuality(event.target.value as VideoQuality)
                }
                aria-label={t.hero.qualityLabel}
              >
                {(Object.keys(t.hero.qualities) as VideoQuality[]).map(
                  (value) => (
                    <option
                      key={value}
                      value={value}
                      disabled={
                        !isPaidMember && (value === '1080' || value === 'max')
                      }
                    >
                      {t.hero.qualities[value]}
                      {!isPaidMember && (value === '1080' || value === 'max')
                        ? ` · ${t.hero.memberBadge}`
                        : ''}
                    </option>
                  )
                )}
              </select>
            </label>
          </div>
          <a className="cp-member-feature-note" href={pricingHref}>
            <Crown size={15} aria-hidden="true" />
            {isPaidMember ? t.hero.memberActive : t.hero.memberUnlock}
          </a>
          <div className="cp-button-row">
            <button
              className="cp-primary-button"
              type="button"
              onClick={handleExtract}
              disabled={loading}
            >
              {loading ? (
                <LoaderCircle className="cp-spin" size={19} />
              ) : (
                <Link size={19} />
              )}
              {loading && batchProgress
                ? t.hero.batchProgress(
                    batchProgress.current,
                    batchProgress.total
                  )
                : loading
                  ? t.hero.extracting
                  : batchMode
                    ? t.hero.batchExtract
                    : t.hero.extract}
            </button>
            <button
              className="cp-secondary-button"
              type="button"
              onClick={handlePaste}
            >
              <Clipboard size={18} />
              {t.hero.paste}
            </button>
            <button
              className="cp-secondary-button"
              type="button"
              onClick={() => {
                setInput('');
                setResult(null);
                setBatchResults([]);
                setBatchProgress(null);
                setNotice(null);
                inputRef.current?.focus();
              }}
            >
              {t.hero.clear}
            </button>
          </div>
          {notice ? (
            <p className={`cp-alert cp-alert-${notice.type}`} role="alert">
              {notice.text}
            </p>
          ) : null}
        </section>

        <div className="cp-mode-buttons" aria-label={t.hero.platformsLabel}>
          {[
            ['TikTok', FileVideo],
            ['Instagram', ImageIcon],
            ['YouTube', Play],
            ['X / Twitter', FileText],
          ].map(([label, Icon]) => (
            <button
              key={label as string}
              type="button"
              onClick={() => inputRef.current?.focus()}
            >
              <Icon size={17} />
              {label as string}
            </button>
          ))}
        </div>
        <div className="cp-platform-chips" aria-label={t.hero.toolsLabel}>
          {t.hero.chips.map((chip) => (
            <span key={chip}>{chip}</span>
          ))}
        </div>
        <div className="cp-content-tool-grid">
          <a className="cp-content-tool-card" href={wechatArticleHref}>
            <div className="cp-content-tool-icon" aria-hidden="true">
              <FileText size={20} />
            </div>
            <div className="cp-content-tool-copy">
              <p>{wechatArticlePromo.eyebrow}</p>
              <h3>{wechatArticlePromo.title}</h3>
              <span>{wechatArticlePromo.description}</span>
            </div>
            <div className="cp-content-tool-action">
              <span>{wechatArticlePromo.action}</span>
              <ExternalLink size={16} />
            </div>
          </a>
          <a className="cp-content-tool-card" href={musicToolHref}>
            <div className="cp-content-tool-icon" aria-hidden="true">
              <Sparkles size={20} />
            </div>
            <div className="cp-content-tool-copy">
              <p>{musicToolPromo.eyebrow}</p>
              <h3>{musicToolPromo.title}</h3>
              <span>{musicToolPromo.description}</span>
            </div>
            <div className="cp-content-tool-action">
              <span>{musicToolPromo.action}</span>
              <ExternalLink size={16} />
            </div>
          </a>
        </div>
      </section>

      {result ? (
        <section className="cp-result-section" ref={resultRef} id="result">
          <div className="cp-section-heading">
            <span>{t.result.ready}</span>
            <h2>{result.title || t.result.title}</h2>
            <p>{result.desc || `${t.result.parsedFrom}: ${platformLabel}.`}</p>
          </div>
          <div className="cp-result-grid">
            <div className="cp-result-preview">
              {mediaUrl && mediaType === 'audio' ? (
                <div className="cp-audio-preview">
                  <AudioLines size={44} aria-hidden="true" />
                  <audio controls preload="metadata" src={mediaUrl} />
                </div>
              ) : mediaUrl && mediaType === 'image' ? (
                <img
                  src={mediaUrl}
                  alt={result.title || result.filename || t.result.coverAlt}
                />
              ) : mediaUrl ? (
                <video
                  controls
                  playsInline
                  preload="metadata"
                  src={mediaUrl}
                  poster={result.coverUrl || undefined}
                />
              ) : result.coverUrl ? (
                <img
                  src={result.coverUrl}
                  alt={result.title || t.result.coverAlt}
                />
              ) : (
                <div className="cp-result-empty">{t.result.noPreview}</div>
              )}
            </div>
            <div className="cp-result-details">
              <dl>
                <div>
                  <dt>{t.result.platform}</dt>
                  <dd>{result.platform || platformLabel}</dd>
                </div>
                <div>
                  <dt>{t.result.author}</dt>
                  <dd>{result.author?.name || t.result.unknown}</dd>
                </div>
                <div>
                  <dt>{t.result.duration}</dt>
                  <dd>{formatDuration(result.duration, t.result.unknown)}</dd>
                </div>
                <div>
                  <dt>{t.result.format}</dt>
                  <dd>{resultFormat}</dd>
                </div>
                <div>
                  <dt>{t.result.quality}</dt>
                  <dd>{resultQuality}</dd>
                </div>
              </dl>
              <div className="cp-result-actions">
                {mediaUrl ? (
                  <a
                    href={mediaUrl}
                    download
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Download size={18} />
                    {mediaType === 'audio'
                      ? t.result.downloadAudio
                      : mediaType === 'image'
                        ? t.result.downloadImage
                        : t.result.downloadVideo}
                  </a>
                ) : null}
                <button
                  type="button"
                  onClick={copyMediaUrl}
                  disabled={!mediaUrl}
                >
                  {copied ? <Check size={18} /> : <Copy size={18} />}
                  {copied ? t.result.copied : t.result.copyUrl}
                </button>
                <button
                  type="button"
                  onClick={() => void handleRetry()}
                  disabled={retrying || loading}
                >
                  <ShieldCheck size={18} />
                  {retrying ? t.errors.retrying : t.errors.retryParse}
                </button>
                {mediaUrl && mediaType !== 'image' ? (
                  <a
                    href={`${transcribeHref}?mediaUrl=${encodeURIComponent(
                      mediaUrl
                    )}&sourceUrl=${encodeURIComponent(result.sourceUrl || input)}`}
                  >
                    <FileText size={18} />
                    {t.result.transcribeVideo}
                  </a>
                ) : null}
              </div>
              {typeof result.freeParsesRemaining === 'number' ? (
                <p className="cp-usage-remaining">
                  <BadgeCheck size={17} />
                  {t.result.freeRemaining(result.freeParsesRemaining)}
                </p>
              ) : typeof result.creditsRemaining === 'number' ? (
                <p className="cp-usage-remaining">
                  <BadgeCheck size={17} />
                  {t.result.creditsRemaining(result.creditsRemaining)}
                </p>
              ) : null}
              {result.alternates?.length ? (
                <div className="cp-alternates">
                  {result.alternates.slice(0, 4).map((item, index) => (
                    <a
                      key={`${item.url}-${index}`}
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {item.label ||
                        item.type ||
                        `${t.result.option} ${index + 1}`}
                      <ExternalLink size={16} />
                    </a>
                  ))}
                </div>
              ) : null}
            </div>
          </div>
        </section>
      ) : null}

      {batchResults.length ? (
        <section className="cp-batch-results" aria-live="polite">
          <div className="cp-section-heading">
            <span>{t.result.batchReady}</span>
            <h2>
              {t.result.batchReady} (
              {batchResults.filter((item) => item.status === 'success').length}/
              {batchResults.length})
            </h2>
            <p>
              {t.result.batchCompleted(
                batchResults.filter((item) => item.status !== 'pending').length,
                batchResults.length
              )}
            </p>
          </div>
          <div className="cp-batch-list">
            {batchResults.map((item, index) => {
              const itemUrl = item.result?.mediaUrl || item.result?.videoUrl;
              const itemLabel = (() => {
                const mediaType = item.result?.mediaType;
                if (mediaType === 'audio') return t.result.downloadAudio;
                if (mediaType === 'image') return t.result.downloadImage;
                if (mediaType === 'video') return t.result.downloadVideo;
                return item.result?.title || item.result?.filename || '';
              })();

              return (
                <article
                  className={`cp-batch-item cp-batch-item-${item.status}`}
                  key={item.id}
                >
                  <div className="cp-batch-item-status">
                    {item.status === 'pending' ? (
                      <LoaderCircle className="cp-spin" size={18} />
                    ) : item.status === 'success' ? (
                      <Check size={18} />
                    ) : null}
                    <span>
                      {item.status === 'pending'
                        ? t.hero.batchProgress(index + 1, batchResults.length)
                        : item.status === 'success'
                          ? t.result.batchSuccess
                          : t.result.batchFailed}
                    </span>
                  </div>
                  <div className="cp-batch-item-copy">
                    <strong>
                      {item.result?.title ||
                        item.result?.filename ||
                        item.sourceUrl}
                    </strong>
                    <span>{item.result?.platform || item.sourceUrl}</span>
                    {item.error ? <em>{item.error}</em> : null}
                  </div>
                  {item.status === 'success' && itemUrl ? (
                    <a
                      href={itemUrl}
                      download
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Download size={17} />
                      {itemLabel}
                    </a>
                  ) : null}
                </article>
              );
            })}
          </div>
        </section>
      ) : null}

      <section className="cp-upgrade-band" aria-labelledby="upgrade-title">
        <div className="cp-upgrade-inner">
          <div>
            <span>
              <Crown size={18} />
              {t.upgrade.eyebrow}
            </span>
            <h2 id="upgrade-title">{t.upgrade.title}</h2>
            <p>{t.upgrade.description}</p>
          </div>
          <div className="cp-upgrade-actions">
            <a href={pricingHref}>{t.upgrade.primary}</a>
            <a href={session?.user ? accountHref : signInHref}>
              <CircleUserRound size={18} />
              {t.upgrade.secondary}
            </a>
          </div>
        </div>
      </section>

      <section className="cp-section" id="features">
        <div className="cp-section-heading">
          <span>
            <Sparkles size={18} />
            {t.featuresEyebrow}
          </span>
          <h2>{t.featuresTitle}</h2>
        </div>
        <div className="cp-feature-grid">
          {t.features.map((feature) => {
            const Icon = feature.icon;
            return (
              <article key={feature.title}>
                <Icon size={30} />
                <h3>{feature.title}</h3>
                <p>{feature.text}</p>
              </article>
            );
          })}
        </div>
      </section>

      <section className="cp-section cp-steps-section" id="steps">
        <div className="cp-section-heading">
          <span>
            <Check size={18} />
            {t.stepsEyebrow}
          </span>
          <h2>{t.stepsTitle}</h2>
        </div>
        <div className="cp-steps-grid">
          {t.steps.map((step, index) => (
            <article key={step.title}>
              <span>{index + 1}</span>
              <h3>{step.title}</h3>
              <p>{step.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="cp-section cp-faq-section" id="faq">
        <div className="cp-section-heading">
          <h2>{t.faqTitle}</h2>
          <p>{t.faqDescription}</p>
        </div>
        <div className="cp-faq-list">
          {t.faqs.map((faq, index) => {
            const expanded = openFaq === index;
            return (
              <article className={expanded ? 'is-open' : ''} key={faq.question}>
                <button
                  type="button"
                  aria-expanded={expanded}
                  onClick={() => setOpenFaq(expanded ? -1 : index)}
                >
                  <span>{faq.question}</span>
                  <ChevronDown size={21} />
                </button>
                {expanded ? <p>{faq.answer}</p> : null}
              </article>
            );
          })}
        </div>
      </section>

      <section className="cp-section cp-tools-section">
        <div className="cp-section-heading">
          <span>
            <Sparkles size={18} />
            {t.toolsEyebrow}
          </span>
          <h2>{t.toolsTitle}</h2>
        </div>
        <div className="cp-tool-groups">
          {t.toolGroups.map((group, groupIndex) => (
            <article key={group.title}>
              <h3>{group.title}</h3>
              <div>
                {group.items.map((item, itemIndex) => {
                  const isToolsDirectory =
                    groupIndex === t.toolGroups.length - 1 && itemIndex === 0;
                  if (isToolsDirectory) {
                    return (
                      <a key={item.label} href={toolsHref}>
                        {item.label}
                      </a>
                    );
                  }
                  return (
                    <button
                      key={item.label}
                      type="button"
                      onClick={() => {
                        if (item.action === 'faq') {
                          document
                            .querySelector('#faq')
                            ?.scrollIntoView({ behavior: 'smooth' });
                        } else if (item.action === 'privacy') {
                          window.location.href =
                            localizedResourceHref('/privacy-policy');
                        } else if (item.action === 'terms') {
                          window.location.href =
                            localizedResourceHref('/terms-of-service');
                        } else {
                          document
                            .querySelector('#top')
                            ?.scrollIntoView({ behavior: 'smooth' });
                          inputRef.current?.focus();
                        }
                      }}
                    >
                      {item.label}
                    </button>
                  );
                })}
              </div>
            </article>
          ))}
        </div>
      </section>

      <footer className="cp-footer">
        <div className="cp-footer-brand">
          <strong>NoWatermark</strong>
          <p>{t.footer.description}</p>
        </div>
        <div>
          <strong>{t.footer.core}</strong>
          <a href="#top">{t.footer.downloader}</a>
          <a href={toolsHref}>{t.navigation.platforms}</a>
          <a href={blogHref}>{t.navigation.blog}</a>
          <a href="#steps">{t.navigation.howItWorks}</a>
          <a href="#faq">{t.navigation.faq}</a>
          <a href={pricingHref}>{t.footer.pricing}</a>
        </div>
        <div>
          <strong>{t.footer.popular}</strong>
          <a href={localizedResourceHref('/tools/tiktok-downloader')}>TikTok</a>
          <a href={localizedResourceHref('/tools/instagram-downloader')}>
            Instagram
          </a>
          <a href={localizedResourceHref('/tools/youtube-downloader')}>
            YouTube
          </a>
          <a href={localizedResourceHref('/tools/twitter-video-downloader')}>
            X / Twitter
          </a>
        </div>
        <div>
          <strong>{t.footer.info}</strong>
          <a href={session?.user ? accountHref : signInHref}>
            {t.footer.account}
          </a>
          <a href={localizedResourceHref('/privacy-policy')}>
            {t.footer.privacy}
          </a>
          <a href={localizedResourceHref('/terms-of-service')}>
            {t.footer.terms}
          </a>
          <a href={localizedResourceHref('/refund-policy')}>
            {t.footer.refunds}
          </a>
          <a href={localizedResourceHref('/copyright-policy')}>
            {t.footer.copyright}
          </a>
          <a href={localizedResourceHref('/data-deletion')}>
            {t.footer.deletion}
          </a>
          <a href="mailto:support@nowatermarkdownloader.com">
            {t.footer.contact}
          </a>
          <a
            href="https://x.com/MaynorAI1"
            target="_blank"
            rel="noopener noreferrer"
          >
            {t.footer.xSupport}
          </a>
        </div>
      </footer>
    </main>
  );
}
