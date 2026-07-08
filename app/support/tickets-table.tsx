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
import { FilterPills, Th, useDataTable } from "@/components/dashboard/use-table";
import { tickets } from "@/data/mock";

const priorityRank: Record<string, number> = { High: 3, Medium: 2, Low: 1 };

export function TicketsTable() {
  const t = useDataTable(tickets, {
    searchFields: (r) => [r.id, r.customer, r.subject],
    filterField: (r) => r.status,
    sorters: {
      id: (r) => r.id,
      customer: (r) => r.customer,
      subject: (r) => r.subject,
      priority: (r) => priorityRank[r.priority] ?? 0,
      status: (r) => r.status,
      updated: (r) => r.updated,
    },
  });

  return (
    <Card className="gap-0 bg-muted/50 p-1 ring-0 shadow-sm dark:bg-muted">
      <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2">
        <PanelTitle title="Tickets" />
        <div className="flex items-center gap-2">
          <FilterPills
            options={["All", "Open", "Pending", "Resolved"]}
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
              placeholder="Search tickets..."
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
              <Th label="ID" k="id" sort={t} />
              <Th label="Customer" k="customer" sort={t} />
              <Th label="Subject" k="subject" sort={t} />
              <Th label="Priority" k="priority" sort={t} />
              <Th label="Status" k="status" sort={t} />
              <Th label="Updated" k="updated" sort={t} />
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
            {t.rows.map((ticket) => (
              <TableRow
                key={ticket.id}
                className={ticket.status === "Resolved" ? "opacity-60" : ""}
              >
                <TableCell className="pl-4">
                  <Checkbox aria-label={`Select ${ticket.id}`} />
                </TableCell>
                <TableCell className="font-mono text-muted-foreground">{ticket.id}</TableCell>
                <TableCell className="font-medium">{ticket.customer}</TableCell>
                <TableCell>{ticket.subject}</TableCell>
                <TableCell className="font-mono">{ticket.priority}</TableCell>
                <TableCell>
                  <StatusBadge status={ticket.status} />
                </TableCell>
                <TableCell className="font-mono text-muted-foreground">{ticket.updated}</TableCell>
                <TableCell className="pr-4 text-right">
                  <Button variant="ghost" size="icon-sm" aria-label={`Actions for ${ticket.id}`}>
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
