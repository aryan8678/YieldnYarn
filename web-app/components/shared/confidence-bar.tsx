import { cn } from "@/lib/utils";

/**
 * Single-hue magnitude bar for an AI confidence score. The label carries the
 * number in text ink — the bar's fill is the only thing wearing the data color.
 */
export function ConfidenceBar({
  value,
  className,
}: {
  /** 0–1 */
  value: number;
  className?: string;
}) {
  const pct = Math.round(value * 100);
  const tone = value >= 0.8 ? "bg-success" : value >= 0.6 ? "bg-warning" : "bg-error";

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="h-1.5 w-20 overflow-hidden rounded-full bg-muted">
        <div className={cn("h-full rounded-full", tone)} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs tabular-nums text-body">{pct}%</span>
    </div>
  );
}
