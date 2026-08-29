import Link from "next/link";

import { Spotlight } from "@/components/ui/spotlight";
import { ShimmerButton } from "@/components/ui/shimmer-button";

export function CtaSection() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-16 sm:px-10">
      <div className="relative overflow-hidden rounded-3xl border border-border-muted bg-neutral-950 px-6 py-20 text-center sm:px-16">
        <Spotlight className="-top-32 left-1/2 -translate-x-1/2" fill="#10B981" />
        <h2 className="relative z-10 text-4xl font-semibold tracking-tight text-natural-white md:text-5xl">
          Ready to Transform How India Trades?
        </h2>
        <p className="relative z-10 mx-auto mt-4 max-w-xl text-body">
          Join thousands of MSMEs already trading smarter.
        </p>
        <div className="relative z-10 mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link href="/register">
            <ShimmerButton
              className="px-6 py-3 text-sm font-semibold"
              background="#10B981"
              shimmerColor="#ffffff"
            >
              <span className="text-black">Start Selling</span>
            </ShimmerButton>
          </Link>
          <Link
            href="/verticals"
            className="rounded-full border border-border px-6 py-3 text-sm font-semibold text-natural-white transition-colors hover:border-brand-primary hover:text-brand-primary-glow"
          >
            Browse Catalog
          </Link>
        </div>
      </div>
    </section>
  );
}
