import type { Metadata } from "next";
import Link from "next/link";
import {
  IconArrowRight,
  IconSettings,
  IconApple,
  IconPalette,
  IconTree,
  IconFlask,
  IconRecycle,
} from "@tabler/icons-react";

import { PageHero } from "@/components/marketing/page-hero";
import { SimpleCta } from "@/components/marketing/simple-cta";
import { WobbleCard } from "@/components/ui/wobble-card";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "Verticals — MSME Marketplace",
  description:
    "Explore the commodity verticals live on MSME Marketplace today, and the ones coming next.",
};

const ACTIVE_VERTICALS = [
  {
    name: "Agriculture",
    href: "/buyer/catalog?vertical=agriculture",
    description:
      "Grain, pulses, and produce — graded on foreign matter, moisture, and standard quality bands, priced against live mandi data.",
    commodities: ["Wheat", "Rice", "Pulses", "Cotton (raw)", "Spices"],
    grading: ["Foreign matter (AI)", "Moisture content", "Grade standard"],
    className: "bg-gradient-to-br from-emerald-900/40 via-neutral-900 to-neutral-950",
  },
  {
    name: "Textiles",
    href: "/buyer/catalog?vertical=textiles",
    description:
      "Fabric and yarn — graded on defect rate via computer vision, with GSM and thread count entered by verified sellers.",
    commodities: ["Cotton fabric", "Yarn", "Grey cloth", "Dyed textiles"],
    grading: ["Defect rate (AI)", "GSM", "Thread count"],
    className: "bg-gradient-to-br from-amber-900/30 via-neutral-900 to-neutral-950",
  },
];

const COMING_SOON = [
  { name: "Basic Engineering", icon: IconSettings },
  { name: "Food Processing", icon: IconApple },
  { name: "Handicrafts", icon: IconPalette },
  { name: "Wood & Timber", icon: IconTree },
  { name: "Chemicals", icon: IconFlask },
  { name: "Plastics & Packaging", icon: IconRecycle },
];

export default function VerticalsPage() {
  return (
    <>
      <PageHero
        eyebrow="Commodity Verticals"
        title="Our Commodity Verticals"
        description="Every vertical plugs into the same grading, pricing, and matching engine — just with its own attributes and rules. Two are live today; more are on the way."
      />

      <section className="mx-auto max-w-6xl px-6 py-20 sm:px-10">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {ACTIVE_VERTICALS.map((vertical) => (
            <WobbleCard key={vertical.name} containerClassName={vertical.className}>
              <div className="flex h-full flex-col justify-between gap-8">
                <div>
                  <Badge className="bg-brand-primary/15 text-brand-primary-glow">
                    Live
                  </Badge>
                  <h2 className="mt-4 text-2xl font-semibold text-heading sm:text-3xl">
                    {vertical.name}
                  </h2>
                  <p className="mt-3 max-w-md text-sm leading-relaxed text-body">
                    {vertical.description}
                  </p>

                  <div className="mt-6 flex flex-wrap gap-2">
                    {vertical.commodities.map((c) => (
                      <span
                        key={c}
                        className="rounded-full border border-border-muted bg-black/30 px-3 py-1 text-xs text-natural-white/80"
                      >
                        {c}
                      </span>
                    ))}
                  </div>

                  <dl className="mt-6 grid grid-cols-1 gap-1.5 text-xs text-muted-2 sm:grid-cols-2">
                    {vertical.grading.map((g) => (
                      <div key={g} className="flex items-center gap-1.5">
                        <span className="size-1 rounded-full bg-brand-primary-glow" />
                        {g}
                      </div>
                    ))}
                  </dl>
                </div>

                <Link
                  href={vertical.href}
                  className="group inline-flex w-fit items-center gap-1.5 text-sm font-semibold text-natural-white transition-colors hover:text-brand-primary-glow"
                >
                  Explore listings
                  <IconArrowRight
                    size={16}
                    className="transition-transform group-hover:translate-x-1"
                  />
                </Link>
              </div>
            </WobbleCard>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-20 sm:px-10">
        <h2 className="text-2xl font-semibold tracking-tight text-heading sm:text-3xl">
          Coming soon
        </h2>
        <p className="mt-2 max-w-xl text-sm text-body">
          The vertical schema is plug-in configurable — each new sector is a
          grading + pricing config, not a rebuild.
        </p>

        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3">
          {COMING_SOON.map(({ name, icon: Icon }) => (
            <div
              key={name}
              className="flex flex-col items-start gap-3 rounded-2xl border border-border-muted bg-surface/50 p-5 opacity-70 grayscale transition-opacity hover:opacity-90"
            >
              <span className="flex size-9 items-center justify-center rounded-full bg-white/5 text-muted-2">
                <Icon size={18} />
              </span>
              <span className="text-sm font-medium text-natural-white/80">
                {name}
              </span>
              <Badge variant="outline" className="text-[10px] text-muted-2">
                Coming Soon
              </Badge>
            </div>
          ))}
        </div>
      </section>

      <SimpleCta
        title="Want your vertical added?"
        description="We're onboarding new commodity sectors based on demand. Tell us what you trade."
        primaryLabel="Contact Us"
        primaryHref="mailto:hello@msmemarketplace.in"
        secondaryLabel="View Services"
        secondaryHref="/services"
      />
    </>
  );
}
