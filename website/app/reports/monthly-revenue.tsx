"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MoreButton, PanelTitle } from "@/components/dashboard/cards";
import { MonthlyArea } from "@/components/dashboard/charts";
import { monthlyRevenue } from "@/data/mock";

export function MonthlyRevenue() {
  const [year, setYear] = useState<"2025" | "2024">("2025");
  const series = monthlyRevenue[year];
  const total = series.reduce((sum, m) => sum + m.revenue, 0);

  return (
    <Card className="gap-0 bg-muted/50 p-1 ring-0 shadow-sm dark:bg-muted xl:col-span-2">
      <div className="flex items-center justify-between px-3 py-2">
        <PanelTitle title="Monthly Revenue" />
        <MoreButton />
      </div>
      <div className="flex-1 rounded-xl bg-card p-4">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground">
            Revenue per month ($k) :
            <span className="ml-2 font-mono text-2xl font-semibold tracking-tight text-foreground">
              ${total}k
            </span>
          </p>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-4 font-mono text-[10px] tracking-wider text-muted-foreground uppercase">
              <span className="flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-foreground/30" />
                Last Year
              </span>
              <span className="flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-foreground/70" />
                This Year
              </span>
            </div>
            <Select value={year} onValueChange={(v) => setYear(v as "2025" | "2024")}>
              <SelectTrigger size="sm" className="bg-card text-xs shadow-none">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2025">2025</SelectItem>
                <SelectItem value="2024">2024</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <MonthlyArea data={series} />
      </div>
    </Card>
  );
}
