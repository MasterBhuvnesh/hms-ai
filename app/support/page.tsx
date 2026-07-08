import { HugeiconsIcon } from "@hugeicons/react";
import { PlusSignIcon } from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { KpiCard } from "@/components/dashboard/cards";
import { Shell } from "@/components/dashboard/shell";
import { TicketsTable } from "./tickets-table";

const kpis = [
  {
    label: "Open Tickets",
    value: "24",
    suffix: "",
    delta: "+1,2%",
    deltaLabel: "this week",
    spark: [10, 14, 12, 16, 13, 18, 15, 20, 17, 22],
  },
  {
    label: "Avg First Response",
    value: "42m",
    suffix: "",
    delta: "-6m",
    deltaLabel: "vs last week",
    spark: [4, 6, 5, 7, 6, 8, 7, 9, 8, 12],
  },
  {
    label: "Resolved Today",
    value: "18",
    suffix: "",
    delta: "+3,5%",
    deltaLabel: "vs yesterday",
    spark: [6, 9, 7, 11, 8, 12, 10, 14, 11, 16],
  },
  {
    label: "CSAT",
    value: "4,6",
    suffix: "",
    delta: "+0,2",
    deltaLabel: "this month",
    spark: [3, 5, 4, 6, 5, 7, 6, 8, 7, 10],
  },
];

export default function CustomerSupport() {
  return (
    <Shell breadcrumb="Customer Support" active="Customer Support">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-medium tracking-tight">Customer Support</h1>
        <Button size="lg">
          <HugeiconsIcon icon={PlusSignIcon} size={14} data-icon="inline-start" />
          New Ticket
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((kpi) => (
          <KpiCard key={kpi.label} kpi={kpi} />
        ))}
      </div>

      <TicketsTable />
    </Shell>
  );
}
