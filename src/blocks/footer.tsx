import { SiteFooter, type FooterColumn } from '@/components/site-footer';

export function Footer() {
  const columns: FooterColumn[] = [
    {
      title: 'Product',
      links: [
        { label: 'Tool', href: '/' },
        { label: 'Plans', href: '/pricing' },
        { label: 'FAQ', href: '/#faq' },
      ],
    },
    {
      title: 'Account',
      links: [
        { label: 'Sign in', href: '/sign-in?callbackUrl=%2F' },
        { label: 'Dashboard', href: '/settings' },
        { label: 'Billing', href: '/settings/billing' },
      ],
    },
    {
      title: 'Legal',
      links: [
        { label: 'User Agreement', href: '/user-agreement' },
        { label: 'Privacy Policy', href: '/privacy-policy' },
        { label: 'Terms of Service', href: '/terms-of-service' },
      ],
    },
    {
      title: 'Contact',
      links: [
        {
          label: 'Support email',
          href: 'mailto:support@nowatermarkdownloader.com',
          external: true,
        },
      ],
    },
  ];

  return (
    <SiteFooter
      tagline="Public video parsing for creators and teams. Use only content you are allowed to process."
      columns={columns}
      socials={[]}
    />
  );
}
