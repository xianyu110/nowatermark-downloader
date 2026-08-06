import { useQuery } from '@tanstack/react-query';

import { apiGet } from '@/lib/api-client';

export type PaidMembership = {
  status: string;
  productId?: string | null;
  planName?: string | null;
  productName?: string | null;
  currentPeriodEnd?: string | null;
  canceledEndAt?: string | null;
};

export function usePaidMembership(enabled: boolean) {
  return useQuery({
    queryKey: ['user-subscription-current'],
    queryFn: () =>
      apiGet<PaidMembership | null>('/api/user/subscriptions/current'),
    enabled,
    staleTime: 60_000,
  });
}
