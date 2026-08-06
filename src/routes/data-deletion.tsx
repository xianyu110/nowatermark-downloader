import { createFileRoute } from '@tanstack/react-router';

import { normalizeLocale } from '@/config/locale';
import { getLocale } from '@/paraglide/runtime.js';
import {
  dataDeletionHead,
  DataDeletionPage,
} from '@/blocks/data-deletion-page';
import type { SeoLocale } from '@/blocks/platform-downloader';

function locale(): SeoLocale {
  return normalizeLocale(getLocale());
}

export const Route = createFileRoute('/data-deletion')({
  head: () => dataDeletionHead(locale()),
  component: () => <DataDeletionPage locale={locale()} />,
});
