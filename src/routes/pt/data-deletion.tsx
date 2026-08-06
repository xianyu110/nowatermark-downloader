import { createFileRoute } from '@tanstack/react-router';

import {
  dataDeletionHead,
  DataDeletionPage,
} from '@/blocks/data-deletion-page';

export const Route = createFileRoute('/pt/data-deletion')({
  head: () => dataDeletionHead('pt'),
  component: () => <DataDeletionPage locale="pt" />,
});
