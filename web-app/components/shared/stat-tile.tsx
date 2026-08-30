import { IconTrendingDown, IconTrendingUp } from "@tabler/icons-react";
import type { ElementType } from "react";

import { cn } from "@/lib/utils";

/**
 * Stat tile: label (sentence case) · value (semibold) · optional signed
 * delta, colored by direction × whether up is good — never color alone,
 * always paired with a trend icon.
 */
export function StatTile({
  label,
  value,
  delta,
  icon: Icon,
}: {
  label: string;
  value: string;
  delta?: { value: string; direction: "up" | "down"; goodDirection?: "up" | "down" };
  icon?: ElementType;
}) {
  const isGood = delta && (delta.goodDirection ?? "up") === delta.direction;
  const DeltaIcon = delta?.direction === "up" ? IconTrendingUp : IconTrendingDown;

  return (
    <div className="rounded-2xl border border-border-muted bg-surface p-5">
      <div className="flex items-center justify-between">
        <span className="text-sm text-body">{label}</span>
        {Icon && (
          <span className="flex size-8 items-center justify-center rounded-lg bg-brand-primary/10 text-brand-primary-glow">
            <Icon size={16} />
          </span>
        )}
      </div>
      <div className="mt-2 flex items-baseline gap-2">
        <span className="text-2xl font-semibold text-heading">{value}</span>
        {delta && (
          <span
            className={cn(
              "flex items-center gap-0.5 text-xs font-medium",
              isGood ? "text-success" : "text-error"
            )}
          >
            <DeltaIcon size={13} />
            {delta.value}
          </span>
        )}
      </div>
    </div>
  );
}
