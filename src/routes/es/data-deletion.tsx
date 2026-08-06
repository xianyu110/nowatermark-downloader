import { createFileRoute } from '@tanstack/react-router';

import {
  dataDeletionHead,
  DataDeletionPage,
} from '@/blocks/data-deletion-page';

export const Route = createFileRoute('/es/data-deletion')({
  head: () => dataDeletionHead('es'),
  component: () => <DataDeletionPage locale="es" />,
});
