import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowUpDownIcon,
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
import type { Kpi } from "@/components/dashboard/cards";

const kpis: Kpi[] = [
  {
    label: "Total Orders",
    value: "10,320",
    suffix: "",
    delta: "+5,6%",
    deltaLabel: "vs last month",
    spark: [4, 6, 5, 7, 6, 8, 7, 9, 8, 12],
  },
  {
    label: "Processing",
    value: "148",
    suffix: "",
    delta: "+2,1%",
    deltaLabel: "vs last month",
    spark: [3, 5, 4, 6, 5, 7, 8, 7, 9, 10],
  },
  {
    label: "Shipped",
    value: "96",
    suffix: "",
    delta: "+3,7%",
    deltaLabel: "vs last month",
    spark: [5, 4, 6, 5, 7, 6, 8, 9, 8, 11],
  },
  {
    label: "Returns",
    value: "23",
    suffix: "",
    delta: "+0,4%",
    deltaLabel: "vs last month",
    spark: [4, 5, 4, 6, 5, 7, 6, 8, 9, 10],
  },
];

const orders = [
  {
    id: "#7301",
    customer: "Kaylee Vetrovs",
    items: 3,
    total: "$284",
    status: "Processing",
    date: "4 Nov 2025",
  },
  {
    id: "#7302",
    customer: "Ryan Korsgaard",
    items: 1,
    total: "$96",
    status: "Shipped",
    date: "4 Nov 2025",
  },
  {
    id: "#7303",
    customer: "Omar Dias",
    items: 5,
    total: "$512",
    status: "Delivered",
    date: "3 Nov 2025",
  },
  {
    id: "#7304",
    customer: "Alena Botosh",
    items: 2,
    total: "$168",
    status: "Cancelled",
    date: "3 Nov 2025",
  },
  {
    id: "#7305",
    customer: "Marcus Levin",
    items: 4,
    total: "$347",
    status: "Processing",
    date: "2 Nov 2025",
  },
  {
    id: "#7306",
    customer: "Talia Herwitz",
    items: 2,
    total: "$205",
    status: "Delivered",
    date: "2 Nov 2025",
  },
  {
    id: "#7307",
    customer: "Jaxson Calzoni",
    items: 6,
    total: "$623",
    status: "Shipped",
    date: "1 Nov 2025",
  },
  {
    id: "#7308",
    customer: "Selin Aminoff",
    items: 1,
    total: "$74",
    status: "Delivered",
    date: "1 Nov 2025",
  },
];

export default function OrderManagement() {
  return (
    <Shell breadcrumb="Order Management" active="Order Management">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-medium tracking-tight">Order Management</h1>
        <Button size="lg">
          <HugeiconsIcon icon={PlusSignIcon} size={14} data-icon="inline-start" />
          Create Order
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((kpi) => (
          <KpiCard key={kpi.label} kpi={kpi} />
        ))}
      </div>

      <Card className="gap-0 bg-muted/50 p-1 ring-0 shadow-sm dark:bg-muted">
        <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2">
          <PanelTitle title="All Orders" />
          <div className="flex items-center gap-2">
            <div className="flex rounded-lg bg-muted p-0.5 text-xs font-medium">
              {["All", "Processing", "Shipped", "Delivered"].map((tab) => (
                <button
                  key={tab}
                  className={
                    tab === "All"
                      ? "rounded-md bg-card px-3 py-1.5 shadow-xs"
                      : "px-3 py-1.5 text-muted-foreground"
                  }
                >
                  {tab}
                </button>
              ))}
            </div>
            <div className="relative hidden md:block">
              <HugeiconsIcon
                icon={Search01Icon}
                size={14}
                className="absolute top-1/2 left-2.5 -translate-y-1/2 text-muted-foreground"
              />
              <Input
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
                {["Order ID", "Customer", "Items", "Total", "Status", "Date"].map((heading) => (
                  <TableHead key={heading}>
                    <span className="flex items-center gap-1 font-mono text-[10px] tracking-wider text-muted-foreground uppercase">
                      {heading}
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
              {orders.map((order) => (
                <TableRow
                  key={order.id}
                  className={order.status === "Cancelled" ? "opacity-60" : ""}
                >
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
      </Card>
    </Shell>
  );
}
