"use client";

import { useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { AiMagicIcon, FileExportIcon, PlusSignIcon } from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MoreButton, PanelTitle } from "@/components/dashboard/cards";
import { AddDialog } from "@/components/dashboard/add-dialog";
import { Shell } from "@/components/dashboard/shell";
import { Leaderboard } from "./leaderboard";
import { staff as staffSeed, type StaffMember } from "@/data/hospital";

const kpis = [
  { label: "Total Staff", value: "66", suffix: "", delta: "+3", deltaLabel: "this quarter", spark: [4, 4, 5, 5, 6, 7, 7, 8, 9, 12] },
  { label: "Doctors On Duty", value: "14", suffix: "", delta: "+2", deltaLabel: "today", spark: [5, 6, 4, 7, 6, 8, 7, 9, 8, 12] },
  { label: "Nurses On Duty", value: "22", suffix: "", delta: "+1", deltaLabel: "today", spark: [6, 5, 7, 6, 8, 7, 9, 8, 10, 12] },
  { label: "On Leave", value: "4", suffix: "", delta: "-1", deltaLabel: "vs yesterday", spark: [10, 9, 8, 9, 7, 8, 6, 5, 6, 12] },
];

const monthShades = ["bg-foreground", "bg-foreground/60", "bg-foreground/30"];

export default function TeamPerformance() {
  const [rows, setRows] = useState<StaffMember[]>(staffSeed);

  return (
    <Shell breadcrumb="Doctors & Staff" active="Doctors & Staff">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-medium tracking-tight">Doctors & Staff</h1>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="lg" className="bg-card">
            <HugeiconsIcon icon={FileExportIcon} size={14} data-icon="inline-start" />
            Export Report
          </Button>
          <AddDialog
            title="Add Staff"
            submitLabel="Add Staff"
            fields={[
              { name: "name", label: "Name", placeholder: "Dr. Jane Cooper" },
              {
                name: "role",
                label: "Role",
                options: ["Doctor", "Nurse", "Receptionist", "Billing Staff", "Pharmacist", "Lab Tech", "Management", "Admin"],
              },
              { name: "department", label: "Department", options: ["Cardiology", "Orthopedics", "Pediatrics", "Neurology", "General", "Emergency", "Radiology", "Pharmacy"] },
              { name: "shift", label: "Shift", options: ["Morning", "Evening", "Night"] },
              { name: "status", label: "Status", options: ["On Duty", "Off Duty", "On Leave"] },
            ]}
            onSubmit={(v) =>
              setRows((r) => [
                {
                  name: v.name,
                  role: v.role as StaffMember["role"],
                  department: v.department,
                  patients: 0,
                  shift: v.shift as StaffMember["shift"],
                  status: v.status as StaffMember["status"],
                },
                ...r,
              ])
            }
            trigger={
              <Button size="lg">
                <HugeiconsIcon icon={PlusSignIcon} size={14} data-icon="inline-start" />
                Add Staff
              </Button>
            }
          />
        </div>
      </div>

      <Card className="gap-0 bg-muted/50 p-1 ring-0 shadow-sm dark:bg-muted">
        <div className="grid divide-y rounded-xl bg-card md:grid-cols-4 md:divide-x md:divide-y-0">
          {kpis.map((kpi) => (
            <div key={kpi.label} className="space-y-2.5 p-5">
              <p className="font-mono text-[11px] tracking-wide text-muted-foreground uppercase">
                {kpi.label}
              </p>
              <p className="font-mono text-[28px] leading-none font-medium tracking-tight">
                {kpi.value}
              </p>
              <p className="text-xs font-medium">
                <span className="font-mono text-emerald-600 dark:text-emerald-500">{kpi.delta}</span>{" "}
                <span className="font-sans text-muted-foreground">{kpi.deltaLabel}</span>
              </p>
            </div>
          ))}
        </div>
      </Card>

      <div className="grid gap-4 xl:grid-cols-3">
        <Leaderboard rows={rows} onChange={setRows} />

        <Card className="gap-0 bg-muted/50 p-1 ring-0 shadow-sm dark:bg-muted">
          <div className="flex items-center justify-between px-3 py-2">
            <PanelTitle title="Shift Coverage" />
            <MoreButton />
          </div>
          <div className="flex-1 space-y-5 rounded-xl bg-card p-4">
            <div>
              <p className="text-sm text-muted-foreground">Today's coverage</p>
              <p className="mt-1 font-mono text-2xl font-semibold tracking-tight">
                87%
                <span className="ml-2 font-sans text-xs font-normal text-muted-foreground">
                  of shifts filled
                </span>
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="h-1.5 flex-1 rounded-full bg-foreground/10">
                <span className="block h-full rounded-full bg-foreground" style={{ width: "87%" }} />
              </span>
              <span className="font-mono text-xs font-medium">87%</span>
            </div>
            <div className="flex items-center gap-2.5 rounded-xl bg-muted p-2 text-sm text-muted-foreground">
              <span className="flex size-7 items-center justify-center rounded-lg border bg-card">
                <HugeiconsIcon icon={AiMagicIcon} size={14} />
              </span>
              Get AI staffing suggestions
            </div>
            <div className="space-y-3">
              <p className="font-mono text-[11px] tracking-wide text-muted-foreground uppercase">
                Shift Split
              </p>
              <div className="flex h-2.5 gap-0.5 overflow-hidden rounded-full">
                {[{ share: 44 }, { share: 33 }, { share: 23 }].map((s, i) => (
                  <div key={i} className={monthShades[i]} style={{ width: `${s.share}%` }} />
                ))}
              </div>
              <div className="space-y-2.5">
                {[
                  { name: "Morning", value: "28 staff", share: 44 },
                  { name: "Evening", value: "21 staff", share: 33 },
                  { name: "Night", value: "15 staff", share: 23 },
                ].map((m, i) => (
                  <div key={m.name} className="flex items-center gap-2.5 text-xs">
                    <span className={`size-2.5 rounded-[3px] ${monthShades[i]}`} />
                    <span>{m.name}</span>
                    <span className="ml-auto font-mono font-medium">{m.value}</span>
                    <span className="w-9 text-right font-mono text-muted-foreground">{m.share}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>
      </div>
    </Shell>
  );
}
