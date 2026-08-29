import { Spotlight } from "@/components/ui/spotlight";
import { HeroArc } from "@/components/marketing/hero-arc";
import { HeroDots } from "@/components/marketing/hero-dots";
import { HeroBeam } from "@/components/marketing/hero-beam";
import { HeroBadge } from "@/components/marketing/hero-badge";
import { HeroCtaButton } from "@/components/marketing/hero-cta-button";

export function Hero() {
  return (
    <section className="relative isolate overflow-hidden bg-background px-2 pt-6">
      <div className="relative min-h-[92vh] overflow-hidden rounded-3xl border border-border-muted bg-neutral-950">
        <Spotlight className="-top-20 left-0 md:left-40" fill="#10B981" />
        <HeroBeam />
        <HeroDots />
        <HeroArc />

        <div className="relative z-10 mx-auto flex h-full max-w-6xl flex-col justify-center px-6 pt-28 pb-40 sm:px-10">
          <HeroBadge />

          <div className="mt-8 grid grid-cols-1 items-end gap-8 lg:grid-cols-2">
            <h1 className="text-4xl leading-[1.05] font-semibold tracking-tight text-natural-white sm:text-5xl lg:text-6xl">
              The smartest way to trade commodities across India.
            </h1>
            <div className="flex flex-col gap-6">
              <p className="max-w-md text-base leading-relaxed text-body sm:text-lg">
                AI-graded quality. Real-time market pricing. Multi-seller
                order fulfillment. Built for MSME producers and buyers across
                Agriculture and Textiles.
              </p>
              <HeroCtaButton />
            </div>
          </div>
        </div>

        <div className="pointer-events-none absolute inset-x-0 bottom-0 select-none overflow-hidden">
          <span className="block translate-y-1/4 text-center text-[18vw] leading-none font-bold whitespace-nowrap text-white/5 sm:text-[14vw]">
            MSME Marketplace
          </span>
        </div>
      </div>
    </section>
  );
}
