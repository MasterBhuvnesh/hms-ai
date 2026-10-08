"use client";

import { useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { PlusSignIcon } from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { MoreButton, PanelTitle } from "@/components/dashboard/cards";
import { AddDialog } from "@/components/dashboard/add-dialog";
import { DeleteConfirm, EditDialog, RowActions } from "@/components/dashboard/row-actions";
import { Shell } from "@/components/dashboard/shell";

type Role = { name: string; description: string; members: number; access: string };

const seedRoles: Role[] = [
  {
    name: "Admin",
    description: "Full control over hospital, billing, staff and settings.",
    members: 2,
    access: "Full access",
  },
  {
    name: "Management",
    description: "Oversees departments, reports, occupancy and revenue.",
    members: 4,
    access: "Limited access",
  },
  {
    name: "Doctor",
    description: "Views patients, writes prescriptions, manages appointments.",
    members: 18,
    access: "Limited access",
  },
  {
    name: "Nurse",
    description: "Patient care, vitals, ward updates and appointment support.",
    members: 24,
    access: "Limited access",
  },
  {
    name: "Receptionist",
    description: "Registers patients, books and reschedules appointments.",
    members: 6,
    access: "Limited access",
  },
  {
    name: "Billing Staff",
    description: "Creates bills, collects payments, handles invoices.",
    members: 5,
    access: "Limited access",
  },
  {
    name: "Pharmacist",
    description: "Dispenses medicines, manages pharmacy stock.",
    members: 3,
    access: "Limited access",
  },
  {
    name: "Lab Tech",
    description: "Lab tests, radiology reports and result uploads.",
    members: 4,
    access: "Read only",
  },
];

// access flags in role order: Admin, Management, Doctor, Nurse, Receptionist, Billing Staff, Pharmacist, Lab Tech
const permissions = [
  { name: "View dashboard", access: [true, true, true, true, true, true, true, true] },
  { name: "Manage patients", access: [true, true, true, true, true, false, false, false] },
  { name: "Manage appointments", access: [true, true, true, true, true, false, false, false] },
  { name: "Write prescriptions", access: [true, false, true, false, false, false, false, false] },
  { name: "Dispense medicines", access: [true, false, false, true, false, false, true, false] },
  { name: "Lab reports", access: [true, true, true, false, false, false, false, true] },
  { name: "Billing access", access: [true, true, false, false, false, true, false, false] },
  { name: "Issue refunds", access: [true, true, false, false, false, true, false, false] },
  { name: "Manage staff", access: [true, true, false, false, false, false, false, false] },
  { name: "System settings", access: [true, false, false, false, false, false, false, false] },
];

export default function Roles() {
  const [roles, setRoles] = useState<Role[]>(seedRoles);
  const [editName, setEditName] = useState<string | null>(null);
  const [deleteName, setDeleteName] = useState<string | null>(null);
  const editing = roles.find((r) => r.name === editName) ?? null;
  const deleting = roles.find((r) => r.name === deleteName) ?? null;

  return (
    <Shell breadcrumb="Roles & Permissions" active="Roles & Permissions">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-medium tracking-tight">Roles & Permissions</h1>
        <AddDialog
          href="/roles"
          title="Add Role"
          submitLabel="Add Role"
          fields={[
            { name: "name", label: "Role name", placeholder: "Dietician" },
            { name: "description", label: "Description", placeholder: "What this role can do" },
            { name: "members", label: "Members", type: "number", placeholder: "0" },
            {
              name: "access",
              label: "Access level",
              options: ["Full access", "Limited access", "Read only"],
            },
          ]}
          onSubmit={(v) =>
            setRoles((r) => [
              ...r,
              {
                name: v.name,
                description: v.description,
                members: Number(v.members) || 0,
                access: v.access,
              },
            ])
          }
          trigger={
            <Button size="lg">
              <HugeiconsIcon icon={PlusSignIcon} size={14} data-icon="inline-start" />
              Add Role
            </Button>
          }
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {roles.map((role) => (
          <Card key={role.name} className="gap-0 bg-muted/50 p-1 ring-0 shadow-sm dark:bg-muted">
            <div className="flex-1 space-y-2 rounded-xl bg-card p-4">
              <p className="font-medium">{role.name}</p>
              <p className="text-sm text-muted-foreground">{role.description}</p>
              <p className="text-sm">
                <span className="font-mono font-medium">{role.members}</span>{" "}
                <span className="font-sans text-muted-foreground">members</span>
              </p>
            </div>
            <div className="flex items-center justify-between px-4 py-2.5">
              <span className="text-xs text-muted-foreground">{role.access}</span>
              <RowActions
                href="/roles"
                label={role.name}
                onEdit={() => setEditName(role.name)}
                onDelete={() => setDeleteName(role.name)}
              />
            </div>
          </Card>
        ))}
      </div>

      <Card className="gap-0 bg-muted/50 p-1 ring-0 shadow-sm dark:bg-muted">
        <div className="flex items-center justify-between px-3 py-2">
          <PanelTitle title="Permission Matrix" />
          <MoreButton />
        </div>
        <div className="overflow-x-auto rounded-xl bg-card py-2">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="pl-4 font-mono text-[10px] tracking-wider text-muted-foreground uppercase">
                  Permission
                </TableHead>
                {roles.map((role) => (
                  <TableHead
                    key={role.name}
                    className="font-mono text-[10px] tracking-wider text-muted-foreground uppercase"
                  >
                    {role.name}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {permissions.map((permission) => (
                <TableRow key={permission.name}>
                  <TableCell className="pl-4">{permission.name}</TableCell>
                  {roles.map((role, i) => (
                    <TableCell key={role.name}>
                      <Checkbox
                        defaultChecked={permission.access[i] ?? false}
                        aria-label={`${permission.name} for ${role.name}`}
                      />
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>
      {editing && (
        <EditDialog
          open={editName !== null}
          onOpenChange={(o) => {
            if (!o) setEditName(null);
          }}
          title={`Edit ${editing.name}`}
          fields={[
            { name: "name", label: "Role name" },
            { name: "description", label: "Description" },
            { name: "members", label: "Members", type: "number" },
            {
              name: "access",
              label: "Access level",
              options: ["Full access", "Limited access", "Read only"],
            },
          ]}
          initial={{
            name: editing.name,
            description: editing.description,
            members: String(editing.members),
            access: editing.access,
          }}
          onSave={(v) =>
            setRoles((rs) =>
              rs.map((r) =>
                r.name === editName
                  ? {
                      name: v.name,
                      description: v.description,
                      members: Number(v.members) || 0,
                      access: v.access,
                    }
                  : r,
              ),
            )
          }
        />
      )}
      <DeleteConfirm
        open={deleteName !== null}
        onOpenChange={(o) => {
          if (!o) setDeleteName(null);
        }}
        title={deleting?.name ?? "role"}
        onConfirm={() => setRoles((rs) => rs.filter((r) => r.name !== deleteName))}
      />
    </Shell>
  );
}
