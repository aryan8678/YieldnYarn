"use client";

import { Suspense, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { IconMapPin, IconStarFilled } from "@tabler/icons-react";

import { cn } from "@/lib/utils";
import { MOCK_LISTINGS, type Vertical } from "@/lib/mock-data";
import { StatusBadge } from "@/components/shared/status-badge";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type VerticalFilter = "all" | Vertical;
type SortOption = "price_asc" | "price_desc" | "grade";

export default function CatalogPage() {
  return (
    <Suspense fallback={null}>
      <CatalogBrowser />
    </Suspense>
  );
}

function CatalogBrowser() {
  const searchParams = useSearchParams();
  const initialVertical = (searchParams.get("vertical") as VerticalFilter) ?? "all";

  const [vertical, setVertical] = useState<VerticalFilter>(
    initialVertical === "agriculture" || initialVertical === "textiles" ? initialVertical : "all"
  );
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortOption>("price_asc");

  const listings = useMemo(() => {
    let result = MOCK_LISTINGS.filter((l) => l.status === "ACTIVE" || l.status === "PENDING_VERIFICATION");
    if (vertical !== "all") result = result.filter((l) => l.vertical === vertical);
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      result = result.filter(
        (l) =>
          l.commodity_name.toLowerCase().includes(q) ||
          l.sub_category.toLowerCase().includes(q) ||
          l.region.toLowerCase().includes(q)
      );
    }
    result = [...result].sort((a, b) => {
      if (sort === "price_asc") return a.price_final - b.price_final;
      if (sort === "price_desc") return b.price_final - a.price_final;
      return a.grade.localeCompare(b.grade);
    });
    return result;
  }, [vertical, query, sort]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Input
          placeholder="Search commodity, variety, or region…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="h-9 sm:max-w-sm"
        />
        <div className="flex items-center gap-2">
          <Select value={vertical} onValueChange={(v) => setVertical(v as VerticalFilter)}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Vertical" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All verticals</SelectItem>
              <SelectItem value="agriculture">Agriculture</SelectItem>
              <SelectItem value="textiles">Textiles</SelectItem>
            </SelectContent>
          </Select>
          <Select value={sort} onValueChange={(v) => setSort(v as SortOption)}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Sort" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="price_asc">Price: low to high</SelectItem>
              <SelectItem value="price_desc">Price: high to low</SelectItem>
              <SelectItem value="grade">Grade</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {listings.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-border-muted p-12 text-center text-sm text-body">
          No listings match your filters.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {listings.map((listing) => (
            <Link
              key={listing.id}
              href={`/buyer/catalog/${listing.id}`}
              className="flex flex-col rounded-2xl border border-border-muted bg-surface p-5 transition-colors hover:border-brand-primary/40"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold text-heading">
                    {listing.commodity_name}
                    <span className="ml-1.5 font-normal text-muted-2">
                      · {listing.sub_category}
                    </span>
                  </p>
                  <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-2">
                    <IconMapPin size={12} />
                    {listing.region}
                  </p>
                </div>
                <StatusBadge status={listing.status} />
              </div>

              <div className="mt-4 flex items-center gap-2">
                <Badge
                  className={cn(
                    listing.grade === "Ungraded"
                      ? "bg-muted text-muted-2"
                      : "bg-brand-primary/15 text-brand-primary-glow"
                  )}
                >
                  {listing.grade}
                </Badge>
                {listing.grade !== "Ungraded" && (
                  <span className="text-xs text-muted-2">
                    {Math.round(listing.grade_confidence * 100)}% confidence
                  </span>
                )}
              </div>

              <div className="mt-auto flex items-end justify-between pt-4">
                <div>
                  <p className="text-lg font-semibold text-heading">
                    ₹{listing.price_final.toLocaleString("en-IN")}
                    <span className="text-xs font-normal text-muted-2"> /{listing.unit}</span>
                  </p>
                  <p className="text-xs text-muted-2">
                    {listing.quantity} {listing.unit} available
                  </p>
                </div>
                <p className="flex items-center gap-1 text-xs text-body">
                  <IconStarFilled size={12} className="text-warning" />
                  {listing.seller_reputation.toFixed(1)}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
