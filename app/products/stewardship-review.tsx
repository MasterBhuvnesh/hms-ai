"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { MoreButton, PanelTitle } from "@/components/dashboard/cards";
import { prescriptions } from "@/data/hospital";

const ANTIBIOTICS = ["Amoxicillin", "Azithromycin", "Ceftriaxone"];
const LONG_COURSE = ["14 days", "30 days"];

type Flag = {
  key: string;
  rxId: string;
  patient: string;
  antibiotic: string;
  reasons: string[];
  injectable: boolean;
};

function buildFlags(): Flag[] {
  const flags: Flag[] = [];
  for (const rx of prescriptions) {
    const poly = rx.medicines.length > 3;
    for (const med of rx.medicines) {
      if (!ANTIBIOTICS.some((a) => med.name.includes(a))) continue;
      const injectable = med.name.includes("Ceftriaxone");
      const reasons: string[] = [];
      if (injectable) reasons.push("Review culture");
      if (LONG_COURSE.includes(med.duration)) reasons.push("Long course");
      if (poly) reasons.push("Polypharmacy");
      if (reasons.length === 0) continue;
      flags.push({
        key: `${rx.id} ${med.name}`,
        rxId: rx.id,
        patient: rx.patient,
        antibiotic: med.name,
        reasons,
        injectable,
      });
    }
  }
  return flags;
}

const FLAGS = buildFlags();

type Verdict = "Approved" | "Flagged";

const verdictPill: Record<Verdict | "Pending", string> = {
  Approved:
    "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-400",
  Flagged:
    "border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-400",
  Pending: "border-border bg-muted text-muted-foreground",
};

const verdictDot: Record<Verdict | "Pending", string> = {
  Approved: "bg-emerald-500",
  Flagged: "bg-red-500",
  Pending: "bg-muted-foreground",
};

export function StewardshipReview() {
  const [verdicts, setVerdicts] = useState<Record<string, Verdict>>({});
  const reviewed = Object.keys(verdicts).length;
  const pending = FLAGS.length - reviewed;

  function toggle(key: string, v: Verdict) {
    setVerdicts((prev) => {
      const next = { ...prev };
      if (next[key] === v) delete next[key];
      else next[key] = v;
      return next;
    });
  }

  return (
    <Card className="gap-0 bg-muted/50 p-1 ring-0 shadow-sm dark:bg-muted">
      <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2">
        <PanelTitle title="Stewardship Review" />
        <div className="flex items-center gap-2">
          <span className="font-mono text-[11px] tracking-wide text-muted-foreground uppercase">
            {reviewed} reviewed / {pending} pending
          </span>
          <MoreButton />
        </div>
      </div>
      <div className="overflow-hidden rounded-xl bg-card py-2">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="font-mono text-[10px] tracking-wider text-muted-foreground uppercase">Rx</TableHead>
              <TableHead className="font-mono text-[10px] tracking-wider text-muted-foreground uppercase">Patient</TableHead>
              <TableHead className="font-mono text-[10px] tracking-wider text-muted-foreground uppercase">Antibiotic</TableHead>
              <TableHead className="font-mono text-[10px] tracking-wider text-muted-foreground uppercase">Reason</TableHead>
              <TableHead className="pr-4 text-right font-mono text-[10px] tracking-wider text-muted-foreground uppercase">Review</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {FLAGS.length === 0 && (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={5} className="py-8 text-center text-sm text-muted-foreground">
                  No stewardship flags
                </TableCell>
              </TableRow>
            )}
            {FLAGS.map((f) => {
              const verdict: Verdict | "Pending" = verdicts[f.key] ?? "Pending";
              return (
                <TableRow key={f.key}>
                  <TableCell className="font-mono text-muted-foreground">{f.rxId}</TableCell>
                  <TableCell className="font-medium">{f.patient}</TableCell>
                  <TableCell className="text-muted-foreground">{f.antibiotic}</TableCell>
                  <TableCell
                    className={`font-mono text-xs ${f.injectable ? "text-red-600 dark:text-red-500" : "text-amber-600 dark:text-amber-500"}`}
                  >
                    {f.reasons.join(" · ")}
                  </TableCell>
                  <TableCell className="pr-4">
                    <div className="flex items-center justify-end gap-2">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 font-mono text-[11px] ${verdictPill[verdict]}`}
                      >
                        <span className={`size-1.5 rounded-full ${verdictDot[verdict]}`} />
                        {verdict}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggle(f.key, "Approved")}
                        aria-pressed={verdict === "Approved"}
                      >
                        Approve
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggle(f.key, "Flagged")}
                        aria-pressed={verdict === "Flagged"}
                      >
                        Flag
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
}
