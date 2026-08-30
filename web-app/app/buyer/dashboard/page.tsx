import Link from "next/link";
import {
  IconClipboardList,
  IconPackage,
  IconShoppingBag,
  IconWallet,
} from "@tabler/icons-react";

import { MOCK_ORDERS, MOCK_REQUIREMENTS } from "@/lib/mock-data";
import { StatTile } from "@/components/shared/stat-tile";
import { StatusBadge } from "@/components/shared/status-badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function BuyerDashboardPage() {
  const openRequirements = MOCK_REQUIREMENTS.filter((r) => r.status === "OPEN").length;
  const activeOrders = MOCK_ORDERS.filter((o) => o.status !== "FULFILLED" && o.status !== "CANCELLED").length;
  const totalSpend = MOCK_ORDERS.reduce((sum, o) => sum + o.total_price, 0);
  const recentOrders = [...MOCK_ORDERS]
    .sort((a, b) => (a.created_at < b.created_at ? 1 : -1))
    .slice(0, 5);

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile
          label="Open requirements"
          value={String(openRequirements)}
          icon={IconClipboardList}
        />
        <StatTile
          label="Active orders"
          value={String(activeOrders)}
          icon={IconPackage}
        />
        <StatTile
          label="Total spend"
          value={`₹${totalSpend.toLocaleString("en-IN")}`}
          delta={{ value: "8.4%", direction: "up", goodDirection: "down" }}
          icon={IconWallet}
        />
        <StatTile
          label="Listings in catalog"
          value="6"
          icon={IconShoppingBag}
        />
      </div>

      <div className="rounded-2xl border border-border-muted bg-surface">
        <div className="flex items-center justify-between border-b border-border-muted p-5">
          <h2 className="text-sm font-semibold text-heading">Recent orders</h2>
          <Link
            href="/buyer/orders"
            className="text-xs font-medium text-brand-primary-glow hover:underline"
          >
            View all
          </Link>
        </div>
        <Table>
          <TableHeader>
            <TableRow className="border-border-muted hover:bg-transparent">
              <TableHead className="pl-5">Order</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Sellers</TableHead>
              <TableHead className="pr-5 text-right">Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {recentOrders.map((order) => (
              <TableRow key={order.id} className="border-border-muted">
                <TableCell className="pl-5 font-medium text-heading">#{order.id}</TableCell>
                <TableCell>
                  <StatusBadge status={order.status} />
                </TableCell>
                <TableCell className="text-body">
                  {order.allocations.length} seller{order.allocations.length > 1 ? "s" : ""}
                </TableCell>
                <TableCell className="pr-5 text-right text-heading">
                  ₹{order.total_price.toLocaleString("en-IN")}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <QuickLink
          href="/buyer/catalog"
          title="Browse catalog"
          description="Search active listings across verticals."
        />
        <QuickLink
          href="/buyer/requirements"
          title="Post a requirement"
          description="Let the matching engine find sellers for you."
        />
        <QuickLink
          href="/buyer/estimate"
          title="Estimate a cost"
          description="Get a grade-adjusted price before you commit."
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
