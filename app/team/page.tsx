import { HugeiconsIcon } from "@hugeicons/react";
import { AiMagicIcon, FileExportIcon, PlusSignIcon } from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MoreButton, PanelTitle } from "@/components/dashboard/cards";
import { Shell } from "@/components/dashboard/shell";
import { Leaderboard } from "./leaderboard";
import data from "@/data/dashboard.json";

const monthShades = ["bg-foreground", "bg-foreground/60", "bg-foreground/30"];

export default function TeamPerformance() {
  return (
    <Shell breadcrumb="Team Performance" active="Team Performance">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-medium tracking-tight">Team Performance</h1>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="lg" className="bg-card">
            <HugeiconsIcon icon={FileExportIcon} size={14} data-icon="inline-start" />
            Export Report
          </Button>
          <Button size="lg">
            <HugeiconsIcon icon={PlusSignIcon} size={14} data-icon="inline-start" />
            Add Member
          </Button>
        </div>
      </div>

      <Card className="gap-0 bg-muted/50 p-1 ring-0 shadow-sm dark:bg-muted">
        <div className="grid divide-y rounded-xl bg-card md:grid-cols-4 md:divide-x md:divide-y-0">
          {data.team.kpis.map((kpi) => (
            <div key={kpi.label} className="space-y-2.5 p-5">
              <p className="font-mono text-[11px] tracking-wide text-muted-foreground uppercase">
                {kpi.label}
              </p>
              <p className="font-mono text-[28px] leading-none font-medium tracking-tight">
                {kpi.value}
              </p>
              <p className="text-xs font-medium">
                <span className="font-mono text-emerald-600 dark:text-emerald-500">{kpi.delta}</span>{" "}
                <span className="font-sans text-muted-foreground">{kpi.deltaLabel}</span>
              </p>
            </div>
          ))}
        </div>
      </Card>

      <div className="grid gap-4 xl:grid-cols-3">
        <Leaderboard />

        <Card className="gap-0 bg-muted/50 p-1 ring-0 shadow-sm dark:bg-muted">
          <div className="flex items-center justify-between px-3 py-2">
            <PanelTitle title="Team Goal" />
            <MoreButton />
          </div>
          <div className="flex-1 space-y-5 rounded-xl bg-card p-4">
            <div>
              <p className="text-sm text-muted-foreground">{data.team.goal.label}</p>
              <p className="mt-1 font-mono text-2xl font-semibold tracking-tight">
                {data.team.goal.reached}
                <span className="ml-2 font-sans text-xs font-normal text-muted-foreground">
                  of {data.team.goal.target}
                </span>
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="h-1.5 flex-1 rounded-full bg-foreground/10">
                <span
                  className="block h-full rounded-full bg-foreground"
                  style={{ width: `${data.team.goal.percent}%` }}
                />
              </span>
              <span className="font-mono text-xs font-medium">{data.team.goal.percent}%</span>
            </div>
            <div className="flex items-center gap-2.5 rounded-xl bg-muted p-2 text-sm text-muted-foreground">
              <span className="flex size-7 items-center justify-center rounded-lg border bg-card">
                <HugeiconsIcon icon={AiMagicIcon} size={14} />
              </span>
              Get AI coaching tips for your team
            </div>
            <div className="grid grid-cols-2 divide-x rounded-xl border">
              <div className="space-y-1 p-3">
                <p className="font-mono text-[11px] tracking-wide text-muted-foreground uppercase">
                  Remaining
                </p>
                <p className="font-mono text-lg leading-none font-medium tracking-tight">
                  {data.team.goal.remaining}
                </p>
              </div>
              <div className="space-y-1 p-3">
                <p className="font-mono text-[11px] tracking-wide text-muted-foreground uppercase">
                  Days Left
                </p>
                <p className="font-mono text-lg leading-none font-medium tracking-tight">
                  {data.team.goal.daysLeft}
                </p>
              </div>
            </div>
            <div className="space-y-3">
              <p className="font-mono text-[11px] tracking-wide text-muted-foreground uppercase">
                Monthly Split
              </p>
              <div className="flex h-2.5 gap-0.5 overflow-hidden rounded-full">
                {data.team.goal.months.map((month, i) => (
                  <div
                    key={month.name}
                    className={monthShades[i]}
                    style={{ width: `${month.share}%` }}
                  />
                ))}
              </div>
              <div className="space-y-2.5">
                {data.team.goal.months.map((month, i) => (
                  <div key={month.name} className="flex items-center gap-2.5 text-xs">
                    <span className={`size-2.5 rounded-[3px] ${monthShades[i]}`} />
                    <span>{month.name}</span>
                    <span className="ml-auto font-mono font-medium">{month.value}</span>
                    <span className="w-9 text-right font-mono text-muted-foreground">
                      {month.share}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="flex items-center justify-end px-4 py-2.5">
            <span className="text-xs font-medium">
              <span className="font-mono text-emerald-600 dark:text-emerald-500">{data.team.goal.delta}</span>{" "}
              <span className="font-sans text-muted-foreground">{data.team.goal.deltaLabel}</span>
            </span>
          </div>
        </Card>
      </div>
    </Shell>
  );
}
