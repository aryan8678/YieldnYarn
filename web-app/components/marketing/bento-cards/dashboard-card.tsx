export function DashboardCard() {
  return (
    <div className="relative grid h-full grid-cols-1 gap-4 overflow-hidden sm:grid-cols-2">
      <div
        className="pointer-events-none absolute inset-0 opacity-20"
        style={{
          backgroundImage:
            "linear-gradient(#10B98155 1px, transparent 1px), linear-gradient(90deg, #10B98155 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      />
      <div className="relative flex flex-col justify-center">
        <h3 className="text-lg font-semibold text-heading">
          Seller Dashboard &amp; Analytics
        </h3>
        <p className="mt-1 text-sm text-body">
          Track listings, revenue, and reputation with a dashboard built for
          MSME producers.
        </p>
      </div>
      <div className="relative flex flex-col justify-center gap-3">
        <div className="grid grid-cols-3 gap-2">
          {["₹1.2L", "48", "4.8★"].map((stat, i) => (
            <div
              key={i}
              className="rounded-lg border border-border-muted bg-surface px-2 py-2 text-center"
            >
              <p className="text-sm font-semibold text-natural-white">{stat}</p>
              <p className="text-[9px] text-muted-2">
                {["Revenue", "Orders", "Rating"][i]}
              </p>
            </div>
          ))}
        </div>
        <div className="flex h-10 items-end gap-1">
          {[30, 50, 40, 70, 55, 85, 65].map((h, i) => (
            <div
              key={i}
              className="flex-1 rounded-t-sm bg-brand-primary/60"
              style={{ height: `${h}%` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
