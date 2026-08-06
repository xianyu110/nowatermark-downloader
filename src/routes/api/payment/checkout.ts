import { createFileRoute } from '@tanstack/react-router';

import { getAuth } from '@/core/auth';
import { getPricingProduct } from '@/config/pricing';
import { getAllConfigs } from '@/modules/config/service';
import {
  createCheckout,
  getAvailablePaymentProviders,
} from '@/modules/payment/service';
import { enforceMinIntervalRateLimit } from '@/lib/rate-limit';
import { respData, respErr } from '@/lib/resp';

function safeSameOriginPath(
  input: string | undefined | null,
  fallbackPath: string,
  baseUrl: string
): string {
  if (!input) return fallbackPath;
  try {
    const appUrl = new URL(baseUrl);
    const candidate = new URL(input, appUrl);
    if (candidate.origin !== appUrl.origin) return fallbackPath;
    return candidate.pathname + candidate.search + candidate.hash;
  } catch {
    return fallbackPath;
  }
}

function providerSupportsCurrency(provider: string, currency: string) {
  const normalizedCurrency = currency.toLowerCase();
  if (normalizedCurrency === 'usd') {
    return ['stripe', 'creem', 'paypal'].includes(provider);
  }
  if (normalizedCurrency === 'cny') {
    return ['stripe', 'alipay', 'wechat'].includes(provider);
  }
  return provider === 'stripe';
}

async function POST({ request }: { request: Request }) {
  const limited = enforceMinIntervalRateLimit(request, {
    intervalMs: 1000,
    keyPrefix: 'checkout',
  });
  if (limited) return limited;

  try {
    const configs = await getAllConfigs();
    const auth = getAuth(configs);
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session?.user) {
      return respErr('Unauthorized');
    }

    const body = await request.json().catch(() => ({}));
    const { product_id, payment_provider, redirect } = body;

    if (!product_id || typeof product_id !== 'string') {
      return respErr('Missing product_id');
    }

    // Look up product in the authoritative server-side catalog.
    // We DO NOT trust price / credits / plan from the request body.
    const product = getPricingProduct(product_id);
    if (!product) {
      return respErr('Unknown product');
    }

    if (configs.video_parse_credits_enabled !== 'true') {
      return respErr('Checkout is not available yet.', { status: 503 });
    }

    if (
      payment_provider !== undefined &&
      typeof payment_provider !== 'string'
    ) {
      return respErr('Invalid payment provider');
    }

    const providerKey =
      payment_provider?.trim() || configs.default_payment_provider?.trim();
    if (!providerKey) {
      return respErr('No payment provider configured.', { status: 503 });
    }
    if (configs[`${providerKey}_enabled`] !== 'true') {
      return respErr('Payment provider is not enabled.', { status: 503 });
    }
    if (!providerSupportsCurrency(providerKey, product.currency)) {
      return respErr('Payment provider does not support this currency.');
    }

    const availableProviders = await getAvailablePaymentProviders();
    if (!availableProviders.includes(providerKey)) {
      return respErr('Payment provider is not fully configured.', {
        status: 503,
      });
    }

    // Build success/cancel URLs — only accept same-origin redirects.
    const baseUrl = configs.app_url || 'http://localhost:3000';
    const safeRedirectPath = safeSameOriginPath(
      redirect,
      '/settings/billing',
      baseUrl
    );
    // Straight to the destination: safeSameOriginPath has already reduced it
    // to a path on this site. The old detour through /auth-callback exists to
    // hand a session token to a desktop client — a browser coming back from
    // checkout is already signed in, and that page isn't part of this app.
    const finalRedirect = `${baseUrl}${safeRedirectPath}`;
    const successUrl = `${baseUrl}/api/payment/callback?redirect=${encodeURIComponent(finalRedirect)}`;
    const cancelUrl = `${baseUrl}/pricing`;

    const checkout = await createCheckout({
      userId: session.user.id,
      userEmail: session.user.email,
      productName: product.productName,
      planName: product.planName,
      credits: product.credits,
      creditsValidDays: product.creditsValidDays,
      paymentOrder: {
        productId: product.productId,
        price: { amount: product.priceInCents, currency: product.currency },
        type: product.type,
        description: product.description,
        successUrl,
        cancelUrl,
        userAgent: request.headers.get('user-agent') || undefined,
        customer: {
          email: session.user.email,
          name: session.user.name,
        },
        plan: product.plan
          ? {
              name: product.plan.name,
              interval: product.plan.interval,
              intervalCount: product.plan.intervalCount,
            }
          : undefined,
      },
      provider: providerKey,
    });

    return respData({ checkout_url: checkout.checkoutInfo.checkoutUrl });
  } catch (error: any) {
    console.error('checkout error:', error);
    return respErr(error.message || 'Checkout failed');
  }
}

export const Route = createFileRoute('/api/payment/checkout')({
  server: {
    handlers: { POST },
  },
});
