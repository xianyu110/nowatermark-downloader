import { and, eq, lt, sql } from 'drizzle-orm';

import { db } from '@/core/db';
import { envConfigs } from '@/config';
import { anonymousUsage } from '@/config/db/schema';

export type AnonymousUsageContext = {
  id: string;
  usageDate: string;
};

function normalizedLimit(limit: number) {
  return Math.max(0, Math.floor(Number(limit) || 0));
}

function getAnonymousClientIdentifier(request: Request) {
  // Cloudflare injects cf-connecting-ip at the edge. Only use forwarded
  // headers as a local-development fallback because clients can forge them.
  return (
    request.headers.get('cf-connecting-ip') ||
    request.headers.get('x-real-ip') ||
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    ''
  );
}

function toHex(buffer: ArrayBuffer) {
  return Array.from(new Uint8Array(buffer), (byte) =>
    byte.toString(16).padStart(2, '0')
  ).join('');
}

export async function getAnonymousUsageContext(
  request: Request
): Promise<AnonymousUsageContext> {
  const usageDate = new Date().toISOString().slice(0, 10);
  const clientIp = getAnonymousClientIdentifier(request);
  const clientIdentifier =
    clientIp || request.headers.get('user-agent') || 'unknown-client';
  const secret = envConfigs.auth_secret || 'local-anonymous-usage-key';
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const signature = await crypto.subtle.sign(
    'HMAC',
    key,
    encoder.encode(`${usageDate}:${clientIdentifier}`)
  );

  return {
    id: `${usageDate}:${toHex(signature).slice(0, 48)}`,
    usageDate,
  };
}

export async function getAnonymousRemaining(
  context: AnonymousUsageContext,
  dailyLimit: number
): Promise<number> {
  const limit = normalizedLimit(dailyLimit);
  if (!limit) return 0;

  const [row] = await db()
    .select({ successfulParses: anonymousUsage.successfulParses })
    .from(anonymousUsage)
    .where(eq(anonymousUsage.id, context.id))
    .limit(1);

  return Math.max(0, limit - (row?.successfulParses || 0));
}

export async function recordAnonymousSuccess(
  context: AnonymousUsageContext,
  dailyLimit: number
): Promise<number | null> {
  const limit = normalizedLimit(dailyLimit);
  if (!limit) return null;

  await db()
    .insert(anonymousUsage)
    .values({
      id: context.id,
      usageDate: context.usageDate,
      successfulParses: 0,
    })
    .onConflictDoNothing({ target: anonymousUsage.id });

  const updatedRows = await db()
    .update(anonymousUsage)
    .set({
      successfulParses: sql`${anonymousUsage.successfulParses} + 1`,
    })
    .where(
      and(
        eq(anonymousUsage.id, context.id),
        lt(anonymousUsage.successfulParses, limit)
      )
    )
    .returning({ successfulParses: anonymousUsage.successfulParses });

  if (!updatedRows.length) return null;
  return Math.max(0, limit - updatedRows[0].successfulParses);
}
