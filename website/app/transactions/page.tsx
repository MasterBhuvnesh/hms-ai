import { HugeiconsIcon } from "@hugeicons/react";
import { FileExportIcon } from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { KpiCard } from "@/components/dashboard/cards";
import { Shell } from "@/components/dashboard/shell";
import { TransactionsView } from "./transactions-view";

const kpis = [
  { label: "Total Payments", value: "₹86,420", suffix: "", delta: "+6,4%", deltaLabel: "this month", spark: [4, 6, 5, 7, 6, 8, 7, 9, 8, 12] },
  { label: "Paid", value: "94,2%", suffix: "", delta: "+1,2%", deltaLabel: "collection rate", spark: [6, 7, 6, 8, 7, 9, 8, 10, 9, 12] },
  { label: "Pending", value: "32", suffix: "bills", delta: "-8", deltaLabel: "vs last month", spark: [10, 9, 8, 9, 7, 8, 6, 7, 5, 12] },
  { label: "Refunded", value: "₹1,240", suffix: "", delta: "-0,4%", deltaLabel: "this month", spark: [8, 7, 9, 6, 8, 5, 7, 4, 6, 12] },
];

export default function Transactions() {
  return (
    <Shell breadcrumb="Payments" active="Payments">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-medium tracking-tight">Payments</h1>
        <Button variant="outline" size="lg" className="bg-card">
          <HugeiconsIcon icon={FileExportIcon} size={14} data-icon="inline-start" />
          Export CSV
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((kpi) => (
          <KpiCard key={kpi.label} kpi={kpi} />
        ))}
      </div>

      <TransactionsView title="Recent Payments" showAdd />
    </Shell>
  );
}
