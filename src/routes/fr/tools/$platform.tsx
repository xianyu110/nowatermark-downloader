import { createFileRoute, notFound } from '@tanstack/react-router';

import { localizedPageHead } from '@/lib/seo';
import {
  getPlatformCopy,
  isPlatformSlug,
  PlatformDownloader,
  type SeoLocale,
} from '@/blocks/platform-downloader';

const locale: SeoLocale = 'fr';

export const Route = createFileRoute('/fr/tools/$platform')({
  beforeLoad: ({ params }) => {
    if (!isPlatformSlug(params.platform)) throw notFound();
  },
  head: ({ params }) => {
    const item = getPlatformCopy(params.platform, locale)!;
    return localizedPageHead({
      locale,
      path: `/tools/${params.platform}`,
      title: `${item.name} | NoWatermark`,
      description: item.description,
    });
  },
  component: SpanishToolPlatformPage,
});

function SpanishToolPlatformPage() {
  return (
    <PlatformDownloader locale={locale} slug={Route.useParams().platform} />
  );
}
