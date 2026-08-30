"use client";

import { useState } from "react";
import Link from "next/link";
import { IconCheck } from "@tabler/icons-react";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { ShimmerButton } from "@/components/ui/shimmer-button";

type Billing = "monthly" | "annual";

const TIERS = [
  {
    name: "Starter",
    priceMonthly: 0,
    tagline: "Try the platform, no commitment.",
    features: [
      "10 listings / month",
      "Basic AI grading (80% threshold)",
      "Price intelligence — view only",
      "Manual matching",
      "Community support",
      "1 vertical",
    ],
    cta: "Start Free",
    href: "/register",
    highlighted: false,
  },
  {
    name: "Growth",
    priceMonthly: 999,
    tagline: "For sellers and buyers trading regularly.",
    features: [
      "Unlimited listings",
      "Full AI grading, configurable threshold",
      "Price alerts + trend history",
      "Auto-allocation (5 / month)",
      "Priority email support",
      "2 verticals",
    ],
    cta: "Start Growth",
    href: "/register?plan=growth",
    highlighted: true,
  },
  {
    name: "Enterprise",
    priceMonthly: null,
    tagline: "For high-volume traders and API integrations.",
    features: [
      "Unlimited listings",
      "Full grading + custom models",
      "Full price intelligence API access",
      "Unlimited allocation",
      "Dedicated support + SLA",
      "All verticals",
    ],
    cta: "Talk to Sales",
    href: "mailto:hello@msmemarketplace.in",
    highlighted: false,
  },
];

export function PricingTiers() {
  const [billing, setBilling] = useState<Billing>("monthly");

  return (
    <div>
      <div className="mx-auto flex w-fit items-center gap-1 rounded-full border border-border bg-surface p-1">
        {(["monthly", "annual"] as const).map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => setBilling(option)}
            className={cn(
              "rounded-full px-4 py-1.5 text-sm font-medium capitalize transition-colors",
              billing === option
                ? "bg-brand-primary text-black"
                : "text-body hover:text-natural-white"
            )}
          >
            {option}
            {option === "annual" && (
              <span className="ml-1.5 text-[10px] font-semibold text-brand-primary-glow">
                −20%
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-3">
        {TIERS.map((tier) => {
          const price =
            tier.priceMonthly === null
              ? null
              : billing === "annual"
                ? Math.round(tier.priceMonthly * 0.8)
                : tier.priceMonthly;

          return (
            <div
              key={tier.name}
              className={cn(
                "relative flex flex-col rounded-2xl border p-8",
                tier.highlighted
                  ? "border-brand-primary bg-neutral-950 shadow-[0_0_0_1px_rgba(16,185,129,0.3)]"
                  : "border-border-muted bg-surface"
              )}
            >
              {tier.highlighted && (
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-brand-primary text-black">
                  Most Popular
                </Badge>
              )}

              <h3 className="text-lg font-semibold text-heading">{tier.name}</h3>
              <p className="mt-1 text-sm text-body">{tier.tagline}</p>

              <div className="mt-6 flex items-baseline gap-1">
                {price === null ? (
                  <span className="text-3xl font-semibold text-heading">Custom</span>
                ) : price === 0 ? (
                  <span className="text-3xl font-semibold text-heading">Free</span>
                ) : (
                  <>
                    <span className="text-3xl font-semibold text-heading">₹{price}</span>
                    <span className="text-sm text-muted-2">/mo</span>
                  </>
                )}
              </div>

              <ul className="mt-6 flex flex-1 flex-col gap-3">
                {tier.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-sm text-body">
                    <IconCheck size={16} className="mt-0.5 shrink-0 text-brand-primary-glow" />
                    {feature}
                  </li>
                ))}
              </ul>

              {tier.highlighted ? (
                <Link href={tier.href} className="mt-8">
                  <ShimmerButton
                    className="w-full px-4 py-2.5 text-sm font-semibold"
                    background="#10B981"
                    shimmerColor="#ffffff"
                  >
                    <span className="text-black">{tier.cta}</span>
                  </ShimmerButton>
                </Link>
              ) : (
                <Link
                  href={tier.href}
                  className="mt-8 rounded-lg border border-border px-4 py-2.5 text-center text-sm font-semibold text-natural-white transition-colors hover:border-brand-primary hover:text-brand-primary-glow"
                >
                  {tier.cta}
                </Link>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
