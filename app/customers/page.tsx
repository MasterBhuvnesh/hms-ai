"use client";

import { useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { FileExportIcon, PlusSignIcon } from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { KpiCard } from "@/components/dashboard/cards";
import { AddDialog } from "@/components/dashboard/add-dialog";
import { Shell } from "@/components/dashboard/shell";
import type { Kpi } from "@/components/dashboard/cards";
import { CustomersTable } from "./customers-table";
import { DuplicatesPanel } from "@/components/dashboard/duplicates-panel";
import { patients as patientsSeed, type Patient } from "@/data/hospital";

const kpis: Kpi[] = [
  {
    label: "Total Patients",
    value: "4,305",
    suffix: "",
    delta: "+6,4%",
    deltaLabel: "vs last month",
    spark: [4, 6, 5, 7, 6, 8, 7, 9, 8, 12],
  },
  {
    label: "Admitted Now",
    value: "42",
    suffix: "beds",
    delta: "+4",
    deltaLabel: "vs yesterday",
    spark: [3, 5, 4, 6, 5, 7, 6, 8, 9, 11],
  },
  {
    label: "Emergency Today",
    value: "18",
    suffix: "",
    delta: "+2",
    deltaLabel: "vs yesterday",
    spark: [5, 4, 6, 5, 7, 6, 8, 7, 9, 10],
  },
  {
    label: "Critical Care",
    value: "6",
    suffix: "ICU",
    delta: "-1",
    deltaLabel: "vs yesterday",
    spark: [4, 5, 4, 6, 7, 6, 8, 9, 8, 12],
  },
];

export default function Customers() {
  const [rows, setRows] = useState<Patient[]>(patientsSeed);

  return (
    <Shell breadcrumb="Patient List" active="Patients">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-medium tracking-tight">Patients</h1>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="lg" className="bg-card">
            <HugeiconsIcon icon={FileExportIcon} size={14} data-icon="inline-start" />
            Export CSV
          </Button>
          <AddDialog
            title="Register Patient"
            submitLabel="Register Patient"
            fields={[
              { name: "name", label: "Name", placeholder: "Jane Cooper" },
              { name: "age", label: "Age", type: "number", placeholder: "32" },
              { name: "doctor", label: "Doctor", placeholder: "Dr. Aditi Rao" },
              { name: "department", label: "Department", options: ["Cardiology", "Orthopedics", "Pediatrics", "Neurology", "General", "Emergency", "Radiology", "Pharmacy"] },
              { name: "status", label: "Status", options: ["Admitted", "Outpatient", "Emergency", "Critical", "Discharged"] },
            ]}
            onSubmit={(v) =>
              setRows((r) => [
                {
                  id: `P-${1000 + r.length + 1}`,
                  name: v.name,
                  age: Number(v.age) || 0,
                  gender: "Other",
                  phone: "+91 00000 00000",
                  blood: "O+",
                  doctor: v.doctor,
                  department: v.department,
                  lastVisit: "6 Nov 2025",
                  status: v.status as Patient["status"],
                },
                ...r,
              ])
            }
            trigger={
              <Button size="lg">
                <HugeiconsIcon icon={PlusSignIcon} size={14} data-icon="inline-start" />
                Register Patient
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

      <CustomersTable rows={rows} onChange={setRows} />

      <DuplicatesPanel rows={rows} onMerge={(_keep, remove) => setRows((r) => r.filter((p) => p.id !== remove))} />
    </Shell>
  );
}
