"use client";

import { useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { FileExportIcon, PlusSignIcon } from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { KpiCard } from "@/components/dashboard/cards";
import { AddDialog, money } from "@/components/dashboard/add-dialog";
import { Shell } from "@/components/dashboard/shell";
import type { Kpi } from "@/components/dashboard/cards";
import { CustomersTable } from "./customers-table";
import { customers as customersSeed, type Customer } from "@/data/mock";

const kpis: Kpi[] = [
  {
    label: "Total Customers",
    value: "4,305",
    suffix: "",
    delta: "+6,4%",
    deltaLabel: "vs last month",
    spark: [4, 6, 5, 7, 6, 8, 7, 9, 8, 12],
  },
  {
    label: "New This Month",
    value: "320",
    suffix: "",
    delta: "+12,1%",
    deltaLabel: "vs last month",
    spark: [3, 5, 4, 6, 5, 7, 6, 8, 9, 11],
  },
  {
    label: "Repeat Rate",
    value: "38,2%",
    suffix: "",
    delta: "+2,3%",
    deltaLabel: "vs last month",
    spark: [5, 4, 6, 5, 7, 6, 8, 7, 9, 10],
  },
  {
    label: "Avg Lifetime Value",
    value: "$412",
    suffix: "",
    delta: "+4,8%",
    deltaLabel: "vs last month",
    spark: [4, 5, 4, 6, 7, 6, 8, 9, 8, 12],
  },
];

export default function Customers() {
  const [rows, setRows] = useState<Customer[]>(customersSeed);

  return (
    <Shell breadcrumb="Customer List" active="Customer List">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-medium tracking-tight">Customers</h1>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="lg" className="bg-card">
            <HugeiconsIcon icon={FileExportIcon} size={14} data-icon="inline-start" />
            Export CSV
          </Button>
          <AddDialog
            title="Add Customer"
            submitLabel="Add Customer"
            fields={[
              { name: "name", label: "Name", placeholder: "Jane Cooper" },
              { name: "email", label: "Email", placeholder: "jane@mail.com" },
              { name: "location", label: "Location", placeholder: "Austin, TX" },
              { name: "orders", label: "Orders", type: "number", placeholder: "0" },
              { name: "totalSpent", label: "Total spent", type: "number", placeholder: "0" },
              { name: "status", label: "Status", options: ["Active", "Inactive"] },
            ]}
            onSubmit={(v) =>
              setRows((r) => [
                {
                  name: v.name,
                  email: v.email,
                  location: v.location,
                  orders: Number(v.orders) || 0,
                  totalSpent: money(v.totalSpent),
                  status: v.status as Customer["status"],
                },
                ...r,
              ])
            }
            trigger={
              <Button size="lg">
                <HugeiconsIcon icon={PlusSignIcon} size={14} data-icon="inline-start" />
                Add Customer
              </Button>
            }
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((kpi) => (
          <KpiCard key={kpi.label} kpi={kpi} />
        ))}
      </div>

      <CustomersTable rows={rows} />
    </Shell>
  );
}
