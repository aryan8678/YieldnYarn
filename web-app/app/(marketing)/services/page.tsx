import type { Metadata } from "next";
import {
  IconScan,
  IconChartLine,
  IconRoute2,
  IconUpload,
  IconTargetArrow,
  IconTruckDelivery,
  IconSearch,
  IconGitCompare,
  IconBuildingWarehouse,
} from "@tabler/icons-react";

import { PageHero } from "@/components/marketing/page-hero";
import { SimpleCta } from "@/components/marketing/simple-cta";
import { StickyScroll } from "@/components/ui/sticky-scroll-reveal";

export const metadata: Metadata = {
  title: "Services — MSME Marketplace",
  description:
    "The three engines behind MSME Marketplace: AI quality grading, real-time price intelligence, and smart multi-seller matching.",
};

const SERVICE_CONTENT = [
  {
    title: "AI Grading Engine",
    description:
      "Sellers upload photos or video of their produce or fabric. The FastAPI grading service runs OpenCV preprocessing and a MobileNetV3/YOLOv8n model on every attribute flagged `gradeable_by_ml` in that vertical's schema — foreign matter in grain, defect rate in fabric. Attributes below the confidence threshold, or not gradeable by ML at all (moisture, GSM, thread count), route to a human verifier queue instead of blocking the listing.",
    content: (
      <div className="flex h-full flex-col items-center justify-center gap-3 p-6 text-brand-primary-glow">
        <IconScan size={40} stroke={1.5} />
        <span className="text-center text-xs text-natural-white/70">
          Upload → preprocess → model → confidence → verifier
        </span>
      </div>
    ),
  },
  {
    title: "Price Intelligence",
    description:
      "Base prices are pulled from live market feeds (Agmarknet for agriculture, admin-entered for textiles) and adjusted for a listing's confirmed grade and quantity tier. Buyers get a real-time cost estimate before they commit; sellers see where their price sits against the region's current market — no more guessing, no more middleman opacity.",
    content: (
      <div className="flex h-full flex-col items-center justify-center gap-3 p-6 text-brand-primary-glow">
        <IconChartLine size={40} stroke={1.5} />
        <span className="text-center text-xs text-natural-white/70">
          Market feed → grade adjustment → quantity tier → estimate
        </span>
      </div>
    ),
  },
  {
    title: "Smart Matching & Allocation",
    description:
      "A buyer posts a requirement — quantity, minimum grade, max price, region. The matching engine filters active listings by grade and radius, sorts by grade-adjusted unit price, and greedily allocates across sellers (tie-broken by reputation score) until the requirement is filled. One requirement can become an order spanning multiple sellers, with a full breakdown of who supplied what at what price.",
    content: (
      <div className="flex h-full flex-col items-center justify-center gap-3 p-6 text-brand-primary-glow">
        <IconRoute2 size={40} stroke={1.5} />
        <span className="text-center text-xs text-natural-white/70">
          Requirement → filter → rank → multi-seller allocation
        </span>
      </div>
    ),
  },
];

const SELLER_STEPS = [
  { icon: IconUpload, title: "List", description: "Create a listing: commodity, quantity, and evidence photos." },
  { icon: IconScan, title: "Get graded", description: "AI grades gradeable attributes; the rest go to a verifier." },
  { icon: IconChartLine, title: "Price it", description: "See a suggested, grade-adjusted price against live market data." },
  { icon: IconTruckDelivery, title: "Fulfill", description: "Get matched into buyer orders and track fulfillment." },
];

const BUYER_STEPS = [
  { icon: IconSearch, title: "Browse or post", description: "Search the catalog, or post a requirement for the engine to match." },
  { icon: IconGitCompare, title: "Compare", description: "Filter by grade, price, region, and seller reputation." },
  { icon: IconTargetArrow, title: "Get matched", description: "Multi-seller allocation fills your requirement at the best price." },
  { icon: IconBuildingWarehouse, title: "Receive", description: "Track the order end-to-end, with disputes handled in-app." },
];

export default function ServicesPage() {
  return (
    <>
      <PageHero
        eyebrow="Platform Services"
        title="Platform Services"
        description="Three engines, one plug-in architecture. Here's how grading, pricing, and matching actually work under the hood."
      />

      <section className="mx-auto max-w-5xl px-6 py-20 sm:px-10">
        <StickyScroll content={SERVICE_CONTENT} />
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-24 sm:px-10">
        <h2 className="text-center text-3xl font-semibold tracking-tight text-heading sm:text-4xl">
          How It Works
        </h2>

        <div className="mt-12 grid grid-cols-1 gap-12 lg:grid-cols-2">
          <StepList label="For Sellers" steps={SELLER_STEPS} />
          <StepList label="For Buyers" steps={BUYER_STEPS} />
        </div>
      </section>

      <SimpleCta
        title="See it running on real listings"
        description="Browse the live verticals to see grading, pricing, and matching end-to-end."
        primaryLabel="Explore Verticals"
        primaryHref="/verticals"
        secondaryLabel="View Pricing"
        secondaryHref="/pricing"
      />
    </>
  );
}

function StepList({
  label,
  steps,
}: {
  label: string;
  steps: { icon: React.ElementType; title: string; description: string }[];
}) {
  return (
    <div>
      <h3 className="font-mono text-xs font-medium tracking-wide text-brand-primary-glow uppercase">
        {label}
      </h3>
      <ol className="mt-6 flex flex-col gap-6">
        {steps.map((step, idx) => (
          <li key={step.title} className="flex gap-4">
            <div className="flex flex-col items-center">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-full border border-border bg-surface text-brand-primary-glow">
                <step.icon size={16} stroke={1.75} />
              </span>
              {idx < steps.length - 1 && (
                <span className="mt-1 w-px flex-1 bg-border-muted" />
              )}
            </div>
            <div className="pb-2">
              <p className="text-sm font-semibold text-heading">{step.title}</p>
              <p className="mt-1 text-sm text-body">{step.description}</p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
