"use client";

import { useState } from "react";

import { MOCK_VERIFICATION_QUEUE, type MockVerificationItem, type VerificationStatus } from "@/lib/mock-data";
import { StatTile } from "@/components/shared/stat-tile";
import { StatusBadge, PriorityBadge } from "@/components/shared/status-badge";
import { ConfidenceBar } from "@/components/shared/confidence-bar";
import { ReviewDialog } from "@/components/verification/review-dialog";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function AdminVerificationPage() {
  const [items, setItems] = useState<MockVerificationItem[]>(MOCK_VERIFICATION_QUEUE);
  const [activeItem, setActiveItem] = useState<MockVerificationItem | null>(null);

  const pending = items.filter((i) => i.status === "PENDING");
  const highPriority = pending.filter((i) => i.priority === "HIGH");

  function handleResolve(id: number, status: VerificationStatus) {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, status } : i)));
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatTile label="Pending review" value={String(pending.length)} />
        <StatTile label="High priority" value={String(highPriority.length)} />
        <StatTile label="Resolved today" value={String(items.length - pending.length)} />
      </div>

      <div className="rounded-2xl border border-border-muted bg-surface">
        <div className="border-b border-border-muted p-5">
          <h2 className="text-sm font-semibold text-heading">Verification queue</h2>
          <p className="text-xs text-body">Shared with the verifier console — highest priority first.</p>
        </div>
        <Table>
          <TableHeader>
            <TableRow className="border-border-muted hover:bg-transparent">
              <TableHead className="pl-5">Listing</TableHead>
              <TableHead>Vertical</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>AI grade</TableHead>
              <TableHead>Confidence</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="pr-5 text-right">Review</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[...items]
              .sort((a, b) => (a.priority === b.priority ? 0 : a.priority === "HIGH" ? -1 : 1))
              .map((item) => (
                <TableRow key={item.id} className="border-border-muted">
                  <TableCell className="pl-5">
                    <p className="font-medium text-heading">{item.commodity_name}</p>
                    <p className="text-xs text-muted-2">{item.seller_name}</p>
                  </TableCell>
                  <TableCell className="text-body capitalize">{item.vertical}</TableCell>
                  <TableCell>
                    <PriorityBadge priority={item.priority} />
                  </TableCell>
                  <TableCell className="text-body">{item.ai_grade}</TableCell>
                  <TableCell>
                    <ConfidenceBar value={item.ai_confidence} />
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={item.status} />
                  </TableCell>
                  <TableCell className="pr-5 text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={item.status !== "PENDING"}
                      onClick={() => setActiveItem(item)}
                    >
                      Review
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </div>

      <ReviewDialog
        item={activeItem}
        open={activeItem !== null}
        onOpenChange={(open) => !open && setActiveItem(null)}
        onResolve={handleResolve}
      />
    </div>
  );
}
