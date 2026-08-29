"use client";

import Link from "next/link";
import { IconArrowRight, IconLeaf } from "@tabler/icons-react";

export function HeroCtaButton() {
  return (
    <Link
      href="/register"
      className="group relative inline-flex w-fit items-center overflow-hidden rounded-full bg-brand-primary px-6 py-3 text-sm font-semibold text-black transition-colors hover:bg-brand-primary-hover"
    >
      <span
        data-slot="button-box"
        className="absolute left-2 grid size-5 grid-cols-3 grid-rows-3 place-items-center gap-0.5 transition-all duration-400 group-hover:left-[calc(100%-1.75rem)] group-hover:rotate-180"
      >
        {Array.from({ length: 9 }).map((_, i) => (
          <span
            key={i}
            className="size-0.75 rounded-full bg-black/70"
            style={{ opacity: [1, 3, 5, 7].includes(i) ? 1 : 0.3 }}
          />
        ))}
        <span className="absolute inset-0 flex items-center justify-center opacity-0 blur-sm transition-all duration-300 group-hover:opacity-100 group-hover:blur-0">
          <IconLeaf size={12} className="text-black" />
        </span>
      </span>
      <span className="ml-6 transition-transform duration-300 group-hover:-translate-x-2 group-hover:ml-4">
        Start Trading
      </span>
      <IconArrowRight
        size={16}
        className="ml-2 transition-transform duration-300 group-hover:translate-x-1"
      />
    </Link>
  );
}
