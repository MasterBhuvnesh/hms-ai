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
import { MoreButton, PanelTitle, StatusBadge } from "@/components/dashboard/cards";
import { beds } from "@/data/hospital";

type Unit = {
  unit: string;
  complaint: string;
  etaMins: number;
  severity: "Critical" | "Urgent" | "Stable";
};

const UNITS: Unit[] = [
  { unit: "AMB-12", complaint: "Cardiac arrest", etaMins: 8, severity: "Critical" },
  { unit: "AMB-07", complaint: "Fracture", etaMins: 15, severity: "Urgent" },
  { unit: "AMB-21", complaint: "Fever", etaMins: 22, severity: "Stable" },
];

export function IncomingAmbulances() {
  const [reserved, setReserved] = useState<Set<string>>(new Set());
  const emergencyAvailable = beds.filter(
    (b) => b.ward === "Emergency" && b.status === "Available",
  ).length;

  return (
    <Card className="gap-0 bg-muted/50 p-1 ring-0 shadow-sm dark:bg-muted">
      <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2">
        <PanelTitle title="Incoming Ambulances" />
        <MoreButton />
      </div>
      <div className="rounded-xl bg-card p-4">
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border px-3 py-2">
          <span className="font-mono text-[11px] tracking-wide text-muted-foreground uppercase">
            Emergency beds available
          </span>
          <span className="font-mono text-sm font-medium">{emergencyAvailable}</span>
        </div>
        <div className="overflow-hidden py-2">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="font-mono text-[10px] tracking-wider text-muted-foreground uppercase">Unit</TableHead>
                <TableHead className="font-mono text-[10px] tracking-wider text-muted-foreground uppercase">Complaint</TableHead>
                <TableHead className="font-mono text-[10px] tracking-wider text-muted-foreground uppercase">ETA</TableHead>
                <TableHead className="font-mono text-[10px] tracking-wider text-muted-foreground uppercase">Severity</TableHead>
                <TableHead className="pr-4 text-right font-mono text-[10px] tracking-wider text-muted-foreground uppercase">Bed</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {UNITS.map((u) => {
                const isReserved = reserved.has(u.unit);
                return (
                  <TableRow key={u.unit}>
                    <TableCell className="font-mono text-muted-foreground">{u.unit}</TableCell>
                    <TableCell className="font-medium">{u.complaint}</TableCell>
                    <TableCell className="font-mono">{u.etaMins} min</TableCell>
                    <TableCell>
                      <StatusBadge status={u.severity} />
                    </TableCell>
                    <TableCell className="pr-4 text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={isReserved}
                        onClick={() =>
                          setReserved((prev) => new Set(prev).add(u.unit))
                        }
                      >
                        {isReserved ? "Bed reserved" : "Reserve bed"}
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>
    </Card>
  );
}
