import { HugeiconsIcon } from "@hugeicons/react";
import {
  AiMagicIcon,
  ArrowDown01Icon,
  Calendar03Icon,
  FileExportIcon,
  PlusSignIcon,
  Search01Icon,
} from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { KpiCard, MoreButton, PanelTitle } from "@/components/dashboard/cards";
import { PixelChart, RevenueBars } from "@/components/dashboard/charts";
import { Shell } from "@/components/dashboard/shell";
import { TransactionsTable } from "@/components/dashboard/transactions-table";
import data from "@/data/dashboard.json";

const monthDate = new Date(data.date);
const daysInMonth = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0).getDate();

export default function Dashboard() {
  return (
    <Shell breadcrumb="Overview" active="Dashboard">
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
        <Card className="gap-0 bg-muted/50 p-1 ring-0 shadow-sm dark:bg-muted xl:col-span-2">
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

        <Card className="gap-0 bg-muted/50 p-1 ring-0 shadow-sm dark:bg-muted">
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
                <HugeiconsIcon icon={AiMagicIcon} size={14} />
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

      <Card className="gap-0 bg-muted/50 p-1 ring-0 shadow-sm dark:bg-muted">
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
          <TransactionsTable transactions={data.transactions} />
        </div>
      </Card>
    </Shell>
  );
}
