import { createFileRoute } from '@tanstack/react-router';

import { VideoDownloaderTool } from '@/blocks/video-downloader-tool';

function HomePage() {
  return <VideoDownloaderTool />;
}

export const Route = createFileRoute('/')({
  head: () => ({
    meta: [
      { title: 'NoWatermark Downloader' },
      {
        name: 'description',
        content:
          'Paste a public video link and get a direct media URL with automatic fallback retries.',
      },
    ],
  }),
  component: HomePage,
});
