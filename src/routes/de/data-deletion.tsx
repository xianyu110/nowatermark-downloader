import { createFileRoute } from '@tanstack/react-router';

import {
  dataDeletionHead,
  DataDeletionPage,
} from '@/blocks/data-deletion-page';

export const Route = createFileRoute('/de/data-deletion')({
  head: () => dataDeletionHead('de'),
  component: () => <DataDeletionPage locale="de" />,
});
