"use client";

import { useMemo, useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { PlusSignIcon, RefreshIcon, Search01Icon } from "@hugeicons/core-free-icons";
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
import { beds as seedBeds, type Bed } from "@/data/hospital";
import { scoreVitals, vitalsFor } from "@/lib/icu";

const BED_FIELDS: Field[] = [
  { name: "ward", label: "Ward", options: ["ICU", "General", "Emergency", "Pediatrics", "Maternity"] },
  { name: "patient", label: "Patient", placeholder: "Patient name" },
  { name: "doctor", label: "Doctor", placeholder: "Assigned doctor" },
  { name: "status", label: "Status", options: ["Occupied", "Available", "Cleaning", "Maintenance"] },
];

function BedsTable({ rows, onChange }: { rows: Bed[]; onChange: (rows: Bed[]) => void }) {
  const [editRow, setEditRow] = useState<Bed | null>(null);
  const [deleteRow, setDeleteRow] = useState<Bed | null>(null);
  const t = useDataTable(rows, {
    searchFields: (r) => [r.id, r.ward, r.patient, r.doctor],
    filterField: (r) => r.status,
    sorters: {
      id: (r) => r.id,
      ward: (r) => r.ward,
      patient: (r) => r.patient,
      doctor: (r) => r.doctor,
      status: (r) => r.status,
    },
  });

  return (
    <Card className="gap-0 bg-muted/50 p-1 ring-0 shadow-sm dark:bg-muted">
      <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2">
        <PanelTitle title="All Beds" />
        <div className="flex items-center gap-2">
          <FilterPills
            options={["All", "Occupied", "Available", "Cleaning", "Maintenance"]}
            value={t.filter}
            onChange={t.setFilter}
          />
          <div className="relative hidden md:block">
            <HugeiconsIcon icon={Search01Icon} size={14} className="absolute top-1/2 left-2.5 -translate-y-1/2 text-muted-foreground" />
            <Input value={t.query} onChange={(e) => t.setQuery(e.target.value)} placeholder="Search beds..." className="h-8 w-56 rounded-lg bg-muted/40 pl-8 shadow-none" />
          </div>
          <MoreButton />
        </div>
      </div>
      <div className="overflow-hidden rounded-xl bg-card py-2">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <Th label="Bed ID" k="id" sort={t} />
              <Th label="Ward" k="ward" sort={t} />
              <Th label="Patient" k="patient" sort={t} />
              <Th label="Doctor" k="doctor" sort={t} />
              <Th label="Status" k="status" sort={t} />
              <TableHead className="pr-4 text-right font-mono text-[10px] tracking-wider text-muted-foreground uppercase">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {t.rows.length === 0 && (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={6} className="py-8 text-center text-sm text-muted-foreground">No results found</TableCell>
              </TableRow>
            )}
            {t.rows.map((b) => (
              <TableRow key={b.id} className={b.status === "Maintenance" ? "opacity-60" : ""}>
                <TableCell className="font-mono text-muted-foreground">{b.id}</TableCell>
                <TableCell className="font-medium">{b.ward}</TableCell>
                <TableCell className="text-muted-foreground">{b.patient}</TableCell>
                <TableCell className="text-muted-foreground">{b.doctor}</TableCell>
                <TableCell><StatusBadge status={b.status} /></TableCell>
                <TableCell className="pr-4 text-right">
                  <div className="flex justify-end">
                    <RowActions label={b.id} href="/channels" onEdit={() => setEditRow(b)} onDelete={() => setDeleteRow(b)} />
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
        title={editRow ? `Edit Bed ${editRow.id}` : "Edit Bed"}
        fields={BED_FIELDS}
        initial={
          editRow
            ? { ward: editRow.ward, patient: editRow.patient === "-" ? "" : editRow.patient, doctor: editRow.doctor, status: editRow.status }
            : { ward: "", patient: "", doctor: "", status: "" }
        }
        onSave={(v) => {
          if (!editRow) return;
          onChange(
            rows.map((r) =>
              r.id === editRow.id
                ? {
                    ...r,
                    ward: v.ward as Bed["ward"],
                    patient: v.patient.trim() || r.patient,
                    doctor: v.doctor.trim() || r.doctor,
                    status: v.status as Bed["status"],
                  }
                : r,
            ),
          );
        }}
      />
      <DeleteConfirm
        open={!!deleteRow}
        onOpenChange={(o) => !o && setDeleteRow(null)}
        title={deleteRow ? `Bed ${deleteRow.id}` : "Bed"}
        description={deleteRow ? `This will permanently remove bed ${deleteRow.id}. This action cannot be undone.` : undefined}
        onConfirm={() => {
          if (!deleteRow) return;
          onChange(rows.filter((r) => r.id !== deleteRow.id));
        }}
      />
    </Card>
  );
}

function IcuWatch({ rows }: { rows: Bed[] }) {
  const [salts, setSalts] = useState<Record<string, number>>({});

  const watched = useMemo(
    () =>
      rows
        .filter((b) => b.ward === "ICU" && b.status === "Occupied")
        .map((bed) => {
          const salt = salts[bed.id] ?? 0;
          const vitals = vitalsFor(`${bed.id}:${bed.patient}`, salt);
          const { score, band } = scoreVitals(vitals);
          return { bed, vitals, score, band };
        })
        .sort((a, b) => b.score - a.score || a.bed.id.localeCompare(b.bed.id)),
    [rows, salts],
  );

  const anyCritical = watched.some((w) => w.band === "Critical");

  return (
    <Card className="gap-0 bg-muted/50 p-1 ring-0 shadow-sm dark:bg-muted">
      <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2">
        <PanelTitle title="ICU Watch" />
        <MoreButton />
      </div>
      <div className="rounded-xl bg-card p-4">
        {watched.length === 0 && (
          <p className="py-4 text-center text-sm text-muted-foreground">No occupied ICU beds</p>
        )}
        {watched.map(({ bed, vitals, score, band }) => (
          <div
            key={bed.id}
            className="flex flex-wrap items-center justify-between gap-2 border-b py-2 last:border-0"
          >
            <div>
              <p className="font-medium">{bed.patient}</p>
              <p className="font-mono text-[11px] tracking-wide text-muted-foreground uppercase">{bed.id}</p>
            </div>
            <p className="font-mono text-xs text-muted-foreground">
              HR {vitals.heartRate} SpO2 {vitals.spo2}% BP {vitals.systolic} RR {vitals.respRate} S{score}
            </p>
            <div className="flex items-center gap-2">
              <StatusBadge status={band === "Critical" ? "Critical" : band === "Watch" ? "Pending" : "Active"} />
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSalts((prev) => ({ ...prev, [bed.id]: (prev[bed.id] ?? 0) + 1 }))}
              >
                <HugeiconsIcon icon={RefreshIcon} size={14} data-icon="inline-start" />
                Recheck
              </Button>
            </div>
          </div>
        ))}
      </div>
      <div className="px-4 py-2.5">
        <p
          className={`font-mono text-xs font-medium tracking-wide uppercase ${
            anyCritical ? "text-red-600 dark:text-red-400" : "text-emerald-600 dark:text-emerald-500"
          }`}
        >
          {anyCritical ? "Escalate to intensivist now" : "No critical trends"}
        </p>
      </div>
    </Card>
  );
}

export default function BedsPage() {
  const [bedList, setBedList] = useState<Bed[]>(seedBeds);

  const occupied = bedList.filter((b) => b.status === "Occupied").length;
  const available = bedList.filter((b) => b.status === "Available").length;
  const cleaning = bedList.filter((b) => b.status === "Cleaning").length;

  const kpis = [
    { label: "Total Beds", value: "54", suffix: "", delta: "+2", deltaLabel: "new this month", spark: [4, 6, 5, 7, 6, 8, 7, 9, 8, 12] },
    { label: "Occupied", value: String(occupied), suffix: "beds", delta: "+4%", deltaLabel: "vs last week", spark: [5, 6, 4, 7, 8, 7, 9, 8, 10, 12] },
    { label: "Available", value: String(available), suffix: "beds", delta: "+1", deltaLabel: "ready now", spark: [3, 5, 4, 6, 5, 7, 8, 7, 9, 10] },
    { label: "Cleaning", value: String(cleaning), suffix: "beds", delta: "-1", deltaLabel: "vs yesterday", spark: [6, 5, 7, 4, 6, 5, 7, 6, 8, 10] },
  ];

  return (
    <Shell breadcrumb="Beds & Wards" active="Beds & Wards">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-medium tracking-tight">Beds &amp; Wards</h1>
        <AddDialog
          href="/channels"
          title="Add Bed"
          submitLabel="Add Bed"
          fields={[
            { name: "patient", label: "Patient", placeholder: "Patient name" },
            { name: "doctor", label: "Doctor", placeholder: "Assigned doctor" },
            { name: "ward", label: "Ward", options: ["ICU", "General", "Emergency", "Pediatrics", "Maternity"] },
            { name: "status", label: "Status", options: ["Occupied", "Available", "Cleaning", "Maintenance"] },
          ]}
          onSubmit={(v) =>
            setBedList((prev) => [
              ...prev,
              {
                id: `B-${101 + prev.length}`,
                ward: v.ward as Bed["ward"],
                patient: v.status === "Occupied" ? v.patient.trim() || "-" : "-",
                doctor: v.doctor.trim() || "Dr. Aditi Rao",
                since: "Nov 2025",
                status: v.status as Bed["status"],
              },
            ])
          }
          trigger={
            <Button size="lg">
              <HugeiconsIcon icon={PlusSignIcon} size={14} data-icon="inline-start" />
              Add Bed
            </Button>
          }
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((kpi) => (
          <KpiCard key={kpi.label} kpi={kpi} />
        ))}
      </div>

      <IcuWatch rows={bedList} />
      <BedsTable rows={bedList} onChange={setBedList} />
    </Shell>
  );
}
