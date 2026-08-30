import { notFound } from "next/navigation";
import { IconMapPin, IconStarFilled } from "@tabler/icons-react";

import { MOCK_LISTINGS } from "@/lib/mock-data";
import { StatusBadge } from "@/components/shared/status-badge";
import { Badge } from "@/components/ui/badge";
import { ListingActions } from "@/components/buyer/listing-actions";

const GRADE_ATTRIBUTES: Record<string, { name: string; value: string; mlGraded: boolean }[]> = {
  agriculture: [
    { name: "Foreign matter", value: "1.2%", mlGraded: true },
    { name: "Moisture content", value: "10.8%", mlGraded: false },
    { name: "Grade standard", value: "FAQ", mlGraded: false },
  ],
  textiles: [
    { name: "Defect rate", value: "0.8%", mlGraded: true },
    { name: "GSM", value: "180", mlGraded: false },
    { name: "Thread count", value: "60x60", mlGraded: false },
  ],
};

export default async function ListingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const listing = MOCK_LISTINGS.find((l) => l.id === Number(id));
  if (!listing) notFound();

  const attributes = GRADE_ATTRIBUTES[listing.vertical];
  const gradeAdjustment = listing.price_final - listing.price_suggested;

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6">
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-xl font-semibold text-heading">
            {listing.commodity_name} — {listing.sub_category}
          </h1>
          <StatusBadge status={listing.status} />
        </div>
        <p className="mt-1 flex items-center gap-1 text-sm text-muted-2">
          <IconMapPin size={14} />
          {listing.region}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="flex flex-col gap-6 lg:col-span-2">
          <div className="flex aspect-video items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-900/30 via-neutral-900 to-neutral-950">
            <span className="text-5xl font-bold text-white/5">
              {listing.commodity_name}
            </span>
          </div>

          <div className="rounded-2xl border border-border-muted bg-surface p-5">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-heading">Grading report</h2>
              <Badge
                className={
                  listing.grade === "Ungraded"
                    ? "bg-muted text-muted-2"
                    : "bg-brand-primary/15 text-brand-primary-glow"
                }
              >
                {listing.grade}
              </Badge>
            </div>
            <ul className="mt-4 flex flex-col divide-y divide-border-muted">
              {attributes.map((attr) => (
                <li key={attr.name} className="flex items-center justify-between py-2.5 text-sm">
                  <span className="flex items-center gap-2 text-body">
                    {attr.name}
                    {attr.mlGraded && (
                      <span className="rounded-full bg-brand-primary/10 px-1.5 py-0.5 text-[10px] font-medium text-brand-primary-glow">
                        AI-graded
                      </span>
                    )}
                  </span>
                  <span className="font-medium text-heading">{attr.value}</span>
                </li>
              ))}
            </ul>
            {listing.grade !== "Ungraded" && (
              <p className="mt-3 text-xs text-muted-2">
                {Math.round(listing.grade_confidence * 100)}% model confidence on AI-graded attributes.
              </p>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <div className="rounded-2xl border border-border-muted bg-surface p-5">
            <h2 className="text-sm font-semibold text-heading">Price breakdown</h2>
            <dl className="mt-4 flex flex-col gap-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-body">Base market price</dt>
                <dd className="text-heading">₹{listing.price_suggested.toLocaleString("en-IN")}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-body">Grade adjustment</dt>
                <dd className={gradeAdjustment >= 0 ? "text-success" : "text-error"}>
                  {gradeAdjustment >= 0 ? "+" : ""}
                  ₹{gradeAdjustment.toLocaleString("en-IN")}
                </dd>
              </div>
              <div className="mt-1 flex justify-between border-t border-border-muted pt-2 font-semibold">
                <dt className="text-heading">Final price</dt>
                <dd className="text-heading">
                  ₹{listing.price_final.toLocaleString("en-IN")} / {listing.unit}
                </dd>
              </div>
              <div className="flex justify-between text-xs text-muted-2">
                <dt>Available quantity</dt>
                <dd>
                  {listing.quantity} {listing.unit}
                </dd>
              </div>
            </dl>
          </div>

          <div className="rounded-2xl border border-border-muted bg-surface p-5">
            <h2 className="text-sm font-semibold text-heading">Seller</h2>
            <p className="mt-2 text-sm font-medium text-heading">{listing.seller_name}</p>
            <p className="mt-1 flex items-center gap-1 text-xs text-body">
              <IconStarFilled size={12} className="text-warning" />
              {listing.seller_reputation.toFixed(1)} reputation score
            </p>
          </div>

          <ListingActions />
        </div>
      </div>
    </div>
  );
}
