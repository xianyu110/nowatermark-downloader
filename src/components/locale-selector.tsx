import { Check, ChevronDown, Globe, Languages } from 'lucide-react';

import { localeNames, normalizeLocale, type SiteLocale } from '@/config/locale';
import { cn } from '@/lib/utils';
import { getLocale, locales, setLocale } from '@/paraglide/runtime.js';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const localeDetails: Record<
  SiteLocale,
  { flag: string; language: string; region: string }
> = {
  en: { flag: '🇺🇸', language: 'English', region: 'United States' },
  zh: { flag: '🇨🇳', language: '中文', region: '中国' },
  es: { flag: '🇪🇸', language: 'Español', region: 'España' },
  pt: { flag: '🇧🇷', language: 'Português', region: 'Brasil' },
  fr: { flag: '🇫🇷', language: 'Français', region: 'France' },
  de: { flag: '🇩🇪', language: 'Deutsch', region: 'Deutschland' },
  it: { flag: '🇮🇹', language: 'Italiano', region: 'Italia' },
  id: { flag: '🇮🇩', language: 'Bahasa Indonesia', region: 'Indonesia' },
  ja: { flag: '🇯🇵', language: '日本語', region: '日本' },
  ko: { flag: '🇰🇷', language: '한국어', region: '대한민국' },
};

export function LocaleSelector({
  variant = 'icon',
  className,
  locale: localeOverride,
}: {
  variant?: 'icon' | 'pill';
  className?: string;
  locale?: SiteLocale;
}) {
  const locale = localeOverride || normalizeLocale(getLocale());
  const current = localeDetails[locale];

  function handleSwitch(newLocale: string) {
    // Writes the locale cookie and reloads on the localized URL.
    setLocale(newLocale as typeof locale);
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(
          'inline-flex items-center transition-colors outline-none',
          variant === 'icon'
            ? 'text-muted-foreground hover:bg-accent hover:text-accent-foreground size-8 justify-center rounded-md'
            : 'h-9 gap-2 rounded-full border px-4 text-sm',
          className
        )}
        aria-label="Switch language"
      >
        {variant === 'icon' ? (
          <>
            <Languages className="size-4" />
            <span className="sr-only">Switch language</span>
          </>
        ) : (
          <>
            <Globe className="size-4" />
            <span aria-hidden="true">{current.flag}</span>
            <span>{localeNames[locale] || locale}</span>
            <ChevronDown className="size-4 opacity-70" />
          </>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-52">
        {locales.map((loc) => (
          <DropdownMenuItem
            key={loc}
            onClick={() => handleSwitch(loc)}
            className="flex items-center justify-between gap-3"
          >
            <span className="flex items-center gap-3">
              <span className="text-base" aria-hidden="true">
                {localeDetails[normalizeLocale(loc)].flag}
              </span>
              <span className="flex flex-col">
                <span>{localeDetails[normalizeLocale(loc)].language}</span>
                <span className="text-muted-foreground text-xs">
                  {localeDetails[normalizeLocale(loc)].region}
                </span>
              </span>
            </span>
            {loc === locale && <Check className="size-3.5" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
