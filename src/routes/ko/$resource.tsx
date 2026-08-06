import { createFileRoute, notFound } from '@tanstack/react-router';

import { ResourcePage, type ResourceKind } from '@/blocks/seo-resource-page';

import { pageHead } from '../faq';

const resources: Record<string, ResourceKind> = {
  faq: 'faq',
  'how-to-download-videos': 'guide',
  'api-docs': 'api',
};

export const Route = createFileRoute('/ko/$resource')({
  beforeLoad: ({ params }) => {
    if (!resources[params.resource]) throw notFound();
  },
  head: ({ params }) => pageHead(resources[params.resource]!, 'ko'),
  component: () => (
    <ResourcePage kind={resources[Route.useParams().resource]!} locale="ko" />
  ),
});
