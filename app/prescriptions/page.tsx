"use client";

import Image from "next/image";
import { HugeiconsIcon } from "@hugeicons/react";
import { Search01Icon, PrinterIcon, PlusSignIcon } from "@hugeicons/core-free-icons";
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
import { AddDialog } from "@/components/dashboard/add-dialog";
import { DeleteConfirm, EditDialog, RowActions } from "@/components/dashboard/row-actions";
import { TablePagination } from "@/components/dashboard/table-pagination";
import { FilterPills, Th, useDataTable } from "@/components/dashboard/use-table";
import { Shell } from "@/components/dashboard/shell";
import { useState } from "react";
import { prescriptions, type Prescription } from "@/data/hospital";

const kpis = [
  { label: "Total Prescriptions", value: "1,284", suffix: "", delta: "+6,4%", deltaLabel: "this month", spark: [4, 6, 5, 7, 6, 8, 7, 9, 8, 12] },
  { label: "Active", value: "312", suffix: "", delta: "+2,1%", deltaLabel: "vs last month", spark: [3, 5, 4, 6, 5, 7, 8, 7, 9, 10] },
  { label: "Completed", value: "948", suffix: "", delta: "+4,8%", deltaLabel: "vs last month", spark: [5, 4, 6, 5, 7, 6, 8, 9, 8, 11] },
  { label: "With PDF", value: "42", suffix: "files", delta: "100%", deltaLabel: "print-ready", spark: [4, 5, 4, 6, 5, 7, 6, 8, 9, 10] },
];

function printPrescription(rx: Prescription) {
  const w = window.open("", "_blank", "width=720,height=900");
  if (!w) return;
  const meds = rx.medicines
    .map((m, i) => `<tr><td>${i + 1}</td><td>${m.name}</td><td>${m.dosage}</td><td>${m.duration}</td></tr>`)
    .join("");
  w.document.write(`<!doctype html><html><head><title>${rx.id} - Prescription</title>
  <style>body{font-family:Arial,sans-serif;padding:32px;color:#111}h1{font-size:20px;margin:0}p{margin:4px 0;font-size:13px}
  table{width:100%;border-collapse:collapse;margin-top:16px;font-size:13px}th,td{border:1px solid #ccc;padding:8px;text-align:left}
  .head{display:flex;justify-content:space-between;border-bottom:2px solid #111;padding-bottom:12px;margin-bottom:12px}
  .rx{font-size:28px;font-weight:bold;margin:12px 0 4px}</style></head><body>
  <div class="head"><div><h1>CityCare Hospital</h1><p>General, Cardiology, Orthopedics, Pediatrics</p><p>Phone: +91 80 4000 1000</p></div>
  <div style="text-align:right"><p><strong>${rx.id}</strong></p><p>${rx.date}</p><p>${rx.department}</p></div></div>
  <p><strong>Patient:</strong> ${rx.patient} (${rx.patientAge}y)</p>
  <p><strong>Doctor:</strong> ${rx.doctor}</p>
  <p><strong>Diagnosis:</strong> ${rx.diagnosis}</p>
  <div class="rx">Rx</div>
  <table><thead><tr><th>#</th><th>Medicine</th><th>Dosage</th><th>Duration</th></tr></thead><tbody>${meds}</tbody></table>
  <p style="margin-top:24px">Signature: ____________________</p>
  <p>Status: ${rx.status}</p>
  <script>window.onload=()=>{window.print()}</script></body></html>`);
  w.document.close();
}

function PrescriptionsTable({ rows, onView, onEdit, onDelete }: { rows: Prescription[]; onView: (rx: Prescription) => void; onEdit: (rx: Prescription) => void; onDelete: (rx: Prescription) => void }) {
  const t = useDataTable(rows, {
    searchFields: (r) => [r.id, r.patient, r.doctor, r.diagnosis],
    filterField: (r) => r.status,
    sorters: {
      id: (r) => r.id,
      patient: (r) => r.patient,
      doctor: (r) => r.doctor,
      date: (r) => r.date,
      status: (r) => r.status,
    },
  });

  return (
    <Card className="gap-0 bg-muted/50 p-1 ring-0 shadow-sm dark:bg-muted">
      <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2">
        <PanelTitle title="All Prescriptions" />
        <div className="flex items-center gap-2">
          <FilterPills options={["All", "Active", "Completed", "Cancelled"]} value={t.filter} onChange={t.setFilter} />
          <div className="relative hidden md:block">
            <HugeiconsIcon icon={Search01Icon} size={14} className="absolute top-1/2 left-2.5 -translate-y-1/2 text-muted-foreground" />
            <Input value={t.query} onChange={(e) => t.setQuery(e.target.value)} placeholder="Search prescriptions..." className="h-8 w-56 rounded-lg bg-muted/40 pl-8 shadow-none" />
          </div>
          <MoreButton />
        </div>
      </div>
      <div className="overflow-hidden rounded-xl bg-card py-2">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-14 pl-4 font-mono text-[10px] tracking-wider text-muted-foreground uppercase">PDF</TableHead>
              <Th label="Rx ID" k="id" sort={t} />
              <Th label="Patient" k="patient" sort={t} />
              <Th label="Doctor" k="doctor" sort={t} />
              <Th label="Date" k="date" sort={t} />
              <Th label="Status" k="status" sort={t} />
              <TableHead className="pr-4 text-right font-mono text-[10px] tracking-wider text-muted-foreground uppercase">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {t.rows.length === 0 && (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={7} className="py-8 text-center text-sm text-muted-foreground">No results found</TableCell>
              </TableRow>
            )}
            {t.rows.map((rx) => (
              <TableRow key={rx.id} className={rx.status === "Cancelled" ? "opacity-60" : ""}>
                <TableCell className="pl-4">
                  <button onClick={() => onView(rx)} aria-label={`Open ${rx.id} PDF`} className="transition-all hover:opacity-80 active:translate-y-px">
                    <Image src="/pdf.svg" alt="PDF" width={28} height={28} />
                  </button>
                </TableCell>
                <TableCell className="font-mono text-muted-foreground">{rx.id}</TableCell>
                <TableCell className="font-medium">{rx.patient}</TableCell>
                <TableCell className="text-muted-foreground">{rx.doctor}</TableCell>
                <TableCell className="font-mono">{rx.date}</TableCell>
                <TableCell><StatusBadge status={rx.status} /></TableCell>
                <TableCell className="pr-4 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button variant="ghost" size="sm" onClick={() => onView(rx)}>View</Button>
                    <Button variant="ghost" size="icon-sm" aria-label={`Print ${rx.id}`} onClick={() => printPrescription(rx)}>
                      <HugeiconsIcon icon={PrinterIcon} size={16} />
                    </Button>
                    <RowActions label={rx.id} onEdit={() => onEdit(rx)} onDelete={() => onDelete(rx)} />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <TablePagination page={t.page} pageSize={t.pageSize} total={t.total} onPageChange={t.setPage} onPageSizeChange={t.setPageSize} />
    </Card>
  );
}

export default function PrescriptionsPage() {
  const [selected, setSelected] = useState<Prescription | null>(null);
  const [rows, setRows] = useState<Prescription[]>(prescriptions);
  const [editRow, setEditRow] = useState<Prescription | null>(null);
  const [deleteRow, setDeleteRow] = useState<Prescription | null>(null);

  return (
    <Shell breadcrumb="Prescriptions" active="Prescriptions">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-medium tracking-tight">Prescriptions</h1>
        <AddDialog
          title="New Prescription"
          submitLabel="Create Prescription"
          fields={[
            { name: "patient", label: "Patient", placeholder: "Patient name" },
            { name: "doctor", label: "Doctor", placeholder: "Dr. Name" },
            { name: "diagnosis", label: "Diagnosis", placeholder: "Diagnosis" },
            { name: "status", label: "Status", options: ["Active", "Completed", "Cancelled"] },
          ]}
          onSubmit={(v) => {
            const maxNum = rows.reduce(
              (m, rx) => Math.max(m, Number(rx.id.replace(/\D/g, "")) || 0),
              9000,
            );
            setRows((r) => [
              {
                id: `RX-${maxNum + 1}`,
                patient: v.patient,
                patientAge: 30,
                doctor: v.doctor,
                department: "General",
                date: "6 Nov 2025",
                diagnosis: v.diagnosis,
                medicines: [{ name: "Paracetamol 500mg", dosage: "1-0-1", duration: "5 days" }],
                status: v.status as Prescription["status"],
              },
              ...r,
            ]);
          }}
          trigger={
            <Button size="lg">
              <HugeiconsIcon icon={PlusSignIcon} size={14} data-icon="inline-start" />
              New Prescription
            </Button>
          }
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((kpi) => (
          <KpiCard key={kpi.label} kpi={kpi} />
        ))}
      </div>

      <PrescriptionsTable rows={rows} onView={setSelected} onEdit={setEditRow} onDelete={setDeleteRow} />

      {editRow && (
        <EditDialog
          open={!!editRow}
          onOpenChange={(o) => !o && setEditRow(null)}
          title={`Edit ${editRow.id}`}
          fields={[
            { name: "patient", label: "Patient" },
            { name: "doctor", label: "Doctor" },
            { name: "diagnosis", label: "Diagnosis" },
            { name: "status", label: "Status", options: ["Active", "Completed", "Cancelled"] },
          ]}
          initial={{
            patient: editRow.patient,
            doctor: editRow.doctor,
            diagnosis: editRow.diagnosis,
            status: editRow.status,
          }}
          onSave={(v) =>
            setRows((r) =>
              r.map((rx) =>
                rx.id === editRow.id
                  ? {
                      ...rx,
                      patient: v.patient,
                      doctor: v.doctor,
                      diagnosis: v.diagnosis,
                      status: v.status as Prescription["status"],
                    }
                  : rx,
              ),
            )
          }
        />
      )}
      <DeleteConfirm
        open={!!deleteRow}
        onOpenChange={(o) => !o && setDeleteRow(null)}
        title={deleteRow?.id ?? "prescription"}
        onConfirm={() => deleteRow && setRows((r) => r.filter((rx) => rx.id !== deleteRow.id))}
      />

      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-mono">Prescription {selected?.id}</DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-4">
              <div className="flex items-start justify-between gap-4 rounded-xl border p-4">
                <div>
                  <p className="font-medium">CityCare Hospital</p>
                  <p className="text-xs text-muted-foreground">{selected.department} - {selected.date}</p>
                  <p className="mt-2 text-sm"><span className="text-muted-foreground">Patient: </span>{selected.patient} ({selected.patientAge}y)</p>
                  <p className="text-sm"><span className="text-muted-foreground">Doctor: </span>{selected.doctor}</p>
                  <p className="text-sm"><span className="text-muted-foreground">Diagnosis: </span>{selected.diagnosis}</p>
                </div>
                <Image src="/pdf.svg" alt="PDF" width={36} height={36} className="shrink-0" />
              </div>
              <div className="overflow-hidden rounded-xl border">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead>Medicine</TableHead>
                      <TableHead>Dosage</TableHead>
                      <TableHead>Duration</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selected.medicines.map((m) => (
                      <TableRow key={m.name}>
                        <TableCell className="font-medium">{m.name}</TableCell>
                        <TableCell className="font-mono">{m.dosage}</TableCell>
                        <TableCell className="font-mono">{m.duration}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Status</span>
                <StatusBadge status={selected.status} />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelected(null)}>Close</Button>
            <Button onClick={() => selected && printPrescription(selected)}>
              <HugeiconsIcon icon={PrinterIcon} size={14} data-icon="inline-start" />
              Print / Save as PDF
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Shell>
  );
}
