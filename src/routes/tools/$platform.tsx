import { createFileRoute, notFound } from '@tanstack/react-router';

import { normalizeLocale } from '@/config/locale';
import { localizedPageHead } from '@/lib/seo';
import { getLocale } from '@/paraglide/runtime.js';
import {
  getPlatformCopy,
  getPlatformSeoKeywords,
  isPlatformSlug,
  PlatformDownloader,
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
    return localizedPageHead({
      locale,
      path: `/tools/${params.platform}`,
      title: `${item.name} | NoWatermark`,
      description: item.description,
      keywords: getPlatformSeoKeywords(params.platform, item),
    });
  },
  component: ToolPlatformPage,
});

function ToolPlatformPage() {
  const { platform } = Route.useParams();
  return <PlatformDownloader locale={currentLocale()} slug={platform} />;
}
