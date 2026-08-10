import { createFileRoute } from '@tanstack/react-router';

import { envConfigs } from '@/config';
import { AI_DISCOVERY_PAGES } from '@/lib/ai-discovery';
import { baseLocale } from '@/paraglide/runtime.js';
import {
  getLocalPosts,
  HIDDEN_BLOG_POST_SLUGS,
  mergePosts,
} from '@/content/posts';

export const Route = createFileRoute('/llms-full.txt')({
  server: {
    handlers: {
      GET: async () => {
        const { app_url, app_name, app_description } = envConfigs;

        const lines: string[] = [
          `# ${app_name}`,
          '',
          `> ${app_description}`,
          '',
          '## Pages',
          '',
          ...AI_DISCOVERY_PAGES.map(
            (p) => `- [${p.title}](${app_url}${p.path}): ${p.description}`
          ),
        ];

        let posts = getLocalPosts(baseLocale);
        try {
          const { listPublishedArticles, findPublishedBySlug } =
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
          posts = mergePosts(dbPosts, posts);

          if (posts.length > 0) {
            lines.push('', '## Blog Posts', '');

            for (const post of posts) {
              lines.push(`### ${post.title}`, '');
              lines.push(`URL: ${app_url}/blog/${post.slug}`);
              if (post.description)
                lines.push(`Description: ${post.description}`);
              lines.push('');

              if (
                post.source === 'db' &&
                !HIDDEN_BLOG_POST_SLUGS.has(post.slug)
              ) {
                const detail = await findPublishedBySlug(post.slug).catch(
                  () => null
                );
                if (detail?.content) {
                  lines.push(detail.content, '');
                }
              }

              lines.push('---', '');
            }
          }
        } catch {
          // Database unreachable — list local posts without content.
          if (posts.length > 0) {
            lines.push('', '## Blog Posts', '');
            for (const post of posts) {
              lines.push(`### ${post.title}`, '');
              lines.push(`URL: ${app_url}/blog/${post.slug}`);
              if (post.description)
                lines.push(`Description: ${post.description}`);
              lines.push('', '---', '');
            }
          }
        }

        lines.push('');

        return new Response(lines.join('\n'), {
          headers: {
            'Content-Type': 'text/plain; charset=utf-8',
            'Cache-Control': 'public, max-age=3600',
          },
        });
      },
    },
  },
});
