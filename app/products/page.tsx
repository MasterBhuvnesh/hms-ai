import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowUpDownIcon,
  FileExportIcon,
  MoreHorizontalIcon,
  PlusSignIcon,
  Search01Icon,
} from "@hugeicons/core-free-icons";
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
import { KpiCard, MoreButton, PanelTitle, StatusBadge } from "@/components/dashboard/cards";
import { Shell } from "@/components/dashboard/shell";
import data from "@/data/dashboard.json";

export default function Products() {
  return (
    <Shell breadcrumb="Products" active="Products">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-medium tracking-tight">Products</h1>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="lg" className="bg-card">
            <HugeiconsIcon icon={FileExportIcon} size={14} data-icon="inline-start" />
            Export CSV
          </Button>
          <Button size="lg">
            <HugeiconsIcon icon={PlusSignIcon} size={14} data-icon="inline-start" />
            Add Product
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {data.products.kpis.map((kpi) => (
          <KpiCard key={kpi.label} kpi={kpi} />
        ))}
      </div>

      <Card className="gap-0 bg-muted/50 p-1 ring-0 shadow-sm dark:bg-muted">
        <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2">
          <PanelTitle title="All Products" />
          <div className="flex items-center gap-2">
            <div className="relative hidden md:block">
              <HugeiconsIcon
                icon={Search01Icon}
                size={14}
                className="absolute top-1/2 left-2.5 -translate-y-1/2 text-muted-foreground"
              />
              <Input
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
                {["Product", "SKU", "Category", "Price", "Stock", "Status", "Sold"].map(
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
              {data.products.items.map((product) => {
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
      </Card>
    </Shell>
  );
}
