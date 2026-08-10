import { createFileRoute, notFound } from '@tanstack/react-router';
import { BlogPostContent } from '@/routes/blog/$slug';

import { envConfigs } from '@/config';
import { normalizeLocale } from '@/config/locale';
import { localizedPageHead } from '@/lib/seo';
import { getBlogPostFn } from '@/content/posts/server';

const allowed = ['zh', 'es', 'pt', 'fr', 'de', 'it', 'id', 'ja', 'ko'];

export const Route = createFileRoute('/$locale/blog/$slug')({
  beforeLoad: ({ params }) => {
    if (!allowed.includes(params.locale)) throw notFound();
  },
  loader: async ({ params }) => {
    const locale = normalizeLocale(params.locale);
    const post = await getBlogPostFn({
      data: { slug: params.slug, locale },
    });
    if (!post) throw notFound();
    return { locale, post };
  },
  head: ({ loaderData, params }) => {
    if (!loaderData) return {};
    const locale = normalizeLocale(params.locale);
    const { post } = loaderData;
    return localizedPageHead({
      locale,
      path: `/blog/${post.slug}`,
      title: `${post.title} | ${envConfigs.app_name}`,
      description: post.description,
    });
  },
  component: LocalizedBlogPostPage,
});

function LocalizedBlogPostPage() {
  const { locale, post } = Route.useLoaderData();
  return <BlogPostContent locale={locale} post={post} />;
}
