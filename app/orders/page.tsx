import { HugeiconsIcon } from "@hugeicons/react";
import { PlusSignIcon } from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { KpiCard } from "@/components/dashboard/cards";
import { Shell } from "@/components/dashboard/shell";
import type { Kpi } from "@/components/dashboard/cards";
import { OrdersTable } from "./orders-table";

const kpis: Kpi[] = [
  {
    label: "Total Orders",
    value: "10,320",
    suffix: "",
    delta: "+5,6%",
    deltaLabel: "vs last month",
    spark: [4, 6, 5, 7, 6, 8, 7, 9, 8, 12],
  },
  {
    label: "Processing",
    value: "148",
    suffix: "",
    delta: "+2,1%",
    deltaLabel: "vs last month",
    spark: [3, 5, 4, 6, 5, 7, 8, 7, 9, 10],
  },
  {
    label: "Shipped",
    value: "96",
    suffix: "",
    delta: "+3,7%",
    deltaLabel: "vs last month",
    spark: [5, 4, 6, 5, 7, 6, 8, 9, 8, 11],
  },
  {
    label: "Returns",
    value: "23",
    suffix: "",
    delta: "+0,4%",
    deltaLabel: "vs last month",
    spark: [4, 5, 4, 6, 5, 7, 6, 8, 9, 10],
  },
];

export default function OrderManagement() {
  return (
    <Shell breadcrumb="Order Management" active="Order Management">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-medium tracking-tight">Order Management</h1>
        <Button size="lg">
          <HugeiconsIcon icon={PlusSignIcon} size={14} data-icon="inline-start" />
          Create Order
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((kpi) => (
          <KpiCard key={kpi.label} kpi={kpi} />
        ))}
      </div>

      <OrdersTable />
    </Shell>
  );
}
