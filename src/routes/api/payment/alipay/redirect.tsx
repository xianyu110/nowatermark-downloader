import { createFileRoute } from '@tanstack/react-router';

import {
  ALIPAY_GATEWAY_URL,
  decodeAlipayCheckoutPayload,
  renderAlipayRedirectHtml,
} from '@/core/payment/alipay';

async function GET({ request }: { request: Request }) {
  const url = new URL(request.url);
  const payload = url.searchParams.get('payload');

  if (!payload) {
    return new Response('Missing Alipay payload', {
      status: 400,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
  }

  const params = decodeAlipayCheckoutPayload(payload);
  if (!params) {
    return new Response('Invalid Alipay payload', {
      status: 400,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
  }

  return new Response(renderAlipayRedirectHtml(params, ALIPAY_GATEWAY_URL), {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-store, no-cache, must-revalidate',
    },
  });
}

export const Route = createFileRoute('/api/payment/alipay/redirect')({
  server: {
    handlers: { GET },
  },
});
