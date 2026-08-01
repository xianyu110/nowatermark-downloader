'use client';

import { useMemo, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import {
  CalendarDays,
  Coins,
  Download,
  History,
  ReceiptText,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { toast } from 'sonner';

import { useSession } from '@/core/auth/client';
import { useRouter } from '@/core/i18n/navigation';
import { apiPost } from '@/lib/api-client';
import { currentPathWithQuery } from '@/lib/redirect';
import { usePublicConfig } from '@/hooks/use-public-config';
import {
  PaymentProviderModal,
  type PaymentProvider,
} from '@/components/payment-provider-modal';
import {
  PricingTable,
  type PricingGroup,
  type PricingPlan,
} from '@/components/pricing-table';

const ALL_PROVIDERS: PaymentProvider[] = [
  'stripe',
  'creem',
  'paypal',
  'alipay',
  'wechat',
];

export function Pricing({ title }: { title?: string } = {}) {
  const router = useRouter();
  const { data: session } = useSession();

  const { data: configsData } = usePublicConfig();
  const configs = configsData ?? {};
  const [modalOpen, setModalOpen] = useState(false);
  const [pendingPlan, setPendingPlan] = useState<PricingPlan | null>(null);
  const [loadingProvider, setLoadingProvider] =
    useState<PaymentProvider | null>(null);

  const enabledProviders = useMemo<PaymentProvider[]>(
    () => ALL_PROVIDERS.filter((p) => configs[`${p}_enabled`] === 'true'),
    [configs]
  );
  const orderedProviders = useMemo<PaymentProvider[]>(
    () => [
      ...enabledProviders.filter((p) => p !== 'alipay'),
      ...enabledProviders.filter((p) => p === 'alipay'),
    ],
    [enabledProviders]
  );

  const packFeatures = [
    { icon: ShieldCheck, label: 'Only successful parses count' },
    { icon: Download, label: 'Preview, copy, and open the media URL' },
    { icon: History, label: 'Keep the last 8 results locally' },
  ];
  const creatorFeatures = [
    { icon: Coins, label: '300 parsing credits per month' },
    { icon: ShieldCheck, label: 'Retries happen before a parse is counted' },
    { icon: ReceiptText, label: 'View billing and usage details in account' },
  ];
  const studioFeatures = [
    { icon: Zap, label: '1200 parsing credits per month' },
    { icon: CalendarDays, label: 'Credits refresh on each billing cycle' },
    { icon: ReceiptText, label: 'Manage payments and usage in one place' },
  ];

  const groups: PricingGroup[] = [
    {
      key: 'credit-packs',
      label: '次数包',
      plans: [
        {
          id: 'lite-pack',
          name: 'Starter Pack',
          description: 'For occasional downloads',
          price: '¥6.9',
          features: packFeatures,
          productId: 'lite_pack',
          priceInCents: 690,
          currency: 'cny',
          credits: 30,
          creditsValidDays: 30,
          buttonText: '购买 30 次',
        },
        {
          id: 'creator-pack',
          name: 'Creator Pack',
          description: 'For steady daily usage',
          price: '¥19.9',
          featured: true,
          badge: 'Popular',
          features: packFeatures,
          productId: 'creator_pack',
          priceInCents: 1990,
          currency: 'cny',
          credits: 150,
          creditsValidDays: 90,
          buttonText: '购买 150 次',
        },
        {
          id: 'studio-pack',
          name: 'Studio Pack',
          description: 'For teams and batch workflows',
          price: '¥59.9',
          features: packFeatures,
          productId: 'studio_pack',
          priceInCents: 5990,
          currency: 'cny',
          credits: 600,
          creditsValidDays: 180,
          buttonText: '购买 600 次',
        },
      ],
    },
    {
      key: 'monthly',
      label: '月度套餐',
      plans: [
        {
          id: 'creator-monthly',
          name: 'Creator Monthly',
          description: 'Recurring plan for creators',
          price: '¥29.9',
          interval: '月',
          features: creatorFeatures,
          productId: 'creator_monthly',
          priceInCents: 2990,
          currency: 'cny',
          credits: 300,
          plan: { name: '创作者月度版', interval: 'month', intervalCount: 1 },
          buttonText: '立即订阅',
        },
        {
          id: 'studio-monthly',
          name: 'Studio Monthly',
          description: 'Recurring plan for teams',
          price: '¥79.9',
          interval: '月',
          featured: true,
          badge: 'Best fit',
          features: studioFeatures,
          productId: 'studio_monthly',
          priceInCents: 7990,
          currency: 'cny',
          credits: 1200,
          plan: { name: '工作室月度版', interval: 'month', intervalCount: 1 },
          buttonText: '立即订阅',
        },
      ],
    },
  ];

  const checkoutMutation = useMutation({
    mutationFn: ({
      plan,
      provider,
    }: {
      plan: PricingPlan;
      provider: PaymentProvider;
    }) =>
      apiPost<{ checkout_url?: string }>('/api/payment/checkout', {
        product_id: plan.productId,
        product_name: plan.productName || plan.name,
        plan_name: plan.plan?.name || plan.name,
        price: plan.priceInCents,
        currency: plan.currency || 'usd',
        type: plan.plan ? 'subscription' : 'one-time',
        description: plan.name,
        plan: plan.plan,
        credits: plan.credits,
        credits_valid_days: plan.creditsValidDays,
        payment_provider: provider,
        // Come back to the page the user paid from.
        redirect: currentPathWithQuery('/settings/billing'),
      }),
    onSuccess: (data) => {
      if (!data?.checkout_url) {
        toast.error('Checkout failed');
        setLoadingProvider(null);
        return;
      }
      window.location.href = data.checkout_url;
    },
    onError: (err: any) => {
      toast.error(err?.message || 'Checkout failed');
      setLoadingProvider(null);
    },
  });

  function startCheckout(plan: PricingPlan, provider: PaymentProvider) {
    setLoadingProvider(provider);
    checkoutMutation.mutate({ plan, provider });
  }

  async function handleCheckout(plan: PricingPlan) {
    if (!session?.user) {
      const callbackUrl = encodeURIComponent(currentPathWithQuery('/pricing'));
      router.push(`/sign-in?callbackUrl=${callbackUrl}`);
      return;
    }

    if (enabledProviders.length === 0) {
      toast.error('支付通道正在配置，请稍后再试');
      return;
    }

    const selectEnabled = configs.select_payment_enabled === 'true';
    const configuredDefault = configs.default_payment_provider as
      | PaymentProvider
      | undefined;
    const defaultProvider =
      (configuredDefault &&
      orderedProviders.includes(configuredDefault) &&
      configuredDefault !== 'alipay'
        ? configuredDefault
        : undefined) ?? orderedProviders[0];

    if (selectEnabled && enabledProviders.length > 1) {
      setPendingPlan(plan);
      setModalOpen(true);
      return;
    }

    await startCheckout(plan, defaultProvider);
  }

  function handleProviderSelect(provider: PaymentProvider) {
    if (!pendingPlan) return;
    startCheckout(pendingPlan, provider);
  }

  return (
    <section
      id="pricing"
      className="border-border border-t px-4 py-24 sm:py-32"
    >
      <div className="mx-auto max-w-5xl">
        <div className="mb-20 text-center">
          <h2 className="font-serif text-4xl font-normal tracking-tight sm:text-5xl">
            {title ?? 'Choose a plan that matches your usage'}
          </h2>
          <p className="text-muted-foreground mx-auto mt-5 max-w-2xl leading-7">
            Trial credits are available for new accounts. Failed upstream
            requests are retried before a parse is counted.
          </p>
        </div>
        <PricingTable groups={groups} onCheckout={handleCheckout} />
      </div>

      <PaymentProviderModal
        open={modalOpen}
        onOpenChange={(open) => {
          setModalOpen(open);
          if (!open) {
            setPendingPlan(null);
            setLoadingProvider(null);
          }
        }}
        providers={orderedProviders.length ? orderedProviders : ['stripe']}
        loadingProvider={loadingProvider}
        onSelect={handleProviderSelect}
        planName={pendingPlan?.name}
        price={pendingPlan?.price}
      />
    </section>
  );
}
