"use client";

import { useState } from "react";
import { toast } from "sonner";

import { Input } from "@/components/ui/input";
import { ShimmerButton } from "@/components/ui/shimmer-button";

export function NewsletterForm() {
  const [email, setEmail] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    // TODO: wire up to a real newsletter list once one exists.
    toast.success("You're on the list — we'll be in touch.");
    setEmail("");
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mx-auto mt-6 flex w-full max-w-md flex-col gap-3 sm:flex-row"
    >
      <Input
        type="email"
        required
        placeholder="you@business.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="h-11 flex-1 border-border-muted bg-neutral-950 px-4 text-sm text-natural-white placeholder:text-muted-2"
      />
      <ShimmerButton
        type="submit"
        className="h-11 px-6 text-sm font-semibold"
        background="#10B981"
        shimmerColor="#ffffff"
      >
        <span className="text-black">Subscribe</span>
      </ShimmerButton>
    </form>
  );
}
