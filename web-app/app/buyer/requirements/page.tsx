"use client";

import { useState } from "react";

import { MOCK_REQUIREMENTS, type MockRequirement } from "@/lib/mock-data";
import { StatusBadge } from "@/components/shared/status-badge";
import { PostRequirementDialog } from "@/components/buyer/post-requirement-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function RequirementsPage() {
  const [requirements, setRequirements] = useState<MockRequirement[]>(MOCK_REQUIREMENTS);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-heading">My requirements</h1>
          <p className="mt-1 text-sm text-body">
            Post what you need — the matching engine finds sellers for you.
          </p>
        </div>
        <PostRequirementDialog
          onCreate={(req) =>
            setRequirements((prev) => [
              { ...req, id: Math.max(0, ...prev.map((r) => r.id)) + 1, status: "OPEN", created_at: new Date().toISOString().slice(0, 10) },
              ...prev,
            ])
          }
        />
      </div>

      <div className="rounded-2xl border border-border-muted bg-surface">
        <Table>
          <TableHeader>
            <TableRow className="border-border-muted hover:bg-transparent">
              <TableHead className="pl-5">Commodity</TableHead>
              <TableHead>Quantity</TableHead>
              <TableHead>Min grade</TableHead>
              <TableHead>Max price</TableHead>
              <TableHead>Region</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="pr-5">Posted</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {requirements.map((req) => (
              <TableRow key={req.id} className="border-border-muted">
                <TableCell className="pl-5 font-medium text-heading">{req.commodity}</TableCell>
                <TableCell className="text-body">
                  {req.quantity} {req.unit}
                </TableCell>
                <TableCell className="text-body">{req.min_grade}</TableCell>
                <TableCell className="text-body">₹{req.max_price.toLocaleString("en-IN")}</TableCell>
                <TableCell className="text-body">{req.region}</TableCell>
                <TableCell>
                  <StatusBadge status={req.status} />
                </TableCell>
                <TableCell className="pr-5 text-muted-2">{req.created_at}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
