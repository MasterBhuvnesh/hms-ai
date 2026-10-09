"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { Search01Icon, PrinterIcon } from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { KpiCard, MoreButton, PanelTitle, StatusBadge, type Kpi } from "@/components/dashboard/cards";
import { TablePagination } from "@/components/dashboard/table-pagination";
import { FilterPills, Th, useDataTable } from "@/components/dashboard/use-table";
import { Shell } from "@/components/dashboard/shell";
import { DeleteConfirm, EditDialog, RowActions } from "@/components/dashboard/row-actions";
import type { Field } from "@/components/dashboard/add-dialog";
import { DEPARTMENTS, appointments, discharges as seedDischarges, type Discharge } from "@/data/hospital";

const DISCHARGE_FIELDS: Field[] = [
  { name: "patient", label: "Patient", placeholder: "Patient name" },
  { name: "doctor", label: "Doctor", placeholder: "Doctor name" },
  { name: "department", label: "Department", options: DEPARTMENTS },
  { name: "diagnosis", label: "Diagnosis", placeholder: "Diagnosis" },
  { name: "dischargeDate", label: "Discharge Date", placeholder: "e.g. 12 Nov 2025" },
  { name: "status", label: "Status", options: ["Ready", "Completed", "Pending"] },
];

function printDischarge(d: Discharge) {
  const w = window.open("", "_blank", "width=720,height=900");
  if (!w) return;
  w.document.write(`<!doctype html><html><head><title>${d.id} - Discharge Summary</title>
  <style>body{font-family:Arial,sans-serif;padding:32px;color:#111}h1{font-size:20px;margin:0}p{margin:4px 0;font-size:13px}
  table{width:100%;border-collapse:collapse;margin-top:16px;font-size:13px}th,td{border:1px solid #ccc;padding:8px;text-align:left}
  .head{display:flex;justify-content:space-between;border-bottom:2px solid #111;padding-bottom:12px;margin-bottom:12px}</style></head><body>
  <div class="head"><div><h1>CityCare Hospital</h1><p>General, Cardiology, Orthopedics, Pediatrics</p><p>Phone: +91 80 4000 1000</p></div>
  <div style="text-align:right"><p><strong>${d.id}</strong></p><p>Admit: ${d.admitDate}</p><p>Discharge: ${d.dischargeDate}</p></div></div>
  <p><strong>Patient:</strong> ${d.patient}</p>
  <p><strong>Doctor:</strong> ${d.doctor} (${d.department})</p>
  <p><strong>Diagnosis:</strong> ${d.diagnosis}</p>
  <p><strong>Status:</strong> ${d.status}</p>
  <p style="margin-top:24px">Doctor signature: ____________________</p>
  <script>window.onload=()=>{window.print()}</script></body></html>`);
  w.document.close();
}

const PIPELINE_STAGES = ["Summary signed", "Bill ready", "Pharmacy returns", "Housekeeping done", "Bed released"] as const;

function emptyStages(): boolean[] {
  return [false, false, false, false, false];
}

function stagesOf(stages: Record<string, boolean[]>, id: string): boolean[] {
  return stages[id] ?? emptyStages();
}

function doneCount(stages: Record<string, boolean[]>, id: string): number {
  return stagesOf(stages, id).filter(Boolean).length;
}

function DischargesTable({ rows, onChange, onView, stages }: { rows: Discharge[]; onChange: (rows: Discharge[]) => void; onView: (d: Discharge) => void; stages: Record<string, boolean[]> }) {
  const [editRow, setEditRow] = useState<Discharge | null>(null);
  const [deleteRow, setDeleteRow] = useState<Discharge | null>(null);
  const t = useDataTable(rows, {
    searchFields: (r) => [r.id, r.patient, r.doctor, r.diagnosis],
    filterField: (r) => r.status,
    sorters: {
      id: (r) => r.id,
      patient: (r) => r.patient,
      doctor: (r) => r.doctor,
      admit: (r) => r.admitDate,
      discharge: (r) => r.dischargeDate,
      status: (r) => r.status,
      pipeline: (r) => doneCount(stages, r.id),
    },
  });

  return (
    <Card className="gap-0 bg-muted/50 p-1 ring-0 shadow-sm dark:bg-muted">
      <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2">
        <PanelTitle title="All Discharge Summaries" />
        <div className="flex items-center gap-2">
          <FilterPills options={["All", "Ready", "Completed", "Pending"]} value={t.filter} onChange={t.setFilter} />
          <div className="relative hidden md:block">
            <HugeiconsIcon icon={Search01Icon} size={14} className="absolute top-1/2 left-2.5 -translate-y-1/2 text-muted-foreground" />
            <Input value={t.query} onChange={(e) => t.setQuery(e.target.value)} placeholder="Search discharges..." className="h-8 w-56 rounded-lg bg-muted/40 pl-8 shadow-none" />
          </div>
          <MoreButton />
        </div>
      </div>
      <div className="overflow-hidden rounded-xl bg-card py-2">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-14 pl-4 font-mono text-[10px] tracking-wider text-muted-foreground uppercase">PDF</TableHead>
              <Th label="ID" k="id" sort={t} />
              <Th label="Patient" k="patient" sort={t} />
              <Th label="Doctor" k="doctor" sort={t} />
              <Th label="Admit" k="admit" sort={t} />
              <Th label="Discharge" k="discharge" sort={t} />
              <Th label="Status" k="status" sort={t} />
              <Th label="Pipeline" k="pipeline" sort={t} />
              <TableHead className="pr-4 text-right font-mono text-[10px] tracking-wider text-muted-foreground uppercase">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {t.rows.length === 0 && (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={9} className="py-8 text-center text-sm text-muted-foreground">No results found</TableCell>
              </TableRow>
            )}
            {t.rows.map((d) => (
              <TableRow key={d.id}>
                <TableCell className="pl-4">
                  <button onClick={() => onView(d)} aria-label={`Open ${d.id} PDF`} className="transition-all hover:opacity-80 active:translate-y-px">
                    <Image src="/pdf.svg" alt="PDF" width={28} height={28} />
                  </button>
                </TableCell>
                <TableCell className="font-mono text-muted-foreground">{d.id}</TableCell>
                <TableCell className="font-medium">{d.patient}</TableCell>
                <TableCell className="text-muted-foreground">{d.doctor}</TableCell>
                <TableCell className="font-mono">{d.admitDate}</TableCell>
                <TableCell className="font-mono">{d.dischargeDate}</TableCell>
                <TableCell><StatusBadge status={d.status} /></TableCell>
                <TableCell className="font-mono">{doneCount(stages, d.id)}/5</TableCell>
                <TableCell className="pr-4 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button variant="ghost" size="sm" onClick={() => onView(d)}>View</Button>
                    <Button variant="ghost" size="icon-sm" aria-label={`Print ${d.id}`} onClick={() => printDischarge(d)}>
                      <HugeiconsIcon icon={PrinterIcon} size={16} />
                    </Button>
                    <RowActions label={d.id} href="/discharge" onEdit={() => setEditRow(d)} onDelete={() => setDeleteRow(d)} />
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
        title={editRow ? `Edit Discharge ${editRow.id}` : "Edit Discharge"}
        fields={DISCHARGE_FIELDS}
        initial={
          editRow
            ? { patient: editRow.patient, doctor: editRow.doctor, department: editRow.department, diagnosis: editRow.diagnosis, dischargeDate: editRow.dischargeDate, status: editRow.status }
            : { patient: "", doctor: "", department: "", diagnosis: "", dischargeDate: "", status: "" }
        }
        onSave={(v) => {
          if (!editRow) return;
          onChange(
            rows.map((r) =>
              r.id === editRow.id
                ? {
                    ...r,
                    patient: v.patient.trim() || r.patient,
                    doctor: v.doctor.trim() || r.doctor,
                    department: v.department || r.department,
                    diagnosis: v.diagnosis.trim() || r.diagnosis,
                    dischargeDate: v.dischargeDate.trim() || r.dischargeDate,
                    status: v.status as Discharge["status"],
                  }
                : r,
            ),
          );
        }}
      />
      <DeleteConfirm
        open={!!deleteRow}
        onOpenChange={(o) => !o && setDeleteRow(null)}
        title={deleteRow ? `Discharge ${deleteRow.id}` : "Discharge"}
        description={deleteRow ? `This will permanently remove discharge summary ${deleteRow.id} for ${deleteRow.patient}. This action cannot be undone.` : undefined}
        onConfirm={() => {
          if (!deleteRow) return;
          onChange(rows.filter((r) => r.id !== deleteRow.id));
        }}
      />
    </Card>
  );
}

function FollowupLeakage({ rows }: { rows: Discharge[] }) {
  const [booked, setBooked] = useState<ReadonlySet<string>>(new Set());
  const followupNames = useMemo(
    () => new Set(appointments.filter((a) => a.type === "Follow-up").map((a) => a.patient.trim())),
    [],
  );
  const completed = rows.filter((d) => d.status === "Completed");
  const leakedActive = completed.filter(
    (d) => !followupNames.has(d.patient.trim()) && !booked.has(d.id),
  );
  const bookedRows = completed.filter(
    (d) => !followupNames.has(d.patient.trim()) && booked.has(d.id),
  );

  function book(id: string) {
    setBooked((prev) => new Set(prev).add(id));
  }

  return (
    <Card className="gap-0 bg-muted/50 p-1 ring-0 shadow-sm dark:bg-muted">
      <div className="flex items-center justify-between px-3 py-2">
        <PanelTitle title="Follow-up Leakage" />
        <MoreButton />
      </div>
      <div className="space-y-3 rounded-xl bg-card p-4">
        <div className="flex items-center justify-between gap-3 rounded-xl bg-muted p-3">
          <span className="font-mono text-sm font-medium">{leakedActive.length} leaked</span>
          <span className="text-xs text-muted-foreground">recoverable visits - book follow-ups to plug leakage</span>
        </div>
        {leakedActive.length === 0 && bookedRows.length === 0 && (
          <p className="py-4 text-center text-sm text-muted-foreground">
            No leakage - all completed discharges have follow-ups booked
          </p>
        )}
        <div className="space-y-2">
          {leakedActive.map((d) => (
            <div key={d.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border p-3">
              <div>
                <p className="font-medium">{d.patient}</p>
                <p className="text-xs text-muted-foreground">{d.doctor}</p>
              </div>
              <div className="flex items-center gap-2.5">
                <span className="font-mono text-xs text-muted-foreground">{d.dischargeDate}</span>
                <StatusBadge status={d.status} />
                <Button variant="outline" size="sm" onClick={() => book(d.id)}>
                  Book follow-up
                </Button>
              </div>
            </div>
          ))}
          {bookedRows.map((d) => (
            <div key={d.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border p-3">
              <div>
                <p className="font-medium">{d.patient}</p>
                <p className="text-xs text-muted-foreground">{d.doctor}</p>
              </div>
              <div className="flex items-center gap-2.5">
                <span className="font-mono text-xs text-muted-foreground">{d.dischargeDate}</span>
                <StatusBadge status={d.status} />
                <Button variant="outline" size="sm" disabled>
                  Booked
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}

export default function DischargePage() {
  const [list, setList] = useState<Discharge[]>(seedDischarges);
  const [selected, setSelected] = useState<Discharge | null>(null);
  const [stages, setStages] = useState<Record<string, boolean[]>>({});

  function handleChange(next: Discharge[]) {
    setList(next);
    setSelected((prev) => (prev ? (next.find((d) => d.id === prev.id) ?? null) : null));
  }

  function toggleStage(id: string, index: number) {
    const next = [...stagesOf(stages, id)];
    next[index] = !next[index];
    setStages((s) => ({ ...s, [id]: next }));
    if (next.every(Boolean)) {
      setList((prev) => prev.map((d) => (d.id === id ? { ...d, status: "Completed" } : d)));
      setSelected((prev) => (prev && prev.id === id ? { ...prev, status: "Completed" } : prev));
    }
  }

  const ready = list.filter((d) => d.status === "Ready").length;
  const completed = list.filter((d) => d.status === "Completed").length;
  const pending = list.filter((d) => d.status === "Pending").length;

  const kpis: Kpi[] = [
    { label: "Total Discharges", value: String(list.length), suffix: "", delta: "+3", deltaLabel: "this week", spark: [4, 6, 5, 7, 6, 8, 7, 9, 8, 12] },
    { label: "Ready", value: String(ready), suffix: "", delta: "+2", deltaLabel: "print-ready", spark: [3, 5, 4, 6, 5, 7, 8, 7, 9, 10] },
    { label: "Completed", value: String(completed), suffix: "", delta: "+4", deltaLabel: "this week", spark: [5, 4, 6, 5, 7, 6, 8, 9, 8, 11] },
    { label: "Pending", value: String(pending), suffix: "", delta: "-1", deltaLabel: "vs last week", spark: [4, 5, 4, 6, 5, 7, 6, 8, 9, 10] },
  ];

  return (
    <Shell breadcrumb="Discharge" active="Discharge">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-medium tracking-tight">Discharge Summaries</h1>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((kpi) => (
          <KpiCard key={kpi.label} kpi={kpi} />
        ))}
      </div>

      <DischargesTable rows={list} onChange={handleChange} onView={setSelected} stages={stages} />

      <FollowupLeakage rows={list} />

      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-mono">Discharge {selected?.id}</DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-4">
              <div className="flex items-start justify-between gap-4 rounded-xl border p-4">
                <div>
                  <p className="font-medium">CityCare Hospital</p>
                  <p className="text-xs text-muted-foreground">{selected.department} - {selected.dischargeDate}</p>
                  <p className="mt-2 text-sm"><span className="text-muted-foreground">Patient: </span>{selected.patient}</p>
                  <p className="text-sm"><span className="text-muted-foreground">Doctor: </span>{selected.doctor}</p>
                  <p className="text-sm"><span className="text-muted-foreground">Diagnosis: </span>{selected.diagnosis}</p>
                  <p className="text-sm"><span className="text-muted-foreground">Admit: </span><span className="font-mono">{selected.admitDate}</span></p>
                  <p className="text-sm"><span className="text-muted-foreground">Discharge: </span><span className="font-mono">{selected.dischargeDate}</span></p>
                </div>
                <Image src="/pdf.svg" alt="PDF" width={36} height={36} className="shrink-0" />
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Status</span>
                <StatusBadge status={selected.status} />
              </div>
              <div className="rounded-xl border p-4">
                <p className="font-mono text-[11px] tracking-wide text-muted-foreground uppercase">
                  Discharge pipeline - <span className="font-mono">{doneCount(stages, selected.id)}/5</span>
                </p>
                <div className="mt-3 space-y-2.5">
                  {PIPELINE_STAGES.map((label, i) => (
                    <label key={label} className="flex cursor-pointer items-center gap-2.5 text-sm">
                      <Checkbox
                        checked={stagesOf(stages, selected.id)[i]}
                        onCheckedChange={() => toggleStage(selected.id, i)}
                        aria-label={label}
                      />
                      <span className={stagesOf(stages, selected.id)[i] ? "text-muted-foreground line-through" : ""}>
                        {label}
                      </span>
                      <span className="ml-auto font-mono text-xs text-muted-foreground">{i + 1}/5</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelected(null)}>Close</Button>
            <Button onClick={() => selected && printDischarge(selected)}>
              <HugeiconsIcon icon={PrinterIcon} size={14} data-icon="inline-start" />
              Print / Save as PDF
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Shell>
  );
}
