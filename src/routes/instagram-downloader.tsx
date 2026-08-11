import { createFileRoute } from '@tanstack/react-router';

import { localizedPageHead } from '@/lib/seo';
import {
  getPlatformCopy,
  getPlatformSeoKeywords,
  PlatformDownloader,
} from '@/blocks/platform-downloader';

const slug = 'instagram-downloader';
const pagePath = '/instagram-downloader';
const title = 'Free Instagram Video Downloader — Reels, Posts, No Signup';
const h1 = 'Download Instagram Videos and Reels Online — Free';
const description =
  'Download public Instagram videos, Reels, and post media online. Paste an Instagram link to extract a clean downloadable media URL with no software and no signup.';

export const Route = createFileRoute('/instagram-downloader')({
  head: () => {
    const item = getPlatformCopy(slug, 'en')!;
    return localizedPageHead({
      locale: 'en',
      path: pagePath,
      title,
      description,
      keywords: [
        'instagram video downloader',
        'instagram reels downloader',
        'download instagram videos online',
        ...getPlatformSeoKeywords(slug, item),
      ],
      locales: ['en'],
    });
  },
  component: InstagramDownloaderPage,
});

function InstagramDownloaderPage() {
  return (
    <PlatformDownloader
      locale="en"
      slug={slug}
      pagePathOverride={pagePath}
      headingOverride={h1}
      descriptionOverride={description}
    />
  );
}
