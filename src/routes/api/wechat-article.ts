import { createFileRoute } from '@tanstack/react-router';

import {
  extractWechatArticle,
  WechatArticleError,
} from '@/modules/wechat-article/service';
import { enforceMinIntervalRateLimit } from '@/lib/rate-limit';
import { respData, respErr } from '@/lib/resp';

async function POST({ request }: { request: Request }) {
  const limited = enforceMinIntervalRateLimit(request, {
    intervalMs: 1500,
    keyPrefix: 'wechat-article',
  });
  if (limited) return limited;

  const body = await request.json().catch(() => ({}));
  const url = typeof body?.url === 'string' ? body.url.trim() : '';

  try {
    const result = await extractWechatArticle(url);
    return respData(result, {
      headers: { 'Cache-Control': 'no-store' },
    });
  } catch (error) {
    if (error instanceof WechatArticleError) {
      return respErr(error.message, { status: error.status });
    }
    console.error('[wechat/article] failed', error);
    return respErr('Failed to parse this WeChat article.', { status: 502 });
  }
}

export const Route = createFileRoute('/api/wechat-article')({
  server: { handlers: { POST } },
});
