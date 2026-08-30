"use client";

import { toast } from "sonner";

import { Button } from "@/components/ui/button";

// TODO: wire up to POST /api/orders/bids/ and the buy flow once the order
// creation endpoint is exercised from the frontend.
export function ListingActions() {
  return (
    <div className="flex flex-col gap-2">
      <Button
        className="w-full"
        onClick={() => toast.info("Buy flow is coming soon.")}
      >
        Buy Now
      </Button>
      <Button
        variant="outline"
        className="w-full"
        onClick={() => toast.info("Bidding is coming soon.")}
      >
        Place a Bid
      </Button>
    </div>
  );
}
