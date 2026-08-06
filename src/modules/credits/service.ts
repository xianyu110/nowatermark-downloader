import { and, asc, desc, eq, gt, gte, isNull, or, sql, sum } from 'drizzle-orm';

import { db } from '@/core/db';
import { envConfigs } from '@/config';
import { credit } from '@/config/db/schema';
import { getSnowId, getUuid } from '@/lib/hash';

// --- Enums ---

export enum CreditStatus {
  ACTIVE = 'active',
  EXPIRED = 'expired',
  DELETED = 'deleted',
}

export enum CreditTransactionType {
  GRANT = 'grant',
  CONSUME = 'consume',
}

export enum CreditTransactionScene {
  PAYMENT = 'payment',
  SUBSCRIPTION = 'subscription',
  RENEWAL = 'renewal',
  GIFT = 'gift',
  REWARD = 'reward',
}

type NewCredit = typeof credit.$inferInsert;

// --- Expiration ---

export function calculateCreditExpirationTime(params: {
  creditsValidDays: number;
  currentPeriodEnd?: Date;
}): Date | null {
  const { creditsValidDays, currentPeriodEnd } = params;

  if (!creditsValidDays || creditsValidDays <= 0) {
    return null; // never expires
  }

  if (currentPeriodEnd) {
    return new Date(currentPeriodEnd.getTime());
  }

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + creditsValidDays);
  return expiresAt;
}

function validCreditConditions(userId: string) {
  const now = new Date();
  return and(
    eq(credit.userId, userId),
    eq(credit.transactionType, CreditTransactionType.GRANT),
    eq(credit.status, CreditStatus.ACTIVE),
    gt(credit.remainingCredits, 0),
    or(isNull(credit.expiresAt), gt(credit.expiresAt, now))
  );
}

// --- Balance ---

export async function getBalance(userId: string): Promise<number> {
  const [result] = await db()
    .select({ total: sum(credit.remainingCredits) })
    .from(credit)
    .where(validCreditConditions(userId));

  return parseInt(result?.total || '0');
}

// --- Grant ---

export async function grant(params: {
  userId: string;
  userEmail?: string;
  credits: number;
  description?: string;
  orderNo?: string;
  subscriptionNo?: string;
  scene?: string;
  expiresAt?: Date | null;
}) {
  const newCredit: NewCredit = {
    id: getUuid(),
    userId: params.userId,
    userEmail: params.userEmail || '',
    transactionNo: getSnowId(),
    transactionType: CreditTransactionType.GRANT,
    transactionScene: params.scene || CreditTransactionScene.GIFT,
    credits: params.credits,
    remainingCredits: params.credits,
    status: CreditStatus.ACTIVE,
    description: params.description || 'Grant credit',
    orderNo: params.orderNo || '',
    subscriptionNo: params.subscriptionNo || '',
    expiresAt: params.expiresAt !== undefined ? params.expiresAt : null,
  };

  await db().insert(credit).values(newCredit);
  return newCredit;
}

// --- Consume (FIFO with batching) ---

export async function consume(params: {
  userId: string;
  userEmail?: string;
  credits: number;
  scene?: string;
  description?: string;
  metadata?: string;
  tx?: any;
}): Promise<{ success: boolean; consumedCredit?: any }> {
  const {
    userId,
    userEmail,
    credits: amount,
    scene,
    description,
    metadata,
    tx,
  } = params;
  const now = new Date();

  if (!Number.isInteger(amount) || amount <= 0) {
    return { success: false };
  }

  const buildConsumedCredit = (consumedItems: any[]): NewCredit => ({
    id: getUuid(),
    userId,
    userEmail: userEmail || '',
    transactionNo: getSnowId(),
    transactionType: CreditTransactionType.CONSUME,
    transactionScene: scene || '',
    status: CreditStatus.ACTIVE,
    description: description || '',
    credits: -amount,
    remainingCredits: 0,
    consumedDetail: JSON.stringify(consumedItems),
    metadata: metadata || '',
  });

  const restoreConsumedItems = async (runner: any, items: any[]) => {
    for (const item of items) {
      await runner
        .update(credit)
        .set({
          remainingCredits: sql`${credit.remainingCredits} + ${item.creditsConsumed}`,
        })
        .where(eq(credit.id, item.creditId));
    }
  };

  const executeD1 = async (runner: any) => {
    let remainingToConsume = amount;
    const consumedItems: any[] = [];
    const maxPasses = 20;

    try {
      for (let pass = 0; pass < maxPasses && remainingToConsume > 0; pass++) {
        const candidates = await runner
          .select()
          .from(credit)
          .where(
            and(
              eq(credit.userId, userId),
              eq(credit.transactionType, CreditTransactionType.GRANT),
              eq(credit.status, CreditStatus.ACTIVE),
              gt(credit.remainingCredits, 0),
              or(isNull(credit.expiresAt), gt(credit.expiresAt, now))
            )
          )
          .orderBy(
            sql`${credit.expiresAt} is null`,
            asc(credit.expiresAt),
            asc(credit.createdAt)
          )
          .limit(100);

        if (!candidates.length) break;

        let progressed = false;
        for (const item of candidates) {
          if (remainingToConsume <= 0) break;
          const toConsume = Math.min(remainingToConsume, item.remainingCredits);
          const updatedRows = await runner
            .update(credit)
            .set({
              remainingCredits: sql`${credit.remainingCredits} - ${toConsume}`,
            })
            .where(
              and(
                eq(credit.id, item.id),
                eq(credit.status, CreditStatus.ACTIVE),
                gte(credit.remainingCredits, toConsume),
                or(isNull(credit.expiresAt), gt(credit.expiresAt, now))
              )
            )
            .returning({ remainingCredits: credit.remainingCredits });

          if (!updatedRows.length) continue;

          const creditsAfter = updatedRows[0].remainingCredits;
          consumedItems.push({
            creditId: item.id,
            transactionNo: item.transactionNo,
            creditsConsumed: toConsume,
            creditsBefore: creditsAfter + toConsume,
            creditsAfter,
          });
          remainingToConsume -= toConsume;
          progressed = true;
        }

        if (!progressed) continue;
      }

      if (remainingToConsume > 0) {
        await restoreConsumedItems(runner, consumedItems);
        return { success: false };
      }

      const consumedCredit = buildConsumedCredit(consumedItems);
      await runner.insert(credit).values(consumedCredit);
      return { success: true, consumedCredit };
    } catch (error) {
      await restoreConsumedItems(runner, consumedItems);
      throw error;
    }
  };

  const execute = async (tx: any) => {
    // 1. Check balance
    const [balance] = await tx
      .select({ total: sum(credit.remainingCredits) })
      .from(credit)
      .where(
        and(
          eq(credit.userId, userId),
          eq(credit.transactionType, CreditTransactionType.GRANT),
          eq(credit.status, CreditStatus.ACTIVE),
          gt(credit.remainingCredits, 0),
          or(isNull(credit.expiresAt), gt(credit.expiresAt, now))
        )
      );

    if (!balance?.total || parseInt(balance.total) < amount) {
      return { success: false };
    }

    // 2. FIFO consumption with batching
    let remainingToConsume = amount;
    const batchSize = 1000;
    const maxBatches = 10;
    let batchNo = 0;
    const consumedItems: any[] = [];

    while (remainingToConsume > 0 && batchNo < maxBatches) {
      const batchCredits = await tx
        .select()
        .from(credit)
        .where(
          and(
            eq(credit.userId, userId),
            eq(credit.transactionType, CreditTransactionType.GRANT),
            eq(credit.status, CreditStatus.ACTIVE),
            gt(credit.remainingCredits, 0),
            or(isNull(credit.expiresAt), gt(credit.expiresAt, now))
          )
        )
        .orderBy(
          sql`${credit.expiresAt} is null`,
          asc(credit.expiresAt),
          asc(credit.createdAt)
        )
        .limit(batchSize)
        .for('update');

      if (!batchCredits || batchCredits.length === 0) break;

      for (const item of batchCredits) {
        if (remainingToConsume <= 0) break;
        const toConsume = Math.min(remainingToConsume, item.remainingCredits);

        await tx
          .update(credit)
          .set({ remainingCredits: item.remainingCredits - toConsume })
          .where(eq(credit.id, item.id));

        consumedItems.push({
          creditId: item.id,
          transactionNo: item.transactionNo,
          creditsConsumed: toConsume,
          creditsBefore: item.remainingCredits,
          creditsAfter: item.remainingCredits - toConsume,
        });

        remainingToConsume -= toConsume;
      }

      batchNo++;
    }

    if (remainingToConsume > 0) {
      await restoreConsumedItems(tx, consumedItems);
      return { success: false };
    }

    // 3. Create consumption record
    const consumedCredit = buildConsumedCredit(consumedItems);
    await tx.insert(credit).values(consumedCredit);

    return { success: true, consumedCredit };
  };

  if (['d1', 'sqlite', 'turso'].includes(envConfigs.database_provider)) {
    return executeD1(tx || db());
  }
  if (tx) return execute(tx);
  return db().transaction(execute);
}

// --- Revoke (restore credits from a consumed record) ---

export async function revoke(consumeCreditId: string) {
  const [consumeRecord] = await db()
    .select()
    .from(credit)
    .where(
      and(
        eq(credit.id, consumeCreditId),
        eq(credit.transactionType, CreditTransactionType.CONSUME),
        eq(credit.status, CreditStatus.ACTIVE)
      )
    )
    .limit(1);

  if (!consumeRecord || !consumeRecord.consumedDetail) return;

  const items = JSON.parse(consumeRecord.consumedDetail);

  await db().transaction(async (tx: any) => {
    // Atomic increment per source grant — no read-modify-write race.
    for (const item of items) {
      await tx
        .update(credit)
        .set({
          remainingCredits: sql`${credit.remainingCredits} + ${item.creditsConsumed}`,
        })
        .where(eq(credit.id, item.creditId));
    }

    // Mark consumption record as deleted
    await tx
      .update(credit)
      .set({ status: CreditStatus.DELETED })
      .where(eq(credit.id, consumeCreditId));
  });
}

// --- Auto-grant for new user ---

export async function grantForNewUser(params: {
  userId: string;
  userEmail?: string;
  configs: Record<string, string>;
}) {
  const { userId, userEmail, configs } = params;

  if (configs.initial_credits_enabled !== 'true') return;

  const credits = parseInt(configs.initial_credits_amount) || 0;
  if (credits <= 0) return;

  const validDays = parseInt(configs.initial_credits_valid_days) || 0;
  const description = configs.initial_credits_description || 'Initial credits';

  const expiresAt = calculateCreditExpirationTime({
    creditsValidDays: validDays,
  });

  return grant({
    userId,
    userEmail,
    credits,
    description,
    scene: CreditTransactionScene.GIFT,
    expiresAt,
  });
}

// --- History ---

export async function getHistory(userId: string, limit = 50) {
  return db()
    .select()
    .from(credit)
    .where(and(eq(credit.userId, userId), isNull(credit.deletedAt)))
    .orderBy(desc(credit.createdAt))
    .limit(limit);
}
