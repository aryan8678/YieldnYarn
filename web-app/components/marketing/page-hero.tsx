import type { ReactNode } from "react";

import { Spotlight } from "@/components/ui/spotlight";

/** Shared header banner for marketing sub-pages (/verticals, /services, /pricing, /blog). */
export function PageHero({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  children?: ReactNode;
}) {
  return (
    <section className="relative isolate overflow-hidden border-b border-border-muted bg-neutral-950 px-6 pt-24 pb-16 sm:px-10 sm:pt-32 sm:pb-20">
      <Spotlight className="-top-20 left-1/2 -translate-x-1/2" fill="#10B981" />
      <div className="relative z-10 mx-auto max-w-3xl text-center">
        <span className="mx-auto flex w-fit items-center rounded-full bg-neutral-900 px-3 py-1 text-[10px] font-medium tracking-wide text-brand-primary-glow uppercase sm:text-xs">
          {eyebrow}
        </span>
        <h1 className="mt-5 text-4xl leading-[1.05] font-semibold tracking-tight text-natural-white sm:text-5xl">
          {title}
        </h1>
        <p className="mt-5 text-base leading-relaxed text-body sm:text-lg">
          {description}
        </p>
        {children}
      </div>
    </section>
  );
}
