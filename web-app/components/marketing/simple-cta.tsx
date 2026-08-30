import Link from "next/link";

import { Spotlight } from "@/components/ui/spotlight";
import { ShimmerButton } from "@/components/ui/shimmer-button";

/** Shared bottom-of-page CTA banner, reused across marketing sub-pages with page-specific copy. */
export function SimpleCta({
  title,
  description,
  primaryLabel,
  primaryHref,
  secondaryLabel,
  secondaryHref,
}: {
  title: string;
  description: string;
  primaryLabel: string;
  primaryHref: string;
  secondaryLabel?: string;
  secondaryHref?: string;
}) {
  return (
    <section className="mx-auto max-w-6xl px-6 py-16 sm:px-10">
      <div className="relative overflow-hidden rounded-3xl border border-border-muted bg-neutral-950 px-6 py-16 text-center sm:px-16">
        <Spotlight className="-top-32 left-1/2 -translate-x-1/2" fill="#10B981" />
        <h2 className="relative z-10 text-3xl font-semibold tracking-tight text-natural-white sm:text-4xl">
          {title}
        </h2>
        <p className="relative z-10 mx-auto mt-4 max-w-xl text-body">{description}</p>
        <div className="relative z-10 mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link href={primaryHref}>
            <ShimmerButton
              className="px-6 py-3 text-sm font-semibold"
              background="#10B981"
              shimmerColor="#ffffff"
            >
              <span className="text-black">{primaryLabel}</span>
            </ShimmerButton>
          </Link>
          {secondaryLabel && secondaryHref && (
            <Link
              href={secondaryHref}
              className="rounded-full border border-border px-6 py-3 text-sm font-semibold text-natural-white transition-colors hover:border-brand-primary hover:text-brand-primary-glow"
            >
              {secondaryLabel}
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}
