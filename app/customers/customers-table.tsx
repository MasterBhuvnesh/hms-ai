"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import { MoreHorizontalIcon, Search01Icon } from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
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
import { FilterPills, num, Th, useDataTable } from "@/components/dashboard/use-table";
import type { Customer } from "@/data/mock";

export function CustomersTable({ rows }: { rows: Customer[] }) {
  const t = useDataTable(rows, {
    searchFields: (r) => [r.name, r.email, r.location],
    filterField: (r) => r.status,
    sorters: {
      name: (r) => r.name,
      email: (r) => r.email,
      location: (r) => r.location,
      orders: (r) => r.orders,
      totalSpent: (r) => num(r.totalSpent),
      status: (r) => r.status,
    },
  });

  return (
    <Card className="gap-0 bg-muted/50 p-1 ring-0 shadow-sm dark:bg-muted">
      <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2">
        <PanelTitle title="All Customers" />
        <div className="flex items-center gap-2">
          <FilterPills
            options={["All", "Active", "Inactive"]}
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
              placeholder="Search customers..."
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
              <Th label="Customer" k="name" sort={t} />
              <Th label="Email" k="email" sort={t} />
              <Th label="Location" k="location" sort={t} />
              <Th label="Orders" k="orders" sort={t} />
              <Th label="Total Spent" k="totalSpent" sort={t} />
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
            {t.rows.map((customer) => (
              <TableRow key={customer.email}>
                <TableCell className="pl-4">
                  <Checkbox aria-label={`Select ${customer.name}`} />
                </TableCell>
                <TableCell className="font-medium">{customer.name}</TableCell>
                <TableCell className="text-muted-foreground">{customer.email}</TableCell>
                <TableCell>{customer.location}</TableCell>
                <TableCell className="font-mono">{customer.orders}</TableCell>
                <TableCell className="font-mono">{customer.totalSpent}</TableCell>
                <TableCell>
                  <StatusBadge status={customer.status} />
                </TableCell>
                <TableCell className="pr-4 text-right">
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label={`Actions for ${customer.name}`}
                  >
                    <HugeiconsIcon icon={MoreHorizontalIcon} size={16} />
                  </Button>
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
  );
}
