"use client";

import { useState } from "react";
import { IconCheck, IconEdit, IconX } from "@tabler/icons-react";
import { toast } from "sonner";

import type { MockVerificationItem, VerificationStatus } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Field, FieldLabel } from "@/components/ui/field";
import { ConfidenceBar } from "@/components/shared/confidence-bar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

type Action = "CONFIRMED" | "OVERRIDDEN" | "REJECTED";

const ACTIONS: { value: Action; label: string; icon: typeof IconCheck; notesRequired: boolean }[] = [
  { value: "CONFIRMED", label: "Confirm AI grade", icon: IconCheck, notesRequired: false },
  { value: "OVERRIDDEN", label: "Override", icon: IconEdit, notesRequired: true },
  { value: "REJECTED", label: "Reject listing", icon: IconX, notesRequired: true },
];

/**
 * Review flow shared by the admin verification queue and (as the basis for
 * the fuller two-panel page) the verifier queue: confirm, override with
 * notes, or reject with notes.
 */
export function ReviewDialog({
  item,
  open,
  onOpenChange,
  onResolve,
}: {
  item: MockVerificationItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onResolve: (id: number, status: VerificationStatus, notes: string) => void;
}) {
  const [action, setAction] = useState<Action>("CONFIRMED");
  const [notes, setNotes] = useState("");

  if (!item) return null;

  const activeAction = ACTIONS.find((a) => a.value === action)!;
  const canSubmit = !activeAction.notesRequired || notes.trim().length > 0;

  function handleOpenChange(next: boolean) {
    if (!next) {
      setAction("CONFIRMED");
      setNotes("");
    }
    onOpenChange(next);
  }

  function handleSubmit() {
    if (!canSubmit || !item) return;
    onResolve(item.id, action, notes.trim());
    toast.success(
      action === "CONFIRMED"
        ? "AI grade confirmed."
        : action === "OVERRIDDEN"
          ? "Grade overridden."
          : "Listing rejected."
    );
    handleOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            #{item.listing_id} · {item.commodity_name}
          </DialogTitle>
          <DialogDescription>{item.flagged_reason}</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between rounded-lg border border-border-muted px-3 py-2">
            <span className="text-xs text-body">AI grade: {item.ai_grade}</span>
            <ConfidenceBar value={item.ai_confidence} />
          </div>

          <div className="rounded-lg border border-border-muted">
            {item.attribute_scores.map((score, i) => (
              <div
                key={score.attribute}
                className={cn(
                  "flex items-center justify-between px-3 py-2 text-xs",
                  i > 0 && "border-t border-border-muted"
                )}
              >
                <span className="text-body">{score.attribute}</span>
                <div className="flex items-center gap-3">
                  <span className="text-heading">{score.ai_value}</span>
                  <ConfidenceBar value={score.ai_confidence} />
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-3 gap-2">
            {ACTIONS.map((a) => (
              <button
                key={a.value}
                type="button"
                onClick={() => setAction(a.value)}
                className={cn(
                  "flex flex-col items-center gap-1 rounded-lg border px-2 py-2.5 text-xs font-medium transition-colors",
                  action === a.value
                    ? "border-brand-primary bg-brand-primary/10 text-brand-primary-glow"
                    : "border-border-muted text-body hover:border-brand-primary/40"
                )}
              >
                <a.icon size={16} />
                {a.label}
              </button>
            ))}
          </div>

          <Field data-invalid={activeAction.notesRequired && notes.trim().length === 0}>
            <FieldLabel htmlFor="review-notes">
              Notes {activeAction.notesRequired ? "(required)" : "(optional)"}
            </FieldLabel>
            <Textarea
              id="review-notes"
              placeholder={
                action === "REJECTED"
                  ? "Why is this listing being rejected?"
                  : action === "OVERRIDDEN"
                    ? "What should the grade be, and why?"
                    : "Add a note for the record…"
              }
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </Field>
        </div>

        <DialogFooter>
          <Button onClick={handleSubmit} disabled={!canSubmit}>
            Submit
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
