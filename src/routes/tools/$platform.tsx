import { createFileRoute, notFound } from '@tanstack/react-router';

import { envConfigs } from '@/config';
import { normalizeLocale, siteLocales } from '@/config/locale';
import { getLocale } from '@/paraglide/runtime.js';
import {
  getPlatformCopy,
  isPlatformSlug,
  PlatformDownloader,
  platformPath,
  type SeoLocale,
} from '@/blocks/platform-downloader';

function currentLocale(): SeoLocale {
  return normalizeLocale(getLocale());
}

export const Route = createFileRoute('/tools/$platform')({
  beforeLoad: ({ params }) => {
    if (!isPlatformSlug(params.platform)) throw notFound();
  },
  head: ({ params }) => {
    const locale = currentLocale();
    const item = getPlatformCopy(params.platform, locale)!;
    const appUrl = envConfigs.app_url.replace(/\/$/, '');
    return {
      meta: [
        { title: `${item.name} | NoWatermark` },
        { name: 'description', content: item.description },
        { property: 'og:type', content: 'website' },
        { property: 'og:title', content: item.name },
        { property: 'og:description', content: item.description },
      ],
      links: [
        {
          rel: 'canonical',
          href: `${appUrl}${platformPath(locale, params.platform)}`,
        },
        ...siteLocales.map((lang) => ({
          rel: 'alternate',
          hrefLang: lang,
          href: `${appUrl}${platformPath(lang, params.platform)}`,
        })),
      ],
    };
  },
  component: ToolPlatformPage,
});

function ToolPlatformPage() {
  const { platform } = Route.useParams();
  return <PlatformDownloader locale={currentLocale()} slug={platform} />;
}
