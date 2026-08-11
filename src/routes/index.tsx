import { createFileRoute } from '@tanstack/react-router';

import { normalizeLocale, type SiteLocale } from '@/config/locale';
import { localizedPageHead } from '@/lib/seo';
import { getLocale } from '@/paraglide/runtime.js';
import { CopypilotDownloader } from '@/blocks/copypilot-downloader';

function HomePage() {
  return <CopypilotDownloader />;
}

export const Route = createFileRoute('/')({
  head: () => {
    const locale = normalizeLocale(getLocale());
    const titles: Record<SiteLocale, string> = {
      en: 'Free TikTok Video Downloader — No Watermark, No Signup',
      zh: 'NoWatermark 视频去水印下载器',
      es: 'Descargador NoWatermark',
      pt: 'Baixador NoWatermark',
      fr: 'Téléchargeur vidéo sans filigrane | NoWatermark',
      de: 'Videos ohne Wasserzeichen herunterladen | NoWatermark',
      it: 'Downloader video senza filigrana | NoWatermark',
      id: 'Pengunduh video tanpa watermark | NoWatermark',
      ja: '透かしなし動画ダウンローダー | NoWatermark',
      ko: '워터마크 없는 동영상 다운로드 | NoWatermark',
    };
    const descriptions: Record<SiteLocale, string> = {
      en: 'Free TikTok video downloader without watermark for public videos. Paste a TikTok, Instagram, or YouTube link to extract clean media URLs with no signup.',
      zh: '免费下载 TikTok、Instagram、YouTube、X、Facebook 等平台的公开无水印视频。',
      es: 'Descarga videos públicos sin marca de agua de TikTok, Instagram, YouTube, X, Facebook y más.',
      pt: 'Baixe vídeos públicos sem marca d’água do TikTok, Instagram, YouTube, X, Facebook e outros.',
      fr: 'Téléchargez des vidéos publiques sans filigrane depuis TikTok, Instagram, YouTube, X, Facebook et plus encore.',
      de: 'Lade öffentliche Videos von TikTok, Instagram, YouTube, X, Facebook und weiteren Plattformen ohne Wasserzeichen herunter.',
      it: 'Scarica video pubblici senza filigrana da TikTok, Instagram, YouTube, X, Facebook e altre piattaforme.',
      id: 'Unduh video publik tanpa watermark dari TikTok, Instagram, YouTube, X, Facebook, dan platform lainnya.',
      ja: 'TikTok、Instagram、YouTube、X、Facebookなどの公開動画を透かしなしでダウンロードできます。',
      ko: 'TikTok, Instagram, YouTube, X, Facebook 등 공개 동영상을 워터마크 없이 다운로드하세요.',
    };
    const title = titles[locale];
    const description = descriptions[locale];
    return localizedPageHead({
      locale,
      path: '/',
      title,
      description,
      keywords:
        locale === 'en'
          ? [
              'tiktok video downloader without watermark',
              'free tiktok video downloader',
              'download tiktok videos without watermark',
              'no watermark video downloader',
            ]
          : undefined,
    });
  },
  component: HomePage,
});
