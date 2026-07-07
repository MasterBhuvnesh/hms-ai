import { HugeiconsIcon } from "@hugeicons/react";
import { FileExportIcon, PlusSignIcon, Search01Icon } from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { KpiCard, MoreButton, PanelTitle } from "@/components/dashboard/cards";
import { Shell } from "@/components/dashboard/shell";
import { TransactionsTable } from "@/components/dashboard/transactions-table";
import data from "@/data/dashboard.json";

export default function Transactions() {
  return (
    <Shell breadcrumb="Transactions" active="Transactions">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-medium tracking-tight">Transactions</h1>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="lg" className="bg-card">
            <HugeiconsIcon icon={FileExportIcon} size={14} data-icon="inline-start" />
            Export CSV
          </Button>
          <Button size="lg">
            <HugeiconsIcon icon={PlusSignIcon} size={14} data-icon="inline-start" />
            Add Transaction
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {data.transactionKpis.map((kpi) => (
          <KpiCard key={kpi.label} kpi={kpi} />
        ))}
      </div>

      <Card className="gap-0 bg-muted/50 p-1 ring-0 shadow-sm dark:bg-muted">
        <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2">
          <PanelTitle title="All Transactions" />
          <div className="flex items-center gap-2">
            <div className="flex rounded-lg bg-muted p-0.5 text-xs font-medium">
              {["All", "Success", "Pending", "Refunded"].map((tab) => (
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
                placeholder="Search transactions..."
                className="h-8 w-56 rounded-lg bg-muted/40 pl-8 shadow-none"
              />
            </div>
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
