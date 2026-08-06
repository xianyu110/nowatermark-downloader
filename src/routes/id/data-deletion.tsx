import { createFileRoute } from '@tanstack/react-router';

import {
  dataDeletionHead,
  DataDeletionPage,
} from '@/blocks/data-deletion-page';

export const Route = createFileRoute('/id/data-deletion')({
  head: () => dataDeletionHead('id'),
  component: () => <DataDeletionPage locale="id" />,
});
