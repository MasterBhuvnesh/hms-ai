"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
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
import { invoices } from "@/data/mock";

export function InvoicesTable() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const rows = invoices.slice((page - 1) * pageSize, page * pageSize);

  return (
    <Card className="gap-0 bg-muted/50 p-1 ring-0 shadow-sm dark:bg-muted xl:col-span-3">
      <div className="flex items-center justify-between px-3 py-2">
        <PanelTitle title="Invoices" />
        <MoreButton />
      </div>
      <div className="overflow-hidden rounded-xl bg-card py-2">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              {["Invoice", "Date", "Amount", "Status"].map((heading) => (
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
            {rows.map((invoice) => (
              <TableRow key={invoice.id}>
                <TableCell className="pl-4 font-mono text-muted-foreground">{invoice.id}</TableCell>
                <TableCell className="font-mono">{invoice.date}</TableCell>
                <TableCell className="font-mono">{invoice.amount}</TableCell>
                <TableCell>
                  <StatusBadge status={invoice.status} />
                </TableCell>
                <TableCell className="pr-4 text-right">
                  <Button variant="ghost" size="sm" aria-label={`View ${invoice.id}`}>
                    View
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <TablePagination
        page={page}
        pageSize={pageSize}
        total={invoices.length}
        onPageChange={setPage}
        onPageSizeChange={(s) => {
          setPageSize(s);
          setPage(1);
        }}
      />
    </Card>
  );
}
