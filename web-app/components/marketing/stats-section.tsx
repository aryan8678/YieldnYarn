import { NumberTicker } from "@/components/ui/number-ticker";

const STATS = [
  { value: 8, suffix: "+", label: "Commodity Verticals" },
  { value: 10000, suffix: "+", label: "MSME Sellers (target)" },
  { value: 50, prefix: "₹", suffix: "Cr+", label: "Monthly Trade Volume (target)" },
  { value: 95, suffix: "%+", label: "Grade Accuracy" },
];

export function StatsSection() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-20 sm:px-10">
      <div className="grid grid-cols-2 gap-8 rounded-2xl border border-border bg-surface p-10 md:grid-cols-4">
        {STATS.map((stat) => (
          <div key={stat.label} className="text-center">
            <p className="flex items-baseline justify-center text-3xl font-semibold text-heading sm:text-4xl">
              {stat.prefix}
              <NumberTicker
                value={stat.value}
                className="text-3xl font-semibold text-heading sm:text-4xl"
              />
              {stat.suffix}
            </p>
            <p className="mt-2 text-sm text-muted-2">{stat.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
