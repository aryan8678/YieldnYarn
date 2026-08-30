"use client";

import { useState } from "react";
import { IconChevronDown } from "@tabler/icons-react";

import { cn } from "@/lib/utils";
import { MOCK_ORDERS } from "@/lib/mock-data";
import { StatusBadge } from "@/components/shared/status-badge";

export default function OrdersPage() {
  const [expanded, setExpanded] = useState<number | null>(null);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-lg font-semibold text-heading">My orders</h1>
        <p className="mt-1 text-sm text-body">
          Orders can span multiple sellers — expand one to see the allocation.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        {MOCK_ORDERS.map((order) => {
          const isOpen = expanded === order.id;
          return (
            <div
              key={order.id}
              className="overflow-hidden rounded-2xl border border-border-muted bg-surface"
            >
              <button
                type="button"
                onClick={() => setExpanded(isOpen ? null : order.id)}
                className="flex w-full items-center justify-between gap-4 p-5 text-left"
                aria-expanded={isOpen}
              >
                <div className="flex items-center gap-4">
                  <span className="font-medium text-heading">Order #{order.id}</span>
                  <StatusBadge status={order.status} />
                  {order.requirement_id && (
                    <span className="text-xs text-muted-2">
                      from requirement #{order.requirement_id}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm font-semibold text-heading">
                    ₹{order.total_price.toLocaleString("en-IN")}
                  </span>
                  <span className="text-xs text-muted-2">{order.created_at}</span>
                  <IconChevronDown
                    size={16}
                    className={cn(
                      "text-muted-2 transition-transform",
                      isOpen && "rotate-180"
                    )}
                  />
                </div>
              </button>

              {isOpen && (
                <div className="border-t border-border-muted px-5 py-4">
                  <p className="text-xs font-medium tracking-wide text-muted-2 uppercase">
                    Allocation
                  </p>
                  <ul className="mt-3 flex flex-col divide-y divide-border-muted">
                    {order.allocations.map((alloc) => (
                      <li
                        key={alloc.listing_id}
                        className="flex items-center justify-between py-2.5 text-sm"
                      >
                        <div>
                          <p className="font-medium text-heading">{alloc.commodity_name}</p>
                          <p className="text-xs text-muted-2">{alloc.seller_name}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-heading">
                            {alloc.allocated_quantity} {alloc.unit}
                          </p>
                          <p className="text-xs text-muted-2">
                            ₹{alloc.unit_price.toLocaleString("en-IN")} / {alloc.unit}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
