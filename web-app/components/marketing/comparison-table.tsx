import {
  IconChartBar,
  IconCoin,
  IconPackage,
  IconWorld,
  IconShieldCheck,
  IconMessageCircle,
  IconBolt,
} from "@tabler/icons-react";

const ROWS = [
  {
    icon: IconChartBar,
    category: "Quality Assurance",
    msme: "AI-verified grading with full audit trail",
    traditional: "Manual inspection, no standardized records",
  },
  {
    icon: IconCoin,
    category: "Pricing",
    msme: "Real-time market data, grade-adjusted algorithms",
    traditional: "Opaque, middleman-dependent pricing",
  },
  {
    icon: IconPackage,
    category: "Order Fulfillment",
    msme: "Multi-seller auto-allocation in one click",
    traditional: "Single supplier or manual sourcing",
  },
  {
    icon: IconWorld,
    category: "Market Reach",
    msme: "Pan-India digital marketplace",
    traditional: "Local mandi, limited buyer pool",
  },
  {
    icon: IconShieldCheck,
    category: "Trust",
    msme: "Reputation scoring + dispute resolution",
    traditional: "Word of mouth, no formal recourse",
  },
  {
    icon: IconMessageCircle,
    category: "Communication",
    msme: "Real-time notifications, in-app tracking",
    traditional: "Phone calls, no status tracking",
  },
  {
    icon: IconBolt,
    category: "Scalability",
    msme: "8+ verticals via plug-in configuration",
    traditional: "One commodity, one region",
  },
];

export function ComparisonTable() {
  return (
    <section className="bg-offwhite py-24">
      <div className="mx-auto max-w-5xl px-6 sm:px-10">
        <h2 className="text-center text-4xl font-semibold tracking-tight text-neutral-900 md:text-5xl">
          MSME Marketplace vs. Traditional Trading
        </h2>

        <div className="mt-12 overflow-x-auto rounded-2xl border border-neutral-200 bg-white">
          <table className="w-full min-w-[640px] border-collapse text-left">
            <thead>
              <tr className="border-b border-neutral-200">
                <th className="w-1/4 px-6 py-4 text-sm font-medium text-neutral-500">
                  Category
                </th>
                <th className="w-3/8 px-6 py-4 text-sm font-medium text-emerald-700">
                  ✅ MSME Marketplace
                </th>
                <th className="w-3/8 px-6 py-4 text-sm font-medium text-amber-600">
                  ⚠️ Traditional Trading
                </th>
              </tr>
            </thead>
            <tbody>
              {ROWS.map((row) => (
                <tr
                  key={row.category}
                  className="border-b border-neutral-100 transition-colors last:border-none hover:bg-neutral-50"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-sm font-medium text-neutral-800">
                      <row.icon size={16} className="text-emerald-600" />
                      {row.category}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-neutral-700">
                    {row.msme}
                  </td>
                  <td className="px-6 py-4 text-sm text-neutral-500">
                    {row.traditional}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
