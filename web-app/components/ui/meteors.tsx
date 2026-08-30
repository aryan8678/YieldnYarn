"use client";

import React, { useEffect, useState } from "react";

import { cn } from "@/lib/utils";

export const Meteors = ({
  number = 20,
  className,
}: {
  number?: number;
  className?: string;
}) => {
  const [meteorStyles, setMeteorStyles] = useState<
    { top: string; left: string; delay: string; duration: string }[]
  >([]);

  // Math.random() is impure and can't run during render (and shouldn't run
  // on the server, to avoid a hydration mismatch) — an effect is the
  // correct place to generate these one-time decorative positions.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMeteorStyles(
      new Array(number).fill(true).map(() => ({
        top: "-5%",
        left: `${Math.floor(Math.random() * 100)}%`,
        delay: `${Math.random() * 1}s`,
        duration: `${Math.floor(Math.random() * 8 + 2)}s`,
      }))
    );
  }, [number]);

  return (
    <>
      {meteorStyles.map((style, idx) => (
        <span
          key={idx}
          className={cn(
            "animate-meteor pointer-events-none absolute top-1/2 left-1/2 h-0.5 w-0.5 rotate-[215deg] rounded-full bg-brand-primary-glow shadow-[0_0_0_1px_#ffffff10]",
            className
          )}
          style={{
            top: style.top,
            left: style.left,
            animationDelay: style.delay,
            animationDuration: style.duration,
          }}
        >
          <div className="pointer-events-none absolute top-1/2 -z-10 h-px w-[50px] -translate-y-1/2 bg-linear-to-r from-brand-primary-glow to-transparent" />
        </span>
      ))}
    </>
  );
};
