import { HugeiconsIcon } from "@hugeicons/react";
import { InformationCircleIcon, MoreHorizontalIcon } from "@hugeicons/core-free-icons";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Sparkline } from "@/components/dashboard/charts";

export function initials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("");
}

export function PanelTitle({ title }: { title: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <h2 className="font-mono text-sm font-medium tracking-wide uppercase text-foreground/50">{title}</h2>
      <HugeiconsIcon icon={InformationCircleIcon} size={14} className="text-muted-foreground" />
    </div>
  );
}

export function MoreButton() {
  return (
    <Button variant="outline" size="icon-sm" aria-label="More options" className="rounded-full border-2 border-comp-border">
      <HugeiconsIcon icon={MoreHorizontalIcon} size={16} />
    </Button>
  );
}

const statusStyles: Record<string, { badge: string; dot: string }> = {
  Success: { badge: "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-400", dot: "bg-emerald-500" },
  Pending: { badge: "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-900/40 dark:text-amber-300", dot: "bg-amber-500" },
  Refunded: { badge: "border-border bg-muted text-muted-foreground", dot: "bg-muted-foreground" },
  "In Stock": { badge: "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-400", dot: "bg-emerald-500" },
  "Low Stock": { badge: "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-900/40 dark:text-amber-300", dot: "bg-amber-500" },
  "Out of Stock": { badge: "border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-400", dot: "bg-red-500" },
  Active: { badge: "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-400", dot: "bg-emerald-500" },
  Paused: { badge: "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-900/40 dark:text-amber-300", dot: "bg-amber-500" },
  Ended: { badge: "border-border bg-muted text-muted-foreground", dot: "bg-muted-foreground" },
  Connected: { badge: "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-400", dot: "bg-emerald-500" },
  Disconnected: { badge: "border-border bg-muted text-muted-foreground", dot: "bg-muted-foreground" },
  Delivered: { badge: "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-400", dot: "bg-emerald-500" },
  Shipped: { badge: "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-400", dot: "bg-emerald-500" },
  Processing: { badge: "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-900/40 dark:text-amber-300", dot: "bg-amber-500" },
  Cancelled: { badge: "border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-400", dot: "bg-red-500" },
  Paid: { badge: "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-400", dot: "bg-emerald-500" },
  Overdue: { badge: "border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-400", dot: "bg-red-500" },
  Open: { badge: "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-900/40 dark:text-amber-300", dot: "bg-amber-500" },
  Resolved: { badge: "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-400", dot: "bg-emerald-500" },
  Admitted: { badge: "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-400", dot: "bg-emerald-500" },
  Outpatient: { badge: "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-400", dot: "bg-emerald-500" },
  Discharged: { badge: "border-border bg-muted text-muted-foreground", dot: "bg-muted-foreground" },
  Critical: { badge: "border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-400", dot: "bg-red-500" },
  Emergency: { badge: "border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-400", dot: "bg-red-500" },
  Scheduled: { badge: "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-900/40 dark:text-amber-300", dot: "bg-amber-500" },
  "In Progress": { badge: "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-900/40 dark:text-amber-300", dot: "bg-amber-500" },
  Completed: { badge: "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-400", dot: "bg-emerald-500" },
  "No Show": { badge: "border-border bg-muted text-muted-foreground", dot: "bg-muted-foreground" },
  "On Duty": { badge: "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-400", dot: "bg-emerald-500" },
  "Off Duty": { badge: "border-border bg-muted text-muted-foreground", dot: "bg-muted-foreground" },
  "On Leave": { badge: "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-900/40 dark:text-amber-300", dot: "bg-amber-500" },
  Partial: { badge: "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-900/40 dark:text-amber-300", dot: "bg-amber-500" },
  Available: { badge: "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-400", dot: "bg-emerald-500" },
  Occupied: { badge: "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-400", dot: "bg-emerald-500" },
  Cleaning: { badge: "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-900/40 dark:text-amber-300", dot: "bg-amber-500" },
  Maintenance: { badge: "border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-400", dot: "bg-red-500" },
  Waiting: { badge: "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-900/40 dark:text-amber-300", dot: "bg-amber-500" },
  Urgent: { badge: "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-900/40 dark:text-amber-300", dot: "bg-amber-500" },
  Stable: { badge: "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-400", dot: "bg-emerald-500" },
  "Sample Collected": { badge: "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-900/40 dark:text-amber-300", dot: "bg-amber-500" },
  Ready: { badge: "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-400", dot: "bg-emerald-500" },
  Submitted: { badge: "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-900/40 dark:text-amber-300", dot: "bg-amber-500" },
  Approved: { badge: "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-400", dot: "bg-emerald-500" },
  Rejected: { badge: "border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-400", dot: "bg-red-500" },
  "Pending Docs": { badge: "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-900/40 dark:text-amber-300", dot: "bg-amber-500" },
};

export function StatusBadge({ status }: { status: string }) {
  const s = statusStyles[status] ?? statusStyles.Refunded;
  return (
    <Badge variant="outline" className={`rounded-full ${s.badge}`}>
      <span className={`size-1.5 rounded-full ${s.dot}`} />
      {status}
    </Badge>
  );
}

export type Kpi = {
  label: string;
  value: string;
  suffix?: string;
  delta: string;
  deltaLabel: string;
  spark: number[];
};

export function KpiCard({ kpi }: { kpi: Kpi }) {
  return (
    <Card className="gap-0 bg-muted/50 p-1 ring-0 shadow-sm dark:bg-muted">
      <div className="flex items-center justify-between gap-3 rounded-xl bg-card p-4">
        <div className="space-y-2">
          <p className="font-mono text-[11px] tracking-wide text-muted-foreground uppercase">
            {kpi.label}
          </p>
          <p className="font-mono text-[28px] leading-none font-medium tracking-tight">
            {kpi.value}
            {kpi.suffix && (
              <span className="ml-2 font-sans text-xs font-normal text-muted-foreground">
                {kpi.suffix}
              </span>
            )}
          </p>
        </div>
        <Sparkline data={kpi.spark} />
      </div>
      <div className="flex items-center justify-end px-4 py-2.5">
        <span className="text-xs font-medium">
          <span className="font-mono text-emerald-600 dark:text-emerald-500">{kpi.delta}</span>{" "}
          <span className="font-sans text-muted-foreground">{kpi.deltaLabel}</span>
        </span>
      </div>
    </Card>
  );
}
