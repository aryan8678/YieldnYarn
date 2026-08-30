import type { Metadata } from "next";

import { PageHero } from "@/components/marketing/page-hero";
import { SimpleCta } from "@/components/marketing/simple-cta";
import { PricingTiers } from "@/components/marketing/pricing-tiers";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export const metadata: Metadata = {
  title: "Pricing — MSME Marketplace",
  description: "Simple, transparent access to the MSME Marketplace platform.",
};

const FAQS = [
  {
    q: "What happens after the free tier?",
    a: "You keep your listings and history — you just hit the Starter tier's caps (10 listings/month, basic grading). Upgrade to Growth any time to lift them, and downgrade back whenever you want.",
  },
  {
    q: "How does AI grading work?",
    a: "Evidence you upload is run through an OpenCV preprocessing step and a MobileNetV3/YOLOv8n model for every attribute your vertical marks as ML-gradeable. Low-confidence results, and attributes that can't be graded from a photo (like moisture content or GSM), are routed to a human verifier instead.",
  },
  {
    q: "Can I use the platform offline?",
    a: "The seller app is offline-first — create listings and capture evidence with no connection, and they sync automatically once you're back online.",
  },
  {
    q: "What regions are covered?",
    a: "The platform is built for pan-India coverage. Pricing and matching currently focus on the Agriculture and Textiles verticals; more regions and verticals roll out as they're configured.",
  },
  {
    q: "How are disputes resolved?",
    a: "Either party can raise a dispute against an order — grade mismatch, quantity shortage, quality defect, or other — with evidence attached. It's reviewed and resolved in-app, with a full audit trail.",
  },
  {
    q: "What verticals are supported?",
    a: "Agriculture and Textiles are live today. The grading schema and pricing rules are plug-in configurable, so new verticals are a configuration change, not a rebuild.",
  },
];

export default function PricingPage() {
  return (
    <>
      <PageHero
        eyebrow="Pricing"
        title="Simple, Transparent Access"
        description="Start free. Upgrade when your volume outgrows it. No hidden fees, no long-term lock-in."
      />

      <section className="mx-auto max-w-6xl px-6 py-20 sm:px-10">
        <PricingTiers />
      </section>

      <section className="mx-auto max-w-3xl px-6 pb-24 sm:px-10">
        <h2 className="text-center text-3xl font-semibold tracking-tight text-heading sm:text-4xl">
          Frequently asked questions
        </h2>
        <Accordion type="single" collapsible className="mt-10">
          {FAQS.map((faq) => (
            <AccordionItem key={faq.q} value={faq.q} className="border-border-muted">
              <AccordionTrigger className="text-base text-heading hover:no-underline">
                {faq.q}
              </AccordionTrigger>
              <AccordionContent className="text-sm leading-relaxed text-body">
                {faq.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>

      <SimpleCta
        title="Ready to get started?"
        description="Create your first listing or post a requirement in minutes."
        primaryLabel="Start Selling"
        primaryHref="/register"
        secondaryLabel="Talk to Sales"
        secondaryHref="mailto:hello@msmemarketplace.in"
      />
    </>
  );
}
