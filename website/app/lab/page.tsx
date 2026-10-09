"use client";

import { useState } from "react";
import Image from "next/image";
import { HugeiconsIcon } from "@hugeicons/react";
import { PrinterIcon, Search01Icon } from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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
import { KpiCard, MoreButton, PanelTitle, StatusBadge } from "@/components/dashboard/cards";
import { TablePagination } from "@/components/dashboard/table-pagination";
import { FilterPills, Th, useDataTable } from "@/components/dashboard/use-table";
import { Shell } from "@/components/dashboard/shell";
import { DeleteConfirm, EditDialog, RowActions } from "@/components/dashboard/row-actions";
import type { Field } from "@/components/dashboard/add-dialog";
import { labReports as seedReports, type LabReport } from "@/data/hospital";

const LAB_FIELDS: Field[] = [
  { name: "patient", label: "Patient", placeholder: "Patient name" },
  { name: "test", label: "Test", options: ["CBC", "HbA1c", "Lipid Profile", "Chest X-Ray", "ECG", "MRI Brain", "Urine R/M", "Thyroid T3T4TSH"] },
  { name: "doctor", label: "Doctor", placeholder: "Doctor name" },
  { name: "result", label: "Result", placeholder: "Result" },
  { name: "status", label: "Status", options: ["Sample Collected", "In Progress", "Ready", "Critical"] },
];

function printLabReport(r: LabReport) {
  const w = window.open("", "_blank", "width=720,height=900");
  if (!w) return;
  w.document.write(`<!doctype html><html><head><title>${r.id} - Lab Report</title>
  <style>body{font-family:Arial,sans-serif;padding:32px;color:#111}h1{font-size:20px;margin:0}p{margin:4px 0;font-size:13px}
  table{width:100%;border-collapse:collapse;margin-top:16px;font-size:13px}th,td{border:1px solid #ccc;padding:8px;text-align:left}
  .head{display:flex;justify-content:space-between;border-bottom:2px solid #111;padding-bottom:12px;margin-bottom:12px}</style></head><body>
  <div class="head"><div><h1>CityCare Hospital</h1><p>Pathology and Radiology</p><p>Phone: +91 80 4000 1000</p></div>
  <div style="text-align:right"><p><strong>${r.id}</strong></p><p>${r.date}</p><p>${r.test}</p></div></div>
  <p><strong>Patient:</strong> ${r.patient}</p>
  <p><strong>Doctor:</strong> ${r.doctor}</p>
  <p><strong>Test:</strong> ${r.test}</p>
  <p><strong>Result:</strong> ${r.result}</p>
  <p>Status: ${r.status}</p>
  <p style="margin-top:24px">Signature: ____________________</p>
  <script>window.onload=()=>{window.print()}</script></body></html>`);
  w.document.close();
}

const IMAGING_TESTS = ["Chest X-Ray", "ECG", "MRI Brain"];

function imagingPriority(status: LabReport["status"]): number {
  if (status === "Critical") return 0;
  if (status === "In Progress") return 1;
  return 2;
}

function nextLabStatus(status: LabReport["status"]): LabReport["status"] {
  if (status === "Sample Collected") return "In Progress";
  if (status === "In Progress") return "Ready";
  if (status === "Critical") return "Ready";
  return "Ready";
}

function RadiologyQueue({ rows, onAdvance }: { rows: LabReport[]; onAdvance: (id: string) => void }) {
  const queue = rows
    .filter((r) => IMAGING_TESTS.includes(r.test) && r.status !== "Ready")
    .sort((a, b) => imagingPriority(a.status) - imagingPriority(b.status) || a.id.localeCompare(b.id));
  const hasCritical = queue.some((r) => r.status === "Critical");
  const oldestId = queue.length === 0 ? null : [...queue].sort((a, b) => a.id.localeCompare(b.id))[0].id;

  return (
    <Card className="gap-0 bg-muted/50 p-1 ring-0 shadow-sm dark:bg-muted">
      <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2">
        <PanelTitle title="Radiology Queue (critical first)" />
        <MoreButton />
      </div>
      <div className="overflow-hidden rounded-xl bg-card py-2">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-20 pl-4 font-mono text-[10px] tracking-wider text-muted-foreground uppercase">Priority</TableHead>
              <TableHead className="font-mono text-[10px] tracking-wider text-muted-foreground uppercase">Lab ID</TableHead>
              <TableHead className="font-mono text-[10px] tracking-wider text-muted-foreground uppercase">Patient</TableHead>
              <TableHead className="font-mono text-[10px] tracking-wider text-muted-foreground uppercase">Test</TableHead>
              <TableHead className="font-mono text-[10px] tracking-wider text-muted-foreground uppercase">Status</TableHead>
              <TableHead className="pr-4 text-right font-mono text-[10px] tracking-wider text-muted-foreground uppercase">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {queue.length === 0 && (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={6} className="py-8 text-center text-sm text-muted-foreground">No pending imaging</TableCell>
              </TableRow>
            )}
            {queue.map((r, i) => (
              <TableRow key={r.id}>
                <TableCell className="pl-4 font-mono text-muted-foreground">#{i + 1}</TableCell>
                <TableCell className="font-mono text-muted-foreground">{r.id}</TableCell>
                <TableCell className="font-medium">{r.patient}</TableCell>
                <TableCell className="text-muted-foreground">{r.test}</TableCell>
                <TableCell><StatusBadge status={r.status} /></TableCell>
                <TableCell className="pr-4 text-right">
                  <Button variant="outline" size="sm" disabled={r.status === "Ready"} onClick={() => onAdvance(r.id)}>
                    Advance
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 text-xs">
        <span className="text-muted-foreground">
          <span className="font-mono font-medium text-foreground">{queue.length}</span> pending imaging
          {oldestId && (
            <>
              {" · oldest "}<span className="font-mono">{oldestId}</span>
            </>
          )}
        </span>
        {hasCritical ? (
          <span className="font-medium text-red-600 dark:text-red-400">Critical imaging awaiting read</span>
        ) : (
          <span className="text-muted-foreground">{queue.length === 0 ? "Queue clear" : "No critical pending"}</span>
        )}
      </div>
    </Card>
  );
}

function LabTable({ rows, onChange, onView }: { rows: LabReport[]; onChange: (rows: LabReport[]) => void; onView: (r: LabReport) => void }) {
  const [editRow, setEditRow] = useState<LabReport | null>(null);
  const [deleteRow, setDeleteRow] = useState<LabReport | null>(null);
  const t = useDataTable(rows, {
    searchFields: (r) => [r.id, r.patient, r.test, r.doctor],
    filterField: (r) => r.status,
    sorters: {
      id: (r) => r.id,
      patient: (r) => r.patient,
      test: (r) => r.test,
      doctor: (r) => r.doctor,
      date: (r) => r.date,
      status: (r) => r.status,
    },
  });

  return (
    <Card className="gap-0 bg-muted/50 p-1 ring-0 shadow-sm dark:bg-muted">
      <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2">
        <PanelTitle title="All Lab Reports" />
        <div className="flex items-center gap-2">
          <FilterPills options={["All", "Sample Collected", "In Progress", "Ready", "Critical"]} value={t.filter} onChange={t.setFilter} />
          <div className="relative hidden md:block">
            <HugeiconsIcon icon={Search01Icon} size={14} className="absolute top-1/2 left-2.5 -translate-y-1/2 text-muted-foreground" />
            <Input value={t.query} onChange={(e) => t.setQuery(e.target.value)} placeholder="Search reports..." className="h-8 w-56 rounded-lg bg-muted/40 pl-8 shadow-none" />
          </div>
          <MoreButton />
        </div>
      </div>
      <div className="overflow-hidden rounded-xl bg-card py-2">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-14 pl-4 font-mono text-[10px] tracking-wider text-muted-foreground uppercase">PDF</TableHead>
              <Th label="Lab ID" k="id" sort={t} />
              <Th label="Patient" k="patient" sort={t} />
              <Th label="Test" k="test" sort={t} />
              <Th label="Doctor" k="doctor" sort={t} />
              <Th label="Date" k="date" sort={t} />
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
            {t.rows.map((r) => (
              <TableRow key={r.id} className={r.status === "Critical" ? "" : r.status === "Sample Collected" ? "opacity-80" : ""}>
                <TableCell className="pl-4">
                  <button onClick={() => onView(r)} aria-label={`Open ${r.id} PDF`} className="transition-all hover:opacity-80 active:translate-y-px">
                    <Image src="/pdf.svg" alt="PDF" width={28} height={28} />
                  </button>
                </TableCell>
                <TableCell className="font-mono text-muted-foreground">{r.id}</TableCell>
                <TableCell className="font-medium">{r.patient}</TableCell>
                <TableCell className="text-muted-foreground">{r.test}</TableCell>
                <TableCell className="text-muted-foreground">{r.doctor}</TableCell>
                <TableCell className="font-mono">{r.date}</TableCell>
                <TableCell><StatusBadge status={r.status} /></TableCell>
                <TableCell className="pr-4 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button variant="ghost" size="sm" onClick={() => onView(r)}>View</Button>
                    <Button variant="ghost" size="icon-sm" aria-label={`Print ${r.id}`} onClick={() => printLabReport(r)}>
                      <HugeiconsIcon icon={PrinterIcon} size={16} />
                    </Button>
                    <RowActions label={r.id} href="/lab" onEdit={() => setEditRow(r)} onDelete={() => setDeleteRow(r)} />
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
        title={editRow ? `Edit Report ${editRow.id}` : "Edit Report"}
        fields={LAB_FIELDS}
        initial={
          editRow
            ? { patient: editRow.patient, test: editRow.test, doctor: editRow.doctor, result: editRow.result, status: editRow.status }
            : { patient: "", test: "", doctor: "", result: "", status: "" }
        }
        onSave={(v) => {
          if (!editRow) return;
          onChange(
            rows.map((r) =>
              r.id === editRow.id
                ? {
                    ...r,
                    patient: v.patient.trim() || r.patient,
                    test: v.test || r.test,
                    doctor: v.doctor.trim() || r.doctor,
                    result: v.result.trim() || r.result,
                    status: v.status as LabReport["status"],
                  }
                : r,
            ),
          );
        }}
      />
      <DeleteConfirm
        open={!!deleteRow}
        onOpenChange={(o) => !o && setDeleteRow(null)}
        title={deleteRow ? `Report ${deleteRow.id}` : "Report"}
        description={deleteRow ? `This will permanently remove lab report ${deleteRow.id} for ${deleteRow.patient}. This action cannot be undone.` : undefined}
        onConfirm={() => {
          if (!deleteRow) return;
          onChange(rows.filter((r) => r.id !== deleteRow.id));
        }}
      />
    </Card>
  );
}

export default function LabPage() {
  const [reports, setReports] = useState<LabReport[]>(seedReports);
  const [selected, setSelected] = useState<LabReport | null>(null);

  function handleChange(next: LabReport[]) {
    setReports(next);
    setSelected((prev) => (prev ? (next.find((r) => r.id === prev.id) ?? null) : null));
  }

  function handleAdvance(id: string) {
    handleChange(
      reports.map((r) => (r.id === id ? { ...r, status: nextLabStatus(r.status) } : r)),
    );
  }

  const total = reports.length;
  const ready = reports.filter((r) => r.status === "Ready").length;
  const pending = reports.filter((r) => r.status === "Sample Collected" || r.status === "In Progress").length;
  const critical = reports.filter((r) => r.status === "Critical").length;

  const kpis = [
    { label: "Total Reports", value: String(total), suffix: "", delta: "+6,4%", deltaLabel: "this month", spark: [4, 6, 5, 7, 6, 8, 7, 9, 8, 12] },
    { label: "Ready", value: String(ready), suffix: "reports", delta: "+4,1%", deltaLabel: "vs last week", spark: [3, 5, 4, 6, 5, 7, 8, 7, 9, 10] },
    { label: "Pending", value: String(pending), suffix: "reports", delta: "-2", deltaLabel: "in queue", spark: [6, 5, 7, 4, 6, 5, 7, 6, 8, 9] },
    { label: "Critical", value: String(critical), suffix: "reports", delta: "+1", deltaLabel: "needs review", spark: [2, 4, 3, 5, 4, 6, 5, 7, 6, 9] },
  ];

  return (
    <Shell breadcrumb="Lab Reports" active="Lab Reports">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-medium tracking-tight">Lab Reports</h1>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((kpi) => (
          <KpiCard key={kpi.label} kpi={kpi} />
        ))}
      </div>

      <RadiologyQueue rows={reports} onAdvance={handleAdvance} />

      <LabTable rows={reports} onChange={handleChange} onView={setSelected} />

      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-mono">Lab Report {selected?.id}</DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-4">
              <div className="flex items-start justify-between gap-4 rounded-xl border p-4">
                <div>
                  <p className="font-medium">CityCare Hospital</p>
                  <p className="text-xs text-muted-foreground">{selected.test} - {selected.date}</p>
                  <p className="mt-2 text-sm"><span className="text-muted-foreground">Patient: </span>{selected.patient}</p>
                  <p className="text-sm"><span className="text-muted-foreground">Doctor: </span>{selected.doctor}</p>
                </div>
                <Image src="/pdf.svg" alt="PDF" width={36} height={36} className="shrink-0" />
              </div>
              <div className="flex items-center justify-between rounded-xl border p-4 text-sm">
                <span className="text-muted-foreground">Result</span>
                <span className="font-mono font-medium">{selected.result}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Status</span>
                <StatusBadge status={selected.status} />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelected(null)}>Close</Button>
            <Button onClick={() => selected && printLabReport(selected)}>
              <HugeiconsIcon icon={PrinterIcon} size={14} data-icon="inline-start" />
              Print / Save as PDF
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Shell>
  );
}
