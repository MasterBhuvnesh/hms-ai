"use client";

import { useState } from "react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { ChartContainer, type ChartConfig } from "@/components/ui/chart";

const ROWS = 20;

export function Sparkline({ data }: { data: number[] }) {
  const max = Math.max(...data);
  return (
    <div className="flex h-8 items-end gap-0.75">
      {data.map((v, i) => (
        <div
          key={i}
          className={`w-0.75 rounded-full ${v === max ? "bg-foreground" : "bg-foreground/25"}`}
          style={{ height: `${(v / max) * 100}%` }}
        />
      ))}
    </div>
  );
}

type Week = { newUser: number; existing: number };
export function PixelChart({
  weeks,
  months,
  maxK,
  year,
}: {
  weeks: Week[];
  months: string[];
  maxK: number;
  year: number;
}) {
  const [hovered, setHovered] = useState<number | null>(null);
  const kPerCell = maxK / ROWS;
  const yLabels = Array.from({ length: 7 }, (_, i) => `${maxK - i * 10}k`);
  const lineLeft =
    hovered === null ? "0%" : `${((hovered + 0.5) / weeks.length) * 100}%`;
  const flip = hovered !== null && hovered > weeks.length / 2;
  const hoveredMonth =
    hovered === null
      ? ""
      : months[Math.min(months.length - 1, Math.floor((hovered / weeks.length) * months.length))];

  return (
    <div>
      <div className="flex gap-3">
        <div className="flex w-7 shrink-0 flex-col justify-between py-px text-right font-mono text-[10px] text-muted-foreground">
          {yLabels.map((l) => (
            <span key={l}>{l}</span>
          ))}
        </div>

        <div className="relative flex-1" onMouseLeave={() => setHovered(null)}>
          <div
            className="grid h-72 gap-0.75"
            style={{ gridTemplateColumns: `repeat(${weeks.length}, 1fr)` }}
          >
            {weeks.map((w, i) => {
              const existingCells = Math.round(w.existing / kPerCell);
              const newCells = Math.round(w.newUser / kPerCell);
              return (
                <div
                  key={i}
                  className="flex flex-col-reverse gap-0.75"
                  onMouseEnter={() => setHovered(i)}
                >
                  {Array.from({ length: ROWS }, (_, c) => (
                    <div
                      key={c}
                      className={`min-h-0 flex-1 rounded-[1px] ${
                        c < existingCells
                          ? "bg-foreground"
                          : c < existingCells + newCells
                            ? "bg-foreground/30"
                            : "bg-foreground/5"
                      }`}
                    />
                  ))}
                </div>
              );
            })}
          </div>

          {hovered !== null && (
            <>
              <div
                className="pointer-events-none absolute inset-y-0 border-l border-dashed border-foreground/40"
                style={{ left: lineLeft }}
              >
                <span className="absolute -top-1 left-[-4.5px] size-2 rounded-full bg-foreground" />
              </div>
              <div
                className="pointer-events-none absolute top-2 z-10 w-44 rounded-xl border bg-popover p-1 shadow-md"
                style={
                  flip
                    ? { right: `calc(100% - ${lineLeft} + 12px)` }
                    : { left: `calc(${lineLeft} + 12px)` }
                }
              >
                <p className="rounded-lg bg-muted px-3 py-1.5 text-xs font-medium text-muted-foreground">
                  {hoveredMonth} {year}
                </p>
                <div className="space-y-1 px-3 py-1.5 text-xs">
                  <p className="flex items-center gap-2 text-muted-foreground">
                    <span className="size-2 rounded-full bg-foreground/30" />
                    New User
                    <span className="ml-auto font-mono font-semibold text-foreground">
                      {weeks[hovered].newUser}k
                    </span>
                  </p>
                  <p className="flex items-center gap-2 text-muted-foreground">
                    <span className="size-2 rounded-full bg-foreground" />
                    Existing User
                    <span className="ml-auto font-mono font-semibold text-foreground">
                      {weeks[hovered].existing}k
                    </span>
                  </p>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between pl-10 font-mono text-[10px] tracking-wider text-muted-foreground uppercase">
        {months.map((m, i) => (
          <span key={m} className="flex items-center gap-3">
            {m}
            {i < months.length - 1 && <span className="text-foreground/20">•</span>}
          </span>
        ))}
      </div>
    </div>
  );
}

const revenueChartConfig = {
  revenue: { label: "Revenue", color: "var(--foreground)" },
} satisfies ChartConfig;

export function RevenueBars({ bars }: { bars: { h: number; o: number; b: number }[] }) {
  const days = bars.map((bar, i) => ({
    day: i + 1,
    revenue: bar.o + bar.b,
    above: bar.h - bar.o - bar.b,
  }));

  return (
    <ChartContainer config={revenueChartConfig} className="aspect-auto h-56 w-full">
      <BarChart data={days} barSize={3} margin={{ top: 0, right: 4, bottom: 0, left: 4 }}>
        <CartesianGrid
          vertical={false}
          strokeDasharray="4 4"
          stroke="color-mix(in oklab, var(--foreground) 10%, transparent)"
        />
        <XAxis dataKey="day" hide />
        <YAxis domain={[0, 100]} hide />
        <Bar dataKey="revenue" stackId="d" fill="var(--color-revenue)" radius={[2, 2, 0, 0]} />
        <Bar dataKey="above" stackId="d" fill="var(--color-revenue)" fillOpacity={0.15} radius={[2, 2, 0, 0]} />
      </BarChart>
    </ChartContainer>
  );
}
