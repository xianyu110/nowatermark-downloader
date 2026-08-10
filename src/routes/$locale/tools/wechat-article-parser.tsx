import { createFileRoute, notFound } from '@tanstack/react-router';

import { normalizeLocale, type SiteLocale } from '@/config/locale';
import { localizedPageHead } from '@/lib/seo';
import { WechatArticleParser } from '@/blocks/wechat-article-parser';

const allowed = ['zh', 'es', 'pt', 'fr', 'de', 'it', 'id', 'ja', 'ko'];

export const Route = createFileRoute('/$locale/tools/wechat-article-parser')({
  beforeLoad: ({ params }) => {
    if (!allowed.includes(params.locale)) throw notFound();
  },
  head: ({ params }) => {
    const locale = normalizeLocale(params.locale);
    const titles: Record<SiteLocale, string> = {
      en: 'WeChat Article Parser - NoWatermark',
      zh: '公众号文章解析 - NoWatermark',
      es: 'Analizador de artículos WeChat - NoWatermark',
      pt: 'Analisador de artigos WeChat - NoWatermark',
      fr: 'Analyseur d’articles WeChat - NoWatermark',
      de: 'WeChat-Artikel-Parser - NoWatermark',
      it: 'Parser articoli WeChat - NoWatermark',
      id: 'Parser artikel WeChat - NoWatermark',
      ja: 'WeChat記事解析 - NoWatermark',
      ko: 'WeChat 글 파서 - NoWatermark',
    };
    const descriptions: Record<SiteLocale, string> = {
      en: 'Extract public WeChat articles into editable text, Markdown, JSON, images, and exposed video sources.',
      zh: '将公开公众号文章提取为可编辑正文、Markdown、JSON、图片和页面暴露的视频源。',
      es: 'Extrae artículos públicos de WeChat como texto editable, Markdown, JSON, imágenes y videos expuestos.',
      pt: 'Extraia artigos públicos do WeChat como texto editável, Markdown, JSON, imagens e vídeos expostos.',
      fr: 'Extrayez les articles WeChat publics en texte modifiable, Markdown, JSON, images et vidéos exposées.',
      de: 'Extrahiere öffentliche WeChat-Artikel als bearbeitbaren Text, Markdown, JSON, Bilder und sichtbare Videos.',
      it: 'Estrai articoli WeChat pubblici come testo modificabile, Markdown, JSON, immagini e video esposti.',
      id: 'Ekstrak artikel WeChat publik menjadi teks, Markdown, JSON, gambar, dan video yang terekspos.',
      ja: '公開WeChat記事を編集可能な本文、Markdown、JSON、画像、公開動画ソースとして抽出します。',
      ko: '공개 WeChat 글을 편집 가능한 텍스트, Markdown, JSON, 이미지, 노출된 동영상 소스로 추출합니다.',
    };
    return localizedPageHead({
      locale,
      path: '/tools/wechat-article-parser',
      title: titles[locale],
      description: descriptions[locale],
      keywords: [
        'WeChat article parser',
        'mp.weixin.qq.com parser',
        '公众号文章解析',
        'WeChat article to Markdown',
      ],
    });
  },
  component: WechatArticleParserPage,
});

function WechatArticleParserPage() {
  const { locale } = Route.useParams();
  return <WechatArticleParser locale={normalizeLocale(locale)} />;
}
