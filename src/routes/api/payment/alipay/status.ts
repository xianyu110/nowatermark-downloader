import { createFileRoute } from '@tanstack/react-router';
import { and, eq, isNull } from 'drizzle-orm';

import { db } from '@/core/db';
import { order } from '@/config/db/schema';
import { handlePaymentCallback } from '@/modules/payment/service';
import { respData, respErr } from '@/lib/resp';

async function GET({ request }: { request: Request }) {
  const url = new URL(request.url);
  const orderNo = url.searchParams.get('order_no');

  if (!orderNo) {
    return respErr('Missing order_no', { status: 400 });
  }

  try {
    await handlePaymentCallback(orderNo);
  } catch (error) {
    console.error('[alipay/status] callback sync failed:', error);
  }

  const [existingOrder] = await db()
    .select({ status: order.status })
    .from(order)
    .where(and(eq(order.orderNo, orderNo), isNull(order.deletedAt)))
    .limit(1);

  if (!existingOrder) {
    return respErr('Order not found', { status: 404 });
  }

  return respData({ status: existingOrder.status });
}

export const Route = createFileRoute('/api/payment/alipay/status')({
  server: {
    handlers: { GET },
  },
});
