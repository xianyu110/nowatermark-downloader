import type { ComponentType } from 'react';
import { notFound, useLoaderData } from '@tanstack/react-router';

import { normalizeLocale, type SiteLocale } from '@/config/locale';
import { localizedPageHead } from '@/lib/seo';
import { m } from '@/paraglide/messages.js';
import { baseLocale, getLocale } from '@/paraglide/runtime.js';

type PageMeta = {
  title: string;
  description: string;
  updated_at: string;
};

type PageModule = {
  default: ComponentType;
  meta: PageMeta;
};

// Eagerly bundle the static content pages (small legal/info MDX files).
// Keys are absolute from the project root.
const pages = import.meta.glob<PageModule>('/src/content/pages/*.mdx', {
  eager: true,
});

export function loadPage(slug: string, locale: string): PageModule | null {
  return (
    pages[`/src/content/pages/${slug}.${locale}.mdx`] ??
    pages[`/src/content/pages/${slug}.${baseLocale}.mdx`] ??
    null
  );
}

type LoaderData = {
  meta: PageMeta;
  slug: string;
  locale: SiteLocale;
  contentLocale: SiteLocale;
  isFallback: boolean;
};

export function staticPageData(slug: string, locale: SiteLocale) {
  const page = loadPage(slug, locale);
  if (!page) return null;
  const hasLocalizedPage = Boolean(
    pages[`/src/content/pages/${slug}.${locale}.mdx`]
  );
  return {
    meta: page.meta,
    contentLocale: hasLocalizedPage ? locale : baseLocale,
    isFallback: !hasLocalizedPage,
  };
}

export function staticPageHead(slug: string, locale: SiteLocale) {
  const data = staticPageData(slug, locale);
  if (!data) return {};
  const pageHead = localizedPageHead({
    locale: data.contentLocale,
    path: `/${slug}`,
    title: data.meta.title,
    description: data.meta.description,
  });
  return {
    meta: [
      ...pageHead.meta,
      ...(data.isFallback
        ? [
            {
              name: 'robots',
              content: 'noindex, follow',
            },
          ]
        : []),
    ],
    links: pageHead.links,
  };
}

// Shared route options for static MDX pages. Each page gets its own
// explicit route file (e.g. privacy-policy.tsx) so static segments
// always outrank dynamic ones — add a new page by creating the MDX
// content plus a thin route file using this factory.
export function staticPageRouteOptions(slug: string) {
  return {
    loader: (): LoaderData => {
      const locale = normalizeLocale(getLocale());
      const data = staticPageData(slug, locale);
      if (!data) throw notFound();
      return {
        meta: data.meta,
        slug,
        locale,
        contentLocale: data.contentLocale,
        isFallback: data.isFallback,
      };
    },
    head: ({ loaderData }: { loaderData?: LoaderData }) => {
      if (!loaderData) return {};
      return staticPageHead(loaderData.slug, loaderData.locale);
    },
    component: StaticPage,
  };
}

export function StaticPageContent({
  slug,
  locale,
}: {
  slug: string;
  locale: SiteLocale;
}) {
  const data = staticPageData(slug, locale);
  if (!data) return null;
  const page = loadPage(slug, data.contentLocale)!;
  const Content = page.default;

  return (
    <article>
      <header className="border-border mb-6 border-b pb-5">
        <h1 className="text-foreground text-3xl font-semibold tracking-tight md:text-4xl">
          {data.meta.title}
        </h1>
        <p className="text-muted-foreground mt-2 text-sm">
          {data.meta.description}
        </p>
        <p className="text-muted-foreground mt-2 text-xs">
          {m['common.pages.last_updated']()}: {data.meta.updated_at}
        </p>
      </header>
      <div className="text-foreground/90 text-[15px] leading-7">
        <Content />
      </div>
    </article>
  );
}

function StaticPage() {
  const { meta, slug, contentLocale } = useLoaderData({
    strict: false,
  }) as LoaderData;

  return <StaticPageContent slug={slug} locale={contentLocale} />;
}
