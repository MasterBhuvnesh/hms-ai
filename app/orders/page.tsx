"use client";

import { useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { PlusSignIcon } from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { KpiCard } from "@/components/dashboard/cards";
import { AddDialog, money } from "@/components/dashboard/add-dialog";
import { Shell } from "@/components/dashboard/shell";
import type { Kpi } from "@/components/dashboard/cards";
import { OrdersTable } from "./orders-table";
import { orders as ordersSeed, type Order } from "@/data/mock";
import data from "@/data/dashboard.json";

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
  const [rows, setRows] = useState<Order[]>(ordersSeed);

  return (
    <Shell breadcrumb="Order Management" active="Order Management">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-medium tracking-tight">Order Management</h1>
        <AddDialog
          title="Create Order"
          submitLabel="Create Order"
          fields={[
            { name: "customer", label: "Customer", placeholder: "Jane Cooper" },
            { name: "items", label: "Items", type: "number", placeholder: "1" },
            { name: "total", label: "Total", type: "number", placeholder: "0" },
            {
              name: "status",
              label: "Status",
              options: ["Processing", "Shipped", "Delivered", "Cancelled"],
            },
          ]}
          onSubmit={(v) => {
            const maxNum = rows.reduce(
              (m, o) => Math.max(m, Number(o.id.replace(/\D/g, "")) || 0),
              7300,
            );
            setRows((r) => [
              {
                id: `ORD-${maxNum + 1}`,
                customer: v.customer,
                items: Number(v.items) || 1,
                total: money(v.total),
                status: v.status as Order["status"],
                date: data.date,
              },
              ...r,
            ]);
          }}
          trigger={
            <Button size="lg">
              <HugeiconsIcon icon={PlusSignIcon} size={14} data-icon="inline-start" />
              Create Order
            </Button>
          }
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((kpi) => (
          <KpiCard key={kpi.label} kpi={kpi} />
        ))}
      </div>

      <OrdersTable rows={rows} />
    </Shell>
  );
}
