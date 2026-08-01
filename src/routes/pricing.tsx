import { createFileRoute } from '@tanstack/react-router';

import { Footer } from '@/blocks/footer';
import { Header } from '@/blocks/header';
import { Pricing } from '@/blocks/pricing';

export const Route = createFileRoute('/pricing')({
  head: () => ({
    meta: [
      { title: 'Plans - NoWatermark Downloader' },
      {
        name: 'description',
        content: 'Usage plans for teams that need higher-volume parsing.',
      },
    ],
  }),
  component: PricingPage,
});

function PricingPage() {
  return (
    <div className="bg-background text-foreground flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <Pricing />
      </main>
      <Footer />
    </div>
  );
}
