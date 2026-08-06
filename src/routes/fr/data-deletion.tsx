import { createFileRoute } from '@tanstack/react-router';

import {
  dataDeletionHead,
  DataDeletionPage,
} from '@/blocks/data-deletion-page';

export const Route = createFileRoute('/fr/data-deletion')({
  head: () => dataDeletionHead('fr'),
  component: () => <DataDeletionPage locale="fr" />,
});
