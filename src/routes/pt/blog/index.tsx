import { createFileRoute } from '@tanstack/react-router';
import { BlogListPage } from '@/routes/blog/index';

import { envConfigs } from '@/config';
import { localizedPageHead } from '@/lib/seo';
import { m } from '@/paraglide/messages.js';
import { getBlogPostsFn } from '@/content/posts/server';

const locale = 'pt' as const;

export const Route = createFileRoute('/pt/blog/')({
  loader: async () => {
    const posts = await getBlogPostsFn({ data: { locale } });
    return { locale, posts };
  },
  head: () =>
    localizedPageHead({
      locale,
      path: '/blog',
      title: `${m['blog.title']({}, { locale })} | ${envConfigs.app_name}`,
      description: m['blog.description']({}, { locale }),
    }),
  component: PortugueseBlogPage,
});

function PortugueseBlogPage() {
  const { posts } = Route.useLoaderData();
  return <BlogListPage locale={locale} posts={posts} />;
}
