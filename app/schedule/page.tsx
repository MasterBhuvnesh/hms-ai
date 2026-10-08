"use client";

import { useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { Search01Icon } from "@hugeicons/core-free-icons";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { appointments as appointmentsSeed, triageQueue, type Appointment } from "@/data/hospital";

function hourOf(time: string): number {
  const h = Number(time.split(":")[0]);
  return Number.isFinite(h) ? h : 0;
}

function SlotList({ title, slots }: { title: string; slots: Appointment[] }) {
  return (
    <Card className="gap-0 bg-muted/50 p-1 ring-0 shadow-sm dark:bg-muted">
      <div className="flex items-center justify-between gap-2 px-3 py-2">
        <PanelTitle title={title} />
        <MoreButton />
      </div>
      <div className="max-h-96 space-y-1 overflow-y-auto rounded-xl bg-card p-2">
        {slots.length === 0 && (
          <p className="py-8 text-center text-sm text-muted-foreground">No slots found</p>
        )}
        {slots.map((a) => (
          <div key={a.id} className="flex items-center justify-between gap-3 rounded-lg px-3 py-2 hover:bg-muted/50">
            <div className="flex min-w-0 items-center gap-3">
              <span className="w-12 shrink-0 font-mono text-xs text-muted-foreground">{a.time}</span>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{a.patient}</p>
                <p className="truncate text-xs text-muted-foreground">{a.doctor} - {a.type}</p>
              </div>
            </div>
            <StatusBadge status={a.status} />
          </div>
        ))}
      </div>
    </Card>
  );
}

function riskOf(a: Appointment): number {
  const base =
    a.type === "Emergency" ? 5 : a.type === "Consult" ? 25 : a.type === "Follow-up" ? 35 : a.type === "Lab Test" ? 20 : 10;
  let sum = 0;
  for (const ch of a.id) sum += ch.charCodeAt(0);
  return base + (sum % 20);
}

function NoShowBackfill({ rows }: { rows: Appointment[] }) {
  const [offered, setOffered] = useState<Set<string>>(new Set());
  const [filled, setFilled] = useState<Record<string, string>>({});
  const waiting = triageQueue.find((t) => t.status === "Waiting");

  const risky = [...rows]
    .filter((r) => r.status === "Scheduled")
    .map((a) => ({ a, risk: riskOf(a) }))
    .sort((x, y) => y.risk - x.risk)
    .slice(0, 5);
  const openSlots = rows.filter((r) => r.status === "Cancelled" || r.status === "No Show").slice(0, 5);

  return (
    <Card className="gap-0 bg-muted/50 p-1 ring-0 shadow-sm dark:bg-muted">
      <div className="flex items-center justify-between gap-2 px-3 py-2">
        <PanelTitle title="No-Show Backfill" />
        <MoreButton />
      </div>
      <div className="grid gap-2 rounded-xl bg-card p-3 md:grid-cols-2">
        <div className="space-y-1">
          <h3 className="px-1 font-mono text-[11px] tracking-wide text-muted-foreground uppercase">
            High-risk no-shows
          </h3>
          {risky.length === 0 && (
            <p className="px-1 py-4 text-center text-sm text-muted-foreground">No scheduled appointments</p>
          )}
          {risky.map(({ a, risk }) => {
            const isOffered = offered.has(a.id);
            return (
              <div key={a.id} className="flex items-center justify-between gap-2 rounded-lg px-2 py-1.5 hover:bg-muted/50">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{a.patient}</p>
                  <p className="truncate font-mono text-xs text-muted-foreground">
                    {a.date} {a.time} - {a.doctor}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <span
                    className={`font-mono text-xs font-medium ${risk >= 35 ? "text-red-600 dark:text-red-400" : "text-amber-600 dark:text-amber-400"}`}
                  >
                    {risk}%
                  </span>
                  <Button
                    variant="outline"
                    size="xs"
                    disabled={isOffered}
                    onClick={() => setOffered((prev) => new Set(prev).add(a.id))}
                  >
                    {isOffered ? "Offered" : "Mark offered"}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
        <div className="space-y-1">
          <h3 className="px-1 font-mono text-[11px] tracking-wide text-muted-foreground uppercase">Open slots</h3>
          {openSlots.length === 0 && (
            <p className="px-1 py-4 text-center text-sm text-muted-foreground">No open slots</p>
          )}
          {openSlots.map((a) => {
            const filledName = filled[a.id];
            return (
              <div key={a.id} className="flex items-center justify-between gap-2 rounded-lg px-2 py-1.5 hover:bg-muted/50">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">
                    {filledName ?? a.patient}{" "}
                    <span className="font-mono text-xs font-normal text-muted-foreground">{a.id}</span>
                  </p>
                  <p className="truncate font-mono text-xs text-muted-foreground">
                    {a.date} {a.time} - {a.status}
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="xs"
                  disabled={!!filledName}
                  onClick={() => {
                    if (waiting) setFilled((prev) => ({ ...prev, [a.id]: waiting.patient }));
                  }}
                >
                  {filledName ? "Filled" : "Fill from triage"}
                </Button>
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
}

export default function SchedulePage() {
  const [rows, setRows] = useState<Appointment[]>(appointmentsSeed);
  const [editRow, setEditRow] = useState<Appointment | null>(null);
  const [deleteRow, setDeleteRow] = useState<Appointment | null>(null);
  const t = useDataTable(rows, {
    searchFields: (r) => [r.id, r.patient, r.doctor, r.department, r.type],
    filterField: (r) => r.status,
    sorters: {
      id: (r) => r.id,
      time: (r) => r.time,
      patient: (r) => r.patient,
      doctor: (r) => r.doctor,
      type: (r) => r.type,
      status: (r) => r.status,
    },
  });

  const byTime = [...t.sorted].sort((a, b) => a.time.localeCompare(b.time));
  const morning = byTime.filter((a) => hourOf(a.time) < 13);
  const evening = byTime.filter((a) => hourOf(a.time) >= 13);

  const kpis: Kpi[] = [
    { label: "Today's Appointments", value: String(t.total), suffix: "", delta: "+8", deltaLabel: "vs yesterday", spark: [4, 6, 5, 7, 6, 8, 7, 9, 8, 12] },
    { label: "Morning Slots", value: String(morning.length), suffix: "", delta: "+3", deltaLabel: "before 1 PM", spark: [3, 5, 4, 6, 5, 7, 8, 7, 9, 10] },
    { label: "Evening Slots", value: String(evening.length), suffix: "", delta: "+2", deltaLabel: "1 PM onwards", spark: [5, 4, 6, 5, 7, 6, 8, 9, 8, 11] },
    { label: "In Progress", value: String(t.sorted.filter((a) => a.status === "In Progress").length), suffix: "", delta: "+1", deltaLabel: "right now", spark: [4, 5, 4, 6, 5, 7, 6, 8, 9, 10] },
  ];

  return (
    <Shell breadcrumb="Schedule" active="Schedule">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-medium tracking-tight">Appointment Day Schedule</h1>
        <div className="flex items-center gap-2">
          <FilterPills options={["All", "Scheduled", "In Progress", "Completed", "Cancelled", "No Show"]} value={t.filter} onChange={t.setFilter} />
          <div className="relative hidden md:block">
            <HugeiconsIcon icon={Search01Icon} size={14} className="absolute top-1/2 left-2.5 -translate-y-1/2 text-muted-foreground" />
            <Input value={t.query} onChange={(e) => t.setQuery(e.target.value)} placeholder="Search schedule..." className="h-8 w-56 rounded-lg bg-muted/40 pl-8 shadow-none" />
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((kpi) => (
          <KpiCard key={kpi.label} kpi={kpi} />
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <SlotList title={`Morning Slots (${morning.length})`} slots={morning} />
        <SlotList title={`Evening Slots (${evening.length})`} slots={evening} />
      </div>

      <NoShowBackfill rows={rows} />

      <Card className="gap-0 bg-muted/50 p-1 ring-0 shadow-sm dark:bg-muted">
        <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2">
          <PanelTitle title="Full Day Schedule" />
          <MoreButton />
        </div>
        <div className="overflow-hidden rounded-xl bg-card py-2">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <Th label="ID" k="id" sort={t} />
                <Th label="Time" k="time" sort={t} />
                <Th label="Patient" k="patient" sort={t} />
                <Th label="Doctor" k="doctor" sort={t} />
                <Th label="Type" k="type" sort={t} />
                <Th label="Status" k="status" sort={t} />
                <TableHead className="pr-4 text-right font-mono text-[10px] tracking-wider text-muted-foreground uppercase">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {t.rows.length === 0 && (
                <TableRow className="hover:bg-transparent">
                  <TableCell colSpan={7} className="py-8 text-center text-sm text-muted-foreground">No results found</TableCell>
                </TableRow>
              )}
              {t.rows.map((a) => (
                <TableRow key={a.id}>
                  <TableCell className="font-mono text-muted-foreground">{a.id}</TableCell>
                  <TableCell className="font-mono">{a.time}</TableCell>
                  <TableCell className="font-medium">{a.patient}</TableCell>
                  <TableCell className="text-muted-foreground">{a.doctor}</TableCell>
                  <TableCell className="text-muted-foreground">{a.type}</TableCell>
                  <TableCell><StatusBadge status={a.status} /></TableCell>
                  <TableCell className="pr-4 text-right">
                    <RowActions label={a.id} onEdit={() => setEditRow(a)} onDelete={() => setDeleteRow(a)} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <TablePagination page={t.page} pageSize={t.pageSize} total={t.total} onPageChange={t.setPage} onPageSizeChange={t.setPageSize} />
      </Card>
      <EditDialog
        open={!!editRow}
        onOpenChange={(o) => { if (!o) setEditRow(null); }}
        title={editRow ? `Edit ${editRow.id}` : "Edit appointment"}
        fields={[
          { name: "patient", label: "Patient", placeholder: "Jane Cooper" },
          { name: "doctor", label: "Doctor", placeholder: "Dr. Aditi Rao" },
          { name: "date", label: "Date", placeholder: "12 Nov 2025" },
          { name: "time", label: "Time", placeholder: "10:00" },
          { name: "status", label: "Status", options: ["Scheduled", "In Progress", "Completed", "Cancelled", "No Show"] },
        ]}
        initial={{
          patient: editRow?.patient ?? "",
          doctor: editRow?.doctor ?? "",
          date: editRow?.date ?? "",
          time: editRow?.time ?? "",
          status: editRow?.status ?? "Scheduled",
        }}
        onSave={(v) => {
          if (!editRow) return;
          setRows((prev) => prev.map((r) => r.id === editRow.id ? {
            ...r,
            patient: v.patient,
            doctor: v.doctor,
            date: v.date,
            time: v.time,
            status: v.status as Appointment["status"],
          } : r));
        }}
      />
      <DeleteConfirm
        open={!!deleteRow}
        onOpenChange={(o) => { if (!o) setDeleteRow(null); }}
        title={deleteRow?.id ?? "appointment"}
        description={deleteRow ? `This will permanently remove appointment ${deleteRow.id} (${deleteRow.patient}). This action cannot be undone.` : undefined}
        onConfirm={() => { if (deleteRow) setRows((prev) => prev.filter((r) => r.id !== deleteRow.id)); }}
      />
    </Shell>
  );
}
