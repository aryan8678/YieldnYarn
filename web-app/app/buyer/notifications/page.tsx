import {
  IconAlertTriangle,
  IconBell,
  IconGavel,
  IconPackage,
  IconScan,
} from "@tabler/icons-react";

import { cn } from "@/lib/utils";
import { MOCK_NOTIFICATIONS, type NotificationType } from "@/lib/mock-data";

const TYPE_ICON: Record<NotificationType, typeof IconBell> = {
  GRADING_COMPLETE: IconScan,
  ORDER_MATCHED: IconPackage,
  BID_RECEIVED: IconGavel,
  DISPUTE_UPDATE: IconAlertTriangle,
  SYSTEM: IconBell,
};

export default function NotificationsPage() {
  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <div>
        <h1 className="text-lg font-semibold text-heading">Notifications</h1>
        <p className="mt-1 text-sm text-body">Updates on your requirements, orders, and account.</p>
      </div>

      <ul className="flex flex-col divide-y divide-border-muted rounded-2xl border border-border-muted bg-surface">
        {MOCK_NOTIFICATIONS.map((n) => {
          const Icon = TYPE_ICON[n.type];
          return (
            <li key={n.id} className={cn("flex gap-3 p-5", !n.is_read && "bg-brand-primary/5")}>
              <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-brand-primary/10 text-brand-primary-glow">
                <Icon size={16} />
              </span>
              <div className="flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-medium text-heading">{n.title}</p>
                  {!n.is_read && <span className="size-2 shrink-0 rounded-full bg-brand-primary-glow" />}
                </div>
                <p className="mt-0.5 text-sm text-body">{n.message}</p>
                <p className="mt-1.5 text-xs text-muted-2">
                  {new Date(n.created_at).toLocaleString("en-IN", {
                    day: "2-digit",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
