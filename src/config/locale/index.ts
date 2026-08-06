// Locale display names for the language switcher UI.
// Locales themselves are defined in project.inlang/settings.json and
// exposed at runtime via @/paraglide/runtime.js (locales, baseLocale).
export const siteLocales = [
  'en',
  'zh',
  'es',
  'pt',
  'fr',
  'de',
  'it',
  'id',
  'ja',
  'ko',
] as const;

export type SiteLocale = (typeof siteLocales)[number];

export const localeNames: Record<string, string> = {
  en: 'English',
  zh: '中文',
  es: 'Español',
  pt: 'Português',
  fr: 'Français',
  de: 'Deutsch',
  it: 'Italiano',
  id: 'Bahasa Indonesia',
  ja: '日本語',
  ko: '한국어',
};

export function normalizeLocale(value: string | null | undefined): SiteLocale {
  return (siteLocales as readonly string[]).includes(value || '')
    ? (value as SiteLocale)
    : 'en';
}

/** Build the public URL for a route using the site's locale-prefix policy. */
export function localePath(locale: SiteLocale, path = '/') {
  const normalizedPath = path || '/';
  if (locale === 'en') return normalizedPath;
  return normalizedPath === '/' ? `/${locale}` : `/${locale}${normalizedPath}`;
}
