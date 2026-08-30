import Link from "next/link";
import { IconChevronRight } from "@tabler/icons-react";

import { MOCK_VERTICAL_CONFIGS } from "@/lib/mock-data";
import { StatusBadge } from "@/components/shared/status-badge";

export default function AdminVerticalsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-lg font-semibold text-heading">Verticals</h1>
        <p className="text-sm text-body">
          Grading schemas and pricing rules that drive listings in each vertical.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {MOCK_VERTICAL_CONFIGS.map((vertical) => (
          <Link
            key={vertical.id}
            href={`/admin/verticals/${vertical.id}`}
            className="flex flex-col gap-3 rounded-2xl border border-border-muted bg-surface p-5 transition-colors hover:border-brand-primary/40"
          >
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-sm font-semibold text-heading">{vertical.name}</h2>
                <p className="mt-1 text-xs text-body">{vertical.description}</p>
              </div>
              <IconChevronRight size={16} className="mt-0.5 shrink-0 text-muted-2" />
            </div>
            <div className="flex items-center gap-4 border-t border-border-muted pt-3 text-xs text-body">
              <StatusBadge status={vertical.is_active ? "ACTIVE" : "DRAFT"} />
              <span>{vertical.grading_attributes.length} grading attributes</span>
              <span>{vertical.grade_adjustments.length} grade tiers</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
