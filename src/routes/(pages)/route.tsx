import { createFileRoute, Outlet } from '@tanstack/react-router';
import { MDXProvider } from '@mdx-js/react';
import { ArrowLeft } from 'lucide-react';

import { Link } from '@/core/i18n/navigation';
import { m } from '@/paraglide/messages.js';
import { Footer } from '@/blocks/footer';
import { Header } from '@/blocks/header';
import { mdxComponents } from '@/components/mdx-components';

export const Route = createFileRoute('/(pages)')({
  component: PagesLayout,
});

function PagesLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-[#f3fbf7] text-[#193d32]">
      <Header />
      <main className="flex-1">
        <div className="mx-auto max-w-3xl px-6 pt-8 md:px-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full border border-[#d8e8e1] bg-white/80 px-4 py-2 text-sm font-medium text-[#107b59] transition-colors hover:border-[#9ed4bf] hover:bg-white"
          >
            <ArrowLeft className="size-4" />
            {m['common.pages.back_to_home']()}
          </Link>
        </div>
        <div className="mx-auto max-w-3xl px-6 pt-6 pb-12 md:px-8 md:pt-8 md:pb-16">
          <MDXProvider components={mdxComponents}>
            <div className="rounded-[28px] border border-[#d8e8e1] bg-white/82 p-6 shadow-[0_18px_50px_rgba(26,74,58,0.08)] md:p-8">
              <Outlet />
            </div>
          </MDXProvider>
        </div>
      </main>
      <Footer />
    </div>
  );
}
