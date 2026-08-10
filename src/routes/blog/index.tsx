import { createFileRoute } from '@tanstack/react-router';

import { envConfigs } from '@/config';
import { normalizeLocale } from '@/config/locale';
import { localizedPageHead } from '@/lib/seo';
import { m } from '@/paraglide/messages.js';
import { getLocale } from '@/paraglide/runtime.js';
import { Footer } from '@/blocks/footer';
import { Header } from '@/blocks/header';
import { BlogCard } from '@/components/blog-card';
import { formatPostDate, type BlogPost } from '@/content/posts';
import { getBlogPostsFn } from '@/content/posts/server';

export const Route = createFileRoute('/blog/')({
  loader: async () => {
    const locale = getLocale();
    const posts = await getBlogPostsFn({ data: { locale } });
    return { locale, posts };
  },
  head: ({ loaderData }) => {
    const locale = normalizeLocale(loaderData?.locale);
    return localizedPageHead({
      locale,
      path: '/blog',
      title: `${m['blog.title']({}, { locale })} | ${envConfigs.app_name}`,
      description: m['blog.description']({}, { locale }),
    });
  },
  component: BlogPage,
});

function BlogPage() {
  const { locale, posts } = Route.useLoaderData();
  return <BlogListPage locale={locale} posts={posts} />;
}

export function BlogListPage({
  locale,
  posts,
}: {
  locale: string;
  posts: BlogPost[];
}) {
  const eyebrow = normalizeLocale(locale) === 'zh' ? '使用指南' : 'Guides';

  return (
    <div className="flex min-h-screen flex-col bg-[#f3fbf7] text-[#193d32]">
      <Header />
      <main className="flex-1 px-4 py-16 sm:py-24">
        <div className="mx-auto max-w-5xl">
          <div className="mb-16 text-center">
            <p className="mb-4 text-xs font-semibold tracking-[0.24em] text-[#107b59] uppercase">
              {eyebrow}
            </p>
            <h1 className="text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">
              {m['blog.title']()}
            </h1>
            <p className="mx-auto mt-5 max-w-lg text-[#5f7b71]">
              {m['blog.description']()}
            </p>
          </div>
          {posts.length === 0 ? (
            <p className="rounded-[24px] border border-[#d8e8e1] bg-white/75 px-6 py-12 text-center text-[#5f7b71]">
              {m['blog.no_posts']()}
            </p>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {posts.map((post) => (
                <BlogCard
                  key={post.slug}
                  href={`/blog/${post.slug}`}
                  title={post.title}
                  description={post.description}
                  image={post.image}
                  date={formatPostDate(post.createdAt, locale)}
                  authorName={post.authorName}
                  authorImage={post.authorImage}
                />
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
