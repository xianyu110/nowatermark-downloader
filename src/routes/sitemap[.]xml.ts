import { createFileRoute } from '@tanstack/react-router';

import { envConfigs } from '@/config';
import { localePath, siteLocales } from '@/config/locale';
import { hreflangForLocale } from '@/lib/seo';
import { baseLocale, locales } from '@/paraglide/runtime.js';
import { getLocalPosts, mergePosts } from '@/content/posts';

const ALL_LOCALE_STATIC_PATHS = ['', '/pricing', '/transcribe'];
const EDITORIAL_PATHS = [
  '/blog',
  '/privacy-policy',
  '/user-agreement',
  '/terms-of-service',
  '/refund-policy',
  '/copyright-policy',
];
const SEO_LOCALES = siteLocales;
const SEO_PATHS = [
  '/faq',
  '/how-to-download-videos',
  '/api-docs',
  '/data-deletion',
];
const TOOL_SLUGS = [
  'tiktok-downloader',
  'instagram-downloader',
  'youtube-downloader',
  'facebook-video-downloader',
  'twitter-video-downloader',
];

type Entry = {
  path: string;
  lastModified?: string;
  changeFrequency: string;
  priority: number;
  locales?: readonly string[];
};

function urlFor(path: string, locale: string): string {
  const appUrl = envConfigs.app_url.replace(/\/$/, '');
  if (locale === 'en') return `${appUrl}${path || '/'}`;
  return `${appUrl}${localePath(locale as (typeof siteLocales)[number], path || '/')}`;
}

function entryXml(e: Entry, locale: string): string {
  const alternates = (e.locales || locales)
    .map(
      (loc) =>
        `    <xhtml:link rel="alternate" hreflang="${hreflangForLocale(loc as (typeof siteLocales)[number])}" href="${urlFor(e.path, loc)}"/>`
    )
    .concat(
      `    <xhtml:link rel="alternate" hreflang="x-default" href="${urlFor(e.path, 'en')}"/>`
    )
    .join('\n');
  return [
    '  <url>',
    `    <loc>${urlFor(e.path, locale)}</loc>`,
    alternates,
    e.lastModified ? `    <lastmod>${e.lastModified}</lastmod>` : null,
    `    <changefreq>${e.changeFrequency}</changefreq>`,
    `    <priority>${e.priority}</priority>`,
    '  </url>',
  ]
    .filter(Boolean)
    .join('\n');
}

export const Route = createFileRoute('/sitemap.xml')({
  server: {
    handlers: {
      GET: async () => {
        const entries: Entry[] = ALL_LOCALE_STATIC_PATHS.map((path) => ({
          path,
          changeFrequency: path === '/blog' ? 'daily' : 'weekly',
          priority: path === '' ? 1 : 0.8,
          locales: SEO_LOCALES,
        }));
        for (const path of EDITORIAL_PATHS) {
          entries.push({
            path,
            changeFrequency: path === '/blog' ? 'daily' : 'weekly',
            priority: path === '/blog' ? 0.8 : 0.5,
            locales: ['en', 'zh'],
          });
        }
        for (const path of SEO_PATHS) {
          entries.push({
            path,
            changeFrequency: path === '/api-docs' ? 'weekly' : 'monthly',
            priority: path === '/faq' ? 0.8 : 0.7,
            locales: SEO_LOCALES,
          });
        }
        for (const slug of TOOL_SLUGS) {
          entries.push({
            path: `/tools/${slug}`,
            changeFrequency: 'weekly',
            priority: 0.85,
            locales: SEO_LOCALES,
          });
        }

        // Blog posts: db posts merged with local MDX posts.
        try {
          const { listPublishedArticles } =
            await import('@/modules/posts/service');
          const rows = await listPublishedArticles().catch(() => []);
          const dbPosts = rows.map((row) => ({
            slug: row.slug,
            title: row.title || row.slug,
            description: row.description || '',
            createdAt: new Date(row.createdAt).toISOString(),
            source: 'db' as const,
          }));
          const posts = mergePosts(dbPosts, getLocalPosts(baseLocale));
          for (const post of posts) {
            entries.push({
              path: `/blog/${post.slug}`,
              lastModified: post.createdAt,
              changeFrequency: 'monthly',
              priority: 0.6,
              locales: [baseLocale],
            });
          }
        } catch {
          // Database unreachable — static paths + local posts still listed.
          for (const post of getLocalPosts(baseLocale)) {
            entries.push({
              path: `/blog/${post.slug}`,
              lastModified: post.createdAt,
              changeFrequency: 'monthly',
              priority: 0.6,
              locales: [baseLocale],
            });
          }
        }

        const xml = [
          '<?xml version="1.0" encoding="UTF-8"?>',
          '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">',
          ...entries.flatMap((entry) =>
            (entry.locales || locales).map((locale) => entryXml(entry, locale))
          ),
          '</urlset>',
          '',
        ].join('\n');

        return new Response(xml, {
          headers: {
            'Content-Type': 'application/xml; charset=utf-8',
            'Cache-Control': 'public, max-age=3600',
          },
        });
      },
    },
  },
});
