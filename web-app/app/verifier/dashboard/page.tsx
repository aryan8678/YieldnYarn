import Link from "next/link";
import { IconChecklist, IconClipboardCheck, IconTargetArrow } from "@tabler/icons-react";

import { MOCK_VERIFICATION_QUEUE } from "@/lib/mock-data";
import { StatTile } from "@/components/shared/stat-tile";
import { StatusBadge, PriorityBadge } from "@/components/shared/status-badge";
import { ConfidenceBar } from "@/components/shared/confidence-bar";

export default function VerifierDashboardPage() {
  const pending = MOCK_VERIFICATION_QUEUE.filter((i) => i.status === "PENDING");
  const reviewed = MOCK_VERIFICATION_QUEUE.filter((i) => i.status !== "PENDING");

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatTile label="Queue count" value={String(pending.length)} icon={IconClipboardCheck} />
        <StatTile label="Reviewed this week" value={String(reviewed.length)} icon={IconChecklist} />
        <StatTile
          label="Accuracy vs. audit"
          value="96.2%"
          delta={{ value: "1.1%", direction: "up" }}
          icon={IconTargetArrow}
        />
      </div>

      <div className="rounded-2xl border border-border-muted bg-surface">
        <div className="flex items-center justify-between border-b border-border-muted p-5">
          <h2 className="text-sm font-semibold text-heading">Next in queue</h2>
          <Link
            href="/verifier/queue"
            className="text-xs font-medium text-brand-primary-glow hover:underline"
          >
            View queue
          </Link>
        </div>
        <ul className="divide-y divide-border-muted">
          {pending.map((item) => (
            <li key={item.id} className="flex items-center justify-between px-5 py-3">
              <div>
                <p className="text-sm font-medium text-heading">{item.commodity_name}</p>
                <p className="text-xs text-body">{item.flagged_reason}</p>
              </div>
              <div className="flex items-center gap-4">
                <ConfidenceBar value={item.ai_confidence} />
                <PriorityBadge priority={item.priority} />
              </div>
            </li>
          ))}
          {pending.length === 0 && (
            <li className="px-5 py-6 text-center text-xs text-muted-2">Queue is empty.</li>
          )}
        </ul>
      </div>

      <div className="rounded-2xl border border-border-muted bg-surface">
        <div className="border-b border-border-muted p-5">
          <h2 className="text-sm font-semibold text-heading">Recent reviews</h2>
        </div>
        <ul className="divide-y divide-border-muted">
          {reviewed.map((item) => (
            <li key={item.id} className="flex items-center justify-between px-5 py-3">
              <div>
                <p className="text-sm font-medium text-heading">{item.commodity_name}</p>
                <p className="text-xs text-body">{item.seller_name}</p>
              </div>
              <StatusBadge status={item.status} />
            </li>
          ))}
          {reviewed.length === 0 && (
            <li className="px-5 py-6 text-center text-xs text-muted-2">No reviews yet.</li>
          )}
        </ul>
      </div>
    </div>
  );
}
