"use client";

import { useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { PlusSignIcon, Search01Icon } from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { KpiCard, MoreButton, PanelTitle, StatusBadge } from "@/components/dashboard/cards";
import { TablePagination } from "@/components/dashboard/table-pagination";
import { FilterPills, Th, useDataTable } from "@/components/dashboard/use-table";
import { Shell } from "@/components/dashboard/shell";
import { AddDialog, type Field } from "@/components/dashboard/add-dialog";
import { DeleteConfirm, EditDialog, RowActions } from "@/components/dashboard/row-actions";
import { triageQueue as seedQueue, type Triage } from "@/data/hospital";
import { IncomingAmbulances } from "./incoming-ambulances";

const TRIAGE_FIELDS: Field[] = [
  { name: "patient", label: "Patient", placeholder: "Patient name" },
  { name: "age", label: "Age", type: "number" },
  { name: "severity", label: "Severity", options: ["Critical", "Urgent", "Stable"] },
  { name: "complaint", label: "Complaint", placeholder: "Chief complaint" },
  { name: "doctor", label: "Doctor", placeholder: "Assigned doctor" },
  { name: "status", label: "Status", options: ["Waiting", "In Progress", "Admitted", "Discharged"] },
];

function ForecastPanel({ rows }: { rows: Triage[] }) {
  const FORECAST = [6, 9, 12, 8, 14, 7];
  const HOURS = ["2 PM", "3 PM", "4 PM", "5 PM", "6 PM", "7 PM"];
  const max = Math.max(...FORECAST);

  const boarding = rows.filter((q) => q.status === "Waiting" && q.waitMins > 45).length;
  const criticalWaiting = rows.filter((q) => q.status === "Waiting" && q.severity === "Critical").length;
  const waitingTotal = rows.filter((q) => q.status === "Waiting").length;

  const boardingClass =
    boarding > 3
      ? "text-red-600 dark:text-red-500"
      : boarding > 0
        ? "text-amber-600 dark:text-amber-500"
        : "text-emerald-600 dark:text-emerald-500";

  const actions: string[] = [
    boarding > 3 ? "Open 2 buffer beds" : boarding > 0 ? "Prep 1 buffer bed" : "Staffing adequate",
    criticalWaiting > 0 ? "Alert on-call surgeon" : "Routine escalation path",
    waitingTotal > 5 ? "Call in float nurse" : "Monitor queue hourly",
  ];

  return (
    <Card className="gap-0 bg-muted/50 p-1 ring-0 shadow-sm dark:bg-muted">
      <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2">
        <PanelTitle title="Arrival Forecast" />
        <MoreButton />
      </div>
      <div className="rounded-xl bg-card p-4">
        <div className="flex h-28 items-end gap-2">
          {FORECAST.map((v, i) => (
            <div key={HOURS[i]} className="flex flex-1 flex-col items-center gap-1.5">
              <span className="font-mono text-[11px] text-muted-foreground">{v}</span>
              <div className="flex h-20 w-full items-end">
                <div
                  className={`w-full rounded-full ${v === max ? "bg-foreground" : "bg-foreground/25"}`}
                  style={{ height: `${(v / max) * 100}%` }}
                />
              </div>
              <span className="font-mono text-[10px] tracking-wider text-muted-foreground uppercase">
                {HOURS[i]}
              </span>
            </div>
          ))}
        </div>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 rounded-xl border px-3 py-2">
          <span className="font-mono text-[11px] tracking-wide text-muted-foreground uppercase">
            Boarding &gt;45m
          </span>
          <span className={`font-mono text-sm font-medium ${boardingClass}`}>
            {boarding} waiting
          </span>
        </div>
        <ul className="mt-3 space-y-1.5">
          {actions.map((a) => (
            <li key={a} className="flex items-center gap-2 text-sm text-muted-foreground">
              <span className="size-1.5 rounded-full bg-foreground/40" />
              {a}
            </li>
          ))}
        </ul>
      </div>
    </Card>
  );
}

function TriageTable({ rows, onChange }: { rows: Triage[]; onChange: (rows: Triage[]) => void }) {
  const [editRow, setEditRow] = useState<Triage | null>(null);
  const [deleteRow, setDeleteRow] = useState<Triage | null>(null);
  const t = useDataTable(rows, {
    searchFields: (r) => [r.id, r.patient, r.complaint, r.doctor],
    filterField: (r) => r.status,
    sorters: {
      id: (r) => r.id,
      patient: (r) => r.patient,
      severity: (r) => r.severity,
      waitMins: (r) => r.waitMins,
      doctor: (r) => r.doctor,
      status: (r) => r.status,
    },
  });

  return (
    <Card className="gap-0 bg-muted/50 p-1 ring-0 shadow-sm dark:bg-muted">
      <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2">
        <PanelTitle title="Triage Queue" />
        <div className="flex items-center gap-2">
          <FilterPills
            options={["All", "Waiting", "In Progress", "Admitted", "Discharged"]}
            value={t.filter}
            onChange={t.setFilter}
          />
          <div className="relative hidden md:block">
            <HugeiconsIcon icon={Search01Icon} size={14} className="absolute top-1/2 left-2.5 -translate-y-1/2 text-muted-foreground" />
            <Input value={t.query} onChange={(e) => t.setQuery(e.target.value)} placeholder="Search queue..." className="h-8 w-56 rounded-lg bg-muted/40 pl-8 shadow-none" />
          </div>
          <MoreButton />
        </div>
      </div>
      <div className="overflow-hidden rounded-xl bg-card py-2">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <Th label="Token" k="id" sort={t} />
              <Th label="Patient" k="patient" sort={t} />
              <Th label="Severity" k="severity" sort={t} />
              <TableHead className="font-mono text-[10px] tracking-wider text-muted-foreground uppercase">Complaint</TableHead>
              <Th label="Wait" k="waitMins" sort={t} />
              <Th label="Doctor" k="doctor" sort={t} />
              <Th label="Status" k="status" sort={t} />
              <TableHead className="pr-4 text-right font-mono text-[10px] tracking-wider text-muted-foreground uppercase">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {t.rows.length === 0 && (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={8} className="py-8 text-center text-sm text-muted-foreground">No results found</TableCell>
              </TableRow>
            )}
            {t.rows.map((q) => (
              <TableRow key={q.id} className={q.status === "Discharged" ? "opacity-60" : ""}>
                <TableCell className="font-mono text-muted-foreground">{q.id}</TableCell>
                <TableCell className="font-medium">{q.patient}</TableCell>
                <TableCell><StatusBadge status={q.severity} /></TableCell>
                <TableCell className="text-muted-foreground">{q.complaint}</TableCell>
                <TableCell className="font-mono">{q.waitMins}m</TableCell>
                <TableCell className="text-muted-foreground">{q.doctor}</TableCell>
                <TableCell><StatusBadge status={q.status} /></TableCell>
                <TableCell className="pr-4 text-right">
                  <div className="flex justify-end">
                    <RowActions label={q.id} onEdit={() => setEditRow(q)} onDelete={() => setDeleteRow(q)} />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <TablePagination page={t.page} pageSize={t.pageSize} total={t.total} onPageChange={t.setPage} onPageSizeChange={t.setPageSize} />
      <EditDialog
        open={!!editRow}
        onOpenChange={(o) => !o && setEditRow(null)}
        title={editRow ? `Edit ${editRow.id}` : "Edit entry"}
        fields={TRIAGE_FIELDS}
        initial={
          editRow
            ? { patient: editRow.patient, age: String(editRow.age), severity: editRow.severity, complaint: editRow.complaint, doctor: editRow.doctor, status: editRow.status }
            : { patient: "", age: "", severity: "", complaint: "", doctor: "", status: "" }
        }
        onSave={(v) => {
          if (!editRow) return;
          onChange(
            rows.map((r) =>
              r.id === editRow.id
                ? {
                    ...r,
                    patient: v.patient.trim() || r.patient,
                    age: Number(v.age) || r.age,
                    severity: v.severity as Triage["severity"],
                    complaint: v.complaint.trim() || r.complaint,
                    doctor: v.doctor.trim() || r.doctor,
                    status: v.status as Triage["status"],
                  }
                : r,
            ),
          );
        }}
      />
      <DeleteConfirm
        open={!!deleteRow}
        onOpenChange={(o) => !o && setDeleteRow(null)}
        title={deleteRow ? `Entry ${deleteRow.id}` : "Entry"}
        description={deleteRow ? `This will permanently remove ${deleteRow.patient} (${deleteRow.id}) from the triage queue. This action cannot be undone.` : undefined}
        onConfirm={() => {
          if (!deleteRow) return;
          onChange(rows.filter((r) => r.id !== deleteRow.id));
        }}
      />
    </Card>
  );
}

export default function TriagePage() {
  const [queue, setQueue] = useState<Triage[]>(seedQueue);

  const waiting = queue.filter((q) => q.status === "Waiting").length;
  const critical = queue.filter((q) => q.severity === "Critical").length;
  const admitted = queue.filter((q) => q.status === "Admitted").length;

  const kpis = [
    { label: "Waiting", value: String(waiting), suffix: "patients", delta: "+2", deltaLabel: "in queue", spark: [4, 6, 5, 8, 6, 9, 7, 10, 8, 12] },
    { label: "Critical", value: String(critical), suffix: "cases", delta: "+1", deltaLabel: "needs attention", spark: [3, 5, 7, 4, 6, 8, 5, 7, 9, 10] },
    { label: "Avg Wait", value: "18m", suffix: "", delta: "-3m", deltaLabel: "vs last week", spark: [10, 9, 8, 9, 7, 8, 6, 5, 6, 8] },
    { label: "Admitted", value: String(admitted), suffix: "patients", delta: "+3", deltaLabel: "today", spark: [5, 4, 6, 5, 7, 6, 8, 9, 8, 11] },
  ];

  return (
    <Shell breadcrumb="Triage" active="Triage">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-medium tracking-tight">Emergency Triage Queue</h1>
        <AddDialog
          title="Add to Queue"
          submitLabel="Add to Queue"
          fields={[
            { name: "patient", label: "Patient", placeholder: "Patient name" },
            { name: "severity", label: "Severity", options: ["Critical", "Urgent", "Stable"] },
            { name: "complaint", label: "Complaint", placeholder: "Chief complaint" },
            { name: "doctor", label: "Doctor", placeholder: "Assigned doctor" },
          ]}
          onSubmit={(v) =>
            setQueue((prev) => [
              ...prev,
              {
                id: `T-${201 + prev.length}`,
                patient: v.patient.trim(),
                age: 35,
                severity: v.severity as Triage["severity"],
                complaint: v.complaint.trim() || "Under evaluation",
                waitMins: 0,
                doctor: v.doctor.trim() || "Dr. Aditi Rao",
                status: "Waiting",
              },
            ])
          }
          trigger={
            <Button size="lg">
              <HugeiconsIcon icon={PlusSignIcon} size={14} data-icon="inline-start" />
              Add to Queue
            </Button>
          }
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((kpi) => (
          <KpiCard key={kpi.label} kpi={kpi} />
        ))}
      </div>

      <ForecastPanel rows={queue} />

      <IncomingAmbulances />

      <TriageTable rows={queue} onChange={setQueue} />
    </Shell>
  );
}
