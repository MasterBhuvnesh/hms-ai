import Image from "next/image";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  AiMagicIcon,
  ArrowDown01Icon,
  ArrowUpDownIcon,
  Calendar03Icon,
  FileExportIcon,
  InboxIcon,
  InformationCircleIcon,
  MoreHorizontalIcon,
  Notification01Icon,
  PlusSignIcon,
  Search01Icon,
} from "@hugeicons/core-free-icons";
import { Badge } from "@/components/ui/badge";
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
import { PixelChart, RevenueBars, Sparkline } from "@/components/dashboard/charts";
import { Sidebar } from "@/components/dashboard/sidebar";
import data from "@/data/dashboard.json";

function PanelTitle({ title }: { title: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <h2 className="font-mono text-sm font-medium tracking-wide uppercase text-black/50">{title}</h2>
      <HugeiconsIcon icon={InformationCircleIcon} size={14} className="text-muted-foreground" />
    </div>
  );
}

function MoreButton() {
  return (
    <Button variant="outline" size="icon-sm" aria-label="More options" className="rounded-full border-2 border-comp-border">
      <HugeiconsIcon icon={MoreHorizontalIcon} size={16} />
    </Button>
  );
}

const statusStyles: Record<string, { badge: string; dot: string }> = {
  Success: { badge: "border-emerald-200 bg-emerald-50 text-emerald-700", dot: "bg-emerald-500" },
  Pending: { badge: "border-amber-200 bg-amber-50 text-amber-700", dot: "bg-amber-500" },
  Refunded: { badge: "border-border bg-muted text-muted-foreground", dot: "bg-muted-foreground" },
};

const monthDate = new Date(data.date);
const daysInMonth = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0).getDate();

type Kpi = (typeof data.kpis)[number];

function KpiCard({ kpi }: { kpi: Kpi }) {
  return (
    <Card className="gap-0 bg-muted/50 p-1 ring-0 shadow-sm">
      <div className="flex items-center justify-between gap-3 rounded-xl bg-card p-4">
        <div className="space-y-2">
          <p className="font-mono text-[11px] tracking-wide text-muted-foreground uppercase">
            {kpi.label}
          </p>
          <p className="font-mono text-[28px] leading-none font-medium tracking-tight">
            {kpi.value}
            {kpi.suffix && (
              <span className="ml-2 font-sans text-xs font-normal text-muted-foreground">
                {kpi.suffix}
              </span>
            )}
          </p>
        </div>
        <Sparkline data={kpi.spark} />
      </div>
      <div className="flex items-center justify-end px-4 py-2.5">
        <span className="text-xs font-medium">
          <span className="font-mono text-emerald-600">{kpi.delta}</span>{" "}
          <span className="font-sans text-muted-foreground">{kpi.deltaLabel}</span>
        </span>
      </div>
    </Card>
  );
}

function StatusBadge({ status }: { status: string }) {
  const s = statusStyles[status] ?? statusStyles.Refunded;
  return (
    <Badge variant="outline" className={`rounded-full ${s.badge}`}>
      <span className={`size-1.5 rounded-full ${s.dot}`} />
      {status}
    </Badge>
  );
}

export default function Dashboard() {
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-16 shrink-0 items-center justify-between gap-4 border-b-2 border-comp-border px-6">
          <nav className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">Dashboard</span>
            <span className="text-muted-foreground">›</span>
            <span className="font-medium">Overview</span>
          </nav>
          <div className="flex items-center gap-2">
            <div className="relative hidden md:block">
              <HugeiconsIcon
                icon={Search01Icon}
                size={16}
                className="absolute top-1/2 left-3 -translate-y-1/2 text-muted-foreground"
              />
              <Input
                placeholder="Search..."
                className="h-9 w-72 rounded-lg border-transparent bg-muted/60 pr-12 pl-9 shadow-none"
              />
              <kbd className="absolute top-1/2 right-2.5 -translate-y-1/2 rounded border bg-card px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
                ⌘ K
              </kbd>
            </div>
            <Button variant="ghost" size="icon-lg" className="border-2 border-comp-border " aria-label="Notifications">
              <HugeiconsIcon icon={Notification01Icon} size={18} />
            </Button>
            <Button variant="ghost" size="icon-lg" className="border-2 border-comp-border" aria-label="Inbox">
              <HugeiconsIcon icon={InboxIcon} size={18} />
            </Button>
            <Image
              src="/meow.png"
              alt={data.user.name}
              width={36}
              height={36}
              className="size-9 rounded-lg object-cover"
            />
          </div>
        </header>

        <main className="flex-1 space-y-4 overflow-y-auto p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h1 className="text-2xl font-medium tracking-tight">
              Welcome back, {data.user.firstName}
            </h1>
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center rounded-lg border bg-muted/50 shadow-xs">
                <Button variant="ghost" size="lg" className="rounded-r-none px-3">
                  Daily
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
                Export CSV
              </Button>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {data.kpis.map((kpi) => (
              <KpiCard key={kpi.label} kpi={kpi} />
            ))}
          </div>

          <div className="grid gap-4 xl:grid-cols-3">
            <Card className="gap-0 bg-muted/50 p-1 ring-0 shadow-sm xl:col-span-2">
              <div className="flex items-center justify-between px-3 py-2">
                <PanelTitle title="Sales Trend" />
                <MoreButton />
              </div>
              <div className="flex-1 rounded-xl bg-card p-4">
                <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                  <p className="text-sm text-muted-foreground">
                    Total Revenue :
                    <span className="ml-2 font-mono text-2xl font-semibold tracking-tight text-foreground">
                      {data.salesTrend.totalRevenue}
                    </span>
                  </p>
                  <div className="flex items-center gap-4 font-mono text-[10px] tracking-wider text-muted-foreground uppercase">
                    <span className="flex items-center gap-1.5">
                      <span className="size-2 rounded-full bg-foreground/30" />
                      New User
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="size-2 rounded-full bg-foreground" />
                      Existing User
                    </span>
                  </div>
                  <div className="flex rounded-lg bg-muted p-0.5 text-xs font-medium">
                    {["Weekly", "Monthly", "Yearly"].map((tab) => (
                      <button
                        key={tab}
                        className={
                          tab === "Monthly"
                            ? "rounded-md bg-card px-3 py-1.5 shadow-xs"
                            : "px-3 py-1.5 text-muted-foreground"
                        }
                      >
                        {tab}
                      </button>
                    ))}
                  </div>
                </div>
                <PixelChart
                  weeks={data.salesTrend.weeks}
                  months={data.salesTrend.months}
                  maxK={data.salesTrend.maxK}
                  year={monthDate.getFullYear()}
                />
              </div>
            </Card>

            <Card className="gap-0 bg-muted/50 p-1 ring-0 shadow-sm">
              <div className="flex items-center justify-between px-3 py-2">
                <PanelTitle title="Revenue Breakdown" />
                <MoreButton />
              </div>
              <div className="flex-1 space-y-4 rounded-xl bg-card p-4">
                <div className="flex items-end justify-between gap-2">
                  <div>
                    <p className="text-sm text-muted-foreground">{data.revenueBreakdown.title}</p>
                    <p className="mt-1 font-mono text-2xl font-semibold tracking-tight">
                      {data.revenueBreakdown.total}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-full font-normal text-muted-foreground"
                  >
                    {data.revenueBreakdown.range}
                    <HugeiconsIcon icon={ArrowDown01Icon} size={12} data-icon="inline-end" />
                  </Button>
                </div>
                <div className="flex items-center gap-2.5 rounded-xl bg-muted p-2 text-sm text-muted-foreground">
                  <span className="flex size-7 items-center justify-center rounded-lg border bg-card">
                    <HugeiconsIcon icon={AiMagicIcon} size={14}  />
                  </span>
                  Get AI insight for better analysis
                </div>
                <RevenueBars bars={data.revenueBreakdown.bars.slice(0, daysInMonth)} />
                <div className="flex items-center justify-between border-t pt-3 font-sans text-[10px] tracking-wide text-muted-foreground uppercase">
                  <span>‹ {data.revenueBreakdown.footerStart}</span>
                  <span>{data.revenueBreakdown.footerEnd} ›</span>
                </div>
              </div>
            </Card>
          </div>

          <Card className="gap-0 bg-muted/50 p-1 ring-0 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2">
              <PanelTitle title="Recent Transactions" />
              <div className="flex items-center gap-2">
                <div className="relative hidden md:block">
                  <HugeiconsIcon
                    icon={Search01Icon}
                    size={14}
                    className="absolute top-1/2 left-2.5 -translate-y-1/2 text-muted-foreground"
                  />
                  <Input
                    placeholder="Search transactions..."
                    className="h-8 w-56 rounded-lg bg-muted/40 pl-8 shadow-none"
                  />
                </div>
                <Button variant="outline">
                  <HugeiconsIcon icon={PlusSignIcon} size={14} data-icon="inline-start" />
                  Add Transaction
                </Button>
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
                  {data.transactions.map((tx) => {
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
            </div>
          </Card>
        </main>
      </div>
    </div>
  );
}
