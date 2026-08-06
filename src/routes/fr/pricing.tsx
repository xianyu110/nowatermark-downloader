import { createFileRoute } from '@tanstack/react-router';

import { type SiteLocale } from '@/config/locale';
import { localizedPageHead } from '@/lib/seo';
import { Footer } from '@/blocks/footer';
import { Header } from '@/blocks/header';
import { Pricing } from '@/blocks/pricing';

const routeLocale: SiteLocale = 'fr';

export const Route = createFileRoute('/fr/pricing')({
  head: () => {
    const locale = routeLocale;
    const titles: Record<SiteLocale, string> = {
      en: 'Pricing - NoWatermark Downloader',
      zh: '价格方案 - NoWatermark 视频下载器',
      es: 'Precios - NoWatermark Downloader',
      pt: 'Preços - NoWatermark Downloader',
      fr: 'Tarifs du téléchargeur vidéo - NoWatermark',
      de: 'Preise für Video-Downloader - NoWatermark',
      it: 'Prezzi del downloader video - NoWatermark',
      id: 'Harga pengunduh video - NoWatermark',
      ja: '動画ダウンローダーの料金 | NoWatermark',
      ko: '동영상 다운로드 요금제 | NoWatermark',
    };
    const descriptions: Record<SiteLocale, string> = {
      en: 'Video parsing credit packs and monthly plans for creators and teams.',
      zh: '面向创作者和团队的视频解析次数包与月度套餐。',
      es: 'Paquetes de créditos y planes mensuales de análisis de video para creadores y equipos.',
      pt: 'Pacotes de créditos e planos mensais de análise de vídeo para criadores e equipes.',
      fr: 'Comparez les crédits de parsing vidéo et les abonnements mensuels pour créateurs et équipes.',
      de: 'Vergleiche Videoparsing-Credits und Monatspläne für Creator und Teams.',
      it: 'Confronta pacchetti di crediti e piani mensili per creator e team.',
      id: 'Bandingkan paket kredit dan paket bulanan untuk kreator serta tim.',
      ja: 'クリエイターとチーム向けの動画解析クレジットと月額プランをご案内します。',
      ko: '크리에이터와 팀을 위한 동영상 분석 크레딧 및 월간 요금제를 비교하세요.',
    };
    return localizedPageHead({
      locale,
      path: '/pricing',
      title: titles[locale],
      description: descriptions[locale],
    });
  },
  component: PricingPage,
});

function PricingPage() {
  return (
    <div className="bg-background text-foreground flex min-h-screen flex-col">
      <Header locale={routeLocale} />
      <main className="flex-1">
        <Pricing locale={routeLocale} />
      </main>
      <Footer locale={routeLocale} />
    </div>
  );
}
