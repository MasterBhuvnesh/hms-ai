"use client";

import { useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { PlusSignIcon } from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { KpiCard } from "@/components/dashboard/cards";
import { AddDialog } from "@/components/dashboard/add-dialog";
import { Shell } from "@/components/dashboard/shell";
import { TicketsTable } from "./tickets-table";
import type { Ticket } from "@/data/mock";

const ticketsSeed: Ticket[] = [
  { id: "#T-2001", customer: "Ward B - Bed 12", subject: "AC not working Ward B", priority: "High", status: "Open", updated: "12m ago" },
  { id: "#T-2002", customer: "ICU - Bed 3", subject: "IV stand needed", priority: "High", status: "Open", updated: "45m ago" },
  { id: "#T-2003", customer: "Ward A - Bed 7", subject: "Oxygen port leaking", priority: "High", status: "Pending", updated: "1h ago" },
  { id: "#T-2004", customer: "Emergency - Bay 2", subject: "Stretcher wheel jammed", priority: "Medium", status: "Open", updated: "2h ago" },
  { id: "#T-2005", customer: "Pediatrics - Room 4", subject: "Nebulizer not working", priority: "Medium", status: "Pending", updated: "4h ago" },
  { id: "#T-2006", customer: "General - Bed 21", subject: "Bathroom tap leaking", priority: "Low", status: "Open", updated: "Yesterday" },
  { id: "#T-2007", customer: "Maternity - Room 2", subject: "Extra pillows requested", priority: "Low", status: "Resolved", updated: "Yesterday" },
  { id: "#T-2008", customer: "Ward C - Bed 9", subject: "TV remote missing", priority: "Low", status: "Resolved", updated: "3d ago" },
  { id: "#T-2009", customer: "Radiology - Waiting", subject: "Token display frozen", priority: "Medium", status: "Resolved", updated: "5d ago" },
];

const kpis = [
  {
    label: "Open Issues",
    value: "24",
    suffix: "",
    delta: "+1,2%",
    deltaLabel: "this week",
    spark: [10, 14, 12, 16, 13, 18, 15, 20, 17, 22],
  },
  {
    label: "Avg Response",
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

export default function HospitalHelpdesk() {
  const [rows, setRows] = useState<Ticket[]>(ticketsSeed);

  return (
    <Shell breadcrumb="Helpdesk" active="Helpdesk">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-medium tracking-tight">Helpdesk</h1>
        <AddDialog
          href="/support"
          title="New Ticket"
          submitLabel="Create Ticket"
          fields={[
            { name: "customer", label: "Patient / Ward", placeholder: "Ward B - Bed 12" },
            { name: "subject", label: "Subject", placeholder: "AC not working Ward B" },
            { name: "priority", label: "Priority", options: ["High", "Medium", "Low"] },
            { name: "status", label: "Status", options: ["Open", "Pending", "Resolved"] },
          ]}
          onSubmit={(v) => {
            const maxNum = rows.reduce(
              (m, tk) => Math.max(m, Number(tk.id.replace(/\D/g, "")) || 0),
              2000,
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

      <TicketsTable rows={rows} onChange={setRows} />
    </Shell>
  );
}
