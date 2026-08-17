import { createFileRoute } from '@tanstack/react-router';

import { envConfigs } from '@/config';
import { localePath, siteLocales } from '@/config/locale';
import { hreflangForLocale } from '@/lib/seo';
import { baseLocale, locales } from '@/paraglide/runtime.js';
import {
  getLocalPostLocales,
  getLocalPosts,
  HIDDEN_BLOG_POST_SLUGS,
  mergePosts,
} from '@/content/posts';

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
  '/tools',
  '/faq',
  '/how-to-download-videos',
  '/api-docs',
  '/video-summary',
  '/audio-extractor',
  '/frame-extractor',
  '/song-recognizer',
  '/tools/ai-watermark-remover',
  '/data-deletion',
];
const ROOT_LANDING_PATHS = [
  '/tiktok-downloader',
  '/instagram-downloader',
  '/youtube-downloader',
];
const TOOL_SLUGS = [
  'tiktok-downloader',
  'instagram-downloader',
  'youtube-downloader',
  'facebook-video-downloader',
  'twitter-video-downloader',
  'douyin-downloader',
  'kuaishou-downloader',
  'xiaohongshu-downloader',
  'bilibili-downloader',
  'weibo-video-downloader',
  'toutiao-video-downloader',
  'doubao-video-downloader',
  'jimeng-video-downloader',
  'pipixia-video-downloader',
  'pipigaoxiao-video-downloader',
  'qianwen-media-downloader',
  'zuiyou-video-downloader',
  'xigua-video-downloader',
  'acfun-video-downloader',
  'zhihu-video-downloader',
  'meipai-video-downloader',
  'huya-video-downloader',
  'weishi-video-downloader',
  'doubao-image-downloader',
  'douyin-profile-downloader',
  'kuaishou-video-downloader',
  'short-video-downloader',
  'short-video-parser-2',
  'weibo-watermark-downloader',
  'xiaohongshu-note-downloader',
  'xiaohongshu-image-downloader',
  'movie-video-parser',
  'netease-music-downloader',
  'kuwo-music-downloader',
  'music-downloader',
  'qq-music-downloader',
  'qishui-music-downloader',
];
const HIGH_PRIORITY_TOOL_SLUGS = new Set([
  'tiktok-downloader',
  'instagram-downloader',
  'youtube-downloader',
  'short-video-downloader',
  'music-downloader',
]);
const MID_PRIORITY_TOOL_SLUGS = new Set([
  'douyin-downloader',
  'kuaishou-downloader',
  'xiaohongshu-downloader',
  'bilibili-downloader',
  'qq-music-downloader',
  'netease-music-downloader',
]);

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
            locales: path === '/blog' ? ['en', 'zh', 'es', 'pt'] : ['en', 'zh'],
          });
        }
        for (const path of SEO_PATHS) {
          entries.push({
            path,
            changeFrequency: path === '/api-docs' ? 'weekly' : 'monthly',
            priority: path === '/tools' ? 0.95 : path === '/faq' ? 0.8 : 0.7,
            locales: SEO_LOCALES,
          });
        }
        for (const path of ROOT_LANDING_PATHS) {
          entries.push({
            path,
            changeFrequency: 'daily',
            priority: path === '/tiktok-downloader' ? 1 : 0.96,
            locales: ['en'],
          });
        }
        for (const slug of TOOL_SLUGS) {
          entries.push({
            path: `/tools/${slug}`,
            changeFrequency: HIGH_PRIORITY_TOOL_SLUGS.has(slug)
              ? 'daily'
              : 'weekly',
            priority: HIGH_PRIORITY_TOOL_SLUGS.has(slug)
              ? 0.95
              : MID_PRIORITY_TOOL_SLUGS.has(slug)
                ? 0.9
                : 0.82,
            locales: SEO_LOCALES,
          });
        }

        // Blog posts: db posts merged with local MDX posts.
        try {
          const { listPublishedArticles } =
            await import('@/modules/posts/service');
          const rows = await listPublishedArticles().catch(() => []);
          const dbPosts = rows
            .filter((row) => !HIDDEN_BLOG_POST_SLUGS.has(row.slug))
            .map((row) => ({
              slug: row.slug,
              title: row.title || row.slug,
              description: row.description || '',
              createdAt: new Date(row.createdAt).toISOString(),
              source: 'db' as const,
            }));
          const posts = mergePosts(dbPosts, getLocalPosts(baseLocale));
          for (const post of posts) {
            const postLocales =
              post.source === 'local' ? getLocalPostLocales(post.slug) : ['en'];
            entries.push({
              path: `/blog/${post.slug}`,
              lastModified: post.createdAt,
              changeFrequency: 'monthly',
              priority: 0.6,
              locales: postLocales.length ? postLocales : ['en'],
            });
          }
        } catch {
          // Database unreachable — static paths + local posts still listed.
          for (const post of getLocalPosts(baseLocale)) {
            const postLocales = getLocalPostLocales(post.slug);
            entries.push({
              path: `/blog/${post.slug}`,
              lastModified: post.createdAt,
              changeFrequency: 'monthly',
              priority: 0.6,
              locales: postLocales.length ? postLocales : ['en'],
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
