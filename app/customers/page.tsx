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
import type { Kpi } from "@/components/dashboard/cards";

const kpis: Kpi[] = [
  {
    label: "Total Customers",
    value: "4,305",
    suffix: "",
    delta: "+6,4%",
    deltaLabel: "vs last month",
    spark: [4, 6, 5, 7, 6, 8, 7, 9, 8, 12],
  },
  {
    label: "New This Month",
    value: "320",
    suffix: "",
    delta: "+12,1%",
    deltaLabel: "vs last month",
    spark: [3, 5, 4, 6, 5, 7, 6, 8, 9, 11],
  },
  {
    label: "Repeat Rate",
    value: "38,2%",
    suffix: "",
    delta: "+2,3%",
    deltaLabel: "vs last month",
    spark: [5, 4, 6, 5, 7, 6, 8, 7, 9, 10],
  },
  {
    label: "Avg Lifetime Value",
    value: "$412",
    suffix: "",
    delta: "+4,8%",
    deltaLabel: "vs last month",
    spark: [4, 5, 4, 6, 7, 6, 8, 9, 8, 12],
  },
];

const customers = [
  {
    name: "Kaylee Vetrovs",
    email: "kaylee.vetrovs@mail.com",
    location: "Austin, TX",
    orders: 24,
    totalSpent: "$1,840",
    status: "Active",
  },
  {
    name: "Ryan Korsgaard",
    email: "ryan.korsgaard@mail.com",
    location: "Portland, OR",
    orders: 18,
    totalSpent: "$1,265",
    status: "Active",
  },
  {
    name: "Omar Dias",
    email: "omar.dias@mail.com",
    location: "Miami, FL",
    orders: 31,
    totalSpent: "$2,410",
    status: "Active",
  },
  {
    name: "Alena Botosh",
    email: "alena.botosh@mail.com",
    location: "Denver, CO",
    orders: 9,
    totalSpent: "$620",
    status: "Inactive",
  },
  {
    name: "Marcus Levin",
    email: "marcus.levin@mail.com",
    location: "Chicago, IL",
    orders: 15,
    totalSpent: "$980",
    status: "Active",
  },
  {
    name: "Talia Herwitz",
    email: "talia.herwitz@mail.com",
    location: "Seattle, WA",
    orders: 27,
    totalSpent: "$2,105",
    status: "Active",
  },
  {
    name: "Jaxson Calzoni",
    email: "jaxson.calzoni@mail.com",
    location: "Nashville, TN",
    orders: 6,
    totalSpent: "$415",
    status: "Inactive",
  },
  {
    name: "Selin Aminoff",
    email: "selin.aminoff@mail.com",
    location: "Boston, MA",
    orders: 21,
    totalSpent: "$1,530",
    status: "Active",
  },
];

export default function Customers() {
  return (
    <Shell breadcrumb="Customer List" active="Customer List">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-medium tracking-tight">Customers</h1>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="lg" className="bg-card">
            <HugeiconsIcon icon={FileExportIcon} size={14} data-icon="inline-start" />
            Export CSV
          </Button>
          <Button size="lg">
            <HugeiconsIcon icon={PlusSignIcon} size={14} data-icon="inline-start" />
            Add Customer
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((kpi) => (
          <KpiCard key={kpi.label} kpi={kpi} />
        ))}
      </div>

      <Card className="gap-0 bg-muted/50 p-1 ring-0 shadow-sm dark:bg-muted">
        <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2">
          <PanelTitle title="All Customers" />
          <div className="flex items-center gap-2">
            <div className="relative hidden md:block">
              <HugeiconsIcon
                icon={Search01Icon}
                size={14}
                className="absolute top-1/2 left-2.5 -translate-y-1/2 text-muted-foreground"
              />
              <Input
                placeholder="Search customers..."
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
                {["Customer", "Email", "Location", "Orders", "Total Spent", "Status"].map(
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
              {customers.map((customer) => (
                <TableRow key={customer.email}>
                  <TableCell className="pl-4">
                    <Checkbox aria-label={`Select ${customer.name}`} />
                  </TableCell>
                  <TableCell className="font-medium">{customer.name}</TableCell>
                  <TableCell className="text-muted-foreground">{customer.email}</TableCell>
                  <TableCell>{customer.location}</TableCell>
                  <TableCell className="font-mono">{customer.orders}</TableCell>
                  <TableCell className="font-mono">{customer.totalSpent}</TableCell>
                  <TableCell>
                    <StatusBadge status={customer.status} />
                  </TableCell>
                  <TableCell className="pr-4 text-right">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label={`Actions for ${customer.name}`}
                    >
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
