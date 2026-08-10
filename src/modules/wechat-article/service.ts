import TurndownService from 'turndown';

const REQUEST_TIMEOUT_MS = 18_000;
const MAX_INPUT_LENGTH = 4000;

export type WechatArticleImage = {
  url: string;
  alt: string;
};

export type WechatArticleVideo = {
  url: string;
  poster: string;
};

export type WechatArticleResult = {
  url: string;
  title: string;
  account_name: string;
  author: string;
  publish_time: string;
  summary: string;
  content_text: string;
  content_html: string;
  content_markdown: string;
  cover_image: string;
  images: WechatArticleImage[];
  videos: WechatArticleVideo[];
};

export class WechatArticleError extends Error {
  status: number;
  code: string;

  constructor(code: string, message: string, status = 502) {
    super(message);
    this.name = 'WechatArticleError';
    this.code = code;
    this.status = status;
  }
}

function assertWechatUrl(rawUrl: string) {
  if (!rawUrl || rawUrl.length > MAX_INPUT_LENGTH) {
    throw new WechatArticleError(
      'INVALID_URL',
      'Paste a valid WeChat article URL.',
      400
    );
  }

  let url: URL;
  try {
    url = new URL(rawUrl.trim());
  } catch {
    throw new WechatArticleError(
      'INVALID_URL',
      'Paste a valid WeChat article URL.',
      400
    );
  }

  const host = url.hostname.toLowerCase();
  if (url.protocol !== 'https:' || host !== 'mp.weixin.qq.com') {
    throw new WechatArticleError(
      'UNSUPPORTED_URL',
      'Only public mp.weixin.qq.com article links are supported.',
      400
    );
  }

  return url.toString();
}

function decodeEntities(value: string) {
  const named: Record<string, string> = {
    amp: '&',
    apos: "'",
    gt: '>',
    lt: '<',
    nbsp: ' ',
    quot: '"',
  };

  return value
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, code) =>
      String.fromCharCode(parseInt(code, 16))
    )
    .replace(/&([a-z]+);/gi, (_, name) => named[name] || `&${name};`)
    .trim();
}

function stripTags(value: string) {
  return decodeEntities(
    value
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<\/(?:p|div|section|h[1-6]|li)>/gi, '\n')
      .replace(/<style[\s\S]*?<\/style>/gi, '')
      .replace(/<script[\s\S]*?<\/script>/gi, '')
      .replace(/<[^>]+>/g, '')
      .replace(/\u00a0/g, ' ')
      .replace(/[ \t]+\n/g, '\n')
      .replace(/\n{3,}/g, '\n\n')
      .trim()
  );
}

function firstMatch(html: string, patterns: RegExp[]) {
  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match?.[1]) {
      return decodeEntities(
        match[1].replace(/\\"/g, '"').replace(/<[^>]+>/g, '')
      );
    }
  }
  return '';
}

function normalizeWechatImageUrl(value: string) {
  const url = decodeEntities(value).replace(/\\\//g, '/').trim();
  if (!url || url.startsWith('data:')) return '';
  if (!/^https?:\/\//i.test(url)) return '';
  return url;
}

function uniqueByUrl<T extends { url: string }>(items: T[]) {
  const seen = new Set<string>();
  return items.filter((item) => {
    if (!item.url || seen.has(item.url)) return false;
    seen.add(item.url);
    return true;
  });
}

function extractContentHtml(html: string) {
  const start = html.search(/<[^>]+id=["']js_content["'][^>]*>/i);
  if (start < 0) return '';

  const scriptAfter = html.slice(start).search(/<script\b/i);
  const raw =
    scriptAfter > 0
      ? html.slice(start, start + scriptAfter)
      : html.slice(start);
  return raw
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .trim();
}

function extractImages(contentHtml: string) {
  const images: WechatArticleImage[] = [];
  for (const match of contentHtml.matchAll(/<img\b[^>]*>/gi)) {
    const tag = match[0];
    const url =
      firstMatch(tag, [
        /\bdata-src=["']([^"']+)["']/i,
        /\bdatasrc=["']([^"']+)["']/i,
        /\bsrc=["']([^"']+)["']/i,
      ]) || '';
    const normalizedUrl = normalizeWechatImageUrl(url);
    if (!normalizedUrl) continue;
    images.push({
      url: normalizedUrl,
      alt: firstMatch(tag, [/\balt=["']([^"']*)["']/i]),
    });
  }
  return uniqueByUrl(images);
}

function extractVideos(contentHtml: string) {
  const videos: WechatArticleVideo[] = [];
  for (const match of contentHtml.matchAll(
    /<(?:video|source)\b[^>]*(?:src|data-src)=["']([^"']+)["'][^>]*>/gi
  )) {
    const tag = match[0];
    const url = normalizeWechatImageUrl(match[1] || '');
    if (!url || /open\.weixin\.qq\.com\/pcopensdk/i.test(url)) continue;
    videos.push({
      url,
      poster: normalizeWechatImageUrl(
        firstMatch(tag, [/\bposter=["']([^"']+)["']/i])
      ),
    });
  }
  return uniqueByUrl(videos);
}

function looksLikeChallenge(html: string, finalUrl: string) {
  return (
    /wappoc_appmsgcaptcha|appmsgcaptcha|poc_token/i.test(finalUrl) ||
    /wappoc_appmsgcaptcha|appmsgcaptcha|环境异常|访问频繁|请输入验证码/i.test(
      html
    )
  );
}

function parseWechatHtml(html: string, url: string, finalUrl: string) {
  if (looksLikeChallenge(html, finalUrl)) {
    throw new WechatArticleError(
      'WECHAT_CHALLENGE',
      'WeChat returned a verification challenge. Try again later or open the article in a browser.',
      502
    );
  }

  const contentHtml = extractContentHtml(html);
  const contentText = stripTags(contentHtml);
  if (!contentHtml || contentText.length < 20) {
    throw new WechatArticleError(
      'ARTICLE_CONTENT_MISSING',
      'The article content was not exposed to the server parser.',
      502
    );
  }

  const images = extractImages(contentHtml);
  const videos = extractVideos(contentHtml);
  const title = firstMatch(html, [
    /<h1[^>]+id=["']activity-name["'][^>]*>([\s\S]*?)<\/h1>/i,
    /<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i,
    /<title[^>]*>([\s\S]*?)<\/title>/i,
  ]);
  const summary = firstMatch(html, [
    /<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i,
    /<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']+)["']/i,
  ]);

  const turndown = new TurndownService({ headingStyle: 'atx' });
  const contentMarkdown = turndown.turndown(contentHtml).trim();

  return {
    url,
    title,
    account_name: firstMatch(html, [
      /<[^>]+id=["']js_name["'][^>]*>([\s\S]*?)<\/[^>]+>/i,
      /var\s+nickname\s*=\s*["']([^"']+)["']/i,
    ]),
    author: firstMatch(html, [
      /<[^>]+id=["']js_author_name["'][^>]*>([\s\S]*?)<\/[^>]+>/i,
      /var\s+author\s*=\s*["']([^"']+)["']/i,
    ]),
    publish_time: firstMatch(html, [
      /<[^>]+id=["']publish_time["'][^>]*>([\s\S]*?)<\/[^>]+>/i,
      /publish_time["']?\s*:\s*["']([^"']+)["']/i,
    ]),
    summary,
    content_text: contentText,
    content_html: contentHtml,
    content_markdown: contentMarkdown,
    cover_image:
      firstMatch(html, [
        /var\s+msg_cdn_url\s*=\s*["']([^"']+)["']/i,
        /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i,
      ]) ||
      images[0]?.url ||
      '',
    images,
    videos,
  } satisfies WechatArticleResult;
}

export async function extractWechatArticle(rawUrl: string) {
  const url = assertWechatUrl(rawUrl);

  const response = await fetch(url, {
    headers: {
      Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
      'User-Agent':
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
    },
    redirect: 'follow',
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });

  const html = await response.text();
  if (!response.ok) {
    throw new WechatArticleError(
      'WECHAT_FETCH_FAILED',
      `WeChat returned HTTP ${response.status}.`,
      502
    );
  }

  return parseWechatHtml(html, url, response.url || url);
}
