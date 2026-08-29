export const SITE_NAME = "MSME Marketplace";

export const NAV_LINKS = [
  { label: "Verticals", href: "/verticals" },
  { label: "Services", href: "/services" },
  { label: "Pricing", href: "/pricing" },
  { label: "Blog", href: "/blog" },
] as const;

export const FOOTER_LINKS = {
  platform: [
    { label: "Verticals", href: "/verticals" },
    { label: "Services", href: "/services" },
    { label: "Pricing", href: "/pricing" },
    { label: "For Sellers", href: "/services#sellers" },
    { label: "For Buyers", href: "/services#buyers" },
  ],
  resources: [
    { label: "Blog", href: "/blog" },
    { label: "API Docs", href: "/services#api" },
    { label: "Support", href: "/blog" },
  ],
  legal: [
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms of Service", href: "/terms" },
    { label: "Contact", href: "/blog" },
  ],
} as const;

export const SOCIAL_LINKS = [
  { label: "Twitter", href: "https://twitter.com" },
  { label: "LinkedIn", href: "https://linkedin.com" },
  { label: "GitHub", href: "https://github.com" },
] as const;
