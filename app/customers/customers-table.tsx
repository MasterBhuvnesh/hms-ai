"use client";

import { useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { Search01Icon } from "@hugeicons/core-free-icons";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { MoreButton, PanelTitle, StatusBadge } from "@/components/dashboard/cards";
import { TablePagination } from "@/components/dashboard/table-pagination";
import { FilterPills, Th, useDataTable } from "@/components/dashboard/use-table";
import { DeleteConfirm, EditDialog, RowActions } from "@/components/dashboard/row-actions";
import type { Field } from "@/components/dashboard/add-dialog";
import type { Patient } from "@/data/hospital";

const editFields: Field[] = [
  { name: "name", label: "Name" },
  { name: "age", label: "Age", type: "number" },
  { name: "phone", label: "Phone" },
  { name: "blood", label: "Blood", options: ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"] },
  { name: "doctor", label: "Doctor" },
  {
    name: "department",
    label: "Department",
    options: ["Cardiology", "Orthopedics", "Pediatrics", "Neurology", "General", "Emergency", "Radiology", "Pharmacy"],
  },
  { name: "status", label: "Status", options: ["Admitted", "Outpatient", "Emergency", "Critical", "Discharged"] },
];

export function CustomersTable({ rows, onChange }: { rows: Patient[]; onChange: (rows: Patient[]) => void }) {
  const [editRow, setEditRow] = useState<Patient | null>(null);
  const [deleteRow, setDeleteRow] = useState<Patient | null>(null);
  const t = useDataTable(rows, {
    searchFields: (r) => [r.id, r.name, r.doctor, r.department],
    filterField: (r) => r.status,
    sorters: {
      name: (r) => r.name,
      age: (r) => r.age,
      doctor: (r) => r.doctor,
      status: (r) => r.status,
    },
  });

  return (
    <>
      <Card className="gap-0 bg-muted/50 p-1 ring-0 shadow-sm dark:bg-muted">
        <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2">
          <PanelTitle title="All Patients" />
          <div className="flex items-center gap-2">
            <FilterPills
              options={["All", "Admitted", "Outpatient", "Emergency", "Critical", "Discharged"]}
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
                placeholder="Search patients..."
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
                <TableHead className="w-12 pl-4">
                  <Checkbox aria-label="Select all" />
                </TableHead>
                <Th label="Patient ID" k="id" sort={t} />
                <Th label="Patient" k="name" sort={t} />
                <Th label="Age / Blood" k="age" sort={t} />
                <Th label="Doctor" k="doctor" sort={t} />
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
              {t.rows.map((p) => (
                <TableRow key={p.id} className={p.status === "Discharged" ? "opacity-60" : ""}>
                  <TableCell className="pl-4">
                    <Checkbox aria-label={`Select ${p.name}`} />
                  </TableCell>
                  <TableCell className="font-mono text-muted-foreground">{p.id}</TableCell>
                  <TableCell className="font-medium">{p.name}</TableCell>
                  <TableCell className="font-mono">{p.age}y / {p.blood}</TableCell>
                  <TableCell className="text-muted-foreground">{p.doctor}</TableCell>
                  <TableCell>
                    <StatusBadge status={p.status} />
                  </TableCell>
                  <TableCell className="pr-4 text-right">
                    <RowActions
                      href="/customers"
                      label={p.name}
                      onEdit={() => setEditRow(p)}
                      onDelete={() => setDeleteRow(p)}
                    />
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
      </Card>
      <EditDialog
        open={!!editRow}
        onOpenChange={(o) => {
          if (!o) setEditRow(null);
        }}
        title={`Edit ${editRow?.name ?? "patient"}`}
        fields={editFields}
        initial={
          editRow
            ? {
                name: editRow.name,
                age: String(editRow.age),
                phone: editRow.phone,
                blood: editRow.blood,
                doctor: editRow.doctor,
                department: editRow.department,
                status: editRow.status,
              }
            : {}
        }
        onSave={(values) => {
          if (!editRow) return;
          onChange(
            rows.map((r) =>
              r.id === editRow.id
                ? {
                    ...r,
                    name: values.name,
                    age: Number(values.age) || 0,
                    phone: values.phone,
                    blood: values.blood as Patient["blood"],
                    doctor: values.doctor,
                    department: values.department,
                    status: values.status as Patient["status"],
                  }
                : r,
            ),
          );
        }}
      />
      <DeleteConfirm
        open={!!deleteRow}
        onOpenChange={(o) => {
          if (!o) setDeleteRow(null);
        }}
        title={deleteRow?.name ?? "patient"}
        description={`This will permanently remove ${deleteRow?.name ?? "this patient"}. This action cannot be undone.`}
        onConfirm={() => {
          if (deleteRow) onChange(rows.filter((r) => r.id !== deleteRow.id));
        }}
      />
    </>
  );
}
