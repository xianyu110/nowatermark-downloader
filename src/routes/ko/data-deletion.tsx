import { createFileRoute } from '@tanstack/react-router';

import {
  dataDeletionHead,
  DataDeletionPage,
} from '@/blocks/data-deletion-page';

export const Route = createFileRoute('/ko/data-deletion')({
  head: () => dataDeletionHead('ko'),
  component: () => <DataDeletionPage locale="ko" />,
});
