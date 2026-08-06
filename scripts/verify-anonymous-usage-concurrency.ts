import assert from 'node:assert/strict';
import { eq } from 'drizzle-orm';

import { db } from '@/core/db';
import { anonymousUsage } from '@/config/db/schema';
import { recordAnonymousSuccess } from '@/modules/usage/service';

const context = {
  id: `anonymous-usage-check-${crypto.randomUUID()}`,
  usageDate: '2099-01-01',
};
const dailyLimit = 3;

const results = await Promise.all(
  Array.from({ length: dailyLimit + 1 }, () =>
    recordAnonymousSuccess(context, dailyLimit)
  )
);
const successfulResults = results.filter(
  (remaining): remaining is number => remaining !== null
);
const [row] = await db()
  .select({ successfulParses: anonymousUsage.successfulParses })
  .from(anonymousUsage)
  .where(eq(anonymousUsage.id, context.id))
  .limit(1);

assert.equal(successfulResults.length, dailyLimit);
assert.equal(results.filter((remaining) => remaining === null).length, 1);
assert.equal(Math.min(...successfulResults), 0);
assert.equal(row?.successfulParses, dailyLimit);

console.log(
  JSON.stringify({
    successCount: successfulResults.length,
    rejectedCount: results.length - successfulResults.length,
    remaining: Math.min(...successfulResults),
    recordedUsage: row?.successfulParses,
  })
);
