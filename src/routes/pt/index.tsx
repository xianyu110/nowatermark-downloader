import { createFileRoute } from '@tanstack/react-router';

import { localizedPageHead } from '@/lib/seo';
import { CopypilotDownloader } from '@/blocks/copypilot-downloader';

function HomePage() {
  return <CopypilotDownloader />;
}

export const Route = createFileRoute('/pt/')({
  head: () => {
    const locale = 'pt' as const;
    const titles = {
      en: 'NoWatermark Downloader',
      zh: 'NoWatermark 视频去水印下载器',
      es: 'Descargador NoWatermark',
      pt: 'Baixador NoWatermark',
    } as const;
    const descriptions = {
      en: 'Download public videos without watermarks from TikTok, Instagram, YouTube, X, Facebook, and more.',
      zh: '免费下载 TikTok、Instagram、YouTube、X、Facebook 等平台的公开无水印视频。',
      es: 'Descarga videos públicos sin marca de agua de TikTok, Instagram, YouTube, X, Facebook y más.',
      pt: 'Baixe vídeos públicos sem marca d’água do TikTok, Instagram, YouTube, X, Facebook e outros.',
    } as const;
    const title = titles.pt;
    const description = descriptions.pt;
    return localizedPageHead({
      locale,
      path: '/',
      title,
      description,
    });
  },
  component: HomePage,
});
