export function MatchingCard() {
  return (
    <div className="grid h-full grid-cols-1 gap-4 sm:grid-cols-2">
      <div className="flex flex-col justify-center">
        <h3 className="text-lg font-semibold text-heading">Smart Order Matching</h3>
        <p className="mt-1 text-sm text-body">
          Post a requirement and let the engine auto-allocate across multiple
          sellers for the best fulfillment.
        </p>
      </div>
      <div className="flex flex-col justify-center gap-3">
        <div className="rounded-xl border border-border-muted bg-surface px-3 py-2.5 text-xs text-body">
          Need 100 quintals Grade A wheat, UP region
        </div>
        <div className="rounded-xl border border-brand-primary/30 bg-brand-primary/10 px-3 py-2.5">
          <p className="text-xs font-medium text-natural-white">
            3 sellers matched
          </p>
          <p className="mt-0.5 text-[11px] text-brand-primary-glow">
            Best price ₹2,450/qtl
          </p>
          <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
            <div className="h-full w-4/5 rounded-full bg-brand-primary" />
          </div>
        </div>
      </div>
    </div>
  );
}
