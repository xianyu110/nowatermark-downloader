import assert from 'node:assert/strict';
import { and, eq } from 'drizzle-orm';

import { db } from '@/core/db';
import { envConfigs } from '@/config';
import { credit, user } from '@/config/db/schema';
import {
  consume,
  CreditTransactionType,
  getBalance,
  grant,
} from '@/modules/credits/service';
import { getUuid } from '@/lib/hash';

if (envConfigs.database_provider !== 'sqlite') {
  throw new Error('verify:credits requires DATABASE_PROVIDER=sqlite');
}

const userId = getUuid();
const email = `credit-check-${userId}@example.invalid`;

await db().insert(user).values({
  id: userId,
  name: 'Credit concurrency check',
  email,
});
await grant({
  userId,
  userEmail: email,
  credits: 1,
  description: 'Test grant',
});

const results = await Promise.all([
  consume({ userId, userEmail: email, credits: 1, scene: 'test' }),
  consume({ userId, userEmail: email, credits: 1, scene: 'test' }),
]);
const successCount = results.filter((result) => result.success).length;
const balance = await getBalance(userId);
const consumptionRows = await db()
  .select({ id: credit.id })
  .from(credit)
  .where(
    and(
      eq(credit.userId, userId),
      eq(credit.transactionType, CreditTransactionType.CONSUME)
    )
  );

assert.equal(successCount, 1, 'exactly one concurrent consume must succeed');
assert.equal(balance, 0, 'credit balance must not become negative');
assert.equal(
  consumptionRows.length,
  1,
  'only one consumption record should be written'
);

console.log(
  JSON.stringify({
    successCount,
    balance,
    consumeRecords: consumptionRows.length,
  })
);
