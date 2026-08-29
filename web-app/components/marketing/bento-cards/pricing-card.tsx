export function PricingCard() {
  return (
    <div className="flex h-full flex-col justify-between gap-4">
      <div className="flex items-center gap-4">
        <div className="relative size-20 shrink-0">
          <svg viewBox="0 0 36 36" className="size-20 -rotate-90">
            <circle cx="18" cy="18" r="15.5" fill="none" stroke="currentColor" strokeWidth="3" className="text-white/10" />
            <circle
              cx="18"
              cy="18"
              r="15.5"
              fill="none"
              stroke="#10B981"
              strokeWidth="3"
              strokeDasharray="97.4"
              strokeDashoffset="26"
              strokeLinecap="round"
            />
          </svg>
          <span className="absolute inset-0 flex items-center justify-center text-sm font-semibold text-natural-white">
            +3.2%
          </span>
        </div>
        <div className="flex-1 rounded-xl border border-border-muted bg-surface px-3 py-2.5">
          <p className="text-[11px] font-medium text-brand-primary-glow">Price Alert</p>
          <p className="mt-0.5 text-xs text-body">
            Wheat ↑ 3.2% in Mandi Jaipur
          </p>
        </div>
      </div>
      <div className="flex h-16 items-end gap-1.5">
        {[40, 55, 45, 65, 60, 80, 70, 90].map((h, i) => (
          <div
            key={i}
            className="flex-1 rounded-t-sm bg-linear-to-t from-brand-primary/30 to-brand-primary-glow"
            style={{ height: `${h}%` }}
          />
        ))}
      </div>
      <div>
        <h3 className="text-lg font-semibold text-heading">Real-time Price Intelligence</h3>
        <p className="mt-1 text-sm text-body">
          Live Agmarknet feeds and grade-adjusted pricing so nobody trades in
          the dark.
        </p>
      </div>
    </div>
  );
}
