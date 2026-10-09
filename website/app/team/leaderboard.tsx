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
import { TablePagination } from "@/components/dashboard/table-pagination";
import { Th, useDataTable } from "@/components/dashboard/use-table";
import { DeleteConfirm, EditDialog, RowActions } from "@/components/dashboard/row-actions";
import type { Field } from "@/components/dashboard/add-dialog";
import type { StaffMember } from "@/data/hospital";

const editFields: Field[] = [
  {
    name: "role",
    label: "Role",
    options: ["Doctor", "Nurse", "Receptionist", "Billing Staff", "Pharmacist", "Lab Tech", "Management", "Admin"],
  },
  {
    name: "department",
    label: "Department",
    options: ["Cardiology", "Orthopedics", "Pediatrics", "Neurology", "General", "Emergency", "Radiology", "Pharmacy"],
  },
  { name: "shift", label: "Shift", options: ["Morning", "Evening", "Night"] },
  { name: "status", label: "Status", options: ["On Duty", "Off Duty", "On Leave"] },
];

export function Leaderboard({ rows, onChange }: { rows: StaffMember[]; onChange: (rows: StaffMember[]) => void }) {
  const [editRow, setEditRow] = useState<StaffMember | null>(null);
  const [deleteRow, setDeleteRow] = useState<StaffMember | null>(null);
  const t = useDataTable(rows, {
    searchFields: (r) => [r.name, r.role, r.department],
    sorters: {
      name: (r) => r.name,
      role: (r) => r.role,
      patients: (r) => r.patients,
    },
  });

  const offset = (t.page - 1) * t.pageSize;

  return (
    <>
      <Card className="gap-0 bg-muted/50 p-1 ring-0 shadow-sm dark:bg-muted xl:col-span-2">
        <div className="flex items-center justify-between px-3 py-2">
          <PanelTitle title="Doctors & Staff Roster" />
          <MoreButton />
        </div>
        <div className="flex-1 overflow-hidden rounded-xl bg-card py-2">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-14 pl-4 font-mono text-[10px] tracking-wider text-muted-foreground uppercase">
                  #
                </TableHead>
                <Th label="Member" k="name" sort={t} />
                <Th label="Role" k="role" sort={t} />
                <Th label="Patients" k="patients" sort={t} />
                <TableHead className="font-mono text-[10px] tracking-wider text-muted-foreground uppercase">
                  Shift / Status
                </TableHead>
                <TableHead className="pr-4 text-right font-mono text-[10px] tracking-wider text-muted-foreground uppercase">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {t.rows.map((m, i) => (
                <TableRow key={m.name}>
                  <TableCell className="pl-4 font-mono text-muted-foreground">
                    #{offset + i + 1}
                  </TableCell>
                  <TableCell className="font-medium">{m.name}</TableCell>
                  <TableCell className="text-muted-foreground">{m.role} - {m.department}</TableCell>
                  <TableCell className="font-mono">{m.patients}</TableCell>
                  <TableCell>
                    <span className="flex items-center gap-2">
                      <span className="font-mono text-xs text-muted-foreground">{m.shift}</span>
                      <StatusBadge status={m.status} />
                    </span>
                  </TableCell>
                  <TableCell className="pr-4 text-right">
                    <RowActions
                      href="/team"
                      label={m.name}
                      onEdit={() => setEditRow(m)}
                      onDelete={() => setDeleteRow(m)}
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
        title={`Edit ${editRow?.name ?? "staff member"}`}
        fields={editFields}
        initial={
          editRow
            ? {
                role: editRow.role,
                department: editRow.department,
                shift: editRow.shift,
                status: editRow.status,
              }
            : {}
        }
        onSave={(values) => {
          if (!editRow) return;
          onChange(
            rows.map((r) =>
              r.name === editRow.name
                ? {
                    ...r,
                    role: values.role as StaffMember["role"],
                    department: values.department,
                    shift: values.shift as StaffMember["shift"],
                    status: values.status as StaffMember["status"],
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
        title={deleteRow?.name ?? "staff member"}
        description={`This will permanently remove ${deleteRow?.name ?? "this staff member"}. This action cannot be undone.`}
        onConfirm={() => {
          if (deleteRow) onChange(rows.filter((r) => r.name !== deleteRow.name));
        }}
      />
    </>
  );
}
