"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import { PlusSignIcon, Search01Icon } from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { MoreButton, PanelTitle } from "@/components/dashboard/cards";
import { TablePagination } from "@/components/dashboard/table-pagination";
import { TransactionsTable } from "@/components/dashboard/transactions-table";
import { FilterPills, num, useDataTable } from "@/components/dashboard/use-table";
import { transactions } from "@/data/mock";

export function TransactionsView({
  title = "All Transactions",
  showAdd = false,
}: {
  title?: string;
  showAdd?: boolean;
}) {
  const t = useDataTable(transactions, {
    searchFields: (r) => [r.id, r.customer, r.product],
    filterField: (r) => r.status,
    sorters: {
      id: (r) => r.id,
      customer: (r) => r.customer,
      product: (r) => r.product,
      status: (r) => r.status,
      qty: (r) => r.qty,
      unitPrice: (r) => num(r.unitPrice),
      totalRevenue: (r) => num(r.totalRevenue),
    },
  });

  return (
    <Card className="gap-0 bg-muted/50 p-1 ring-0 shadow-sm dark:bg-muted">
      <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2">
        <PanelTitle title={title} />
        <div className="flex items-center gap-2">
          <FilterPills
            options={["All", "Success", "Pending", "Refunded"]}
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
              placeholder="Search transactions..."
              className="h-8 w-56 rounded-lg bg-muted/40 pl-8 shadow-none"
            />
          </div>
          {showAdd && (
            <Button variant="outline">
              <HugeiconsIcon icon={PlusSignIcon} size={14} data-icon="inline-start" />
              Add Transaction
            </Button>
          )}
          <MoreButton />
        </div>
      </div>
      <div className="overflow-hidden rounded-xl bg-card py-2">
        <TransactionsTable transactions={t.rows} sort={t} />
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
