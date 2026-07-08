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
import { PixelChart } from "@/components/dashboard/charts";
import { monthlyRevenue } from "@/data/mock";
import data from "@/data/dashboard.json";

const VIEWS = ["Weekly", "Monthly", "Yearly"] as const;
type View = (typeof VIEWS)[number];

const baseWeeks = data.salesTrend.weeks; // 48 = 4 per month
const monthLabels = data.salesTrend.months; // Jan..Dec
const baseMaxK = data.salesTrend.maxK;
const currentMonth = new Date(data.date).getMonth();
const currentYear = new Date(data.date).getFullYear();

function ceilTo(n: number, step: number) {
  return Math.ceil(n / step) * step;
}

// deterministic per-day series so a month's daily chart is stable across renders
function seeded(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function SalesTrend() {
  const [view, setView] = useState<View>("Monthly");
  const [month, setMonth] = useState(currentMonth);
  const [year, setYear] = useState<"2025" | "2024">("2025");

  let weeks = baseWeeks;
  let labels = monthLabels;
  let maxK = baseMaxK;
  let tooltipYear = currentYear;
  let tooltipLabels: string[] | undefined;

  if (view === "Weekly") {
    const days = new Date(currentYear, month + 1, 0).getDate();
    const rand = seeded(currentYear * 100 + month);
    weeks = Array.from({ length: days }, () => ({
      existing: 4 + Math.floor(rand() * 11), // 4..14
      newUser: 8 + Math.floor(rand() * 22), // 8..29
    }));
    labels = Array.from({ length: Math.ceil(days / 7) }, (_, i) => `W${i + 1}`);
    tooltipLabels = Array.from(
      { length: days },
      (_, i) => `${i + 1} ${monthLabels[month]} ${currentYear}`,
    );
  } else if (view === "Yearly") {
    // one column per month, scaled from the year's revenue series ($k)
    weeks = monthlyRevenue[year].map((m) => ({
      existing: m.revenue,
      newUser: Math.round(m.revenue * 0.35),
    }));
    labels = monthLabels;
    maxK = ceilTo(Math.max(...weeks.map((w) => w.existing + w.newUser)), 20);
    tooltipYear = Number(year);
  }

  return (
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
          <div className="flex items-center gap-2">
            {view === "Weekly" && (
              <Select value={String(month)} onValueChange={(v) => setMonth(Number(v))}>
                <SelectTrigger size="sm" className="bg-card text-xs shadow-none">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {monthLabels.map((m, i) => (
                    <SelectItem key={m} value={String(i)}>
                      {m} {currentYear}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            {view === "Yearly" && (
              <Select value={year} onValueChange={(v) => setYear(v as "2025" | "2024")}>
                <SelectTrigger size="sm" className="bg-card text-xs shadow-none">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2025">2025</SelectItem>
                  <SelectItem value="2024">2024</SelectItem>
                </SelectContent>
              </Select>
            )}
            <div className="flex rounded-lg bg-muted p-0.5 text-xs font-medium">
              {VIEWS.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setView(tab)}
                  className={
                    tab === view
                      ? "rounded-md bg-card px-3 py-1.5 shadow-xs"
                      : "px-3 py-1.5 text-muted-foreground"
                  }
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>
        </div>
        <PixelChart
          key={`${view}-${month}-${year}`}
          weeks={weeks}
          months={labels}
          maxK={maxK}
          year={tooltipYear}
          tooltipLabels={tooltipLabels}
        />
      </div>
    </Card>
  );
}
