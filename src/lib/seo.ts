import { envConfigs } from '@/config';
import { localePath, siteLocales, type SiteLocale } from '@/config/locale';

const hreflangLocales: Record<SiteLocale, string> = {
  en: 'en',
  zh: 'zh-CN',
  es: 'es',
  pt: 'pt',
  fr: 'fr',
  de: 'de',
  it: 'it',
  id: 'id',
  ja: 'ja',
  ko: 'ko',
};

const openGraphLocales: Record<SiteLocale, string> = {
  en: 'en_US',
  zh: 'zh_CN',
  es: 'es_ES',
  pt: 'pt_BR',
  fr: 'fr_FR',
  de: 'de_DE',
  it: 'it_IT',
  id: 'id_ID',
  ja: 'ja_JP',
  ko: 'ko_KR',
};

function appUrl() {
  return envConfigs.app_url.replace(/\/$/, '');
}

export function hreflangForLocale(locale: SiteLocale) {
  return hreflangLocales[locale];
}

export function openGraphLocale(locale: SiteLocale) {
  return openGraphLocales[locale];
}

export function localizedUrl(locale: SiteLocale, path = '/') {
  return `${appUrl()}${localePath(locale, path)}`;
}

export function localizedPageHead({
  locale,
  path,
  title,
  description,
}: {
  locale: SiteLocale;
  path: string;
  title: string;
  description: string;
}) {
  const canonical = localizedUrl(locale, path);
  return {
    meta: [
      { title },
      { name: 'description', content: description },
      { property: 'og:type', content: 'website' },
      { property: 'og:site_name', content: 'NoWatermark' },
      { property: 'og:title', content: title },
      { property: 'og:description', content: description },
      { property: 'og:url', content: canonical },
      { property: 'og:locale', content: openGraphLocale(locale) },
      ...siteLocales
        .filter((alternateLocale) => alternateLocale !== locale)
        .map((alternateLocale) => ({
          property: 'og:locale:alternate',
          content: openGraphLocale(alternateLocale),
        })),
      { name: 'twitter:card', content: 'summary' },
      { name: 'twitter:title', content: title },
      { name: 'twitter:description', content: description },
    ],
    links: [
      { rel: 'canonical', href: canonical },
      ...siteLocales.map((alternateLocale) => ({
        rel: 'alternate',
        hrefLang: hreflangForLocale(alternateLocale),
        href: localizedUrl(alternateLocale, path),
      })),
      {
        rel: 'alternate',
        hrefLang: 'x-default',
        href: localizedUrl('en', path),
      },
    ],
  };
}

export function privatePageHead() {
  return {
    meta: [
      {
        name: 'robots',
        content: 'noindex, nofollow, noarchive, nosnippet',
      },
      {
        name: 'googlebot',
        content: 'noindex, nofollow, noarchive, nosnippet',
      },
    ],
  };
}
