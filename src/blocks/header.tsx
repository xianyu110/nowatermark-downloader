import { SiteHeader } from '@/components/site-header';

export function Header() {
  const navLinks = [
    { href: '/', label: 'Tool' },
    { href: '/pricing', label: 'Plans' },
    { href: '/#faq', label: 'FAQ' },
  ];

  return <SiteHeader navLinks={navLinks} />;
}
