"use client";

import { useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { AiMagicIcon, Alert02Icon, CheckmarkCircle02Icon, PlusSignIcon, Search01Icon } from "@hugeicons/core-free-icons";
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
import { KpiCard, MoreButton, PanelTitle, StatusBadge, type Kpi } from "@/components/dashboard/cards";
import { TablePagination } from "@/components/dashboard/table-pagination";
import { FilterPills, Th, useDataTable } from "@/components/dashboard/use-table";
import { AddDialog } from "@/components/dashboard/add-dialog";
import { DeleteConfirm, EditDialog, RowActions } from "@/components/dashboard/row-actions";
import { Shell } from "@/components/dashboard/shell";
import { surgeries as surgeriesSeed, type Surgery } from "@/data/hospital";

const PROCEDURE_OPTIONS = ["Knee Replacement", "Appendectomy", "Cataract", "C-Section", "Hernia Repair", "Fracture Fixation"] as const;
const OT_OPTIONS = ["OT-1", "OT-2", "OT-3"] as const;
const STATUS_OPTIONS = ["Scheduled", "In Progress", "Completed", "Cancelled"] as const;

const OT_LIST = ["OT-1", "OT-2", "OT-3"] as const;
const SLOT_MINS = 120;

function parseTimeToMins(time: string): number {
  const [h, m] = time.split(":").map(Number);
  if (!Number.isFinite(h) || !Number.isFinite(m)) return NaN;
  return h * 60 + m;
}

function formatMinsToTime(mins: number): string {
  const norm = ((mins % 1440) + 1440) % 1440;
  return `${Math.floor(norm / 60)}:${String(norm % 60).padStart(2, "0")}`;
}

function isActiveSurgery(s: Surgery): boolean {
  return s.status === "Scheduled" || s.status === "In Progress";
}

function slotsOverlap(a: Surgery, b: Surgery): boolean {
  if (a.date !== b.date) return false;
  const ta = parseTimeToMins(a.time);
  const tb = parseTimeToMins(b.time);
  if (Number.isNaN(ta) || Number.isNaN(tb)) return false;
  return Math.abs(ta - tb) < SLOT_MINS;
}

type ClashKind = "OT clash" | "Surgeon clash";
type Clash = { kind: ClashKind; a: Surgery; b: Surgery };

function detectClashes(rows: Surgery[]): Clash[] {
  const active = rows.filter(isActiveSurgery);
  const clashes: Clash[] = [];
  for (let i = 0; i < active.length; i++) {
    for (let j = i + 1; j < active.length; j++) {
      const a = active[i];
      const b = active[j];
      if (!slotsOverlap(a, b)) continue;
      if (a.ot === b.ot) clashes.push({ kind: "OT clash", a, b });
      else if (a.surgeon === b.surgeon) clashes.push({ kind: "Surgeon clash", a, b });
    }
  }
  return clashes;
}

type ClashFix = { label: string; apply: (rows: Surgery[]) => Surgery[] };

function suggestFix(clash: Clash, rows: Surgery[]): ClashFix {
  const { a, b } = clash;
  const others = rows.filter((r) => r.id !== a.id && r.id !== b.id && isActiveSurgery(r));
  // OT clash with different surgeons: move one to a free OT at the same time.
  if (clash.kind === "OT clash" && a.surgeon !== b.surgeon) {
    const freeOt = OT_LIST.find(
      (ot) => ot !== b.ot && !others.some((r) => r.ot === ot && slotsOverlap(r, b)),
    );
    if (freeOt) {
      return {
        label: `Move ${b.id} to ${freeOt} at ${b.time}`,
        apply: (rs) => rs.map((r) => (r.id === b.id ? { ...r, ot: freeOt } : r)),
      };
    }
  }
  // Fallback (also used for surgeon clashes): shift the later surgery to 2h after the earlier one.
  const aStart = parseTimeToMins(a.time);
  const bStart = parseTimeToMins(b.time);
  const movedId = bStart >= aStart ? b.id : a.id;
  const newTime = formatMinsToTime(Math.max(aStart, bStart) + SLOT_MINS);
  return {
    label: `Shift ${movedId} to ${newTime} (+2h)`,
    apply: (rs) => rs.map((r) => (r.id === movedId ? { ...r, time: newTime } : r)),
  };
}

function OtOptimizerPanel({ rows, onChange }: { rows: Surgery[]; onChange: (rows: Surgery[]) => void }) {
  const clashes = detectClashes(rows);
  const active = rows.filter(isActiveSurgery);
  const counts = OT_LIST.map((ot) => ({ ot, count: active.filter((r) => r.ot === ot).length }));
  const max = Math.max(1, ...counts.map((c) => c.count));

  return (
    <Card className="gap-0 bg-muted/50 p-1 ring-0 shadow-sm dark:bg-muted">
      <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2">
        <PanelTitle title="OT Conflicts & Optimization" />
        <div className="flex items-center gap-2">
          <span className="font-mono text-[11px] text-muted-foreground">{clashes.length} clashes</span>
          <MoreButton />
        </div>
      </div>
      <div className="rounded-xl bg-card p-4">
        <div className="grid gap-3 sm:grid-cols-3">
          {counts.map(({ ot, count }) => (
            <div key={ot} className="rounded-xl border px-3 py-2">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[11px] tracking-wide text-muted-foreground uppercase">{ot}</span>
                <span className="font-mono text-sm font-medium">{count} active</span>
              </div>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
                <div className="h-full rounded-full bg-foreground/70" style={{ width: `${(count / max) * 100}%` }} />
              </div>
            </div>
          ))}
        </div>
        <div className="mt-3">
          {clashes.length === 0 ? (
            <p className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-sm text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-400">
              <HugeiconsIcon icon={CheckmarkCircle02Icon} size={16} />
              No conflicts - schedule is clean
            </p>
          ) : (
            <ul className="space-y-2">
              {clashes.map((c) => {
                const fix = suggestFix(c, rows);
                return (
                  <li key={`${c.kind}-${c.a.id}-${c.b.id}`} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border px-3 py-2">
                    <div className="space-y-0.5">
                      <p className="flex items-center gap-2 text-sm font-medium">
                        <HugeiconsIcon icon={Alert02Icon} size={14} className="text-amber-600 dark:text-amber-500" />
                        <span className="font-mono text-[11px] tracking-wide text-muted-foreground uppercase">{c.kind}</span>
                        {c.kind === "Surgeon clash" && <span className="text-muted-foreground">{c.a.surgeon}</span>}
                      </p>
                      <p className="font-mono text-xs text-muted-foreground">
                        {c.a.id} ({c.a.ot}, {c.a.time}) vs {c.b.id} ({c.b.ot}, {c.b.time}) - {c.a.date}
                      </p>
                      <p className="text-sm text-muted-foreground">Resolve: {fix.label}</p>
                    </div>
                    <Button size="sm" variant="outline" onClick={() => onChange(fix.apply(rows))}>
                      <HugeiconsIcon icon={AiMagicIcon} size={14} data-icon="inline-start" />
                      Apply
                    </Button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </Card>
  );
}

function familyMessage(s: Surgery): string {
  if (s.status === "Scheduled") return `Reminder: ${s.procedure} scheduled ${s.date} ${s.time} - report 2h early`;
  if (s.status === "In Progress") return `Update: ${s.patient} is in ${s.ot} now, surgeon ${s.surgeon}`;
  return `Done: ${s.procedure} completed, patient in recovery`;
}

function FamilyUpdatesPanel({ rows }: { rows: Surgery[] }) {
  const [sent, setSent] = useState<Record<string, true>>({});
  const notifiable = rows.filter(
    (s) => s.status === "Scheduled" || s.status === "In Progress" || s.status === "Completed",
  );
  const sentCount = notifiable.filter((s) => sent[s.id]).length;

  return (
    <Card className="gap-0 bg-muted/50 p-1 ring-0 shadow-sm dark:bg-muted">
      <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2">
        <PanelTitle title="Family Updates" />
        <div className="flex items-center gap-2">
          <span className="font-mono text-[11px] text-muted-foreground">{sentCount}/{notifiable.length} families notified</span>
          <MoreButton />
        </div>
      </div>
      <div className="rounded-xl bg-card p-4">
        {notifiable.length === 0 ? (
          <p className="rounded-xl border px-3 py-2.5 text-sm text-muted-foreground">No pending family updates</p>
        ) : (
          <ul className="space-y-2">
            {notifiable.map((s) => {
              const isSent = !!sent[s.id];
              return (
                <li key={s.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border px-3 py-2">
                  <div className="min-w-0 space-y-0.5">
                    <p className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-[11px] tracking-wide text-muted-foreground uppercase">{s.id}</span>
                      <span className="text-sm font-medium">{s.patient}</span>
                      <StatusBadge status={s.status} />
                    </p>
                    <p className="text-sm text-muted-foreground">{familyMessage(s)}</p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={isSent}
                    onClick={() => setSent((prev) => ({ ...prev, [s.id]: true }))}
                  >
                    {isSent ? "Sent" : "Send"}
                  </Button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </Card>
  );
}

function SurgeriesTable({ rows, onChange }: { rows: Surgery[]; onChange: (rows: Surgery[]) => void }) {
  const [editRow, setEditRow] = useState<Surgery | null>(null);
  const [deleteRow, setDeleteRow] = useState<Surgery | null>(null);
  const t = useDataTable(rows, {
    searchFields: (r) => [r.id, r.patient, r.procedure, r.surgeon, r.ot],
    filterField: (r) => r.status,
    sorters: {
      id: (r) => r.id,
      patient: (r) => r.patient,
      procedure: (r) => r.procedure,
      surgeon: (r) => r.surgeon,
      ot: (r) => r.ot,
      datetime: (r) => `${r.date} ${r.time}`,
      status: (r) => r.status,
    },
  });

  return (
    <Card className="gap-0 bg-muted/50 p-1 ring-0 shadow-sm dark:bg-muted">
      <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2">
        <PanelTitle title="OT Schedule" />
        <div className="flex items-center gap-2">
          <FilterPills options={["All", "Scheduled", "In Progress", "Completed", "Cancelled"]} value={t.filter} onChange={t.setFilter} />
          <div className="relative hidden md:block">
            <HugeiconsIcon icon={Search01Icon} size={14} className="absolute top-1/2 left-2.5 -translate-y-1/2 text-muted-foreground" />
            <Input value={t.query} onChange={(e) => t.setQuery(e.target.value)} placeholder="Search surgeries..." className="h-8 w-56 rounded-lg bg-muted/40 pl-8 shadow-none" />
          </div>
          <MoreButton />
        </div>
      </div>
      <div className="overflow-hidden rounded-xl bg-card py-2">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <Th label="Surgery ID" k="id" sort={t} />
              <Th label="Patient" k="patient" sort={t} />
              <Th label="Procedure" k="procedure" sort={t} />
              <Th label="Surgeon" k="surgeon" sort={t} />
              <Th label="OT" k="ot" sort={t} />
              <Th label="Date / Time" k="datetime" sort={t} />
              <Th label="Status" k="status" sort={t} />
              <TableHead className="pr-4 text-right font-mono text-[10px] tracking-wider text-muted-foreground uppercase">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {t.rows.length === 0 && (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={8} className="py-8 text-center text-sm text-muted-foreground">No results found</TableCell>
              </TableRow>
            )}
            {t.rows.map((s) => (
              <TableRow key={s.id}>
                <TableCell className="font-mono text-muted-foreground">{s.id}</TableCell>
                <TableCell className="font-medium">{s.patient}</TableCell>
                <TableCell className="text-muted-foreground">{s.procedure}</TableCell>
                <TableCell className="text-muted-foreground">{s.surgeon}</TableCell>
                <TableCell><span className="font-mono text-xs">{s.ot}</span></TableCell>
                <TableCell className="font-mono whitespace-nowrap">{s.date} - {s.time}</TableCell>
                <TableCell><StatusBadge status={s.status} /></TableCell>
                <TableCell className="pr-4 text-right">
                  <RowActions href="/surgeries" label={s.id} onEdit={() => setEditRow(s)} onDelete={() => setDeleteRow(s)} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <TablePagination page={t.page} pageSize={t.pageSize} total={t.total} onPageChange={t.setPage} onPageSizeChange={t.setPageSize} />
      <EditDialog
        open={!!editRow}
        onOpenChange={(o) => { if (!o) setEditRow(null); }}
        title={editRow ? `Edit ${editRow.id}` : "Edit surgery"}
        fields={[
          { name: "patient", label: "Patient", placeholder: "Jane Cooper" },
          { name: "procedure", label: "Procedure", options: [...PROCEDURE_OPTIONS] },
          { name: "surgeon", label: "Surgeon", placeholder: "Dr. Aditi Rao" },
          { name: "ot", label: "OT", options: [...OT_OPTIONS] },
          { name: "date", label: "Date", placeholder: "12 Nov 2025" },
          { name: "time", label: "Time", placeholder: "10:00" },
          { name: "status", label: "Status", options: [...STATUS_OPTIONS] },
        ]}
        initial={{
          patient: editRow?.patient ?? "",
          procedure: editRow?.procedure ?? PROCEDURE_OPTIONS[0],
          surgeon: editRow?.surgeon ?? "",
          ot: editRow?.ot ?? OT_OPTIONS[0],
          date: editRow?.date ?? "",
          time: editRow?.time ?? "",
          status: editRow?.status ?? STATUS_OPTIONS[0],
        }}
        onSave={(v) => {
          if (!editRow) return;
          onChange(rows.map((r) => r.id === editRow.id ? {
            ...r,
            patient: v.patient,
            procedure: v.procedure,
            surgeon: v.surgeon,
            ot: v.ot as Surgery["ot"],
            date: v.date,
            time: v.time,
            status: v.status as Surgery["status"],
          } : r));
        }}
      />
      <DeleteConfirm
        open={!!deleteRow}
        onOpenChange={(o) => { if (!o) setDeleteRow(null); }}
        title={deleteRow?.id ?? "surgery"}
        description={deleteRow ? `This will permanently remove surgery ${deleteRow.id} (${deleteRow.patient}). This action cannot be undone.` : undefined}
        onConfirm={() => { if (deleteRow) onChange(rows.filter((r) => r.id !== deleteRow.id)); }}
      />
    </Card>
  );
}

export default function SurgeriesPage() {
  const [rows, setRows] = useState<Surgery[]>(surgeriesSeed);

  const scheduled = rows.filter((s) => s.status === "Scheduled").length;
  const inProgress = rows.filter((s) => s.status === "In Progress").length;
  const completed = rows.filter((s) => s.status === "Completed").length;

  const kpis: Kpi[] = [
    { label: "Scheduled Today", value: String(scheduled), suffix: "", delta: "+2", deltaLabel: "vs yesterday", spark: [4, 6, 5, 7, 6, 8, 7, 9, 8, 12] },
    { label: "In Progress", value: String(inProgress), suffix: "", delta: "+1", deltaLabel: "right now", spark: [3, 5, 4, 6, 5, 7, 8, 7, 9, 10] },
    { label: "Completed", value: String(completed), suffix: "", delta: "+3", deltaLabel: "this week", spark: [5, 4, 6, 5, 7, 6, 8, 9, 8, 11] },
    { label: "Operation Theatres", value: "3", suffix: "OT-1 to OT-3", delta: "100%", deltaLabel: "available", spark: [4, 5, 4, 6, 5, 7, 6, 8, 9, 10] },
  ];

  return (
    <Shell breadcrumb="Surgeries" active="Surgeries">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-medium tracking-tight">OT Schedule</h1>
        <AddDialog
          href="/surgeries"
          title="Book Surgery"
          submitLabel="Book Surgery"
          fields={[
            { name: "patient", label: "Patient", placeholder: "Jane Cooper" },
            { name: "procedure", label: "Procedure", options: [...PROCEDURE_OPTIONS] },
            { name: "surgeon", label: "Surgeon", placeholder: "Dr. Aditi Rao" },
            { name: "ot", label: "OT", options: [...OT_OPTIONS] },
            { name: "status", label: "Status", options: [...STATUS_OPTIONS] },
          ]}
          onSubmit={(v) => {
            const maxNum = rows.reduce(
              (m, s) => Math.max(m, Number(s.id.replace(/\D/g, "")) || 0),
              500,
            );
            setRows((r) => [
              {
                id: `SURG-${maxNum + 1}`,
                patient: v.patient,
                procedure: v.procedure,
                surgeon: v.surgeon,
                ot: v.ot as Surgery["ot"],
                date: "12 Nov 2025",
                time: "10:00",
                status: v.status as Surgery["status"],
              },
              ...r,
            ]);
          }}
          trigger={
            <Button size="lg">
              <HugeiconsIcon icon={PlusSignIcon} size={14} data-icon="inline-start" />
              Book Surgery
            </Button>
          }
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((kpi) => (
          <KpiCard key={kpi.label} kpi={kpi} />
        ))}
      </div>

      <OtOptimizerPanel rows={rows} onChange={setRows} />

      <FamilyUpdatesPanel rows={rows} />

      <SurgeriesTable rows={rows} onChange={setRows} />
    </Shell>
  );
}
