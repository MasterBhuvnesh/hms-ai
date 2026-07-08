import { HugeiconsIcon } from "@hugeicons/react";
import { AiMagicIcon, ArrowDown01Icon, FileExportIcon } from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { KpiCard, MoreButton, PanelTitle } from "@/components/dashboard/cards";
import { RevenueBars } from "@/components/dashboard/charts";
import { Shell } from "@/components/dashboard/shell";
import { DateControls } from "./date-controls";
import { SalesTrend } from "./sales-trend";
import { TransactionsView } from "./transactions/transactions-view";
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
          <DateControls initialDate={data.date} />
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
        <SalesTrend />

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

      <TransactionsView title="Recent Transactions" showAdd />
    </Shell>
  );
}
