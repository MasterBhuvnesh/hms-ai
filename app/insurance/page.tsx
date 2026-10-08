"use client";

import { useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { PlusSignIcon, Search01Icon } from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { FilterPills, Th, num, useDataTable } from "@/components/dashboard/use-table";
import { AddDialog, money } from "@/components/dashboard/add-dialog";
import { DeleteConfirm, EditDialog, RowActions } from "@/components/dashboard/row-actions";
import { Shell } from "@/components/dashboard/shell";
import { insuranceClaims as seed, type InsuranceClaim } from "@/data/hospital";

const REQUIRED_DOCS = [
  "ID proof",
  "Pre-auth form",
  "Discharge summary",
  "Itemized bills",
  "Lab reports",
] as const;

function riskOf(claim: InsuranceClaim): number {
  let score = 0;
  if (claim.status === "Pending Docs") score += 30;
  if (num(claim.amount) > 150000) score += 20;
  if (claim.provider === "Ayushman") score += 10;
  if (claim.provider === "CGHS") score += 5;
  return Math.min(score, 95);
}

function riskMeta(score: number): { label: string; className: string } {
  if (score < 30) return { label: "Low", className: "text-emerald-600 dark:text-emerald-500" };
  if (score < 60) return { label: "Medium", className: "text-amber-600 dark:text-amber-500" };
  return { label: "High", className: "text-red-600 dark:text-red-500" };
}

function docsFor(docs: Record<string, boolean[]>, id: string): boolean[] {
  const cur = docs[id];
  if (cur && cur.length === REQUIRED_DOCS.length) return cur;
  return Array(REQUIRED_DOCS.length).fill(false);
}

function ClaimsTable({
  rows,
  onChange,
  docs,
  onDocsChange,
}: {
  rows: InsuranceClaim[];
  onChange: (rows: InsuranceClaim[]) => void;
  docs: Record<string, boolean[]>;
  onDocsChange: (id: string, next: boolean[]) => void;
}) {
  const [editRow, setEditRow] = useState<InsuranceClaim | null>(null);
  const [deleteRow, setDeleteRow] = useState<InsuranceClaim | null>(null);
  const [viewRow, setViewRow] = useState<InsuranceClaim | null>(null);
  const t = useDataTable(rows, {
    searchFields: (r) => [r.id, r.patient, r.provider],
    filterField: (r) => r.status,
    sorters: {
      id: (r) => r.id,
      patient: (r) => r.patient,
      provider: (r) => r.provider,
      amount: (r) => num(r.amount),
      date: (r) => r.date,
      status: (r) => r.status,
    },
  });

  return (
    <Card className="gap-0 bg-muted/50 p-1 ring-0 shadow-sm dark:bg-muted">
      <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2">
        <PanelTitle title="All Claims" />
        <div className="flex items-center gap-2">
          <FilterPills
            options={["All", "Submitted", "Approved", "Rejected", "Pending Docs"]}
            value={t.filter}
            onChange={t.setFilter}
          />
          <div className="relative hidden md:block">
            <HugeiconsIcon
              icon={Search01Icon}
              size={14}
              className="absolute top-1/2 left-2.5 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              value={t.query}
              onChange={(e) => t.setQuery(e.target.value)}
              placeholder="Search claims..."
              className="h-8 w-56 rounded-lg bg-muted/40 pl-8 shadow-none"
            />
          </div>
          <MoreButton />
        </div>
      </div>
      <div className="overflow-hidden rounded-xl bg-card py-2">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <Th label="Claim ID" k="id" sort={t} className="pl-4" />
              <Th label="Patient" k="patient" sort={t} />
              <Th label="Provider" k="provider" sort={t} />
              <Th label="Amount" k="amount" sort={t} />
              <Th label="Date" k="date" sort={t} />
              <Th label="Status" k="status" sort={t} />
              <TableHead className="pr-4 text-right font-mono text-[10px] tracking-wider text-muted-foreground uppercase">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {t.rows.length === 0 && (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={7} className="py-8 text-center text-sm text-muted-foreground">
                  No results found
                </TableCell>
              </TableRow>
            )}
            {t.rows.map((c) => (
              <TableRow key={c.id} className={c.status === "Rejected" ? "opacity-60" : ""}>
                <TableCell className="pl-4 font-mono text-muted-foreground">{c.id}</TableCell>
                <TableCell className="font-medium">{c.patient}</TableCell>
                <TableCell className="text-muted-foreground">{c.provider}</TableCell>
                <TableCell className="font-mono">{c.amount}</TableCell>
                <TableCell className="font-mono">{c.date}</TableCell>
                <TableCell>
                  <StatusBadge status={c.status} />
                </TableCell>
                <TableCell className="pr-4 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button variant="ghost" size="sm" onClick={() => setViewRow(c)}>
                      View
                    </Button>
                    <RowActions label={c.id} onEdit={() => setEditRow(c)} onDelete={() => setDeleteRow(c)} />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <TablePagination
        page={t.page}
        pageSize={t.pageSize}
        total={t.total}
        onPageChange={t.setPage}
        onPageSizeChange={t.setPageSize}
      />
      <EditDialog
        open={!!editRow}
        onOpenChange={(o) => { if (!o) setEditRow(null); }}
        title={editRow ? `Edit ${editRow.id}` : "Edit claim"}
        fields={[
          { name: "patient", label: "Patient", placeholder: "Jane Cooper" },
          { name: "provider", label: "Provider", options: ["Star Health", "HDFC Ergo", "ICICI Lombard", "CGHS", "Ayushman"] },
          { name: "amount", label: "Amount", type: "number", placeholder: "25000" },
          { name: "status", label: "Status", options: ["Submitted", "Approved", "Rejected", "Pending Docs"] },
        ]}
        initial={{
          patient: editRow?.patient ?? "",
          provider: editRow?.provider ?? "Star Health",
          amount: editRow ? editRow.amount.replace(/[^0-9.]/g, "") : "",
          status: editRow?.status ?? "Submitted",
        }}
        onSave={(v) => {
          if (!editRow) return;
          onChange(rows.map((r) => r.id === editRow.id ? {
            ...r,
            patient: v.patient,
            provider: v.provider as InsuranceClaim["provider"],
            amount: money(v.amount),
            status: v.status as InsuranceClaim["status"],
          } : r));
        }}
      />
      <DeleteConfirm
        open={!!deleteRow}
        onOpenChange={(o) => { if (!o) setDeleteRow(null); }}
        title={deleteRow?.id ?? "claim"}
        description={deleteRow ? `This will permanently remove claim ${deleteRow.id} (${deleteRow.patient}). This action cannot be undone.` : undefined}
        onConfirm={() => { if (deleteRow) onChange(rows.filter((r) => r.id !== deleteRow.id)); }}
      />
      <Dialog open={!!viewRow} onOpenChange={(o) => { if (!o) setViewRow(null); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-mono">Claim {viewRow?.id}</DialogTitle>
          </DialogHeader>
          {viewRow && (() => {
            const score = riskOf(viewRow);
            const meta = riskMeta(score);
            const checked = docsFor(docs, viewRow.id);
            const done = checked.filter(Boolean).length;
            return (
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-4 rounded-xl border p-4">
                  <div>
                    <p className="font-medium">{viewRow.patient}</p>
                    <p className="text-xs text-muted-foreground">{viewRow.provider} - {viewRow.date}</p>
                    <p className="mt-2 font-mono text-sm">{viewRow.amount}</p>
                  </div>
                  <StatusBadge status={viewRow.status} />
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[11px] tracking-wide text-muted-foreground uppercase">
                    Denial risk
                  </span>
                  <span className={`font-mono text-sm font-medium ${meta.className}`}>
                    {score} - {meta.label}
                  </span>
                </div>
                <div className="space-y-2">
                  <p className="font-mono text-[11px] tracking-wide text-muted-foreground uppercase">
                    Required documents
                  </p>
                  {REQUIRED_DOCS.map((doc, i) => (
                    <label key={doc} className="flex cursor-pointer items-center gap-2.5 text-sm">
                      <Checkbox
                        checked={checked[i]}
                        onCheckedChange={(v) => {
                          const next = [...checked];
                          next[i] = v === true;
                          onDocsChange(viewRow.id, next);
                        }}
                      />
                      <span className={checked[i] ? "text-muted-foreground line-through" : ""}>{doc}</span>
                    </label>
                  ))}
                </div>
                <p className="font-mono text-xs text-muted-foreground">
                  Packet readiness: {done}/{REQUIRED_DOCS.length} documents
                </p>
              </div>
            );
          })()}
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewRow(null)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

export default function InsurancePage() {
  const [rows, setRows] = useState<InsuranceClaim[]>(seed);
  const [docs, setDocs] = useState<Record<string, boolean[]>>({});

  const submitted = rows.filter((r) => r.status === "Submitted").length;
  const approved = rows.filter((r) => r.status === "Approved").length;
  const pendingDocs = rows.filter((r) => r.status === "Pending Docs").length;
  const totalAmount = rows.reduce((s, r) => s + num(r.amount), 0);
  const claimed = `₹${totalAmount.toLocaleString("en-US")}`;

  const kpis: Kpi[] = [
    { label: "Submitted", value: String(submitted), suffix: "claims", delta: `+${submitted}`, deltaLabel: "this month", spark: [4, 6, 5, 7, 6, 8, 7, 9, 8, 12] },
    { label: "Approved", value: String(approved), suffix: "claims", delta: `+${approved}`, deltaLabel: "this month", spark: [3, 5, 4, 6, 5, 7, 8, 7, 9, 10] },
    { label: "Pending Docs", value: String(pendingDocs), suffix: "claims", delta: `+${pendingDocs}`, deltaLabel: "need action", spark: [5, 4, 6, 5, 7, 6, 8, 9, 8, 11] },
    { label: "Amount Claimed", value: claimed, suffix: "", delta: "+8,2%", deltaLabel: "vs last month", spark: [4, 5, 4, 6, 5, 7, 6, 8, 9, 10] },
  ];

  return (
    <Shell breadcrumb="Insurance Claims" active="Insurance Claims">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-medium tracking-tight">Insurance / TPA Claims</h1>
        <AddDialog
          title="New Claim"
          submitLabel="New Claim"
          fields={[
            { name: "patient", label: "Patient", placeholder: "Jane Cooper" },
            { name: "provider", label: "Provider", options: ["Star Health", "HDFC Ergo", "ICICI Lombard", "CGHS", "Ayushman"] },
            { name: "amount", label: "Amount", type: "number", placeholder: "25000" },
            { name: "status", label: "Status", options: ["Submitted", "Approved", "Rejected", "Pending Docs"] },
          ]}
          onSubmit={(v) => {
            const maxNum = rows.reduce(
              (m, c) => Math.max(m, Number(c.id.replace(/\D/g, "")) || 0),
              6000,
            );
            setRows((r) => [
              {
                id: `CLM-${maxNum + 1}`,
                patient: v.patient,
                provider: v.provider as InsuranceClaim["provider"],
                amount: money(v.amount),
                date: "6 Nov 2025",
                status: v.status as InsuranceClaim["status"],
              },
              ...r,
            ]);
          }}
          trigger={
            <Button size="lg">
              <HugeiconsIcon icon={PlusSignIcon} size={14} data-icon="inline-start" />
              New Claim
            </Button>
          }
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((kpi) => (
          <KpiCard key={kpi.label} kpi={kpi} />
        ))}
      </div>

      <ClaimsTable
        rows={rows}
        onChange={setRows}
        docs={docs}
        onDocsChange={(id, next) => setDocs((d) => ({ ...d, [id]: next }))}
      />
    </Shell>
  );
}
