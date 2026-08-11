import { createFileRoute, notFound } from '@tanstack/react-router';
import { MDXProvider } from '@mdx-js/react';
import { ArrowLeft, Calendar } from 'lucide-react';

import { Link } from '@/core/i18n/navigation';
import { envConfigs } from '@/config';
import { localePath, normalizeLocale } from '@/config/locale';
import { localizedPageHead } from '@/lib/seo';
import { m } from '@/paraglide/messages.js';
import { getLocale } from '@/paraglide/runtime.js';
import { Footer } from '@/blocks/footer';
import { Header } from '@/blocks/header';
import { JsonLd } from '@/components/json-ld';
import { MarkdownContent } from '@/components/markdown-content';
import { mdxComponents } from '@/components/mdx-components';
import {
  formatPostDate,
  loadLocalPost,
  type BlogPostDetail,
} from '@/content/posts';
import { getBlogPostFn } from '@/content/posts/server';

export const Route = createFileRoute('/blog/$slug')({
  loader: async ({ params }) => {
    const locale = getLocale();
    const post = await getBlogPostFn({
      data: { slug: params.slug, locale },
    });
    if (!post) throw notFound();
    return { locale, post };
  },
  head: ({ loaderData }) => {
    if (!loaderData) return {};
    const { locale, post } = loaderData;
    const normalizedLocale = normalizeLocale(locale);
    return localizedPageHead({
      locale: normalizedLocale,
      path: `/blog/${post.slug}`,
      title: `${post.title} | ${envConfigs.app_name}`,
      description: post.description,
      locales: post.availableLocales?.length
        ? post.availableLocales
        : [normalizedLocale],
    });
  },
  component: BlogPostPage,
});

function BlogPostPage() {
  const { locale, post } = Route.useLoaderData();
  return <BlogPostContent locale={locale} post={post} />;
}

export function BlogPostContent({
  locale,
  post,
}: {
  locale: string;
  post: BlogPostDetail;
}) {
  const normalizedLocale = normalizeLocale(locale);
  const siteUrl = envConfigs.app_url.replace(/\/$/, '');
  const canonicalUrl = `${siteUrl}${localePath(normalizedLocale, `/blog/${post.slug}`)}`;
  const blogPostingSchema = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.description,
    datePublished: post.createdAt,
    dateModified: post.createdAt,
    inLanguage: normalizedLocale === 'zh' ? 'zh-CN' : normalizedLocale,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': canonicalUrl,
    },
    url: canonicalUrl,
    author: {
      '@type': 'Organization',
      name: post.authorName || envConfigs.app_name,
      url: siteUrl,
    },
    publisher: {
      '@type': 'Organization',
      name: envConfigs.app_name,
      logo: {
        '@type': 'ImageObject',
        url: `${siteUrl}/logo.svg`,
      },
    },
    ...(post.image
      ? {
          image: post.image.startsWith('http')
            ? post.image
            : `${siteUrl}${post.image}`,
        }
      : {}),
  };

  // Local posts render their bundled MDX component; database posts render
  // raw markdown through MarkdownContent.
  const LocalContent =
    post.source === 'local'
      ? loadLocalPost(post.slug, normalizedLocale)?.default
      : null;

  return (
    <div className="flex min-h-screen flex-col bg-[#f3fbf7] text-[#193d32]">
      <JsonLd data={blogPostingSchema} />
      <Header locale={normalizedLocale} />
      <main className="flex-1 px-6 py-12 md:px-8 md:py-16">
        <article className="mx-auto max-w-3xl">
          <Link
            href={localePath(normalizedLocale, '/blog')}
            className="inline-flex items-center gap-2 rounded-full border border-[#d8e8e1] bg-white/80 px-4 py-2 text-sm font-medium text-[#107b59] transition-colors hover:border-[#9ed4bf] hover:bg-white"
          >
            <ArrowLeft className="size-4" />
            {m['blog.back_to_blog']({}, { locale: normalizedLocale })}
          </Link>

          <header className="mt-8 mb-6 rounded-[28px] border border-[#d8e8e1] bg-white/82 p-6 shadow-[0_18px_50px_rgba(26,74,58,0.08)] md:p-8">
            <h1 className="text-3xl font-semibold tracking-[-0.04em] text-[#193d32] md:text-4xl">
              {post.title}
            </h1>
            {post.description && (
              <p className="mt-3 text-[#5f7b71]">{post.description}</p>
            )}
            <div className="mt-4 flex items-center gap-4 text-sm text-[#7f9a91]">
              <span className="inline-flex items-center gap-1.5">
                <Calendar className="size-4" />
                {formatPostDate(post.createdAt, locale)}
              </span>
              {(post.authorName || post.authorImage) && (
                <span className="inline-flex items-center gap-2">
                  {post.authorImage && (
                    <img
                      src={post.authorImage}
                      alt={post.authorName || ''}
                      width={20}
                      height={20}
                      className="size-5 rounded-full object-cover"
                    />
                  )}
                  {post.authorName}
                </span>
              )}
            </div>
          </header>

          {post.image && (
            <img
              src={post.image}
              alt={post.title}
              className="mb-8 w-full rounded-[28px] border border-[#d8e8e1] object-cover shadow-[0_18px_50px_rgba(26,74,58,0.08)]"
            />
          )}

          {LocalContent ? (
            <div className="rounded-[28px] border border-[#d8e8e1] bg-white/82 p-6 text-[15px] leading-7 text-[#294c41] shadow-[0_18px_50px_rgba(26,74,58,0.06)] md:p-8">
              <MDXProvider components={mdxComponents}>
                <LocalContent />
              </MDXProvider>
            </div>
          ) : (
            <MarkdownContent
              content={post.content || ''}
              className="rounded-[28px] border border-[#d8e8e1] bg-white/82 p-6 text-[#294c41] shadow-[0_18px_50px_rgba(26,74,58,0.06)] md:p-8"
            />
          )}
        </article>
      </main>
      <Footer locale={normalizedLocale} />
    </div>
  );
}
