import { and, count, desc, eq, like, or, type SQL } from 'drizzle-orm';

import { db } from '@/core/db';
import { parseHistory } from '@/config/db/schema';
import { getUuid } from '@/lib/hash';

const MAX_SOURCE_URL_LENGTH = 4000;
const MAX_RESULT_JSON_LENGTH = 200_000;

type ParseResultRecord = Record<string, unknown>;

export type CreateParseHistoryParams = {
  userId: string;
  result: ParseResultRecord;
};

function stringValue(value: unknown, maxLength: number) {
  return typeof value === 'string' ? value.trim().slice(0, maxLength) : '';
}

function parseResultJson(value: string) {
  try {
    const parsed = JSON.parse(value);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

/** Store a successful authenticated parse for the user's later reference. */
export async function createParseHistory({
  userId,
  result,
}: CreateParseHistoryParams) {
  const sourceUrl = stringValue(result.sourceUrl, MAX_SOURCE_URL_LENGTH);
  const mediaUrl = stringValue(
    result.mediaUrl || result.videoUrl,
    MAX_SOURCE_URL_LENGTH
  );
  const resultJson = JSON.stringify(result);
  if (!sourceUrl || !mediaUrl || resultJson.length > MAX_RESULT_JSON_LENGTH) {
    return null;
  }

  const [row] = await db()
    .insert(parseHistory)
    .values({
      id: getUuid(),
      userId,
      sourceUrl,
      platform: stringValue(result.platform, 100),
      title: stringValue(result.title, 500),
      mediaType: stringValue(result.mediaType, 30) || 'video',
      requestedMode: stringValue(result.requestedMode, 30) || 'auto',
      requestedQuality: stringValue(result.requestedQuality, 30) || '1080',
      provider: stringValue(result.provider, 100),
      mediaUrl,
      videoUrl: stringValue(result.videoUrl, MAX_SOURCE_URL_LENGTH) || null,
      coverUrl: stringValue(result.coverUrl, MAX_SOURCE_URL_LENGTH) || null,
      filename: stringValue(result.filename, 500) || null,
      duration:
        typeof result.duration === 'number' && Number.isFinite(result.duration)
          ? Math.max(0, Math.round(result.duration))
          : null,
      resultJson,
    })
    .returning({ id: parseHistory.id });

  return row?.id || null;
}

export async function listParseHistory(
  userId: string,
  page = 1,
  pageSize = 20,
  search = ''
) {
  const safePage = Math.max(1, Math.floor(page));
  const safePageSize = Math.min(50, Math.max(1, Math.floor(pageSize)));
  const conditions: SQL[] = [eq(parseHistory.userId, userId)];
  const normalizedSearch = search.trim().slice(0, 200);
  if (normalizedSearch) {
    conditions.push(
      or(
        like(parseHistory.title, `%${normalizedSearch}%`),
        like(parseHistory.platform, `%${normalizedSearch}%`),
        like(parseHistory.sourceUrl, `%${normalizedSearch}%`)
      ) as SQL
    );
  }

  const where = and(...conditions);
  const [totalResult] = await db()
    .select({ count: count() })
    .from(parseHistory)
    .where(where);
  const rows = await db()
    .select()
    .from(parseHistory)
    .where(where)
    .orderBy(desc(parseHistory.createdAt))
    .limit(safePageSize)
    .offset((safePage - 1) * safePageSize);

  return {
    items: rows.map((row: any) => {
      const { resultJson, ...item } = row;
      return {
        ...item,
        result: parseResultJson(resultJson),
      };
    }),
    total: totalResult?.count || 0,
  };
}

export async function removeParseHistory(params: {
  userId: string;
  id: string;
}) {
  await db()
    .delete(parseHistory)
    .where(
      and(
        eq(parseHistory.id, params.id),
        eq(parseHistory.userId, params.userId)
      )
    );
}

export async function clearParseHistory(userId: string) {
  await db().delete(parseHistory).where(eq(parseHistory.userId, userId));
}
