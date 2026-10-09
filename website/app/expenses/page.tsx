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
import { KpiCard, MoreButton, PanelTitle, StatusBadge, type Kpi } from "@/components/dashboard/cards";
import { TablePagination } from "@/components/dashboard/table-pagination";
import { FilterPills, Th, num, useDataTable } from "@/components/dashboard/use-table";
import { AddDialog, money } from "@/components/dashboard/add-dialog";
import { DeleteConfirm, EditDialog, RowActions } from "@/components/dashboard/row-actions";
import { Shell } from "@/components/dashboard/shell";
import { expenses as seed, type Expense } from "@/data/hospital";

function ExpensesTable({ rows, onChange }: { rows: Expense[]; onChange: (rows: Expense[]) => void }) {
  const [editRow, setEditRow] = useState<Expense | null>(null);
  const [deleteRow, setDeleteRow] = useState<Expense | null>(null);
  const t = useDataTable(rows, {
    searchFields: (r) => [r.id, r.item, r.category, r.by],
    filterField: (r) => r.status,
    sorters: {
      id: (r) => r.id,
      item: (r) => r.item,
      category: (r) => r.category,
      amount: (r) => num(r.amount),
      date: (r) => r.date,
      by: (r) => r.by,
      status: (r) => r.status,
    },
  });

  return (
    <Card className="gap-0 bg-muted/50 p-1 ring-0 shadow-sm dark:bg-muted">
      <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2">
        <PanelTitle title="All Expenses" />
        <div className="flex items-center gap-2">
          <FilterPills options={["All", "Paid", "Pending", "Overdue"]} value={t.filter} onChange={t.setFilter} />
          <div className="relative hidden md:block">
            <HugeiconsIcon
              icon={Search01Icon}
              size={14}
              className="absolute top-1/2 left-2.5 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              value={t.query}
              onChange={(e) => t.setQuery(e.target.value)}
              placeholder="Search expenses..."
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
              <Th label="Exp ID" k="id" sort={t} className="pl-4" />
              <Th label="Item" k="item" sort={t} />
              <Th label="Category" k="category" sort={t} />
              <Th label="Amount" k="amount" sort={t} />
              <Th label="Date" k="date" sort={t} />
              <Th label="By" k="by" sort={t} />
              <Th label="Status" k="status" sort={t} />
              <TableHead className="pr-4 text-right font-mono text-[10px] tracking-wider text-muted-foreground uppercase">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {t.rows.length === 0 && (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={8} className="py-8 text-center text-sm text-muted-foreground">
                  No results found
                </TableCell>
              </TableRow>
            )}
            {t.rows.map((e) => (
              <TableRow key={e.id} className={e.status === "Overdue" ? "opacity-60" : ""}>
                <TableCell className="pl-4 font-mono text-muted-foreground">{e.id}</TableCell>
                <TableCell className="font-medium">{e.item}</TableCell>
                <TableCell className="text-muted-foreground">{e.category}</TableCell>
                <TableCell className="font-mono">{e.amount}</TableCell>
                <TableCell className="font-mono">{e.date}</TableCell>
                <TableCell className="text-muted-foreground">{e.by}</TableCell>
                <TableCell>
                  <StatusBadge status={e.status} />
                </TableCell>
                <TableCell className="pr-4 text-right">
                  <RowActions href="/expenses" label={e.id} onEdit={() => setEditRow(e)} onDelete={() => setDeleteRow(e)} />
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
        title={editRow ? `Edit ${editRow.id}` : "Edit expense"}
        fields={[
          { name: "item", label: "Item", placeholder: "Syringes 5ml" },
          { name: "category", label: "Category", options: ["Pharmacy Purchase", "Equipment", "Salaries", "Maintenance", "Utilities"] },
          { name: "amount", label: "Amount", type: "number", placeholder: "12000" },
          { name: "by", label: "By", placeholder: "Bhuvnesh Verma" },
          { name: "status", label: "Status", options: ["Paid", "Pending", "Overdue"] },
        ]}
        initial={{
          item: editRow?.item ?? "",
          category: editRow?.category ?? "Pharmacy Purchase",
          amount: editRow ? editRow.amount.replace(/[^0-9.]/g, "") : "",
          by: editRow?.by ?? "",
          status: editRow?.status ?? "Paid",
        }}
        onSave={(v) => {
          if (!editRow) return;
          onChange(rows.map((r) => r.id === editRow.id ? {
            ...r,
            item: v.item,
            category: v.category as Expense["category"],
            amount: money(v.amount),
            by: v.by,
            status: v.status as Expense["status"],
          } : r));
        }}
      />
      <DeleteConfirm
        open={!!deleteRow}
        onOpenChange={(o) => { if (!o) setDeleteRow(null); }}
        title={deleteRow?.id ?? "expense"}
        description={deleteRow ? `This will permanently remove expense ${deleteRow.id} (${deleteRow.item}). This action cannot be undone.` : undefined}
        onConfirm={() => { if (deleteRow) onChange(rows.filter((r) => r.id !== deleteRow.id)); }}
      />
    </Card>
  );
}

export default function ExpensesPage() {
  const [rows, setRows] = useState<Expense[]>(seed);

  const total = rows.reduce((s, r) => s + num(r.amount), 0);
  const paid = rows.filter((r) => r.status === "Paid").reduce((s, r) => s + num(r.amount), 0);
  const pending = rows.filter((r) => r.status === "Pending").length;
  const overdue = rows.filter((r) => r.status === "Overdue").length;
  const fmt = (n: number) => `₹${n.toLocaleString("en-US")}`;

  const kpis: Kpi[] = [
    { label: "Total Spent", value: fmt(total), suffix: "", delta: "+6,4%", deltaLabel: "vs last month", spark: [4, 6, 5, 7, 6, 8, 7, 9, 8, 12] },
    { label: "Paid", value: fmt(paid), suffix: "", delta: "+4,8%", deltaLabel: "vs last month", spark: [3, 5, 4, 6, 5, 7, 8, 7, 9, 10] },
    { label: "Pending", value: String(pending), suffix: "bills", delta: `+${pending}`, deltaLabel: "awaiting approval", spark: [5, 4, 6, 5, 7, 6, 8, 9, 8, 11] },
    { label: "Overdue", value: String(overdue), suffix: "bills", delta: `+${overdue}`, deltaLabel: "need action", spark: [4, 5, 4, 6, 5, 7, 6, 8, 9, 10] },
  ];

  return (
    <Shell breadcrumb="Expenses" active="Expenses">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-medium tracking-tight">Hospital Expenses</h1>
        <AddDialog
          href="/expenses"
          title="Add Expense"
          submitLabel="Add Expense"
          fields={[
            { name: "item", label: "Item", placeholder: "Syringes 5ml" },
            { name: "category", label: "Category", options: ["Pharmacy Purchase", "Equipment", "Salaries", "Maintenance", "Utilities"] },
            { name: "amount", label: "Amount", type: "number", placeholder: "12000" },
            { name: "by", label: "By", placeholder: "Bhuvnesh Verma" },
            { name: "status", label: "Status", options: ["Paid", "Pending", "Overdue"] },
          ]}
          onSubmit={(v) => {
            const maxNum = rows.reduce(
              (m, e) => Math.max(m, Number(e.id.replace(/\D/g, "")) || 0),
              8000,
            );
            setRows((r) => [
              {
                id: `EXP-${maxNum + 1}`,
                item: v.item,
                category: v.category as Expense["category"],
                amount: money(v.amount),
                date: "6 Nov 2025",
                by: v.by,
                status: v.status as Expense["status"],
              },
              ...r,
            ]);
          }}
          trigger={
            <Button size="lg">
              <HugeiconsIcon icon={PlusSignIcon} size={14} data-icon="inline-start" />
              Add Expense
            </Button>
          }
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((kpi) => (
          <KpiCard key={kpi.label} kpi={kpi} />
        ))}
      </div>

      <ExpensesTable rows={rows} onChange={setRows} />
    </Shell>
  );
}
