"use client";

import { useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { IconPlus } from "@tabler/icons-react";
import { toast } from "sonner";

import { MOCK_PRICE_ENTRIES, type MockPriceEntry, type Vertical } from "@/lib/mock-data";
import { StatTile } from "@/components/shared/stat-tile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

const schema = z.object({
  vertical: z.enum(["agriculture", "textiles"]),
  commodity: z.string().min(1, "Required"),
  region: z.string().min(1, "Required"),
  price: z.coerce.number().positive("Must be greater than 0"),
  unit: z.string().min(1, "Required"),
});

type FormInput = z.input<typeof schema>;
type FormValues = z.output<typeof schema>;

export default function AdminPricingPage() {
  const [entries, setEntries] = useState<MockPriceEntry[]>(MOCK_PRICE_ENTRIES);
  const [filter, setFilter] = useState<Vertical | "all">("all");
  const [open, setOpen] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormInput, unknown, FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { vertical: "textiles", unit: "meter" },
  });

  const visible = useMemo(
    () => (filter === "all" ? entries : entries.filter((e) => e.vertical === filter)),
    [entries, filter]
  );

  const manualCount = entries.filter((e) => e.source === "ADMIN_ENTERED").length;

  function onSubmit(values: FormValues) {
    setEntries((prev) => [
      {
        id: Math.max(0, ...prev.map((e) => e.id)) + 1,
        ...values,
        source: "ADMIN_ENTERED",
        timestamp: new Date().toISOString(),
      },
      ...prev,
    ]);
    // TODO: POST /api/pricing/price-points/ once the pricing endpoints are
    // exercised from the frontend.
    toast.success("Price point added.");
    reset();
    setOpen(false);
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatTile label="Tracked price points" value={String(entries.length)} />
        <StatTile label="Manually entered" value={String(manualCount)} />
        <StatTile label="Ingested (AGMARKNET/CCI)" value={String(entries.length - manualCount)} />
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Tabs value={filter} onValueChange={(v) => setFilter(v as Vertical | "all")}>
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="agriculture">Agriculture</TabsTrigger>
            <TabsTrigger value="textiles">Textiles</TabsTrigger>
          </TabsList>
        </Tabs>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <IconPlus />
              Add price point
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Add a price point</DialogTitle>
              <DialogDescription>
                Used for verticals without an automated ingestion job (e.g. textiles).
              </DialogDescription>
            </DialogHeader>

            <form id="price-form" onSubmit={handleSubmit(onSubmit)}>
              <FieldGroup>
                <Field data-invalid={!!errors.vertical}>
                  <FieldLabel htmlFor="vertical">Vertical</FieldLabel>
                  <Controller
                    control={control}
                    name="vertical"
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger id="vertical" className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="agriculture">Agriculture</SelectItem>
                          <SelectItem value="textiles">Textiles</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                </Field>

                <Field data-invalid={!!errors.commodity}>
                  <FieldLabel htmlFor="commodity">Commodity</FieldLabel>
                  <Input id="commodity" placeholder="Cotton Fabric" {...register("commodity")} />
                  <FieldError errors={errors.commodity ? [errors.commodity] : undefined} />
                </Field>

                <Field data-invalid={!!errors.region}>
                  <FieldLabel htmlFor="region">Region</FieldLabel>
                  <Input id="region" placeholder="Surat, Gujarat" {...register("region")} />
                  <FieldError errors={errors.region ? [errors.region] : undefined} />
                </Field>

                <div className="grid grid-cols-2 gap-3">
                  <Field data-invalid={!!errors.price}>
                    <FieldLabel htmlFor="price">Price (₹)</FieldLabel>
                    <Input id="price" type="number" step="any" {...register("price")} />
                    <FieldError errors={errors.price ? [errors.price] : undefined} />
                  </Field>
                  <Field data-invalid={!!errors.unit}>
                    <FieldLabel htmlFor="unit">Unit</FieldLabel>
                    <Input id="unit" placeholder="meter" {...register("unit")} />
                    <FieldError errors={errors.unit ? [errors.unit] : undefined} />
                  </Field>
                </div>
              </FieldGroup>
            </form>

            <DialogFooter>
              <Button type="submit" form="price-form" disabled={isSubmitting}>
                {isSubmitting ? "Saving…" : "Add price point"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-2xl border border-border-muted bg-surface">
        <Table>
          <TableHeader>
            <TableRow className="border-border-muted hover:bg-transparent">
              <TableHead className="pl-5">Commodity</TableHead>
              <TableHead>Region</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Source</TableHead>
              <TableHead className="pr-5 text-right">Updated</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {visible.map((entry) => (
              <TableRow key={entry.id} className="border-border-muted">
                <TableCell className="pl-5 font-medium text-heading">{entry.commodity}</TableCell>
                <TableCell className="text-body">{entry.region}</TableCell>
                <TableCell className="text-heading">
                  ₹{entry.price.toLocaleString("en-IN")} / {entry.unit}
                </TableCell>
                <TableCell className="text-body">{entry.source}</TableCell>
                <TableCell className="pr-5 text-right text-xs text-muted-2">
                  {new Date(entry.timestamp).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
