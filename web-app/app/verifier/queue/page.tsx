import Link from "next/link";

import { MOCK_VERIFICATION_QUEUE } from "@/lib/mock-data";
import { PriorityBadge } from "@/components/shared/status-badge";
import { ConfidenceBar } from "@/components/shared/confidence-bar";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function VerifierQueuePage() {
  const pending = MOCK_VERIFICATION_QUEUE.filter((i) => i.status === "PENDING").sort((a, b) =>
    a.priority === b.priority ? 0 : a.priority === "HIGH" ? -1 : 1
  );

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-lg font-semibold text-heading">Verification queue</h1>
        <p className="text-sm text-body">{pending.length} listings awaiting review.</p>
      </div>

      <div className="rounded-2xl border border-border-muted bg-surface">
        <Table>
          <TableHeader>
            <TableRow className="border-border-muted hover:bg-transparent">
              <TableHead className="pl-5">Listing</TableHead>
              <TableHead>Flagged reason</TableHead>
              <TableHead>AI grade</TableHead>
              <TableHead>Confidence</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead className="pr-5 text-right">Review</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pending.map((item) => (
              <TableRow key={item.id} className="border-border-muted">
                <TableCell className="pl-5">
                  <p className="font-medium text-heading">{item.commodity_name}</p>
                  <p className="text-xs text-muted-2">{item.seller_name}</p>
                </TableCell>
                <TableCell className="max-w-xs text-body">{item.flagged_reason}</TableCell>
                <TableCell className="text-body">{item.ai_grade}</TableCell>
                <TableCell>
                  <ConfidenceBar value={item.ai_confidence} />
                </TableCell>
                <TableCell>
                  <PriorityBadge priority={item.priority} />
                </TableCell>
                <TableCell className="pr-5 text-right">
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/verifier/queue/${item.id}`}>Review</Link>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {pending.length === 0 && (
              <TableRow className="border-border-muted hover:bg-transparent">
                <TableCell colSpan={6} className="py-8 text-center text-sm text-muted-2">
                  Queue is empty.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
