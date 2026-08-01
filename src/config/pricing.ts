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
    productName: '轻量次数包',
    planName: '轻量次数包',
    description: '30 次视频号解析，30 天有效',
    type: PaymentType.ONE_TIME,
    priceInCents: 690,
    currency: 'cny',
    credits: 30,
    creditsValidDays: 30,
  },
  creator_pack: {
    productId: 'creator_pack',
    productName: '创作者次数包',
    planName: '创作者次数包',
    description: '150 次视频号解析，90 天有效',
    type: PaymentType.ONE_TIME,
    priceInCents: 1990,
    currency: 'cny',
    credits: 150,
    creditsValidDays: 90,
  },
  studio_pack: {
    productId: 'studio_pack',
    productName: '工作室次数包',
    planName: '工作室次数包',
    description: '600 次视频号解析，180 天有效',
    type: PaymentType.ONE_TIME,
    priceInCents: 5990,
    currency: 'cny',
    credits: 600,
    creditsValidDays: 180,
  },
  creator_monthly: {
    productId: 'creator_monthly',
    productName: '创作者月度版',
    planName: '创作者月度版',
    description: '每月 300 次视频号解析',
    type: PaymentType.SUBSCRIPTION,
    priceInCents: 2990,
    currency: 'cny',
    credits: 300,
    plan: {
      name: '创作者月度版',
      interval: PaymentInterval.MONTH,
      intervalCount: 1,
    },
  },
  studio_monthly: {
    productId: 'studio_monthly',
    productName: '工作室月度版',
    planName: '工作室月度版',
    description: '每月 1200 次视频号解析',
    type: PaymentType.SUBSCRIPTION,
    priceInCents: 7990,
    currency: 'cny',
    credits: 1200,
    plan: {
      name: '工作室月度版',
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
