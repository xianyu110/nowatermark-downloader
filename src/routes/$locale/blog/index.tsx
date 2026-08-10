import { createFileRoute, notFound } from '@tanstack/react-router';
import { BlogListPage } from '@/routes/blog/index';

import { envConfigs } from '@/config';
import { normalizeLocale } from '@/config/locale';
import { localizedPageHead } from '@/lib/seo';
import { m } from '@/paraglide/messages.js';
import { getBlogPostsFn } from '@/content/posts/server';

const allowed = ['zh', 'es', 'pt', 'fr', 'de', 'it', 'id', 'ja', 'ko'];

export const Route = createFileRoute('/$locale/blog/')({
  beforeLoad: ({ params }) => {
    if (!allowed.includes(params.locale)) throw notFound();
  },
  loader: async ({ params }) => {
    const locale = normalizeLocale(params.locale);
    const posts = await getBlogPostsFn({ data: { locale } });
    return { locale, posts };
  },
  head: ({ loaderData, params }) => {
    const locale = normalizeLocale(loaderData?.locale || params.locale);
    return localizedPageHead({
      locale,
      path: '/blog',
      title: `${m['blog.title']({}, { locale })} | ${envConfigs.app_name}`,
      description: m['blog.description']({}, { locale }),
    });
  },
  component: LocalizedBlogPage,
});

function LocalizedBlogPage() {
  const { locale, posts } = Route.useLoaderData();
  return <BlogListPage locale={locale} posts={posts} />;
}
