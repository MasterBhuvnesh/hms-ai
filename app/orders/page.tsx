"use client";

import { useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { PlusSignIcon } from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { KpiCard } from "@/components/dashboard/cards";
import { AddDialog } from "@/components/dashboard/add-dialog";
import { Shell } from "@/components/dashboard/shell";
import type { Kpi } from "@/components/dashboard/cards";
import { OrdersTable } from "./orders-table";
import { appointments as appointmentsSeed, type Appointment } from "@/data/hospital";

const kpis: Kpi[] = [
  {
    label: "Today's Appointments",
    value: "86",
    suffix: "",
    delta: "+8",
    deltaLabel: "vs yesterday",
    spark: [4, 6, 5, 7, 6, 8, 7, 9, 8, 12],
  },
  {
    label: "In Progress",
    value: "12",
    suffix: "",
    delta: "+2",
    deltaLabel: "right now",
    spark: [3, 5, 4, 6, 5, 7, 8, 7, 9, 10],
  },
  {
    label: "Completed",
    value: "54",
    suffix: "",
    delta: "+6",
    deltaLabel: "today",
    spark: [5, 4, 6, 5, 7, 6, 8, 9, 8, 11],
  },
  {
    label: "No Show / Cancelled",
    value: "7",
    suffix: "",
    delta: "-2",
    deltaLabel: "vs yesterday",
    spark: [4, 5, 4, 6, 5, 7, 6, 8, 9, 10],
  },
];

export default function OrderManagement() {
  const [rows, setRows] = useState<Appointment[]>(appointmentsSeed);

  return (
    <Shell breadcrumb="Appointments" active="Appointments">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-medium tracking-tight">Appointments</h1>
        <AddDialog
          title="Book Appointment"
          submitLabel="Book Appointment"
          fields={[
            { name: "patient", label: "Patient", placeholder: "Jane Cooper" },
            { name: "doctor", label: "Doctor", placeholder: "Dr. Aditi Rao" },
            { name: "department", label: "Department", options: ["Cardiology", "Orthopedics", "Pediatrics", "Neurology", "General", "Emergency", "Radiology", "Pharmacy"] },
            { name: "type", label: "Type", options: ["Consult", "Follow-up", "Emergency", "Surgery", "Lab Test"] },
            {
              name: "status",
              label: "Status",
              options: ["Scheduled", "In Progress", "Completed", "Cancelled", "No Show"],
            },
          ]}
          onSubmit={(v) => {
            const maxNum = rows.reduce(
              (m, o) => Math.max(m, Number(o.id.replace(/\D/g, "")) || 0),
              5000,
            );
            setRows((r) => [
              {
                id: `APT-${maxNum + 1}`,
                patient: v.patient,
                doctor: v.doctor,
                department: v.department,
                date: "6 Nov 2025",
                time: "10:00",
                type: v.type as Appointment["type"],
                status: v.status as Appointment["status"],
              },
              ...r,
            ]);
          }}
          trigger={
            <Button size="lg">
              <HugeiconsIcon icon={PlusSignIcon} size={14} data-icon="inline-start" />
              Book Appointment
            </Button>
          }
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((kpi) => (
          <KpiCard key={kpi.label} kpi={kpi} />
        ))}
      </div>

      <OrdersTable rows={rows} onChange={setRows} />
    </Shell>
  );
}
