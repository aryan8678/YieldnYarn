"use client";

import Link from "next/link";
import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useScroll,
} from "motion/react";
import { useState } from "react";

import { cn } from "@/lib/utils";

export function FloatingNav({
  navItems,
  className,
  children,
}: {
  navItems: {
    name: string;
    link: string;
  }[];
  className?: string;
  children?: React.ReactNode;
}) {
  const { scrollYProgress } = useScroll();
  const [visible, setVisible] = useState(true);

  useMotionValueEvent(scrollYProgress, "change", (current) => {
    if (typeof current === "number") {
      const direction = current - scrollYProgress.getPrevious()!;

      if (scrollYProgress.get() < 0.05) {
        setVisible(true);
      } else {
        if (direction < 0) {
          setVisible(true);
        } else {
          setVisible(false);
        }
      }
    }
  });

  return (
    <AnimatePresence mode="wait">
      <motion.div
        initial={{ opacity: 1, y: 0 }}
        animate={{
          y: visible ? 0 : -100,
          opacity: visible ? 1 : 0,
        }}
        transition={{ duration: 0.2 }}
        className={cn(
          "fixed inset-x-0 top-4 z-[5000] mx-auto flex max-w-fit items-center justify-center gap-2 rounded-full border border-white/[0.1] bg-black/80 px-4 py-2 shadow-[0px_2px_3px_-1px_rgba(0,0,0,0.1),0px_1px_0px_0px_rgba(25,28,33,0.02),0px_0px_0px_1px_rgba(25,28,33,0.08)] backdrop-blur-md",
          className
        )}
      >
        {navItems.map((navItem, idx) => (
          <Link
            key={`link-${idx}`}
            href={navItem.link}
            className={cn(
              "relative flex items-center space-x-1 px-3 py-1 text-sm text-neutral-300 transition-colors hover:text-white"
            )}
          >
            <span className="text-sm">{navItem.name}</span>
          </Link>
        ))}
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
