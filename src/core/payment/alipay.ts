import * as crypto from 'crypto';

import {
  CheckoutSession,
  PaymentConfigs,
  PaymentEvent,
  PaymentEventType,
  PaymentInterval,
  PaymentOrder,
  PaymentProvider,
  PaymentSession,
  PaymentStatus,
  SubscriptionCycleType,
  SubscriptionInfo,
  SubscriptionStatus,
  WebhookIgnoredError,
} from './types';

/**
 * Alipay payment provider configs
 * @docs https://opendocs.alipay.com/open/
 */
export interface AlipayConfigs extends PaymentConfigs {
  appId: string;
  privateKey: string; // RSA2 private key (PKCS1 or PKCS8)
  alipayPublicKey: string; // Alipay public key for signature verification
  signType?: 'RSA2' | 'RSA';
  returnUrl?: string; // redirect after payment
  notifyUrl?: string; // webhook notify URL
}

export const ALIPAY_GATEWAY_URL = 'https://openapi.alipay.com/gateway.do';
export const ALIPAY_QR_CHECKOUT_PATH = '/api/payment/alipay/checkout';
const ALIPAY_CHARSET = 'UTF-8';

export function encodeAlipayCheckoutPayload(
  params: Record<string, string>
): string {
  return Buffer.from(JSON.stringify(params), 'utf8').toString('base64url');
}

export function decodeAlipayCheckoutPayload(
  payload: string
): Record<string, string> | null {
  try {
    const parsed = JSON.parse(
      Buffer.from(payload, 'base64url').toString('utf8')
    );
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      return null;
    }

    const result: Record<string, string> = {};
    for (const [key, value] of Object.entries(parsed)) {
      if (typeof value !== 'string') return null;
      result[key] = value;
    }
    return result;
  } catch {
    return null;
  }
}

export function buildAlipayRedirectUrl(params: Record<string, string>): string {
  return `/api/payment/alipay/redirect?payload=${encodeURIComponent(
    encodeAlipayCheckoutPayload(params)
  )}`;
}

function splitAlipayRequestParams(params: Record<string, string>) {
  const { biz_content: bizContent, ...publicParams } = params;
  const bodyParams: Record<string, string> = {};
  if (bizContent) {
    bodyParams.biz_content = bizContent;
  }

  return { publicParams, bodyParams };
}

function buildAlipayGatewayUrl(params: Record<string, string>): string {
  const url = new URL(ALIPAY_GATEWAY_URL);
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== '') {
      url.searchParams.set(key, value);
    }
  }
  return url.toString();
}

export function buildAlipayQrCheckoutUrl(
  params: Record<string, string>
): string {
  return `${ALIPAY_QR_CHECKOUT_PATH}?payload=${encodeURIComponent(
    encodeAlipayCheckoutPayload(params)
  )}`;
}

export function renderAlipayRedirectHtml(
  params: Record<string, string>,
  gateway: string = ALIPAY_GATEWAY_URL
): string {
  const { publicParams, bodyParams } = splitAlipayRequestParams(params);
  const inputs = Object.entries(bodyParams)
    .map(
      ([key, value]) =>
        `<input type="hidden" name="${escapeHtml(key)}" value="${escapeHtml(value)}" />`
    )
    .join('');
  const actionUrl = buildAlipayGatewayUrl(publicParams || {});

  return `<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>正在跳转支付宝支付</title>
    <style>
      body{margin:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#f4f8f7;color:#19312b;display:flex;align-items:center;justify-content:center;min-height:100vh}
      .card{background:#fff;border:1px solid #d8e8e2;border-radius:20px;box-shadow:0 20px 60px rgba(28,86,65,.12);padding:32px 28px;max-width:420px;text-align:center}
      .title{font-size:20px;font-weight:700;line-height:1.3;margin:0 0 10px}
      .desc{font-size:14px;line-height:1.7;color:#5f7b71;margin:0}
    </style>
  </head>
  <body>
    <div class="card">
      <p class="title">正在跳转到支付宝支付</p>
      <p class="desc">如果页面没有自动跳转，请点击继续。</p>
      <form id="alipay-form" action="${escapeHtml(actionUrl || gateway)}" method="post">
        ${inputs}
        <button type="submit" style="display:none">submit</button>
      </form>
      <script>
        const form = document.getElementById('alipay-form');
        if (form) form.submit();
      </script>
    </div>
  </body>
</html>`;
}

/**
 * Alipay payment provider implementation
 * @docs https://opendocs.alipay.com/open/028r8t
 */
export class AlipayProvider implements PaymentProvider {
  readonly name = 'alipay';
  configs: AlipayConfigs;

  constructor(configs: AlipayConfigs) {
    this.configs = configs;
  }

  /**
   * Create payment — generates Alipay PC payment page URL
   * Uses alipay.trade.page.pay for desktop or alipay.trade.wap.pay for mobile
   */
  async createPayment({
    order,
  }: {
    order: PaymentOrder;
  }): Promise<CheckoutSession> {
    if (!order.price) {
      throw new Error('Price is required for Alipay payment');
    }

    const outTradeNo = order.orderNo || `ALI${Date.now()}`;
    const totalAmount = (order.price.amount / 100).toFixed(2); // Convert cents to yuan
    const isMobile = this.isMobileUserAgent(order.userAgent);
    const method = isMobile ? 'alipay.trade.wap.pay' : 'alipay.trade.page.pay';

    const bizContent = {
      out_trade_no: outTradeNo,
      total_amount: totalAmount,
      subject: order.description || 'Her Subscription',
      product_code: isMobile ? 'QUICK_WAP_WAY' : 'FAST_INSTANT_TRADE_PAY',
      // Pass metadata as passback_params for webhook identification
      passback_params: order.metadata
        ? encodeURIComponent(JSON.stringify(order.metadata))
        : undefined,
    };

    const params = this.buildRequestParams(method, bizContent);

    // Add return_url — append order_no so callback can query status
    const baseReturnUrl = order.successUrl || this.configs.returnUrl || '';
    if (baseReturnUrl) {
      const sep = baseReturnUrl.includes('?') ? '&' : '?';
      params.return_url = `${baseReturnUrl}${sep}order_no=${outTradeNo}`;
    }
    if (this.configs.notifyUrl) {
      params.notify_url = this.configs.notifyUrl;
    }

    // Sign the params
    const signedParams = this.signParams(params);
    const pageCheckoutUrl = buildAlipayRedirectUrl(signedParams);

    try {
      const qrResult = await this.execute('alipay.trade.precreate', {
        out_trade_no: outTradeNo,
        total_amount: totalAmount,
        subject: order.description || 'Her Subscription',
        product_code: 'FACE_TO_FACE_PAYMENT',
        passback_params: order.metadata
          ? encodeURIComponent(JSON.stringify(order.metadata))
          : undefined,
      });
      const qrResponse = qrResult.alipay_trade_precreate_response;
      if (qrResponse?.code === '10000' && qrResponse.qr_code) {
        const qrCheckoutUrl = buildAlipayQrCheckoutUrl({
          order_no: outTradeNo,
          qr_code: qrResponse.qr_code,
          subject: order.description || 'Her Subscription',
          total_amount: totalAmount,
          callback_url: order.successUrl || this.configs.returnUrl || '',
        });

        return {
          provider: this.name,
          checkoutParams: {
            ...signedParams,
            precreate: qrResult,
          },
          checkoutInfo: {
            sessionId: outTradeNo,
            checkoutUrl: qrCheckoutUrl,
          },
          checkoutResult: {
            outTradeNo,
            totalAmount,
            qrCode: qrResponse.qr_code,
            flow: 'precreate',
          },
          metadata: order.metadata || {},
        };
      }
    } catch {
      // Fallback to the browser redirect flow below.
    }

    return {
      provider: this.name,
      checkoutParams: signedParams,
      checkoutInfo: {
        sessionId: outTradeNo,
        checkoutUrl: pageCheckoutUrl,
      },
      checkoutResult: { outTradeNo, totalAmount },
      metadata: order.metadata || {},
    };
  }

  /**
   * Get payment session by querying Alipay trade status
   */
  async getPaymentSession({
    sessionId,
  }: {
    sessionId: string;
  }): Promise<PaymentSession> {
    const bizContent = {
      out_trade_no: sessionId,
    };

    const result = await this.execute('alipay.trade.query', bizContent);
    const response = result.alipay_trade_query_response;

    if (!response || response.code !== '10000') {
      throw new Error(
        response?.sub_msg || response?.msg || 'Query payment failed'
      );
    }

    return {
      provider: this.name,
      paymentStatus: this.mapAlipayStatus(response.trade_status),
      paymentInfo: {
        transactionId: response.trade_no,
        amount: Math.round(parseFloat(response.total_amount) * 100),
        currency: 'cny',
        paymentAmount: Math.round(
          parseFloat(response.buyer_pay_amount || response.total_amount) * 100
        ),
        paymentCurrency: 'cny',
        paymentUserId: response.buyer_user_id,
        paymentEmail: response.buyer_logon_id,
        paidAt: response.send_pay_date
          ? new Date(response.send_pay_date)
          : undefined,
      },
      paymentResult: response,
      metadata: response.passback_params
        ? JSON.parse(decodeURIComponent(response.passback_params))
        : undefined,
    };
  }

  /**
   * Handle Alipay async notification (webhook)
   */
  async getPaymentEvent({ req }: { req: Request }): Promise<PaymentEvent> {
    const body = await req.text();
    const params = Object.fromEntries(new URLSearchParams(body));

    // Verify signature
    if (!this.verifySignature(params)) {
      throw new Error('Invalid Alipay notification signature');
    }

    const tradeStatus = params.trade_status;
    let eventType: PaymentEventType;

    switch (tradeStatus) {
      case 'TRADE_SUCCESS':
      case 'TRADE_FINISHED':
        eventType = PaymentEventType.PAYMENT_SUCCESS;
        break;
      case 'TRADE_CLOSED':
        eventType = PaymentEventType.PAYMENT_FAILED;
        break;
      default:
        throw new WebhookIgnoredError(
          `Unhandled Alipay trade status: ${tradeStatus}`
        );
    }

    const metadata = params.passback_params
      ? JSON.parse(decodeURIComponent(params.passback_params))
      : undefined;

    const paymentSession: PaymentSession = {
      provider: this.name,
      paymentStatus:
        eventType === PaymentEventType.PAYMENT_SUCCESS
          ? PaymentStatus.SUCCESS
          : PaymentStatus.FAILED,
      paymentInfo: {
        transactionId: params.trade_no,
        amount: Math.round(parseFloat(params.total_amount) * 100),
        currency: 'cny',
        paymentAmount: Math.round(
          parseFloat(params.buyer_pay_amount || params.total_amount) * 100
        ),
        paymentCurrency: 'cny',
        paymentUserId: params.buyer_id,
        paymentEmail: params.buyer_logon_id,
        paidAt: params.gmt_payment ? new Date(params.gmt_payment) : undefined,
      },
      paymentResult: params,
      metadata,
    };

    return {
      eventType,
      eventResult: params,
      paymentSession,
    };
  }

  // ─── Internal helpers ────────────────────────────────────────────────────────

  /**
   * Execute an Alipay API call
   */
  private async execute(method: string, bizContent: any): Promise<any> {
    const params = this.buildRequestParams(method, bizContent);
    if (this.configs.notifyUrl) {
      params.notify_url = this.configs.notifyUrl;
    }

    const signedParams = this.signParams(params);
    const { publicParams, bodyParams } = splitAlipayRequestParams(signedParams);
    const gatewayUrl = buildAlipayGatewayUrl(publicParams);

    const response = await fetch(gatewayUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
      },
      body: new URLSearchParams(bodyParams).toString(),
    });

    return await response.json();
  }

  /**
   * Build common request parameters
   */
  private buildRequestParams(
    method: string,
    bizContent: any
  ): Record<string, string> {
    return {
      app_id: this.configs.appId,
      method,
      format: 'JSON',
      charset: ALIPAY_CHARSET,
      sign_type: this.configs.signType || 'RSA2',
      timestamp: this.formatTimestamp(new Date()),
      version: '1.0',
      biz_content: JSON.stringify(bizContent),
    };
  }

  /**
   * Sign parameters with RSA2
   */
  private signParams(params: Record<string, string>): Record<string, string> {
    // Sort params alphabetically and build sign string
    const sortedKeys = Object.keys(params)
      .filter((k) => k !== 'sign' && k !== 'sign_type')
      .sort();
    const signStr = sortedKeys
      .filter((k) => params[k] !== undefined && params[k] !== '')
      .map((k) => `${k}=${params[k]}`)
      .join('&');

    const algorithm =
      (this.configs.signType || 'RSA2') === 'RSA2'
        ? 'SHA256withRSA'
        : 'SHA1withRSA';

    const sign = crypto
      .createSign(algorithm === 'SHA256withRSA' ? 'RSA-SHA256' : 'RSA-SHA1')
      .update(signStr, 'utf-8')
      .sign(this.normalizePrivateKey(this.configs.privateKey), 'base64');

    return { ...params, sign };
  }

  /**
   * Verify Alipay notification signature
   */
  private verifySignature(params: Record<string, string>): boolean {
    const sign = params.sign;
    const signType = params.sign_type || this.configs.signType || 'RSA2';

    if (!sign) return false;

    // Build verification string (exclude sign and sign_type)
    const sortedKeys = Object.keys(params)
      .filter((k) => k !== 'sign' && k !== 'sign_type')
      .sort();
    const signStr = sortedKeys
      .filter((k) => params[k] !== undefined && params[k] !== '')
      .map((k) => `${k}=${params[k]}`)
      .join('&');

    const algorithm = signType === 'RSA2' ? 'RSA-SHA256' : 'RSA-SHA1';

    return crypto
      .createVerify(algorithm)
      .update(signStr, 'utf-8')
      .verify(
        this.normalizePublicKey(this.configs.alipayPublicKey),
        sign,
        'base64'
      );
  }

  private mapAlipayStatus(status: string): PaymentStatus {
    switch (status) {
      case 'TRADE_SUCCESS':
      case 'TRADE_FINISHED':
        return PaymentStatus.SUCCESS;
      case 'TRADE_CLOSED':
        return PaymentStatus.CANCELED;
      case 'WAIT_BUYER_PAY':
        return PaymentStatus.PROCESSING;
      default:
        return PaymentStatus.PROCESSING;
    }
  }

  private formatTimestamp(date: Date): string {
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
  }

  private isMobileUserAgent(userAgent?: string): boolean {
    if (!userAgent) return false;
    return /Android|iPhone|iPad|iPod|Mobile/i.test(userAgent);
  }

  private normalizePrivateKey(key: string): string {
    const normalized = key.replace(/\\n/g, '\n').trim();
    if (normalized.includes('-----BEGIN')) return normalized;
    return `-----BEGIN RSA PRIVATE KEY-----\n${normalized}\n-----END RSA PRIVATE KEY-----`;
  }

  private normalizePublicKey(key: string): string {
    const normalized = key.replace(/\\n/g, '\n').trim();
    if (normalized.includes('-----BEGIN')) return normalized;
    return `-----BEGIN PUBLIC KEY-----\n${normalized}\n-----END PUBLIC KEY-----`;
  }
}

/**
 * Create Alipay provider with configs
 */
export function createAlipayProvider(configs: AlipayConfigs): AlipayProvider {
  return new AlipayProvider(configs);
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
