/**
 * Authoritative pricing catalog.
 *
 * The checkout API uses this as the SOURCE OF TRUTH for price/credits/duration.
 * Any price, credits, or plan info sent by the client is IGNORED — only the
 * product_id is honored, and everything else is looked up here.
 *
 * To change pricing, edit this file and redeploy. Admin UI cannot alter prices.
 */

import { PaymentInterval, PaymentType } from '@/core/payment/types';

export type PricingPlanInfo = {
  name: string;
  interval: PaymentInterval;
  intervalCount: number;
};

export type PricingProduct = {
  productId: string;
  productName: string;
  planName: string;
  description: string;
  type: PaymentType;
  priceInCents: number;
  currency: string;
  credits: number;
  creditsValidDays?: number;
  plan?: PricingPlanInfo;
};

/** Keys MUST match what the pricing UI sends as product_id. */
export const pricingCatalog: Record<string, PricingProduct> = {
  lite_pack: {
    productId: 'lite_pack',
    productName: 'Starter Credit Pack',
    planName: 'Starter Credit Pack',
    description: '50 successful video parses, valid for 30 days',
    type: PaymentType.ONE_TIME,
    priceInCents: 299,
    currency: 'usd',
    credits: 50,
    creditsValidDays: 30,
  },
  creator_pack: {
    productId: 'creator_pack',
    productName: 'Creator Credit Pack',
    planName: 'Creator Credit Pack',
    description: '300 successful video parses, valid for 90 days',
    type: PaymentType.ONE_TIME,
    priceInCents: 799,
    currency: 'usd',
    credits: 300,
    creditsValidDays: 90,
  },
  studio_pack: {
    productId: 'studio_pack',
    productName: 'Studio Credit Pack',
    planName: 'Studio Credit Pack',
    description: '1,200 successful video parses, valid for 180 days',
    type: PaymentType.ONE_TIME,
    priceInCents: 1999,
    currency: 'usd',
    credits: 1200,
    creditsValidDays: 180,
  },
  creator_monthly: {
    productId: 'creator_monthly',
    productName: 'Creator Monthly',
    planName: 'Creator Monthly',
    description:
      '600 parses per month plus AI transcription, batch parsing, advanced formats, best quality, and API access',
    type: PaymentType.SUBSCRIPTION,
    priceInCents: 999,
    currency: 'usd',
    credits: 600,
    plan: {
      name: 'Creator Monthly',
      interval: PaymentInterval.MONTH,
      intervalCount: 1,
    },
  },
  studio_monthly: {
    productId: 'studio_monthly',
    productName: 'Studio Monthly',
    planName: 'Studio Monthly',
    description:
      '2,400 parses per month plus AI transcription, batch parsing, advanced formats, best quality, and API access',
    type: PaymentType.SUBSCRIPTION,
    priceInCents: 2499,
    currency: 'usd',
    credits: 2400,
    plan: {
      name: 'Studio Monthly',
      interval: PaymentInterval.MONTH,
      intervalCount: 1,
    },
  },
};

export function getPricingProduct(productId: string): PricingProduct | null {
  if (!productId) return null;
  return pricingCatalog[productId] ?? null;
}

export function listPricingProducts(): PricingProduct[] {
  return Object.values(pricingCatalog);
}
