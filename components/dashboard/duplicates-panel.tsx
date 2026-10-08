"use client";

import { useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { Cancel01Icon, GitMergeIcon } from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MoreButton, PanelTitle } from "@/components/dashboard/cards";
import type { Patient } from "@/data/hospital";

function normalizeName(name: string): string {
  return name.toLowerCase().replace(/\s+/g, " ").trim();
}

function lastNameOf(name: string): string {
  const parts = normalizeName(name).split(" ");
  return parts[parts.length - 1];
}

export type DuplicatePair = { a: Patient; b: Patient; confidence: "High" | "Medium" };

export function findDuplicatePairs(rows: Patient[]): DuplicatePair[] {
  const pairs: DuplicatePair[] = [];
  for (let i = 0; i < rows.length; i++) {
    for (let j = i + 1; j < rows.length; j++) {
      const a = rows[i];
      const b = rows[j];
      if (lastNameOf(a.name) !== lastNameOf(b.name)) continue;
      const phoneHit = a.phone.slice(0, 8) === b.phone.slice(0, 8);
      const clinicalHit = a.blood === b.blood && Math.abs(a.age - b.age) <= 2;
      if (!phoneHit && !clinicalHit) continue;
      pairs.push({ a, b, confidence: a.phone === b.phone ? "High" : "Medium" });
    }
  }
  return pairs;
}

function pairKey(a: string, b: string): string {
  return [a, b].sort().join("|");
}

export function DuplicatesPanel({
  rows,
  onMerge,
}: {
  rows: Patient[];
  onMerge: (keepId: string, removeId: string) => void;
}) {
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const pairs = findDuplicatePairs(rows).filter((p) => !dismissed.has(pairKey(p.a.id, p.b.id)));

  return (
    <Card className="gap-0 bg-muted/50 p-1 ring-0 shadow-sm dark:bg-muted">
      <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2">
        <PanelTitle title="Possible Duplicates" />
        <MoreButton />
      </div>
      <div className="rounded-xl bg-card py-2">
        {pairs.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">No suspected duplicates</p>
        ) : (
          <ul className="divide-y divide-border">
            {pairs.map(({ a, b, confidence }) => (
              <li key={`${a.id}-${b.id}`} className="flex flex-wrap items-center gap-x-6 gap-y-3 px-4 py-3">
                <div className="min-w-0 flex-1 space-y-1">
                  <p className="truncate font-medium">
                    {a.name}
                    <span className="ml-2 font-mono text-xs text-muted-foreground">{a.id}</span>
                  </p>
                  <p className="font-mono text-xs text-muted-foreground">
                    {a.phone} - {a.age}y / {a.blood}
                  </p>
                </div>
                <div className="min-w-0 flex-1 space-y-1">
                  <p className="truncate font-medium">
                    {b.name}
                    <span className="ml-2 font-mono text-xs text-muted-foreground">{b.id}</span>
                  </p>
                  <p className="font-mono text-xs text-muted-foreground">
                    {b.phone} - {b.age}y / {b.blood}
                  </p>
                </div>
                <span
                  className={
                    confidence === "High"
                      ? "font-mono text-xs"
                      : "font-mono text-xs text-amber-600 dark:text-amber-400"
                  }
                >
                  {confidence}
                </span>
                <div className="flex items-center gap-1">
                  <Button variant="outline" size="sm" onClick={() => onMerge(a.id, b.id)}>
                    <HugeiconsIcon icon={GitMergeIcon} size={14} data-icon="inline-start" />
                    Merge
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setDismissed((s) => new Set(s).add(pairKey(a.id, b.id)))}
                  >
                    <HugeiconsIcon icon={Cancel01Icon} size={14} data-icon="inline-start" />
                    Dismiss
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Card>
  );
}
