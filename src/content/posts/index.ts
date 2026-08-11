import type { ComponentType } from 'react';

import { normalizeLocale, siteLocales, type SiteLocale } from '@/config/locale';

export const HIDDEN_BLOG_POST_SLUGS = new Set([
  'what-is-shipany',
  'blocks-vs-components',
]);

export type BlogPostMeta = {
  title: string;
  description: string;
  created_at: string;
  author_name?: string;
  author_image?: string;
  image?: string;
};

type PostModule = {
  default: ComponentType;
  meta: BlogPostMeta;
};

export type BlogPost = {
  slug: string;
  title: string;
  description: string;
  image?: string;
  /** ISO date string — serializable across loader/server-fn boundaries */
  createdAt: string;
  authorName?: string;
  authorImage?: string;
  source: 'local' | 'db';
  availableLocales?: SiteLocale[];
};

export type BlogPostDetail = BlogPost & {
  /** Raw markdown — set for database posts */
  content?: string;
};

// Eagerly bundle the local MDX posts (small markdown files), mirroring the
// static-pages pattern. Keys are absolute from the project root.
const postModules = import.meta.glob<PostModule>('/src/content/posts/*.mdx', {
  eager: true,
});

/**
 * Local blog posts written as MDX files in this directory.
 * File naming: `<slug>.<locale>.mdx` (falls back to the base locale).
 *
 * Slugs are discovered from the bundled MDX files so publishing many SEO posts
 * does not require keeping a second manual registry in sync.
 */
export const BLOG_POST_SLUGS = Array.from(
  new Set(
    Object.keys(postModules)
      .map((path) =>
        path
          .split('/')
          .pop()
          ?.replace(/\.[^.]+\.mdx$/, '')
      )
      .filter((slug): slug is string => Boolean(slug))
      .filter((slug) => !HIDDEN_BLOG_POST_SLUGS.has(slug))
  )
).sort();

export function loadLocalPost(slug: string, locale: string): PostModule | null {
  if (!BLOG_POST_SLUGS.includes(slug)) {
    return null;
  }
  return postModules[`/src/content/posts/${slug}.${locale}.mdx`] ?? null;
}

export function getLocalPostLocales(slug: string): SiteLocale[] {
  if (!BLOG_POST_SLUGS.includes(slug)) {
    return [];
  }
  return siteLocales.filter((locale) =>
    Boolean(postModules[`/src/content/posts/${slug}.${locale}.mdx`])
  );
}

function localPostToItem(slug: string, meta: BlogPostMeta): BlogPost {
  return {
    slug,
    title: meta.title,
    description: meta.description,
    image: meta.image,
    createdAt: new Date(meta.created_at).toISOString(),
    authorName: meta.author_name,
    authorImage: meta.author_image,
    source: 'local',
  };
}

export function getLocalPosts(locale: string): BlogPost[] {
  const normalizedLocale = normalizeLocale(locale);
  return BLOG_POST_SLUGS.map((slug) => ({
    slug: slug as string,
    mod: loadLocalPost(slug, normalizedLocale),
  }))
    .filter((m): m is { slug: string; mod: PostModule } => m.mod !== null)
    .map(({ slug, mod }) => ({
      ...localPostToItem(slug, mod.meta),
      availableLocales: getLocalPostLocales(slug),
    }));
}

/**
 * Merge database posts with local MDX posts, deduped by slug
 * (database wins), newest first.
 */
export function mergePosts(
  dbPosts: BlogPost[],
  localPosts: BlogPost[],
  options: { limit?: number } = {}
): BlogPost[] {
  const dbSlugs = new Set(dbPosts.map((p) => p.slug));
  const merged = [
    ...dbPosts,
    ...localPosts.filter((p) => !dbSlugs.has(p.slug)),
  ].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  return options.limit ? merged.slice(0, options.limit) : merged;
}

export function formatPostDate(dateIso: string, locale: string): string {
  const intlLocale =
    locale === 'zh'
      ? 'zh-CN'
      : locale === 'es'
        ? 'es-ES'
        : locale === 'pt'
          ? 'pt-BR'
          : 'en-US';
  return new Intl.DateTimeFormat(intlLocale, {
    year: 'numeric',
    month: locale === 'zh' ? 'long' : 'short',
    day: 'numeric',
  }).format(new Date(dateIso));
}
