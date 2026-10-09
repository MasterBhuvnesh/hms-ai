"use client";

import { useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { Search01Icon } from "@hugeicons/core-free-icons";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
import { VisitBriefDialog } from "@/components/dashboard/visit-brief";
import type { Field } from "@/components/dashboard/add-dialog";
import type { Appointment } from "@/data/hospital";

const editFields: Field[] = [
  { name: "patient", label: "Patient" },
  { name: "doctor", label: "Doctor" },
  {
    name: "department",
    label: "Department",
    options: ["Cardiology", "Orthopedics", "Pediatrics", "Neurology", "General", "Emergency", "Radiology", "Pharmacy"],
  },
  { name: "date", label: "Date", placeholder: "6 Nov 2025" },
  { name: "time", label: "Time" },
  { name: "type", label: "Type", options: ["Consult", "Follow-up", "Emergency", "Surgery", "Lab Test"] },
  { name: "status", label: "Status", options: ["Scheduled", "In Progress", "Completed", "Cancelled", "No Show"] },
];

export function OrdersTable({ rows, onChange }: { rows: Appointment[]; onChange: (rows: Appointment[]) => void }) {
  const [editRow, setEditRow] = useState<Appointment | null>(null);
  const [deleteRow, setDeleteRow] = useState<Appointment | null>(null);
  const [briefRow, setBriefRow] = useState<Appointment | null>(null);
  const t = useDataTable(rows, {
    searchFields: (r) => [r.id, r.patient, r.doctor],
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
    <>
      <Card className="gap-0 bg-muted/50 p-1 ring-0 shadow-sm dark:bg-muted">
        <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2">
          <PanelTitle title="All Appointments" />
          <div className="flex items-center gap-2">
            <FilterPills
              options={["All", "Scheduled", "In Progress", "Completed", "Cancelled", "No Show"]}
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
                placeholder="Search appointments..."
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
                <Th label="Appt ID" k="id" sort={t} />
                <Th label="Patient" k="patient" sort={t} />
                <Th label="Doctor" k="doctor" sort={t} />
                <Th label="Date / Time" k="date" sort={t} />
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
              {t.rows.map((a) => (
                <TableRow key={a.id} className={a.status === "Cancelled" || a.status === "No Show" ? "opacity-60" : ""}>
                  <TableCell className="pl-4">
                    <Checkbox aria-label={`Select ${a.id}`} />
                  </TableCell>
                  <TableCell className="font-mono text-muted-foreground">{a.id}</TableCell>
                  <TableCell className="font-medium">{a.patient}</TableCell>
                  <TableCell className="text-muted-foreground">{a.doctor}</TableCell>
                  <TableCell className="font-mono">{a.date} {a.time}</TableCell>
                  <TableCell>
                    <StatusBadge status={a.status} />
                  </TableCell>
                  <TableCell className="pr-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="xs" onClick={() => setBriefRow(a)}>
                        Brief
                      </Button>
                      <RowActions
                        href="/orders"
                        label={a.id}
                        onEdit={() => setEditRow(a)}
                        onDelete={() => setDeleteRow(a)}
                      />
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
      </Card>
      <EditDialog
        open={!!editRow}
        onOpenChange={(o) => {
          if (!o) setEditRow(null);
        }}
        title={`Edit ${editRow?.id ?? "appointment"}`}
        fields={editFields}
        initial={
          editRow
            ? {
                patient: editRow.patient,
                doctor: editRow.doctor,
                department: editRow.department,
                date: editRow.date,
                time: editRow.time,
                type: editRow.type,
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
                    patient: values.patient,
                    doctor: values.doctor,
                    department: values.department,
                    date: values.date,
                    time: values.time,
                    type: values.type as Appointment["type"],
                    status: values.status as Appointment["status"],
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
        title={deleteRow?.id ?? "appointment"}
        description={`This will permanently remove appointment ${deleteRow?.id ?? ""}. This action cannot be undone.`}
        onConfirm={() => {
          if (deleteRow) onChange(rows.filter((r) => r.id !== deleteRow.id));
        }}
      />
      <VisitBriefDialog
        appointment={briefRow}
        open={!!briefRow}
        onOpenChange={(o) => {
          if (!o) setBriefRow(null);
        }}
      />
    </>
  );
}
