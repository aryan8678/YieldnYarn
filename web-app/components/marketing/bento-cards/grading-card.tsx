export function GradingCard() {
  return (
    <div className="flex h-full flex-col">
      <div className="overflow-hidden rounded-xl border border-border bg-neutral-950">
        <div className="flex items-center gap-1.5 border-b border-border px-3 py-2">
          <span className="size-2 rounded-full bg-red-500/70" />
          <span className="size-2 rounded-full bg-yellow-500/70" />
          <span className="size-2 rounded-full bg-green-500/70" />
          <span className="ml-2 text-[10px] text-muted-2">grading.msme.market</span>
        </div>
        <div className="space-y-3 p-4">
          <div className="flex items-center justify-between rounded-lg border border-border-muted bg-surface px-3 py-2">
            <span className="text-xs text-body">wheat_sample_04.jpg</span>
            <span className="rounded-full bg-brand-primary/15 px-2 py-0.5 text-[10px] font-medium text-brand-primary-glow">
              Analyzed
            </span>
          </div>
          {[
            { label: "Moisture", value: 92 },
            { label: "Foreign Matter", value: 88 },
            { label: "Grain Size", value: 95 },
          ].map((row) => (
            <div key={row.label} className="space-y-1">
              <div className="flex justify-between text-[11px] text-muted-2">
                <span>{row.label}</span>
                <span>{row.value}%</span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/5">
                <div
                  className="h-full rounded-full bg-linear-to-r from-brand-primary to-brand-primary-glow"
                  style={{ width: `${row.value}%` }}
                />
              </div>
            </div>
          ))}
          <div className="flex items-center justify-between rounded-lg bg-brand-primary/10 px-3 py-2">
            <span className="text-xs font-medium text-natural-white">Grade A</span>
            <span className="text-[11px] text-brand-primary-glow">96% confidence</span>
          </div>
        </div>
      </div>
      <div className="mt-4">
        <h3 className="text-lg font-semibold text-heading">AI Quality Grading</h3>
        <p className="mt-1 text-sm text-body">
          Upload evidence photos and get instant, auditable grade scores
          across every attribute.
        </p>
      </div>
    </div>
  );
}
