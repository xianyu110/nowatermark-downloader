import { createFileRoute } from '@tanstack/react-router';
import QRCode from 'qrcode';

import { decodeAlipayCheckoutPayload } from '@/core/payment/alipay';

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

async function GET({ request }: { request: Request }) {
  const url = new URL(request.url);
  const payload = url.searchParams.get('payload');

  if (!payload) {
    return new Response('Missing Alipay payload', {
      status: 400,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
  }

  const data = decodeAlipayCheckoutPayload(payload);
  if (!data?.order_no || !data.qr_code) {
    return new Response('Invalid Alipay payload', {
      status: 400,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
  }

  const qrDataUrl = await QRCode.toDataURL(data.qr_code, {
    margin: 1,
    width: 320,
    errorCorrectionLevel: 'M',
  });
  const callbackUrl =
    data.callback_url ||
    `/api/payment/callback?order_no=${encodeURIComponent(data.order_no)}`;
  const statusUrl = `/api/payment/alipay/status?order_no=${encodeURIComponent(
    data.order_no
  )}`;
  const amount = data.total_amount ? `¥${data.total_amount}` : '';
  const subject = data.subject || '支付宝当面付';

  const html = `<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>支付宝扫码支付</title>
    <style>
      body{margin:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#f4f8f7;color:#173d31;min-height:100vh;display:flex;align-items:center;justify-content:center;padding:24px}
      .card{width:min(100%,460px);background:#fff;border:1px solid #d5e8df;border-radius:24px;box-shadow:0 20px 60px rgba(28,86,65,.12);padding:28px}
      .title{margin:0;font-size:28px;line-height:1.2;font-weight:700}
      .desc{margin:10px 0 0;color:#5f7b71;font-size:14px;line-height:1.7}
      .meta{margin-top:18px;display:grid;gap:8px;font-size:13px;color:#5e746c}
      .qr{margin:22px auto 0;width:320px;max-width:100%;padding:16px;background:#f9fcfb;border:1px solid #e1eee7;border-radius:20px}
      .qr img{display:block;width:100%;height:auto}
      .status{margin-top:18px;display:flex;align-items:center;justify-content:center;gap:8px;font-size:14px;color:#0f7f58}
      .status-dot{width:10px;height:10px;border-radius:999px;background:#11a06d;box-shadow:0 0 0 6px rgba(17,160,109,.1)}
      .actions{margin-top:22px;display:flex;gap:12px;flex-wrap:wrap}
      .btn{display:inline-flex;align-items:center;justify-content:center;min-height:42px;padding:0 16px;border-radius:12px;font-size:14px;font-weight:600;text-decoration:none}
      .btn-primary{background:#139162;color:#fff}
      .btn-secondary{border:1px solid #cce1d7;color:#186c4f;background:#fff}
      .footer{margin-top:16px;font-size:12px;line-height:1.6;color:#7c938b}
      code{background:#edf6f1;padding:2px 6px;border-radius:8px}
    </style>
  </head>
  <body>
    <main class="card">
      <h1 class="title">支付宝扫码支付</h1>
      <p class="desc">请使用支付宝扫一扫完成付款。二维码通常有效约 2 小时，支付成功后会自动检查并跳转。</p>
      <div class="meta">
        <div>订单号：<code>${escapeHtml(data.order_no)}</code></div>
        ${amount ? `<div>金额：<strong>${escapeHtml(amount)}</strong></div>` : ''}
        ${subject ? `<div>商品：${escapeHtml(subject)}</div>` : ''}
      </div>
      <div class="qr">
        <img src="${escapeHtml(qrDataUrl)}" alt="支付宝扫码支付二维码" />
      </div>
      <div class="status" id="status-line">
        <span class="status-dot"></span>
        <span id="status-text">等待扫码付款</span>
      </div>
      <div class="actions">
        <a class="btn btn-primary" href="${escapeHtml(callbackUrl)}">我已支付，立即检查</a>
        <button class="btn btn-secondary" type="button" id="retry-btn">重新检查</button>
      </div>
      <p class="footer">如果你已经支付但页面未跳转，点击“重新检查”即可同步订单状态。</p>
    </main>
    <script>
      const callbackUrl = ${JSON.stringify(callbackUrl)};
      const statusUrl = ${JSON.stringify(statusUrl)};
      const statusText = document.getElementById('status-text');
      const retryBtn = document.getElementById('retry-btn');
      let polling = false;

      async function checkPayment() {
        if (polling) return;
        polling = true;
        try {
          const res = await fetch(statusUrl, { cache: 'no-store' });
          const data = await res.json().catch(() => null);
          if (data?.data?.status === 'paid') {
            if (statusText) statusText.textContent = '支付成功，正在跳转…';
            window.location.href = callbackUrl;
            return;
          }
          if (statusText) statusText.textContent = '等待扫码付款';
        } catch {
          if (statusText) statusText.textContent = '检查失败，请重试';
        } finally {
          polling = false;
        }
      }

      if (retryBtn) retryBtn.addEventListener('click', checkPayment);
      checkPayment();
      window.setInterval(checkPayment, 4000);
    </script>
  </body>
</html>`;

  return new Response(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-store, no-cache, must-revalidate',
    },
  });
}

export const Route = createFileRoute('/api/payment/alipay/checkout')({
  server: {
    handlers: { GET },
  },
});
