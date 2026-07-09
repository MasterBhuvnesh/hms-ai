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
import type { Product } from "@/data/mock";

export function ProductsTable({ rows }: { rows: Product[] }) {
  const t = useDataTable(rows, {
    searchFields: (r) => [r.name, r.sku, r.category],
    filterField: (r) => r.status,
    sorters: {
      name: (r) => r.name,
      sku: (r) => r.sku,
      category: (r) => r.category,
      price: (r) => num(r.price),
      stock: (r) => r.stock,
      status: (r) => r.status,
      sold: (r) => num(r.sold),
    },
  });

  return (
    <Card className="gap-0 bg-muted/50 p-1 ring-0 shadow-sm dark:bg-muted">
      <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2">
        <PanelTitle title="All Products" />
        <div className="flex items-center gap-2">
          <FilterPills
            options={["All", "In Stock", "Low Stock", "Out of Stock"]}
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
              placeholder="Search products..."
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
              <Th label="Product" k="name" sort={t} />
              <Th label="SKU" k="sku" sort={t} />
              <Th label="Category" k="category" sort={t} />
              <Th label="Price" k="price" sort={t} />
              <Th label="Stock" k="stock" sort={t} />
              <Th label="Status" k="status" sort={t} />
              <Th label="Sold" k="sold" sort={t} />
              <TableHead className="pr-4 text-right font-mono text-[10px] tracking-wider text-muted-foreground uppercase">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {t.rows.length === 0 && (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={9} className="py-8 text-center text-sm text-muted-foreground">
                  No results found
                </TableCell>
              </TableRow>
            )}
            {t.rows.map((product) => {
              const outOfStock = product.status === "Out of Stock";
              return (
                <TableRow key={product.sku} className={outOfStock ? "opacity-60" : ""}>
                  <TableCell className="pl-4">
                    <Checkbox aria-label={`Select ${product.name}`} />
                  </TableCell>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell className="font-mono text-muted-foreground">{product.sku}</TableCell>
                  <TableCell>{product.category}</TableCell>
                  <TableCell className="font-mono">{product.price}</TableCell>
                  <TableCell className="font-mono">{product.stock}</TableCell>
                  <TableCell>
                    <StatusBadge status={product.status} />
                  </TableCell>
                  <TableCell className="font-mono">{product.sold}</TableCell>
                  <TableCell className="pr-4 text-right">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label={`Actions for ${product.name}`}
                    >
                      <HugeiconsIcon icon={MoreHorizontalIcon} size={16} />
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
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
