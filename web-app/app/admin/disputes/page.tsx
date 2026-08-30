"use client";

import { useState } from "react";
import { toast } from "sonner";

import { MOCK_DISPUTES, type DisputeStatus, type MockDispute } from "@/lib/mock-data";
import { StatTile } from "@/components/shared/stat-tile";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Field, FieldLabel } from "@/components/ui/field";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function AdminDisputesPage() {
  const [disputes, setDisputes] = useState<MockDispute[]>(MOCK_DISPUTES);
  const [activeDispute, setActiveDispute] = useState<MockDispute | null>(null);
  const [notes, setNotes] = useState("");

  const open = disputes.filter((d) => d.status === "OPEN" || d.status === "UNDER_REVIEW");

  function resolve(status: DisputeStatus) {
    if (!activeDispute) return;
    setDisputes((prev) => prev.map((d) => (d.id === activeDispute.id ? { ...d, status } : d)));
    toast.success(status === "RESOLVED" ? "Dispute resolved." : "Dispute rejected.");
    setActiveDispute(null);
    setNotes("");
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatTile label="Open disputes" value={String(open.length)} />
        <StatTile label="Resolved" value={String(disputes.filter((d) => d.status === "RESOLVED").length)} />
        <StatTile label="Total this month" value={String(disputes.length)} />
      </div>

      <div className="rounded-2xl border border-border-muted bg-surface">
        <div className="border-b border-border-muted p-5">
          <h2 className="text-sm font-semibold text-heading">Disputes</h2>
        </div>
        <Table>
          <TableHeader>
            <TableRow className="border-border-muted hover:bg-transparent">
              <TableHead className="pl-5">Order</TableHead>
              <TableHead>Raised by</TableHead>
              <TableHead>Reason</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="pr-5 text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {disputes.map((dispute) => (
              <TableRow key={dispute.id} className="border-border-muted">
                <TableCell className="pl-5 font-medium text-heading">#{dispute.order_id}</TableCell>
                <TableCell className="text-body">{dispute.raised_by}</TableCell>
                <TableCell className="max-w-xs text-body">{dispute.reason}</TableCell>
                <TableCell>
                  <StatusBadge status={dispute.status} />
                </TableCell>
                <TableCell className="pr-5 text-right">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={dispute.status === "RESOLVED" || dispute.status === "REJECTED"}
                    onClick={() => setActiveDispute(dispute)}
                  >
                    Resolve
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog
        open={activeDispute !== null}
        onOpenChange={(next) => {
          if (!next) {
            setActiveDispute(null);
            setNotes("");
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Order #{activeDispute?.order_id}</DialogTitle>
            <DialogDescription>{activeDispute?.reason}</DialogDescription>
          </DialogHeader>
          <Field>
            <FieldLabel htmlFor="resolution-notes">Resolution notes</FieldLabel>
            <Textarea
              id="resolution-notes"
              placeholder="Summarize how this dispute was resolved…"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </Field>
          <DialogFooter>
            <Button variant="destructive" onClick={() => resolve("REJECTED")}>
              Reject dispute
            </Button>
            <Button onClick={() => resolve("RESOLVED")} disabled={notes.trim().length === 0}>
              Mark resolved
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
