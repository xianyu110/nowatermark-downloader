import { createFileRoute } from '@tanstack/react-router';

import { normalizeLocale, type SiteLocale } from '@/config/locale';
import { localizedPageHead } from '@/lib/seo';
import { getLocale } from '@/paraglide/runtime.js';
import { AiWatermarkRemover } from '@/blocks/ai-watermark-remover';

function currentLocale() {
  return normalizeLocale(getLocale());
}

const titles: Record<SiteLocale, string> = {
  en: 'Claude Watermark Remover - Clean Hidden Text Unicode',
  zh: 'AI 水印清理 - 本地移除隐形标记',
  es: 'Limpiador de marcas de agua IA - NoWatermark',
  pt: 'Limpador de marcas d’água de IA - NoWatermark',
  fr: 'Nettoyeur de filigranes IA - NoWatermark',
  de: 'KI-Wasserzeichen-Cleaner - NoWatermark',
  it: 'Pulitore watermark IA - NoWatermark',
  id: 'Pembersih watermark AI - NoWatermark',
  ja: 'AIウォーターマーククリーナー - NoWatermark',
  ko: 'AI 워터마크 클리너 - NoWatermark',
};

const descriptions: Record<SiteLocale, string> = {
  en: 'Use this free Claude watermark remover to clean zero-width and hidden Unicode characters from copied text locally in your browser. No text upload required.',
  zh: '在浏览器本地清理文本隐形 Unicode 标记，并通过图片重导出去除大部分元数据。不上传文件。',
  es: 'Limpia marcas Unicode invisibles y elimina la mayoría de metadatos de imágenes localmente en el navegador.',
  pt: 'Limpe marcas Unicode invisíveis e remova a maioria dos metadados de imagens localmente no navegador.',
  fr: 'Nettoyez les marques Unicode invisibles et supprimez la plupart des métadonnées d’image localement.',
  de: 'Entferne unsichtbare Unicode-Zeichen und die meisten Bildmetadaten lokal im Browser.',
  it: 'Pulisci segni Unicode invisibili e rimuovi la maggior parte dei metadati immagine localmente.',
  id: 'Bersihkan tanda Unicode tak terlihat dan hapus sebagian besar metadata gambar secara lokal.',
  ja: '不可視Unicodeマークと画像メタデータの多くをブラウザ内でローカルに削除します。',
  ko: '보이지 않는 Unicode 표시와 대부분의 이미지 메타데이터를 브라우저에서 로컬로 정리합니다.',
};

export const Route = createFileRoute('/tools/ai-watermark-remover')({
  head: () => {
    const locale = currentLocale();
    return localizedPageHead({
      locale,
      path: '/tools/ai-watermark-remover',
      title: titles[locale],
      description: descriptions[locale],
      keywords: [
        'Claude watermark remover',
        'remove Claude watermark',
        'Claude AI text cleaner',
        'AI watermark remover',
        'AI text cleaner',
        'hidden Unicode cleaner',
        'invisible watermark remover',
        'zero width character remover',
        'image metadata remover',
        'EXIF remover online',
        'local privacy tool',
      ],
    });
  },
  component: AiWatermarkRemoverPage,
});

function AiWatermarkRemoverPage() {
  return <AiWatermarkRemover locale={currentLocale()} />;
}
