import { createFileRoute, notFound } from '@tanstack/react-router';

import { ResourcePage, type ResourceKind } from '@/blocks/seo-resource-page';

import { StaticPageContent, staticPageHead } from '../(pages)/-static-page';
import { pageHead } from '../faq';

const resources: Record<string, ResourceKind> = {
  faq: 'faq',
  'how-to-download-videos': 'guide',
  'api-docs': 'api',
};
const staticSlugs = new Set([
  'privacy-policy',
  'user-agreement',
  'terms-of-service',
  'refund-policy',
  'copyright-policy',
]);

export const Route = createFileRoute('/id/$resource')({
  beforeLoad: ({ params }) => {
    if (!resources[params.resource] && !staticSlugs.has(params.resource)) {
      throw notFound();
    }
  },
  head: ({ params }) =>
    resources[params.resource]
      ? pageHead(resources[params.resource]!, 'id')
      : staticPageHead(params.resource, 'id'),
  component: () => {
    const slug = Route.useParams().resource;
    return resources[slug] ? (
      <ResourcePage kind={resources[slug]!} locale="id" />
    ) : (
      <StaticPageContent slug={slug} locale="id" />
    );
  },
});
