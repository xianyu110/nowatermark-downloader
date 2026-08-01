'use client';

import { CreditCard, Loader2 } from 'lucide-react';

import { m } from '@/paraglide/messages.js';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export type PaymentProvider =
  | 'stripe'
  | 'creem'
  | 'paypal'
  | 'alipay'
  | 'wechat';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  providers: PaymentProvider[];
  loadingProvider?: PaymentProvider | null;
  onSelect: (provider: PaymentProvider) => void;
  planName?: string;
  price?: string;
}

const providerLabel: Record<PaymentProvider, string> = {
  stripe: 'Stripe',
  creem: 'Creem',
  paypal: 'PayPal',
  alipay: 'Alipay',
  wechat: 'WeChat Pay',
};

const providerHint: Partial<Record<PaymentProvider, string>> = {
  alipay: '优先扫码支付，网页支付作为兜底',
};

export function PaymentProviderModal({
  open,
  onOpenChange,
  providers,
  loadingProvider,
  onSelect,
  planName,
  price,
}: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{m['common.pricing.choose_payment']()}</DialogTitle>
          <DialogDescription>
            {planName
              ? price
                ? m['common.pricing.payment_for']({ plan: planName, price })
                : m['common.pricing.payment_for_plan']({ plan: planName })
              : m['common.pricing.choose_payment_desc']()}
          </DialogDescription>
        </DialogHeader>

        <div className="mt-2 space-y-2">
          {providers.map((p) => {
            const loading = loadingProvider === p;
            return (
              <Button
                key={p}
                variant="outline"
                className="h-12 w-full justify-start gap-3"
                disabled={!!loadingProvider}
                onClick={() => onSelect(p)}
              >
                {loading ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <CreditCard className="size-4" />
                )}
                <span className="flex flex-col items-start">
                  <span>{providerLabel[p]}</span>
                  {providerHint[p] && (
                    <span className="text-muted-foreground text-xs">
                      {providerHint[p]}
                    </span>
                  )}
                </span>
              </Button>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}
