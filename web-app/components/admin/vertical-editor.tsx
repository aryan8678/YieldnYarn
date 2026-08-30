"use client";

import Link from "next/link";
import { useId, useState } from "react";
import {
  IconArrowLeft,
  IconArrowDown,
  IconArrowUp,
  IconEye,
  IconPlus,
  IconTrash,
} from "@tabler/icons-react";
import { toast } from "sonner";

import type {
  MockGradeAdjustment,
  MockGradingAttribute,
  MockQuantityTier,
  MockVerticalConfig,
} from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

function reorder<T>(list: T[], index: number, direction: -1 | 1): T[] {
  const target = index + direction;
  if (target < 0 || target >= list.length) return list;
  const next = [...list];
  [next[index], next[target]] = [next[target], next[index]];
  return next;
}

/**
 * Visual JSONB schema editor for a vertical's grading attributes and pricing
 * rules — no raw JSON, per the plan. Edits are local state; "Save changes"
 * is a placeholder until PATCH /api/config/verticals/[id]/ is wired up.
 */
export function VerticalEditor({ vertical }: { vertical: MockVerticalConfig }) {
  const [attributes, setAttributes] = useState<MockGradingAttribute[]>(vertical.grading_attributes);
  const [gradeAdjustments, setGradeAdjustments] = useState<MockGradeAdjustment[]>(
    vertical.grade_adjustments
  );
  const [quantityTiers, setQuantityTiers] = useState<MockQuantityTier[]>(vertical.quantity_tiers);
  const [preview, setPreview] = useState(false);

  const weightTotal = attributes.reduce((sum, a) => sum + a.weight, 0);

  function updateAttribute(index: number, patch: Partial<MockGradingAttribute>) {
    setAttributes((prev) => prev.map((a, i) => (i === index ? { ...a, ...patch } : a)));
  }

  function addAttribute() {
    setAttributes((prev) => [
      ...prev,
      { id: `attr-${Date.now()}`, name: "New attribute", type: "numeric", gradeable_by_ml: false, weight: 0, range: "" },
    ]);
  }

  function updateAdjustment(index: number, patch: Partial<MockGradeAdjustment>) {
    setGradeAdjustments((prev) => prev.map((a, i) => (i === index ? { ...a, ...patch } : a)));
  }

  function updateTier(index: number, patch: Partial<MockQuantityTier>) {
    setQuantityTiers((prev) => prev.map((t, i) => (i === index ? { ...t, ...patch } : t)));
  }

  function handleSave() {
    // TODO: PATCH /api/config/verticals/{id}/ once the admin config
    // endpoints are exercised from the frontend.
    toast.success("Vertical configuration saved.");
  }

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <Link
            href="/admin/verticals"
            className="mb-2 inline-flex items-center gap-1 text-xs font-medium text-muted-2 hover:text-body"
          >
            <IconArrowLeft size={14} />
            Verticals
          </Link>
          <h1 className="text-lg font-semibold text-heading">{vertical.name}</h1>
          <p className="text-sm text-body">{vertical.description}</p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Button variant={preview ? "secondary" : "outline"} onClick={() => setPreview((p) => !p)}>
            <IconEye />
            {preview ? "Editing" : "Preview"}
          </Button>
          <Button onClick={handleSave}>Save changes</Button>
        </div>
      </div>

      {preview ? (
        <VerticalPreview
          vertical={vertical}
          attributes={attributes}
          gradeAdjustments={gradeAdjustments}
        />
      ) : (
        <Tabs defaultValue="attributes">
          <TabsList>
            <TabsTrigger value="attributes">Grading attributes</TabsTrigger>
            <TabsTrigger value="pricing">Pricing rules</TabsTrigger>
          </TabsList>

          <TabsContent value="attributes" className="flex flex-col gap-3">
            <div className="rounded-2xl border border-border-muted bg-surface">
              <div className="grid grid-cols-[1fr_auto_auto_auto_1fr_auto] gap-3 border-b border-border-muted px-4 py-2.5 text-xs font-medium text-muted-2">
                <span>Attribute</span>
                <span>Type</span>
                <span>ML-graded</span>
                <span>Weight</span>
                <span>Range</span>
                <span className="sr-only">Actions</span>
              </div>
              {attributes.map((attr, i) => (
                <AttributeRow
                  key={attr.id}
                  attribute={attr}
                  onChange={(patch) => updateAttribute(i, patch)}
                  onRemove={() => setAttributes((prev) => prev.filter((_, j) => j !== i))}
                  onMove={(dir) => setAttributes((prev) => reorder(prev, i, dir))}
                  isFirst={i === 0}
                  isLast={i === attributes.length - 1}
                />
              ))}
              <div className="flex items-center justify-between px-4 py-3">
                <span className={cn("text-xs", weightTotal === 1 ? "text-muted-2" : "text-warning")}>
                  Weights sum to {Math.round(weightTotal * 100)}%{weightTotal !== 1 && " (should be 100%)"}
                </span>
                <Button variant="outline" size="sm" onClick={addAttribute}>
                  <IconPlus />
                  Add attribute
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="pricing" className="flex flex-col gap-4">
            <div className="rounded-2xl border border-border-muted bg-surface p-4">
              <h3 className="text-sm font-semibold text-heading">Grade adjustments</h3>
              <p className="mt-0.5 text-xs text-body">
                Percentage applied to the base market price for each grade.
              </p>
              <div className="mt-3 flex flex-col gap-2">
                {gradeAdjustments.map((adj, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <Input
                      value={adj.grade}
                      onChange={(e) => updateAdjustment(i, { grade: e.target.value })}
                      className="max-w-40"
                    />
                    <div className="flex items-center gap-1">
                      <Input
                        type="number"
                        value={adj.adjustment_pct}
                        onChange={(e) => updateAdjustment(i, { adjustment_pct: Number(e.target.value) })}
                        className="w-20"
                      />
                      <span className="text-xs text-muted-2">%</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      className="text-muted-2 hover:text-error"
                      onClick={() => setGradeAdjustments((prev) => prev.filter((_, j) => j !== i))}
                    >
                      <IconTrash size={14} />
                    </Button>
                  </div>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  className="w-fit"
                  onClick={() => setGradeAdjustments((prev) => [...prev, { grade: "New grade", adjustment_pct: 0 }])}
                >
                  <IconPlus />
                  Add grade
                </Button>
              </div>
            </div>

            <div className="rounded-2xl border border-border-muted bg-surface p-4">
              <h3 className="text-sm font-semibold text-heading">Quantity tiers</h3>
              <p className="mt-0.5 text-xs text-body">Bulk discount thresholds.</p>
              <div className="mt-3 flex flex-col gap-2">
                {quantityTiers.map((tier, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs text-body">
                    <span>At least</span>
                    <Input
                      type="number"
                      value={tier.min_qty}
                      onChange={(e) => updateTier(i, { min_qty: Number(e.target.value) })}
                      className="w-24"
                    />
                    <span>units →</span>
                    <Input
                      type="number"
                      value={tier.discount_pct}
                      onChange={(e) => updateTier(i, { discount_pct: Number(e.target.value) })}
                      className="w-20"
                    />
                    <span>% off</span>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      className="text-muted-2 hover:text-error"
                      onClick={() => setQuantityTiers((prev) => prev.filter((_, j) => j !== i))}
                    >
                      <IconTrash size={14} />
                    </Button>
                  </div>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  className="w-fit"
                  onClick={() => setQuantityTiers((prev) => [...prev, { min_qty: 0, discount_pct: 0 }])}
                >
                  <IconPlus />
                  Add tier
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}

function AttributeRow({
  attribute,
  onChange,
  onRemove,
  onMove,
  isFirst,
  isLast,
}: {
  attribute: MockGradingAttribute;
  onChange: (patch: Partial<MockGradingAttribute>) => void;
  onRemove: () => void;
  onMove: (direction: -1 | 1) => void;
  isFirst: boolean;
  isLast: boolean;
}) {
  const switchId = useId();

  return (
    <div className="grid grid-cols-[1fr_auto_auto_auto_1fr_auto] items-center gap-3 border-b border-border-muted px-4 py-2.5 last:border-b-0">
      <Input value={attribute.name} onChange={(e) => onChange({ name: e.target.value })} />

      <Select
        value={attribute.type}
        onValueChange={(v) => onChange({ type: v as MockGradingAttribute["type"] })}
      >
        <SelectTrigger size="sm">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="numeric">Numeric</SelectItem>
          <SelectItem value="categorical">Categorical</SelectItem>
          <SelectItem value="boolean">Boolean</SelectItem>
        </SelectContent>
      </Select>

      <Switch
        id={switchId}
        checked={attribute.gradeable_by_ml}
        onCheckedChange={(checked) => onChange({ gradeable_by_ml: checked })}
      />

      <div className="flex items-center gap-1">
        <Input
          type="number"
          min={0}
          max={100}
          value={Math.round(attribute.weight * 100)}
          onChange={(e) => onChange({ weight: Number(e.target.value) / 100 })}
          className="w-16"
        />
        <span className="text-xs text-muted-2">%</span>
      </div>

      <Input
        value={attribute.range}
        onChange={(e) => onChange({ range: e.target.value })}
        placeholder="e.g. 0–100%"
      />

      <div className="flex items-center gap-0.5">
        <Button variant="ghost" size="icon-sm" disabled={isFirst} onClick={() => onMove(-1)}>
          <IconArrowUp size={14} />
        </Button>
        <Button variant="ghost" size="icon-sm" disabled={isLast} onClick={() => onMove(1)}>
          <IconArrowDown size={14} />
        </Button>
        <Button variant="ghost" size="icon-sm" className="text-muted-2 hover:text-error" onClick={onRemove}>
          <IconTrash size={14} />
        </Button>
      </div>
    </div>
  );
}

function VerticalPreview({
  vertical,
  attributes,
  gradeAdjustments,
}: {
  vertical: MockVerticalConfig;
  attributes: MockGradingAttribute[];
  gradeAdjustments: MockGradeAdjustment[];
}) {
  const basePrice = 2500;
  const topGrade = gradeAdjustments[0];

  return (
    <div className="rounded-2xl border border-border-muted bg-surface p-5">
      <p className="text-xs font-medium text-muted-2">Sample listing preview</p>
      <div className="mt-3 flex items-center justify-between">
        <h3 className="text-base font-semibold text-heading">
          Sample {vertical.name} commodity
        </h3>
        {topGrade && (
          <span className="rounded-full bg-brand-primary/15 px-2.5 py-1 text-xs font-medium text-brand-primary-glow">
            {topGrade.grade}
          </span>
        )}
      </div>
      <ul className="mt-4 flex flex-col divide-y divide-border-muted">
        {attributes.map((attr) => (
          <li key={attr.id} className="flex items-center justify-between py-2 text-sm">
            <span className="flex items-center gap-2 text-body">
              {attr.name || "Untitled attribute"}
              {attr.gradeable_by_ml && (
                <span className="rounded-full bg-brand-primary/10 px-1.5 py-0.5 text-[10px] font-medium text-brand-primary-glow">
                  AI-graded
                </span>
              )}
            </span>
            <span className="text-xs text-muted-2">{attr.range || "—"}</span>
          </li>
        ))}
      </ul>
      {topGrade && (
        <p className="mt-4 border-t border-border-muted pt-3 text-sm text-body">
          Base price ₹{basePrice.toLocaleString("en-IN")} → adjusted{" "}
          <span className="font-semibold text-heading">
            ₹{Math.round(basePrice * (1 + topGrade.adjustment_pct / 100)).toLocaleString("en-IN")}
          </span>{" "}
          at {topGrade.grade}
        </p>
      )}
    </div>
  );
}
