"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { useAuth } from "@/hooks/use-auth";
import { dashboardPathForRole } from "@/lib/auth";
import { BUYER_NAV_ITEMS } from "@/components/shared/dashboard-nav-items";
import { DashboardLayout } from "@/components/shared/dashboard-layout";
import { Skeleton } from "@/components/ui/skeleton";

export default function BuyerLayout({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user === null) {
      router.replace("/login");
    } else if (user && user.role !== "BUYER") {
      router.replace(dashboardPathForRole(user.role));
    }
  }, [user, router]);

  if (!user || user.role !== "BUYER") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-6">
        <Skeleton className="h-8 w-40" />
      </div>
    );
  }

  return (
    <DashboardLayout user={user} navItems={BUYER_NAV_ITEMS}>
      {children}
    </DashboardLayout>
  );
}
