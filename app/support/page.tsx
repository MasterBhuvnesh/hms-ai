"use client";

import { useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { PlusSignIcon } from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { KpiCard } from "@/components/dashboard/cards";
import { AddDialog } from "@/components/dashboard/add-dialog";
import { Shell } from "@/components/dashboard/shell";
import { TicketsTable } from "./tickets-table";
import { tickets as ticketsSeed, type Ticket } from "@/data/mock";

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
  const [rows, setRows] = useState<Ticket[]>(ticketsSeed);

  return (
    <Shell breadcrumb="Customer Support" active="Customer Support">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-medium tracking-tight">Customer Support</h1>
        <AddDialog
          title="New Ticket"
          submitLabel="Create Ticket"
          fields={[
            { name: "customer", label: "Customer", placeholder: "Jane Cooper" },
            { name: "subject", label: "Subject", placeholder: "Payment failed on checkout" },
            { name: "priority", label: "Priority", options: ["High", "Medium", "Low"] },
            { name: "status", label: "Status", options: ["Open", "Pending", "Resolved"] },
          ]}
          onSubmit={(v) => {
            const maxNum = rows.reduce(
              (m, tk) => Math.max(m, Number(tk.id.replace(/\D/g, "")) || 0),
              1000,
            );
            setRows((r) => [
              {
                id: `#T-${maxNum + 1}`,
                customer: v.customer,
                subject: v.subject,
                priority: v.priority as Ticket["priority"],
                status: v.status as Ticket["status"],
                updated: "Now",
              },
              ...r,
            ]);
          }}
          trigger={
            <Button size="lg">
              <HugeiconsIcon icon={PlusSignIcon} size={14} data-icon="inline-start" />
              New Ticket
            </Button>
          }
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((kpi) => (
          <KpiCard key={kpi.label} kpi={kpi} />
        ))}
      </div>

      <TicketsTable rows={rows} />
    </Shell>
  );
}
