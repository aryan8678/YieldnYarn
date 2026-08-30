import Link from "next/link";
import {
  IconShoppingBag,
  IconPackage,
  IconUsers,
  IconCurrencyRupee,
} from "@tabler/icons-react";

import {
  MOCK_DISPUTES,
  MOCK_PLATFORM_STATS,
  MOCK_VERIFICATION_QUEUE,
} from "@/lib/mock-data";
import { StatTile } from "@/components/shared/stat-tile";
import { PriorityBadge, StatusBadge } from "@/components/shared/status-badge";

export default function AdminDashboardPage() {
  const pendingVerification = MOCK_VERIFICATION_QUEUE.filter((v) => v.status === "PENDING");
  const openDisputes = MOCK_DISPUTES.filter((d) => d.status === "OPEN" || d.status === "UNDER_REVIEW");

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile
          label="Total listings"
          value={MOCK_PLATFORM_STATS.total_listings.toLocaleString("en-IN")}
          icon={IconShoppingBag}
        />
        <StatTile
          label="Total orders"
          value={MOCK_PLATFORM_STATS.total_orders.toLocaleString("en-IN")}
          icon={IconPackage}
        />
        <StatTile
          label="Total users"
          value={MOCK_PLATFORM_STATS.total_users.toLocaleString("en-IN")}
          icon={IconUsers}
        />
        <StatTile
          label="Platform revenue"
          value={`₹${(MOCK_PLATFORM_STATS.revenue / 100000).toFixed(1)}L`}
          delta={{ value: `${MOCK_PLATFORM_STATS.revenue_delta_pct}%`, direction: "up" }}
          icon={IconCurrencyRupee}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-border-muted bg-surface">
          <div className="flex items-center justify-between border-b border-border-muted p-5">
            <h2 className="text-sm font-semibold text-heading">Verification queue</h2>
            <Link
              href="/admin/verification"
              className="text-xs font-medium text-brand-primary-glow hover:underline"
            >
              View all
            </Link>
          </div>
          <ul className="divide-y divide-border-muted">
            {pendingVerification.slice(0, 4).map((item) => (
              <li key={item.id} className="flex items-center justify-between px-5 py-3 text-sm">
                <div>
                  <p className="font-medium text-heading">{item.commodity_name}</p>
                  <p className="text-xs text-body">{item.seller_name}</p>
                </div>
                <PriorityBadge priority={item.priority} />
              </li>
            ))}
            {pendingVerification.length === 0 && (
              <li className="px-5 py-6 text-center text-xs text-muted-2">Queue is empty.</li>
            )}
          </ul>
        </div>

        <div className="rounded-2xl border border-border-muted bg-surface">
          <div className="flex items-center justify-between border-b border-border-muted p-5">
            <h2 className="text-sm font-semibold text-heading">Open disputes</h2>
            <Link
              href="/admin/disputes"
              className="text-xs font-medium text-brand-primary-glow hover:underline"
            >
              View all
            </Link>
          </div>
          <ul className="divide-y divide-border-muted">
            {openDisputes.slice(0, 4).map((dispute) => (
              <li key={dispute.id} className="flex items-center justify-between px-5 py-3 text-sm">
                <div>
                  <p className="font-medium text-heading">Order #{dispute.order_id}</p>
                  <p className="text-xs text-body">{dispute.raised_by}</p>
                </div>
                <StatusBadge status={dispute.status} />
              </li>
            ))}
            {openDisputes.length === 0 && (
              <li className="px-5 py-6 text-center text-xs text-muted-2">No open disputes.</li>
            )}
          </ul>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <QuickLink
          href="/admin/verticals"
          title="Configure verticals"
          description="Edit grading attributes and pricing rules."
        />
        <QuickLink
          href="/admin/users"
          title="Manage users"
          description="Review roles and account status."
        />
        <QuickLink
          href="/admin/pricing"
          title="Enter prices"
          description="Add manual price points for textiles."
        />
      </div>
    </div>
  );
}

function QuickLink({
  href,
  title,
  description,
}: {
  href: string;
  title: string;
  description: string;
}) {
  return (
    <Link
      href={href}
      className="rounded-2xl border border-border-muted bg-surface p-5 transition-colors hover:border-brand-primary/40"
    >
      <h3 className="text-sm font-semibold text-heading">{title}</h3>
      <p className="mt-1 text-xs text-body">{description}</p>
    </Link>
  );
}
