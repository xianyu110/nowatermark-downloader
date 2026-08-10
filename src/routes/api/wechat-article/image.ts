import { createFileRoute } from '@tanstack/react-router';

import { respErr } from '@/lib/resp';

const REQUEST_TIMEOUT_MS = 15_000;

function isAllowedWechatImageUrl(rawUrl: string) {
  let url: URL;
  try {
    url = new URL(rawUrl);
  } catch {
    return false;
  }

  if (url.protocol !== 'https:') return false;

  const host = url.hostname.toLowerCase();
  return (
    host.endsWith('qpic.cn') ||
    host.endsWith('qlogo.cn') ||
    host.endsWith('qq.com') ||
    host.endsWith('gtimg.com')
  );
}

async function GET({ request }: { request: Request }) {
  const url = new URL(request.url).searchParams.get('url')?.trim() || '';
  if (!url) return respErr('Missing url', { status: 400 });
  if (!isAllowedWechatImageUrl(url)) {
    return respErr('Unsupported image url', { status: 400 });
  }

  try {
    const upstream = await fetch(url, {
      headers: {
        Accept: 'image/avif,image/webp,image/apng,image/*,*/*;q=0.8',
        'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
        Referer: 'https://mp.weixin.qq.com/',
        'User-Agent':
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
      },
      redirect: 'follow',
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });

    if (!upstream.ok) {
      return respErr(`Image fetch failed with HTTP ${upstream.status}`, {
        status: 502,
      });
    }

    const contentType = upstream.headers.get('content-type') || '';
    if (!contentType.startsWith('image/')) {
      return respErr('Upstream response was not an image', { status: 502 });
    }

    const headers = new Headers();
    headers.set('Content-Type', contentType);
    headers.set('Cache-Control', 'public, max-age=86400, s-maxage=604800');
    headers.set('X-Content-Type-Options', 'nosniff');

    const cacheControl = upstream.headers.get('cache-control');
    if (cacheControl) headers.set('X-Upstream-Cache-Control', cacheControl);

    return new Response(upstream.body, {
      headers,
      status: 200,
    });
  } catch (error) {
    console.error('[wechat/article/image] proxy failed', error);
    return respErr('Failed to proxy image', { status: 502 });
  }
}

export const Route = createFileRoute('/api/wechat-article/image')({
  server: { handlers: { GET } },
});
