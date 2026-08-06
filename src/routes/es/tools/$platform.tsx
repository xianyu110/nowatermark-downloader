import { createFileRoute, notFound } from '@tanstack/react-router';

import { envConfigs } from '@/config';
import { siteLocales } from '@/config/locale';
import {
  getPlatformCopy,
  isPlatformSlug,
  PlatformDownloader,
  platformPath,
  type SeoLocale,
} from '@/blocks/platform-downloader';

const locale: SeoLocale = 'es';

export const Route = createFileRoute('/es/tools/$platform')({
  beforeLoad: ({ params }) => {
    if (!isPlatformSlug(params.platform)) throw notFound();
  },
  head: ({ params }) => {
    const item = getPlatformCopy(params.platform, locale)!;
    const appUrl = envConfigs.app_url.replace(/\/$/, '');
    return {
      meta: [
        { title: `${item.name} | NoWatermark` },
        { name: 'description', content: item.description },
        { property: 'og:type', content: 'website' },
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
  component: SpanishToolPlatformPage,
});

function SpanishToolPlatformPage() {
  return (
    <PlatformDownloader locale={locale} slug={Route.useParams().platform} />
  );
}
