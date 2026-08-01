'use client';

import { useState } from 'react';
import { ArrowRight, LogIn, Menu, X } from 'lucide-react';

import { useSession } from '@/core/auth/client';
import { Link } from '@/core/i18n/navigation';
import { envConfigs } from '@/config';
import { cn } from '@/lib/utils';
import { LocaleSelector } from '@/components/locale-selector';
import { SiteUserMenu } from '@/components/site-user-menu';
import { ThemeToggle } from '@/components/theme-toggle';
import { buttonVariants } from '@/components/ui/button';

export interface NavLink {
  href: string;
  label: string;
  /** Open in a new tab. Off-site (http) hrefs always open in a new tab. */
  external?: boolean;
}

/** Off-site URLs render as plain <a>; internal paths use the locale-aware Link. */
const isExternalHref = (href: string) => /^https?:\/\//.test(href);

export function SiteHeader({ navLinks }: { navLinks?: NavLink[] }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { data: session } = useSession();
  const user = session?.user;

  return (
    <header className="bg-background/86 sticky top-0 z-50 w-full border-b border-[#d8e8e1] backdrop-blur-md">
      <div className="mx-auto flex h-[72px] max-w-6xl items-center justify-between px-4 sm:px-6">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-[12px] bg-[#107b59] shadow-[0_8px_20px_rgba(16,123,89,0.18)]">
            <img src={envConfigs.app_logo} alt="" className="size-6" />
          </span>
          <span className="leading-none">
            <span className="block text-[17px] font-semibold tracking-[-0.02em] text-[#193d32]">
              {envConfigs.app_name}
            </span>
            <span className="block text-[10px] font-medium tracking-[0.18em] text-[#7f9a91] uppercase">
              VIDEO CHANNEL TOOL
            </span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-6 md:flex">
          {navLinks?.map((link) =>
            isExternalHref(link.href) ? (
              <a
                key={link.href}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground text-sm transition-colors"
              >
                {link.label}
              </a>
            ) : (
              <Link
                key={link.href}
                href={link.href}
                target={link.external ? '_blank' : undefined}
                className="text-muted-foreground hover:text-foreground text-sm transition-colors"
              >
                {link.label}
              </Link>
            )
          )}
        </nav>

        {/* Desktop actions */}
        <div className="hidden items-center gap-3 md:flex">
          <LocaleSelector />
          <ThemeToggle />
          {user ? (
            <SiteUserMenu
              name={user.name || 'User'}
              email={user.email}
              image={user.image}
            />
          ) : (
            <Link
              href="/sign-in?callbackUrl=%2Fpricing"
              className={cn(
                buttonVariants({ variant: 'outline' }),
                'gap-1.5 border-[#b9ded0] bg-white text-[#107b59] hover:bg-[#eff9f5] hover:text-[#107b59]'
              )}
            >
              <LogIn className="size-4" />
              登录 / 注册
              <ArrowRight className="size-3.5" />
            </Link>
          )}
        </div>

        {/* Mobile toggle */}
        <button
          className="p-2 md:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="border-border border-t px-4 pt-2 pb-4 md:hidden">
          <nav className="flex flex-col gap-2">
            {navLinks?.map((link) =>
              isExternalHref(link.href) ? (
                <a
                  key={link.href}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:bg-accent hover:text-foreground rounded-md px-3 py-2 text-sm transition-colors"
                  onClick={() => setMobileOpen(false)}
                >
                  {link.label}
                </a>
              ) : (
                <Link
                  key={link.href}
                  href={link.href}
                  target={link.external ? '_blank' : undefined}
                  className="text-muted-foreground hover:bg-accent hover:text-foreground rounded-md px-3 py-2 text-sm transition-colors"
                  onClick={() => setMobileOpen(false)}
                >
                  {link.label}
                </Link>
              )
            )}
          </nav>
          <div className="border-border mt-3 flex items-center gap-2 border-t pt-3">
            <LocaleSelector />
            <ThemeToggle />
            <div className="flex-1" />
            {user ? (
              <SiteUserMenu
                name={user.name || 'User'}
                email={user.email}
                image={user.image}
              />
            ) : (
              <Link
                href="/sign-in?callbackUrl=%2Fpricing"
                className={cn(
                  buttonVariants({ variant: 'outline' }),
                  'gap-1.5 border-[#b9ded0] bg-white text-[#107b59] hover:bg-[#eff9f5] hover:text-[#107b59]'
                )}
                onClick={() => setMobileOpen(false)}
              >
                <LogIn className="size-4" />
                登录 / 注册
                <ArrowRight className="size-3.5" />
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
