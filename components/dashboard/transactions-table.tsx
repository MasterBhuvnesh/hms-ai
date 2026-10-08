"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowUpDownIcon, MoreHorizontalIcon } from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StatusBadge } from "@/components/dashboard/cards";
import { RowActions } from "@/components/dashboard/row-actions";
import { Th } from "@/components/dashboard/use-table";

export type Transaction = {
  id: string;
  customer: string;
  product: string;
  status: string;
  qty: number;
  unitPrice: string;
  totalRevenue: string;
};

const COLUMNS: { label: string; k: string }[] = [
  { label: "ID", k: "id" },
  { label: "Patient", k: "customer" },
  { label: "Service", k: "product" },
  { label: "Status", k: "status" },
  { label: "Qty", k: "qty" },
  { label: "Unit Price", k: "unitPrice" },
  { label: "Amount", k: "totalRevenue" },
];

export function TransactionsTable<T extends Transaction>({
  transactions,
  sort,
  onEdit,
  onDelete,
  href,
}: {
  transactions: T[];
  sort?: { sortKey: string | null; toggleSort: (key: string) => void };
  onEdit?: (row: T) => void;
  onDelete?: (row: T) => void;
  href?: string;
}) {
  return (
    <Table>
      <TableHeader>
        <TableRow className="hover:bg-transparent">
          <TableHead className="w-12 pl-4">
            <Checkbox aria-label="Select all" />
          </TableHead>
          {sort
            ? COLUMNS.map((c) => <Th key={c.k} label={c.label} k={c.k} sort={sort} />)
            : COLUMNS.map((c) => (
                <TableHead key={c.k}>
                  <span className="flex items-center gap-1 font-mono text-[10px] tracking-wider text-muted-foreground uppercase">
                    {c.label}
                    <HugeiconsIcon icon={ArrowUpDownIcon} size={12} />
                  </span>
                </TableHead>
              ))}
          <TableHead className="pr-4 text-right font-mono text-[10px] tracking-wider text-muted-foreground uppercase">
            Actions
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {transactions.length === 0 && (
          <TableRow className="hover:bg-transparent">
            <TableCell colSpan={9} className="py-8 text-center text-sm text-muted-foreground">
              No results found
            </TableCell>
          </TableRow>
        )}
        {transactions.map((tx) => {
          const refunded = tx.status === "Refunded";
          return (
            <TableRow key={tx.id} className={refunded ? "opacity-60" : ""}>
              <TableCell className="pl-4">
                <Checkbox aria-label={`Select ${tx.id}`} />
              </TableCell>
              <TableCell className="font-mono text-muted-foreground">{tx.id}</TableCell>
              <TableCell className="font-medium">{tx.customer}</TableCell>
              <TableCell>{tx.product}</TableCell>
              <TableCell>
                <StatusBadge status={tx.status} />
              </TableCell>
              <TableCell className="font-mono">{tx.qty}</TableCell>
              <TableCell className="font-mono">{tx.unitPrice}</TableCell>
              <TableCell className="font-mono">{tx.totalRevenue}</TableCell>
              <TableCell className="pr-4 text-right">
                {onEdit && onDelete ? (
                  <RowActions
                    href={href}
                    label={tx.id}
                    onEdit={() => onEdit(tx)}
                    onDelete={() => onDelete(tx)}
                  />
                ) : (
                  <Button variant="ghost" size="icon-sm" aria-label={`Actions for ${tx.id}`}>
                    <HugeiconsIcon icon={MoreHorizontalIcon} size={16} />
                  </Button>
                )}
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
