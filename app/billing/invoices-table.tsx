"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { MoreButton, PanelTitle, StatusBadge } from "@/components/dashboard/cards";
import { money } from "@/components/dashboard/add-dialog";
import { DeleteConfirm, EditDialog, RowActions } from "@/components/dashboard/row-actions";
import { TablePagination } from "@/components/dashboard/table-pagination";
import type { Bill } from "@/data/hospital";

export function InvoicesTable({ rows, onChange }: { rows: Bill[]; onChange: (rows: Bill[]) => void }) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [editRow, setEditRow] = useState<Bill | null>(null);
  const [deleteRow, setDeleteRow] = useState<Bill | null>(null);
  const visible = rows.slice((page - 1) * pageSize, page * pageSize);

  return (
    <Card className="gap-0 bg-muted/50 p-1 ring-0 shadow-sm dark:bg-muted xl:col-span-3">
      <div className="flex items-center justify-between px-3 py-2">
        <PanelTitle title="Patient Bills" />
        <MoreButton />
      </div>
      <div className="overflow-hidden rounded-xl bg-card py-2">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              {["Bill", "Patient", "Date", "Amount", "Status"].map((heading) => (
                <TableHead
                  key={heading}
                  className="first:pl-4 font-mono text-[10px] tracking-wider text-muted-foreground uppercase"
                >
                  {heading}
                </TableHead>
              ))}
              <TableHead className="pr-4 text-right font-mono text-[10px] tracking-wider text-muted-foreground uppercase">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {visible.map((bill) => (
              <TableRow key={bill.id}>
                <TableCell className="pl-4 font-mono text-muted-foreground">{bill.id}</TableCell>
                <TableCell className="font-medium">{bill.patient}</TableCell>
                <TableCell className="font-mono">{bill.date}</TableCell>
                <TableCell className="font-mono">{bill.amount}</TableCell>
                <TableCell>
                  <StatusBadge status={bill.status} />
                </TableCell>
                <TableCell className="pr-4 text-right">
                  <RowActions
                    href="/billing"
                    label={bill.id}
                    onEdit={() => setEditRow(bill)}
                    onDelete={() => setDeleteRow(bill)}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <TablePagination
        page={page}
        pageSize={pageSize}
        total={rows.length}
        onPageChange={setPage}
        onPageSizeChange={(s) => {
          setPageSize(s);
          setPage(1);
        }}
      />
      {editRow && (
        <EditDialog
          open={!!editRow}
          onOpenChange={(o) => !o && setEditRow(null)}
          title={`Edit ${editRow.id}`}
          fields={[
            { name: "patient", label: "Patient" },
            { name: "date", label: "Date" },
            { name: "amount", label: "Amount", type: "number" },
            { name: "status", label: "Status", options: ["Paid", "Pending", "Overdue", "Partial"] },
          ]}
          initial={{
            patient: editRow.patient,
            date: editRow.date,
            amount: editRow.amount.replace(/[^0-9.]/g, ""),
            status: editRow.status,
          }}
          onSave={(v) =>
            onChange(
              rows.map((b) =>
                b.id === editRow.id
                  ? {
                      ...b,
                      patient: v.patient,
                      date: v.date,
                      amount: money(v.amount),
                      status: v.status as Bill["status"],
                    }
                  : b,
              ),
            )
          }
        />
      )}
      <DeleteConfirm
        open={!!deleteRow}
        onOpenChange={(o) => !o && setDeleteRow(null)}
        title={deleteRow?.id ?? "bill"}
        onConfirm={() => deleteRow && onChange(rows.filter((b) => b.id !== deleteRow.id))}
      />
    </Card>
  );
}
