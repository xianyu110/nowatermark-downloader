import { createFileRoute, Outlet } from '@tanstack/react-router';

import { privatePageHead } from '@/lib/seo';

export const Route = createFileRoute('/(auth)')({
  head: privatePageHead,
  component: () => <Outlet />,
});
