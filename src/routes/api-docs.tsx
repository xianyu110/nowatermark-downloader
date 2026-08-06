import { createFileRoute } from '@tanstack/react-router';

import { normalizeLocale } from '@/config/locale';
import { getLocale } from '@/paraglide/runtime.js';
import type { SeoLocale } from '@/blocks/platform-downloader';
import { ResourcePage, type ResourceKind } from '@/blocks/seo-resource-page';

import { pageHead } from './faq';

const kind: ResourceKind = 'api';
function locale(): SeoLocale {
  return normalizeLocale(getLocale());
}

export const Route = createFileRoute('/api-docs')({
  head: () => pageHead(kind, locale()),
  component: () => <ResourcePage kind={kind} locale={locale()} />,
});
