import { createFileRoute } from '@tanstack/react-router';

import { staticPageRouteOptions } from './-static-page';

export const Route = createFileRoute('/(pages)/copyright-policy')(
  staticPageRouteOptions('copyright-policy')
);
