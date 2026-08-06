import { createFileRoute } from '@tanstack/react-router';

import {
  dataDeletionHead,
  DataDeletionPage,
} from '@/blocks/data-deletion-page';

export const Route = createFileRoute('/it/data-deletion')({
  head: () => dataDeletionHead('it'),
  component: () => <DataDeletionPage locale="it" />,
});
