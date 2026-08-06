import { createFileRoute } from '@tanstack/react-router';

import { envConfigs } from '@/config';
import { normalizeLocale } from '@/config/locale';
import { getLocale, locales, localizeUrl } from '@/paraglide/runtime.js';
import { CopypilotDownloader } from '@/blocks/copypilot-downloader';

function HomePage() {
  return <CopypilotDownloader />;
}

export const Route = createFileRoute('/es/')({
  head: () => {
    const locale = normalizeLocale(getLocale());
    const titles = {
      en: 'NoWatermark Downloader',
      zh: 'NoWatermark 视频去水印下载器',
      es: 'Descargador NoWatermark',
      pt: 'Baixador NoWatermark',
    } as const;
    const descriptions = {
      en: 'Download public videos without watermarks from TikTok, Instagram, YouTube, X, Facebook, and more.',
      zh: '免费下载 TikTok、Instagram、YouTube、X、Facebook 等平台的公开无水印视频。',
      es: 'Descarga videos públicos sin marca de agua de TikTok, Instagram, YouTube, X, Facebook y más.',
      pt: 'Baixe vídeos públicos sem marca d’água do TikTok, Instagram, YouTube, X, Facebook e outros.',
    } as const;
    const title = titles.es;
    const description = descriptions.es;
    const canonical = localizeUrl(`${envConfigs.app_url}/es`, { locale }).href;

    return {
      meta: [
        { title },
        { name: 'description', content: description },
        { property: 'og:type', content: 'website' },
        { property: 'og:site_name', content: 'NoWatermark' },
        { property: 'og:title', content: title },
        { property: 'og:description', content: description },
        { property: 'og:url', content: canonical },
        { name: 'twitter:card', content: 'summary' },
        { name: 'twitter:title', content: title },
        { name: 'twitter:description', content: description },
      ],
      links: [
        { rel: 'canonical', href: canonical },
        ...locales.map((alternateLocale) => ({
          rel: 'alternate',
          hrefLang: alternateLocale,
          href: localizeUrl(`${envConfigs.app_url}/`, {
            locale: alternateLocale,
          }).href,
        })),
      ],
    };
  },
  component: HomePage,
});
