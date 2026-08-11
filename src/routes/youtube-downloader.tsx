import { createFileRoute } from '@tanstack/react-router';

import { localizedPageHead } from '@/lib/seo';
import {
  getPlatformCopy,
  getPlatformSeoKeywords,
  PlatformDownloader,
} from '@/blocks/platform-downloader';

const slug = 'youtube-downloader';
const pagePath = '/youtube-downloader';
const title = 'Free YouTube Video Downloader — Shorts and Public Videos';
const h1 = 'Download YouTube Videos and Shorts Online — Free';
const description =
  'Use this free YouTube video downloader for public YouTube videos and Shorts. Paste a YouTube link, extract available media, and download or copy the direct URL.';

export const Route = createFileRoute('/youtube-downloader')({
  head: () => {
    const item = getPlatformCopy(slug, 'en')!;
    return localizedPageHead({
      locale: 'en',
      path: pagePath,
      title,
      description,
      keywords: [
        'youtube video downloader',
        'youtube shorts downloader',
        'download youtube videos online',
        ...getPlatformSeoKeywords(slug, item),
      ],
      locales: ['en'],
    });
  },
  component: YouTubeDownloaderPage,
});

function YouTubeDownloaderPage() {
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
