"use client";

import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { IconPlus } from "@tabler/icons-react";
import { toast } from "sonner";

import type { MockRequirement, Vertical } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const schema = z.object({
  vertical: z.enum(["agriculture", "textiles"]),
  commodity: z.string().min(1, "Required"),
  quantity: z.coerce.number().positive("Must be greater than 0"),
  unit: z.string().min(1, "Required"),
  min_grade: z.string().min(1, "Required"),
  max_price: z.coerce.number().positive("Must be greater than 0"),
  region: z.string().min(1, "Required"),
});

type FormInput = z.input<typeof schema>;
type FormValues = z.output<typeof schema>;

export function PostRequirementDialog({
  onCreate,
}: {
  onCreate: (req: Omit<MockRequirement, "id" | "status" | "created_at">) => void;
}) {
  const [open, setOpen] = useState(false);
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormInput, unknown, FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { vertical: "agriculture", unit: "quintal" },
  });

  function onSubmit(values: FormValues) {
    onCreate(values as Omit<MockRequirement, "id" | "status" | "created_at"> & { vertical: Vertical });
    toast.success("Requirement posted.");
    reset();
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <IconPlus />
          Post requirement
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Post a requirement</DialogTitle>
          <DialogDescription>
            The matching engine will find sellers meeting these terms.
          </DialogDescription>
        </DialogHeader>

        <form id="requirement-form" onSubmit={handleSubmit(onSubmit)}>
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
              <Input id="commodity" placeholder="Wheat" {...register("commodity")} />
              <FieldError errors={errors.commodity ? [errors.commodity] : undefined} />
            </Field>

            <div className="grid grid-cols-2 gap-3">
              <Field data-invalid={!!errors.quantity}>
                <FieldLabel htmlFor="quantity">Quantity</FieldLabel>
                <Input id="quantity" type="number" step="any" {...register("quantity")} />
                <FieldError errors={errors.quantity ? [errors.quantity] : undefined} />
              </Field>
              <Field data-invalid={!!errors.unit}>
                <FieldLabel htmlFor="unit">Unit</FieldLabel>
                <Input id="unit" placeholder="quintal" {...register("unit")} />
                <FieldError errors={errors.unit ? [errors.unit] : undefined} />
              </Field>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Field data-invalid={!!errors.min_grade}>
                <FieldLabel htmlFor="min_grade">Min. grade</FieldLabel>
                <Input id="min_grade" placeholder="Grade A" {...register("min_grade")} />
                <FieldError errors={errors.min_grade ? [errors.min_grade] : undefined} />
              </Field>
              <Field data-invalid={!!errors.max_price}>
                <FieldLabel htmlFor="max_price">Max price (₹)</FieldLabel>
                <Input id="max_price" type="number" step="any" {...register("max_price")} />
                <FieldError errors={errors.max_price ? [errors.max_price] : undefined} />
              </Field>
            </div>

            <Field data-invalid={!!errors.region}>
              <FieldLabel htmlFor="region">Region</FieldLabel>
              <Input id="region" placeholder="Uttar Pradesh" {...register("region")} />
              <FieldError errors={errors.region ? [errors.region] : undefined} />
            </Field>
          </FieldGroup>
        </form>

        <DialogFooter>
          <Button type="submit" form="requirement-form" disabled={isSubmitting}>
            {isSubmitting ? "Posting…" : "Post requirement"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
