"use client";

import Link from "next/link";
import { useState } from "react";
import { IconMenu2, IconX, IconLeaf } from "@tabler/icons-react";

import { cn } from "@/lib/utils";
import { NAV_LINKS, SITE_NAME } from "@/lib/constants";

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-4 z-50 mx-auto w-[calc(100%-2rem)] max-w-6xl px-0">
      <nav className="flex items-center justify-between rounded-full border border-border bg-black/70 px-4 py-2.5 shadow-lg shadow-black/40 backdrop-blur-md">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex size-8 items-center justify-center rounded-full bg-brand-primary/15 text-brand-primary-glow">
            <IconLeaf size={18} stroke={2} />
          </span>
          <span className="text-sm font-semibold tracking-tight text-natural-white">
            {SITE_NAME}
          </span>
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-full px-3 py-1.5 text-sm font-medium text-natural-white/80 transition-colors hover:bg-white/5 hover:text-natural-white"
            >
              {item.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/login"
            className="hidden text-sm font-medium text-natural-white/70 transition-colors hover:text-natural-white sm:block"
          >
            Log In
          </Link>
          <GetStartedButton />
          <button
            type="button"
            className="ml-1 flex size-9 items-center justify-center rounded-full border border-border text-natural-white md:hidden"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Toggle navigation menu"
          >
            {mobileOpen ? <IconX size={18} /> : <IconMenu2 size={18} />}
          </button>
        </div>
      </nav>

      {mobileOpen && (
        <div className="mt-2 flex flex-col gap-1 rounded-2xl border border-border bg-black/90 p-4 backdrop-blur-md md:hidden">
          {NAV_LINKS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-lg px-3 py-2 text-sm font-medium text-natural-white/80 hover:bg-white/5"
              onClick={() => setMobileOpen(false)}
            >
              {item.label}
            </Link>
          ))}
          <Link
            href="/login"
            className="rounded-lg px-3 py-2 text-sm font-medium text-natural-white/80 hover:bg-white/5"
            onClick={() => setMobileOpen(false)}
          >
            Log In
          </Link>
        </div>
      )}
    </header>
  );
}

function GetStartedButton() {
  return (
    <Link
      href="/register"
      className={cn(
        "group relative flex items-center overflow-hidden rounded-full bg-brand-primary px-4 py-2 text-xs font-semibold text-black sm:text-sm"
      )}
    >
      <span className="relative z-10 transition-transform duration-300 group-hover:-translate-x-2">
        Get Started
      </span>
      <span className="relative z-10 ml-0 w-0 overflow-hidden transition-all duration-300 group-hover:ml-1 group-hover:w-4">
        →
      </span>
    </Link>
  );
}
