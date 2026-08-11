import { createFileRoute } from '@tanstack/react-router';

import { localizedPageHead } from '@/lib/seo';
import {
  getPlatformCopy,
  getPlatformSeoKeywords,
  PlatformDownloader,
} from '@/blocks/platform-downloader';

const slug = 'tiktok-downloader';
const pagePath = '/tiktok-downloader';
const title = 'Free TikTok Video Downloader — No Watermark, No Signup';
const h1 = 'Download TikTok Videos Without Watermark — Free';
const description =
  'Use this free TikTok video downloader without watermark to save public TikTok videos online. Paste a TikTok link, extract a clean video, and download with no signup.';

export const Route = createFileRoute('/tiktok-downloader')({
  head: () => {
    const item = getPlatformCopy(slug, 'en')!;
    return localizedPageHead({
      locale: 'en',
      path: pagePath,
      title,
      description,
      keywords: [
        'tiktok video downloader without watermark',
        'free tiktok video downloader',
        'download tiktok videos without watermark',
        ...getPlatformSeoKeywords(slug, item),
      ],
      locales: ['en'],
    });
  },
  component: TikTokDownloaderPage,
});

function TikTokDownloaderPage() {
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
