import Link from "next/link";
import { IconLeaf, IconBrandTwitter, IconBrandLinkedin, IconBrandGithub } from "@tabler/icons-react";

import { FOOTER_LINKS, SITE_NAME, SOCIAL_LINKS } from "@/lib/constants";

const SOCIAL_ICONS = {
  Twitter: IconBrandTwitter,
  LinkedIn: IconBrandLinkedin,
  GitHub: IconBrandGithub,
};

export function Footer() {
  return (
    <footer className="border-t border-border-muted bg-background">
      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-4">
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center gap-2">
              <span className="flex size-8 items-center justify-center rounded-full bg-brand-primary/15 text-brand-primary-glow">
                <IconLeaf size={18} stroke={2} />
              </span>
              <span className="text-sm font-semibold text-natural-white">
                {SITE_NAME}
              </span>
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted-2">
              Empowering India&apos;s producers with AI-powered commodity
              trading.
            </p>
          </div>

          <FooterColumn title="Platform" links={FOOTER_LINKS.platform} />
          <FooterColumn title="Resources" links={FOOTER_LINKS.resources} />
          <FooterColumn title="Legal" links={FOOTER_LINKS.legal} />
        </div>

        <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-border-muted pt-8 sm:flex-row">
          <p className="text-xs text-muted-2">
            © {new Date().getFullYear()} {SITE_NAME}. All rights reserved.
          </p>
          <div className="flex items-center gap-3">
            {SOCIAL_LINKS.map((social) => {
              const Icon = SOCIAL_ICONS[social.label as keyof typeof SOCIAL_ICONS];
              return (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={social.label}
                  className="flex size-8 items-center justify-center rounded-full border border-border-muted text-muted-2 transition-colors hover:border-brand-primary hover:text-brand-primary-glow"
                >
                  <Icon size={15} />
                </a>
              );
            })}
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({
  title,
  links,
}: {
  title: string;
  links: readonly { label: string; href: string }[];
}) {
  return (
    <div>
      <h4 className="font-mono text-xs font-medium tracking-wide text-natural-white uppercase">
        {title}
      </h4>
      <ul className="mt-4 flex flex-col gap-3">
        {links.map((link) => (
          <li key={link.label}>
            <Link
              href={link.href}
              className="text-sm text-muted-2 transition-colors hover:text-natural-white"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
