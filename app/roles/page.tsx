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
import { Shell } from "@/components/dashboard/shell";

type Role = { name: string; description: string; members: number; access: string };

const seedRoles: Role[] = [
  {
    name: "Admin",
    description: "Full control over workspace, billing and settings.",
    members: 3,
    access: "Full access",
  },
  {
    name: "Manager",
    description: "Manages products, transactions and the sales team.",
    members: 5,
    access: "Limited access",
  },
  {
    name: "Operator",
    description: "Handles day-to-day sales operations and orders.",
    members: 8,
    access: "Limited access",
  },
  {
    name: "Viewer",
    description: "Read-only visibility into dashboard metrics.",
    members: 12,
    access: "Read only",
  },
];

// access flags in role order: Admin, Manager, Operator, Viewer
const permissions = [
  { name: "View dashboard", access: [true, true, true, true] },
  { name: "Manage products", access: [true, true, true, false] },
  { name: "Manage transactions", access: [true, true, true, false] },
  { name: "Issue refunds", access: [true, true, false, false] },
  { name: "Manage team", access: [true, true, false, false] },
  { name: "Billing access", access: [true, false, false, false] },
  { name: "System settings", access: [true, false, false, false] },
];

export default function Roles() {
  const [roles, setRoles] = useState<Role[]>(seedRoles);

  return (
    <Shell breadcrumb="Roles & Permissions" active="Roles & Permissions">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-medium tracking-tight">Roles & Permissions</h1>
        <AddDialog
          title="Add Role"
          submitLabel="Add Role"
          fields={[
            { name: "name", label: "Role name", placeholder: "Analyst" },
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
            <div className="flex items-center justify-end px-4 py-2.5">
              <span className="text-xs text-muted-foreground">{role.access}</span>
            </div>
          </Card>
        ))}
      </div>

      <Card className="gap-0 bg-muted/50 p-1 ring-0 shadow-sm dark:bg-muted">
        <div className="flex items-center justify-between px-3 py-2">
          <PanelTitle title="Permission Matrix" />
          <MoreButton />
        </div>
        <div className="overflow-hidden rounded-xl bg-card py-2">
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
                        defaultChecked={permission.access[i]}
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
    </Shell>
  );
}
