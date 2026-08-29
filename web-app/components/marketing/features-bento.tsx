import { GradingCard } from "@/components/marketing/bento-cards/grading-card";
import { PricingCard } from "@/components/marketing/bento-cards/pricing-card";
import { ReachCard } from "@/components/marketing/bento-cards/reach-card";
import { MatchingCard } from "@/components/marketing/bento-cards/matching-card";
import { DashboardCard } from "@/components/marketing/bento-cards/dashboard-card";

export function FeaturesBento() {
  return (
    <section id="features" className="mx-auto max-w-6xl px-6 py-24 sm:px-10">
      <h2 className="text-center text-4xl font-semibold tracking-tight text-heading md:text-5xl">
        Everything MSMEs Need to Trade Smarter
      </h2>
      <p className="mx-auto mt-4 max-w-2xl text-center text-body">
        One platform for AI-verified quality, live pricing, and multi-seller
        fulfillment — built specifically for India&apos;s producers.
      </p>

      <div className="mt-12 grid grid-cols-1 gap-4 md:grid-cols-[repeat(19,minmax(0,1fr))]">
        <div className="rounded-2xl border border-border bg-surface p-5 md:col-span-6 md:row-span-2">
          <GradingCard />
        </div>
        <div className="rounded-2xl border border-border bg-surface p-5 md:col-span-7">
          <PricingCard />
        </div>
        <div className="rounded-2xl border border-border bg-neutral-950 p-5 md:col-span-6">
          <ReachCard />
        </div>
        <div className="rounded-2xl border border-border bg-surface p-5 md:col-span-10">
          <MatchingCard />
        </div>
        <div className="rounded-2xl border border-border bg-surface p-5 md:col-span-9">
          <DashboardCard />
        </div>
      </div>
    </section>
  );
}
