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
import type { Order } from "@/data/mock";

export function OrdersTable({ rows }: { rows: Order[] }) {
  const t = useDataTable(rows, {
    searchFields: (r) => [r.id, r.customer],
    filterField: (r) => r.status,
    sorters: {
      id: (r) => r.id,
      customer: (r) => r.customer,
      items: (r) => r.items,
      total: (r) => num(r.total),
      status: (r) => r.status,
      date: (r) => r.date,
    },
  });

  return (
    <Card className="gap-0 bg-muted/50 p-1 ring-0 shadow-sm dark:bg-muted">
      <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2">
        <PanelTitle title="All Orders" />
        <div className="flex items-center gap-2">
          <FilterPills
            options={["All", "Processing", "Shipped", "Delivered", "Cancelled"]}
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
              placeholder="Search orders..."
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
              <Th label="Order ID" k="id" sort={t} />
              <Th label="Customer" k="customer" sort={t} />
              <Th label="Items" k="items" sort={t} />
              <Th label="Total" k="total" sort={t} />
              <Th label="Status" k="status" sort={t} />
              <Th label="Date" k="date" sort={t} />
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
            {t.rows.map((order) => (
              <TableRow key={order.id} className={order.status === "Cancelled" ? "opacity-60" : ""}>
                <TableCell className="pl-4">
                  <Checkbox aria-label={`Select ${order.id}`} />
                </TableCell>
                <TableCell className="font-mono text-muted-foreground">{order.id}</TableCell>
                <TableCell className="font-medium">{order.customer}</TableCell>
                <TableCell className="font-mono">{order.items}</TableCell>
                <TableCell className="font-mono">{order.total}</TableCell>
                <TableCell>
                  <StatusBadge status={order.status} />
                </TableCell>
                <TableCell className="font-mono">{order.date}</TableCell>
                <TableCell className="pr-4 text-right">
                  <Button variant="ghost" size="icon-sm" aria-label={`Actions for ${order.id}`}>
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
