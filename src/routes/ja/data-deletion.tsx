import { createFileRoute } from '@tanstack/react-router';

import {
  dataDeletionHead,
  DataDeletionPage,
} from '@/blocks/data-deletion-page';

export const Route = createFileRoute('/ja/data-deletion')({
  head: () => dataDeletionHead('ja'),
  component: () => <DataDeletionPage locale="ja" />,
});
