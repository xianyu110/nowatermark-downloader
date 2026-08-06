import { createFileRoute } from '@tanstack/react-router';

import { getAuth } from '@/core/auth';
import {
  clearParseHistory,
  listParseHistory,
  removeParseHistory,
} from '@/modules/parse-history/service';
import { respErr, respOk, respPage } from '@/lib/resp';

async function getSession(request: Request) {
  const auth = getAuth();
  return auth.api.getSession({ headers: request.headers });
}

async function GET({ request }: { request: Request }) {
  try {
    const session = await getSession(request);
    if (!session?.user) return respErr('Unauthorized');

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const pageSize = parseInt(searchParams.get('pageSize') || '20', 10);
    const search = searchParams.get('search') || '';
    const result = await listParseHistory(
      session.user.id,
      Number.isFinite(page) ? page : 1,
      Number.isFinite(pageSize) ? pageSize : 20,
      search
    );

    return respPage(result.items, result.total);
  } catch (error: any) {
    return respErr(error?.message || 'Failed to load parse history');
  }
}

async function DELETE({ request }: { request: Request }) {
  try {
    const session = await getSession(request);
    if (!session?.user) return respErr('Unauthorized');

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id')?.trim();
    if (searchParams.get('all') === 'true') {
      await clearParseHistory(session.user.id);
    } else if (id) {
      await removeParseHistory({ userId: session.user.id, id });
    } else {
      return respErr('History id is required');
    }

    return respOk();
  } catch (error: any) {
    return respErr(error?.message || 'Failed to delete parse history');
  }
}

export const Route = createFileRoute('/api/user/parse-history')({
  server: {
    handlers: { GET, DELETE },
  },
});
