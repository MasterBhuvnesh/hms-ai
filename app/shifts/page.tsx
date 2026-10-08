"use client";

import { useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { Search01Icon } from "@hugeicons/core-free-icons";
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
import { Shell } from "@/components/dashboard/shell";
import { DeleteConfirm, EditDialog, RowActions } from "@/components/dashboard/row-actions";
import { leaveRequests as leaveSeed, staff as staffSeed, type LeaveRequest, type StaffMember } from "@/data/hospital";

function RosterTable({ rows, onChange }: { rows: StaffMember[]; onChange: (rows: StaffMember[]) => void }) {
  const [editRow, setEditRow] = useState<StaffMember | null>(null);
  const [deleteRow, setDeleteRow] = useState<StaffMember | null>(null);
  const t = useDataTable(rows, {
    searchFields: (r) => [r.name, r.role, r.department, r.shift],
    filterField: (r) => r.status,
    sorters: {
      name: (r) => r.name,
      role: (r) => r.role,
      shift: (r) => r.shift,
      status: (r) => r.status,
    },
  });

  return (
    <Card className="gap-0 bg-muted/50 p-1 ring-0 shadow-sm dark:bg-muted">
      <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2">
        <PanelTitle title="Shift Roster" />
        <div className="flex items-center gap-2">
          <div className="relative hidden md:block">
            <HugeiconsIcon
              icon={Search01Icon}
              size={14}
              className="absolute top-1/2 left-2.5 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              value={t.query}
              onChange={(e) => t.setQuery(e.target.value)}
              placeholder="Search staff..."
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
              <Th label="Name" k="name" sort={t} className="pl-4" />
              <Th label="Role - Department" k="role" sort={t} />
              <Th label="Shift" k="shift" sort={t} />
              <Th label="Status" k="status" sort={t} />
              <TableHead className="pr-4 text-right font-mono text-[10px] tracking-wider text-muted-foreground uppercase">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {t.rows.length === 0 && (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={5} className="py-8 text-center text-sm text-muted-foreground">
                  No results found
                </TableCell>
              </TableRow>
            )}
            {t.rows.map((s) => (
              <TableRow key={s.name} className={s.status === "On Leave" ? "opacity-60" : ""}>
                <TableCell className="pl-4 font-medium">{s.name}</TableCell>
                <TableCell className="text-muted-foreground">
                  {s.role} - {s.department}
                </TableCell>
                <TableCell className="font-mono">{s.shift}</TableCell>
                <TableCell>
                  <StatusBadge status={s.status} />
                </TableCell>
                <TableCell className="pr-4 text-right">
                  <RowActions href="/shifts" label={s.name} onEdit={() => setEditRow(s)} onDelete={() => setDeleteRow(s)} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5">
        <span className="text-xs text-muted-foreground">
          Availability is toggled from the staff profile - changes reflect in the roster instantly.
        </span>
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
        title={editRow ? `Edit ${editRow.name}` : "Edit staff"}
        fields={[
          { name: "role", label: "Role", options: ["Doctor", "Nurse", "Receptionist", "Billing Staff", "Pharmacist", "Lab Tech", "Management", "Admin"] },
          { name: "department", label: "Department", options: ["Cardiology", "Orthopedics", "Pediatrics", "Neurology", "General", "Emergency", "Radiology", "Pharmacy"] },
          { name: "shift", label: "Shift", options: ["Morning", "Evening", "Night"] },
          { name: "status", label: "Status", options: ["On Duty", "Off Duty", "On Leave"] },
        ]}
        initial={{
          role: editRow?.role ?? "Doctor",
          department: editRow?.department ?? "General",
          shift: editRow?.shift ?? "Morning",
          status: editRow?.status ?? "On Duty",
        }}
        onSave={(v) => {
          if (!editRow) return;
          onChange(rows.map((r) => r.name === editRow.name ? {
            ...r,
            role: v.role as StaffMember["role"],
            department: v.department,
            shift: v.shift as StaffMember["shift"],
            status: v.status as StaffMember["status"],
          } : r));
        }}
      />
      <DeleteConfirm
        open={!!deleteRow}
        onOpenChange={(o) => { if (!o) setDeleteRow(null); }}
        title={deleteRow?.name ?? "staff member"}
        description={deleteRow ? `This will permanently remove ${deleteRow.name} from the roster. This action cannot be undone.` : undefined}
        onConfirm={() => { if (deleteRow) onChange(rows.filter((r) => r.name !== deleteRow.name)); }}
      />
    </Card>
  );
}

function LeavesTable({
  rows,
  onChange,
}: {
  rows: LeaveRequest[];
  onChange: (rows: LeaveRequest[]) => void;
}) {
  const [editRow, setEditRow] = useState<LeaveRequest | null>(null);
  const [deleteRow, setDeleteRow] = useState<LeaveRequest | null>(null);
  const t = useDataTable(rows, {
    searchFields: (r) => [r.id, r.staff, r.role, r.reason],
    filterField: (r) => r.status,
    sorters: {
      id: (r) => r.id,
      staff: (r) => r.staff,
      role: (r) => r.role,
      status: (r) => r.status,
    },
  });

  return (
    <Card className="gap-0 bg-muted/50 p-1 ring-0 shadow-sm dark:bg-muted">
      <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2">
        <PanelTitle title="Leave Requests" />
        <div className="flex items-center gap-2">
          <FilterPills
            options={["All", "Pending", "Approved", "Rejected"]}
            value={t.filter}
            onChange={t.setFilter}
          />
          <MoreButton />
        </div>
      </div>
      <div className="overflow-hidden rounded-xl bg-card py-2">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <Th label="ID" k="id" sort={t} className="pl-4" />
              <Th label="Staff" k="staff" sort={t} />
              <Th label="Role" k="role" sort={t} />
              <TableHead className="font-mono text-[10px] tracking-wider text-muted-foreground uppercase">
                From - To
              </TableHead>
              <TableHead className="font-mono text-[10px] tracking-wider text-muted-foreground uppercase">
                Reason
              </TableHead>
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
            {t.rows.map((l) => (
              <TableRow key={l.id} className={l.status === "Rejected" ? "opacity-60" : ""}>
                <TableCell className="pl-4 font-mono text-muted-foreground">{l.id}</TableCell>
                <TableCell className="font-medium">{l.staff}</TableCell>
                <TableCell className="text-muted-foreground">{l.role}</TableCell>
                <TableCell className="font-mono">
                  {l.from} - {l.to}
                </TableCell>
                <TableCell className="text-muted-foreground">{l.reason}</TableCell>
                <TableCell>
                  <StatusBadge status={l.status} />
                </TableCell>
                <TableCell className="pr-4 text-right">
                  <div className="flex items-center justify-end gap-1">
                    {l.status === "Pending" ? (
                      <>
                        <Button variant="ghost" size="sm" onClick={() => onChange(rows.map((r) => r.id === l.id ? { ...r, status: "Approved" as const } : r))} aria-label={`Approve ${l.id}`}>
                          Approve
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => onChange(rows.map((r) => r.id === l.id ? { ...r, status: "Rejected" as const } : r))} aria-label={`Reject ${l.id}`}>
                          Reject
                        </Button>
                      </>
                    ) : (
                      <span className="font-mono text-xs text-muted-foreground">Done</span>
                    )}
                    <RowActions href="/shifts" label={l.id} onEdit={() => setEditRow(l)} onDelete={() => setDeleteRow(l)} />
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
        title={editRow ? `Edit ${editRow.id}` : "Edit leave request"}
        fields={[
          { name: "from", label: "From", placeholder: "10 Nov 2025" },
          { name: "to", label: "To", placeholder: "12 Nov 2025" },
          { name: "reason", label: "Reason", placeholder: "Fever" },
          { name: "status", label: "Status", options: ["Pending", "Approved", "Rejected"] },
        ]}
        initial={{
          from: editRow?.from ?? "",
          to: editRow?.to ?? "",
          reason: editRow?.reason ?? "",
          status: editRow?.status ?? "Pending",
        }}
        onSave={(v) => {
          if (!editRow) return;
          onChange(rows.map((r) => r.id === editRow.id ? {
            ...r,
            from: v.from,
            to: v.to,
            reason: v.reason,
            status: v.status as LeaveRequest["status"],
          } : r));
        }}
      />
      <DeleteConfirm
        open={!!deleteRow}
        onOpenChange={(o) => { if (!o) setDeleteRow(null); }}
        title={deleteRow?.id ?? "leave request"}
        description={deleteRow ? `This will permanently remove leave request ${deleteRow.id} (${deleteRow.staff}). This action cannot be undone.` : undefined}
        onConfirm={() => { if (deleteRow) onChange(rows.filter((r) => r.id !== deleteRow.id)); }}
      />
    </Card>
  );
}

export default function ShiftsPage() {
  const [roster, setRoster] = useState<StaffMember[]>(staffSeed);
  const [leaves, setLeaves] = useState<LeaveRequest[]>(leaveSeed);

  const onDuty = roster.filter((s) => s.status === "On Duty").length;
  const night = roster.filter((s) => s.shift === "Night").length;
  const onLeave = roster.filter((s) => s.status === "On Leave").length;
  const pending = leaves.filter((l) => l.status === "Pending").length;

  const kpis: Kpi[] = [
    { label: "On Duty", value: String(onDuty), suffix: "staff", delta: `+${onDuty}`, deltaLabel: "right now", spark: [4, 6, 5, 7, 6, 8, 7, 9, 8, 12] },
    { label: "Night Shift", value: String(night), suffix: "staff", delta: `+${night}`, deltaLabel: "tonight", spark: [3, 5, 4, 6, 5, 7, 8, 7, 9, 10] },
    { label: "On Leave", value: String(onLeave), suffix: "staff", delta: `+${onLeave}`, deltaLabel: "today", spark: [5, 4, 6, 5, 7, 6, 8, 9, 8, 11] },
    { label: "Pending Leaves", value: String(pending), suffix: "requests", delta: `+${pending}`, deltaLabel: "need review", spark: [4, 5, 4, 6, 5, 7, 6, 8, 9, 10] },
  ];

  return (
    <Shell breadcrumb="Shifts & Leaves" active="Shifts & Leaves">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-medium tracking-tight">Shifts &amp; Leave Approvals</h1>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((kpi) => (
          <KpiCard key={kpi.label} kpi={kpi} />
        ))}
      </div>

      <RosterTable rows={roster} onChange={setRoster} />
      <LeavesTable rows={leaves} onChange={setLeaves} />
    </Shell>
  );
}
