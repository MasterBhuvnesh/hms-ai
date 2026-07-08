import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowDown01Icon, Calendar03Icon, FileExportIcon } from "@hugeicons/core-free-icons";
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
import { KpiCard, MoreButton, PanelTitle } from "@/components/dashboard/cards";
import { Shell } from "@/components/dashboard/shell";
import { MonthlyRevenue } from "./monthly-revenue";
import { products } from "@/data/mock";
import data from "@/data/dashboard.json";

const categoryShades = [
  "bg-foreground",
  "bg-foreground/70",
  "bg-foreground/45",
  "bg-foreground/25",
];

const topProducts = [...products]
  .sort((a, b) => Number(b.sold.replace(/,/g, "")) - Number(a.sold.replace(/,/g, "")))
  .slice(0, 5);

export default function Reports() {
  return (
    <Shell breadcrumb="Reports & Analytics" active="Reports & Analytics">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-medium tracking-tight">Reports & Analytics</h1>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center rounded-lg border bg-muted/50 shadow-xs">
            <Button variant="ghost" size="lg" className="rounded-r-none px-3">
              Monthly
              <HugeiconsIcon icon={ArrowDown01Icon} size={14} data-icon="inline-end" />
            </Button>
            <span className="w-px self-stretch bg-border" />
            <Button variant="ghost" size="lg" className="rounded-l-none px-3">
              <HugeiconsIcon icon={Calendar03Icon} size={14} data-icon="inline-start" />
              {data.date}
            </Button>
          </div>
          <Button size="lg">
            <HugeiconsIcon icon={FileExportIcon} size={14} data-icon="inline-start" />
            Download Report
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {data.reports.kpis.map((kpi) => (
          <KpiCard key={kpi.label} kpi={kpi} />
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <MonthlyRevenue />

        <Card className="gap-0 bg-muted/50 p-1 ring-0 shadow-sm dark:bg-muted">
          <div className="flex items-center justify-between px-3 py-2">
            <PanelTitle title="Top Categories" />
            <MoreButton />
          </div>
          <div className="flex-1 space-y-5 rounded-xl bg-card p-4">
            <div>
              <p className="text-sm text-muted-foreground">Revenue share</p>
              <p className="mt-1 font-mono text-2xl font-semibold tracking-tight">
                {data.reports.kpis[0].value}
              </p>
            </div>
            <div className="flex h-2.5 gap-0.5 overflow-hidden rounded-full">
              {data.reports.categories.map((cat, i) => (
                <div
                  key={cat.name}
                  className={categoryShades[i]}
                  style={{ width: `${cat.share}%` }}
                />
              ))}
            </div>
            <div className="space-y-3">
              {data.reports.categories.map((cat, i) => (
                <div key={cat.name} className="flex items-center gap-2.5 text-sm">
                  <span className={`size-2.5 rounded-[3px] ${categoryShades[i]}`} />
                  <span>{cat.name}</span>
                  <span className="ml-auto font-mono font-medium">{cat.value}</span>
                  <span className="w-10 text-right font-mono text-xs text-muted-foreground">
                    {cat.share}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      <Card className="gap-0 bg-muted/50 p-1 ring-0 shadow-sm dark:bg-muted">
        <div className="flex items-center justify-between px-3 py-2">
          <PanelTitle title="Top Products" />
          <MoreButton />
        </div>
        <div className="overflow-hidden rounded-xl bg-card py-2">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                {["Rank", "Product", "Category", "Price", "Sold"].map((heading) => (
                  <TableHead
                    key={heading}
                    className="first:pl-4 font-mono text-[10px] tracking-wider text-muted-foreground uppercase"
                  >
                    {heading}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {topProducts.map((product, i) => (
                <TableRow key={product.sku}>
                  <TableCell className="pl-4 font-mono text-muted-foreground">
                    #{i + 1}
                  </TableCell>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell>{product.category}</TableCell>
                  <TableCell className="font-mono">{product.price}</TableCell>
                  <TableCell className="font-mono">{product.sold}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>
    </Shell>
  );
}
