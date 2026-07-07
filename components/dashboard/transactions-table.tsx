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

export type Transaction = {
  id: string;
  customer: string;
  product: string;
  status: string;
  qty: number;
  unitPrice: string;
  totalRevenue: string;
};

export function TransactionsTable({ transactions }: { transactions: Transaction[] }) {
  return (
    <Table>
      <TableHeader>
        <TableRow className="hover:bg-transparent">
          <TableHead className="w-12 pl-4">
            <Checkbox aria-label="Select all" />
          </TableHead>
          {["ID", "Customer", "Product", "Status", "Qty", "Unit Price", "Total Revenue"].map(
            (heading) => (
              <TableHead key={heading}>
                <span className="flex items-center gap-1 font-mono text-[10px] tracking-wider text-muted-foreground uppercase">
                  {heading}
                  <HugeiconsIcon icon={ArrowUpDownIcon} size={12} />
                </span>
              </TableHead>
            ),
          )}
          <TableHead className="pr-4 text-right font-mono text-[10px] tracking-wider text-muted-foreground uppercase">
            Actions
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
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
                <Button variant="ghost" size="icon-sm" aria-label={`Actions for ${tx.id}`}>
                  <HugeiconsIcon icon={MoreHorizontalIcon} size={16} />
                </Button>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
