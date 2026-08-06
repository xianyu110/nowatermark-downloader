import { normalizeLocale, type SiteLocale } from '@/config/locale';
import { getLocale } from '@/paraglide/runtime.js';
import { SiteHeader } from '@/components/site-header';

export function Header({
  locale: localeOverride,
}: { locale?: SiteLocale } = {}) {
  const locale = localeOverride || normalizeLocale(getLocale());
  const copy = {
    en: {
      downloader: 'Downloader',
      transcribe: 'Video to text',
      tools: 'Video tools',
      api: 'API Docs',
      pricing: 'Pricing',
      faq: 'FAQ',
    },
    zh: {
      downloader: '下载工具',
      transcribe: '视频转文字',
      tools: '平台工具',
      api: 'API 文档',
      pricing: '价格',
      faq: '常见问题',
    },
    es: {
      downloader: 'Descargador',
      transcribe: 'Video a texto',
      tools: 'Herramientas',
      api: 'API',
      pricing: 'Precios',
      faq: 'Preguntas',
    },
    pt: {
      downloader: 'Baixador',
      transcribe: 'Vídeo para texto',
      tools: 'Ferramentas',
      api: 'API',
      pricing: 'Preços',
      faq: 'FAQ',
    },
    fr: {
      downloader: 'Téléchargeur',
      transcribe: 'Vidéo en texte',
      tools: 'Outils vidéo',
      api: 'API',
      pricing: 'Tarifs',
      faq: 'FAQ',
    },
    de: {
      downloader: 'Downloader',
      transcribe: 'Video zu Text',
      tools: 'Video-Tools',
      api: 'API',
      pricing: 'Preise',
      faq: 'FAQ',
    },
    it: {
      downloader: 'Downloader',
      transcribe: 'Video in testo',
      tools: 'Strumenti video',
      api: 'API',
      pricing: 'Prezzi',
      faq: 'FAQ',
    },
    id: {
      downloader: 'Pengunduh',
      transcribe: 'Video ke teks',
      tools: 'Alat video',
      api: 'API',
      pricing: 'Harga',
      faq: 'FAQ',
    },
    ja: {
      downloader: 'ダウンローダー',
      transcribe: '動画を文字起こし',
      tools: '動画ツール',
      api: 'API ドキュメント',
      pricing: '料金',
      faq: 'よくある質問',
    },
    ko: {
      downloader: '다운로더',
      transcribe: '동영상 텍스트 변환',
      tools: '동영상 도구',
      api: 'API 문서',
      pricing: '요금제',
      faq: '자주 묻는 질문',
    },
  } as const;
  const t =
    (copy as unknown as Record<string, (typeof copy)['en']>)[locale] || copy.en;
  const navLinks = [
    { href: '/', label: t.downloader },
    { href: '/transcribe', label: t.transcribe },
    { href: '/tools/tiktok-downloader', label: t.tools },
    { href: '/api-docs', label: t.api },
    { href: '/pricing', label: t.pricing },
    { href: '/faq', label: t.faq },
  ];

  return <SiteHeader navLinks={navLinks} />;
}
