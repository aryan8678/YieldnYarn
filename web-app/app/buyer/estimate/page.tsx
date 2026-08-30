"use client";

import { useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { mockPriceTrend } from "@/lib/mock-data";
import { PriceTrendChart } from "@/components/shared/price-trend-chart";
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

const BASE_PRICES: Record<string, number> = {
  Wheat: 2410,
  Chana: 5150,
  "Cotton Fabric": 68,
  "Cotton Yarn": 245,
};

const GRADE_MULTIPLIER: Record<string, number> = {
  "Grade A": 1.04,
  "Grade B": 1.0,
  "Grade C": 0.92,
};

const schema = z.object({
  vertical: z.enum(["agriculture", "textiles"]),
  commodity: z.string().min(1, "Required"),
  quantity: z.coerce.number().positive("Must be greater than 0"),
  minGrade: z.enum(["Grade A", "Grade B", "Grade C"]),
  region: z.string().min(1, "Required"),
});

type FormInput = z.input<typeof schema>;
type FormValues = z.output<typeof schema>;

interface Estimate {
  basePrice: number;
  gradeAdjustedPrice: number;
  total: number;
  quantity: number;
  commodity: string;
}

export default function EstimatePage() {
  const [estimate, setEstimate] = useState<Estimate | null>(null);
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<FormInput, unknown, FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { vertical: "agriculture", commodity: "Wheat", minGrade: "Grade A" },
  });

  const vertical = useWatch({ control, name: "vertical" });

  function onSubmit(values: FormValues) {
    const basePrice = BASE_PRICES[values.commodity] ?? 2000;
    const gradeAdjustedPrice = Math.round(basePrice * (GRADE_MULTIPLIER[values.minGrade] ?? 1));
    setEstimate({
      basePrice,
      gradeAdjustedPrice,
      total: gradeAdjustedPrice * values.quantity,
      quantity: values.quantity,
      commodity: values.commodity,
    });
  }

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6">
      <div>
        <h1 className="text-lg font-semibold text-heading">Cost estimator</h1>
        <p className="mt-1 text-sm text-body">
          Get a grade-adjusted price estimate before you post a requirement.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="rounded-2xl border border-border-muted bg-surface p-5"
        >
          <FieldGroup>
            <Field>
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
              <Controller
                control={control}
                name="commodity"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id="commodity" className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {vertical === "agriculture" ? (
                        <>
                          <SelectItem value="Wheat">Wheat</SelectItem>
                          <SelectItem value="Chana">Chana</SelectItem>
                        </>
                      ) : (
                        <>
                          <SelectItem value="Cotton Fabric">Cotton Fabric</SelectItem>
                          <SelectItem value="Cotton Yarn">Cotton Yarn</SelectItem>
                        </>
                      )}
                    </SelectContent>
                  </Select>
                )}
              />
            </Field>

            <div className="grid grid-cols-2 gap-3">
              <Field data-invalid={!!errors.quantity}>
                <FieldLabel htmlFor="quantity">Quantity</FieldLabel>
                <Input id="quantity" type="number" step="any" {...register("quantity")} />
                <FieldError errors={errors.quantity ? [errors.quantity] : undefined} />
              </Field>
              <Field>
                <FieldLabel htmlFor="minGrade">Min. grade</FieldLabel>
                <Controller
                  control={control}
                  name="minGrade"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger id="minGrade" className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Grade A">Grade A</SelectItem>
                        <SelectItem value="Grade B">Grade B</SelectItem>
                        <SelectItem value="Grade C">Grade C</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </Field>
            </div>

            <Field data-invalid={!!errors.region}>
              <FieldLabel htmlFor="region">Region</FieldLabel>
              <Input id="region" placeholder="Uttar Pradesh" {...register("region")} />
              <FieldError errors={errors.region ? [errors.region] : undefined} />
            </Field>

            <Button type="submit" disabled={isSubmitting} className="mt-2">
              {isSubmitting ? "Calculating…" : "Get estimate"}
            </Button>
          </FieldGroup>
        </form>

        <div className="flex flex-col gap-4">
          {estimate ? (
            <div className="rounded-2xl border border-border-muted bg-surface p-5">
              <p className="text-xs font-medium tracking-wide text-muted-2 uppercase">
                Estimated total
              </p>
              <p className="mt-1 text-3xl font-semibold text-heading">
                ₹{estimate.total.toLocaleString("en-IN")}
              </p>
              <dl className="mt-4 flex flex-col gap-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-body">Base market price</dt>
                  <dd className="text-heading">₹{estimate.basePrice.toLocaleString("en-IN")}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-body">Grade-adjusted price</dt>
                  <dd className="text-heading">
                    ₹{estimate.gradeAdjustedPrice.toLocaleString("en-IN")}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-body">Quantity</dt>
                  <dd className="text-heading">{estimate.quantity}</dd>
                </div>
              </dl>

              <p className="mt-5 text-xs font-medium tracking-wide text-muted-2 uppercase">
                30-day price trend — {estimate.commodity}
              </p>
              <PriceTrendChart data={mockPriceTrend(estimate.basePrice)} className="mt-2" />
            </div>
          ) : (
            <div className="flex h-full min-h-52 items-center justify-center rounded-2xl border border-dashed border-border-muted p-8 text-center text-sm text-muted-2">
              Fill in the form to see a grade-adjusted estimate and price trend.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
