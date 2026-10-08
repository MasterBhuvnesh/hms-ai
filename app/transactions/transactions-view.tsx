"use client";

import { useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { PlusSignIcon, Search01Icon } from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { MoreButton, PanelTitle } from "@/components/dashboard/cards";
import { AddDialog, money } from "@/components/dashboard/add-dialog";
import { DeleteConfirm, EditDialog } from "@/components/dashboard/row-actions";
import { TablePagination } from "@/components/dashboard/table-pagination";
import { TransactionsTable } from "@/components/dashboard/transactions-table";
import { FilterPills, num, useDataTable } from "@/components/dashboard/use-table";
import {
  customers,
  products,
  transactions as transactionsSeed,
  type Transaction,
} from "@/data/mock";
import data from "@/data/dashboard.json";

const customerNames = customers.map((c) => c.name);
const productNames = products.map((p) => p.name);

export function TransactionsView({
  title = "All Payments",
  showAdd = false,
}: {
  title?: string;
  showAdd?: boolean;
}) {
  const [rows, setRows] = useState<Transaction[]>(transactionsSeed);
  const [editRow, setEditRow] = useState<Transaction | null>(null);
  const [deleteRow, setDeleteRow] = useState<Transaction | null>(null);
  const t = useDataTable(rows, {
    searchFields: (r) => [r.id, r.customer, r.product],
    filterField: (r) => r.status,
    sorters: {
      id: (r) => r.id,
      customer: (r) => r.customer,
      product: (r) => r.product,
      status: (r) => r.status,
      qty: (r) => r.qty,
      unitPrice: (r) => num(r.unitPrice),
      totalRevenue: (r) => num(r.totalRevenue),
    },
  });

  return (
    <Card className="gap-0 bg-muted/50 p-1 ring-0 shadow-sm dark:bg-muted">
      <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2">
        <PanelTitle title={title} />
        <div className="flex items-center gap-2">
          <FilterPills
            options={["All", "Success", "Pending", "Refunded"]}
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
              placeholder="Search payments..."
              className="h-8 w-56 rounded-lg bg-muted/40 pl-8 shadow-none"
            />
          </div>
          {showAdd && (
            <AddDialog
              title="Add Payment"
              submitLabel="Add Payment"
              fields={[
                {
                  name: "customer",
                  label: "Patient",
                  options: customerNames,
                  searchable: true,
                  placeholder: "Search patients...",
                },
                {
                  name: "product",
                  label: "Service",
                  options: productNames,
                  searchable: true,
                  placeholder: "Search services...",
                },
                { name: "qty", label: "Quantity", type: "number", placeholder: "1" },
                { name: "unitPrice", label: "Unit price", type: "number", placeholder: "0" },
                { name: "status", label: "Status", options: ["Success", "Pending", "Refunded"] },
              ]}
              onSubmit={(v) => {
                const qty = Number(v.qty) || 1;
                const unit = Number(v.unitPrice) || 0;
                const maxNum = rows.reduce(
                  (m, tx) => Math.max(m, Number(tx.id.replace(/\D/g, "")) || 0),
                  4830,
                );
                setRows((r) => [
                  {
                    id: `#${String(maxNum + 1).padStart(5, "0")}`,
                    customer: v.customer,
                    product: v.product,
                    status: v.status as Transaction["status"],
                    qty,
                    unitPrice: money(v.unitPrice),
                    totalRevenue: money(String(qty * unit)),
                    date: data.date,
                  },
                  ...r,
                ]);
              }}
              trigger={
                <Button variant="outline">
                  <HugeiconsIcon icon={PlusSignIcon} size={14} data-icon="inline-start" />
                  Add Payment
                </Button>
              }
            />
          )}
          <MoreButton />
        </div>
      </div>
      <div className="overflow-hidden rounded-xl bg-card py-2">
        <TransactionsTable
          transactions={t.rows}
          sort={t}
          onEdit={setEditRow}
          onDelete={setDeleteRow}
        />
      </div>
      <TablePagination
        page={t.page}
        pageSize={t.pageSize}
        total={t.total}
        onPageChange={t.setPage}
        onPageSizeChange={t.setPageSize}
      />
      {editRow && (
        <EditDialog
          open={!!editRow}
          onOpenChange={(o) => !o && setEditRow(null)}
          title={`Edit ${editRow.id}`}
          fields={[
            { name: "customer", label: "Patient", options: customerNames },
            { name: "product", label: "Service", options: productNames },
            { name: "qty", label: "Quantity", type: "number" },
            { name: "unitPrice", label: "Unit price", type: "number" },
            { name: "status", label: "Status", options: ["Success", "Pending", "Refunded"] },
          ]}
          initial={{
            customer: editRow.customer,
            product: editRow.product,
            qty: String(editRow.qty),
            unitPrice: editRow.unitPrice.replace(/[^0-9.]/g, ""),
            status: editRow.status,
          }}
          onSave={(v) => {
            const qty = Number(v.qty) || 0;
            const unit = Number(v.unitPrice) || 0;
            setRows((r) =>
              r.map((tx) =>
                tx.id === editRow.id
                  ? {
                      ...tx,
                      customer: v.customer,
                      product: v.product,
                      qty,
                      unitPrice: money(v.unitPrice),
                      totalRevenue: money(String(qty * unit)),
                      status: v.status as Transaction["status"],
                    }
                  : tx,
              ),
            );
          }}
        />
      )}
      <DeleteConfirm
        open={!!deleteRow}
        onOpenChange={(o) => !o && setDeleteRow(null)}
        title={deleteRow?.id ?? "payment"}
        onConfirm={() => deleteRow && setRows((r) => r.filter((tx) => tx.id !== deleteRow.id))}
      />
    </Card>
  );
}
