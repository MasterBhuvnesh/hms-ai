"use client";

import { useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { AiMagicIcon, PlusSignIcon } from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MoreButton, PanelTitle, StatusBadge } from "@/components/dashboard/cards";
import { AddDialog, money } from "@/components/dashboard/add-dialog";
import { Shell } from "@/components/dashboard/shell";
import { useCurrentRole } from "@/components/dashboard/use-current-role";
import { InvoicesTable } from "./invoices-table";
import { bills, DEPARTMENTS, type Bill } from "@/data/hospital";
import { getSupabase } from "@/lib/supabase";
import { addBill } from "@/lib/repos/supabase";

const planFeatures = [
  "Unlimited patients and appointments",
  "Up to 66 staff members",
  "Prescriptions with PDF print",
  "Pharmacy and lab modules",
  "Priority support",
];

const ELECTIVE_BASES: Record<string, number> = {
  "Knee Replacement": 250000,
  Cataract: 45000,
  "Hernia Repair": 90000,
  "Fracture Fixation": 120000,
  Appendectomy: 80000,
  "C-Section": 70000,
};

const DEMAND_OPTS = [
  { label: "Off-peak", mult: 0.9 },
  { label: "Standard", mult: 1.0 },
  { label: "High demand", mult: 1.15 },
];

const PAYER_OPTS = [
  { label: "Cash", mult: 1.0 },
  { label: "Star Health", mult: 1.05 },
  { label: "HDFC Ergo", mult: 1.05 },
  { label: "CGHS", mult: 0.8 },
  { label: "Ayushman", mult: 0.7 },
];

function ElectivePriceEstimator({ onCreate }: { onCreate: (amount: string) => void }) {
  const [procedure, setProcedure] = useState("Knee Replacement");
  const [demand, setDemand] = useState("Standard");
  const [payer, setPayer] = useState("Cash");

  const base = ELECTIVE_BASES[procedure] ?? 0;
  const demandMult = DEMAND_OPTS.find((d) => d.label === demand)?.mult ?? 1;
  const payerMult = PAYER_OPTS.find((p) => p.label === payer)?.mult ?? 1;
  const estimate = Math.round(base * demandMult * payerMult);
  const estimateLabel = `₹${estimate.toLocaleString("en-US")}`;

  return (
    <Card className="gap-0 bg-muted/50 p-1 ring-0 shadow-sm dark:bg-muted xl:col-span-3">
      <div className="flex items-center justify-between px-3 py-2">
        <PanelTitle title="Elective Price Estimator" />
        <MoreButton />
      </div>
      <div className="grid gap-4 rounded-xl bg-card p-4 md:grid-cols-2">
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="elective-procedure" className="font-mono text-[11px] tracking-wide text-muted-foreground uppercase">
              Procedure
            </Label>
            <Select value={procedure} onValueChange={setProcedure}>
              <SelectTrigger id="elective-procedure" className="w-full bg-muted/40 shadow-none">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.keys(ELECTIVE_BASES).map((p) => (
                  <SelectItem key={p} value={p}>
                    {p}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="elective-demand" className="font-mono text-[11px] tracking-wide text-muted-foreground uppercase">
              Demand
            </Label>
            <Select value={demand} onValueChange={setDemand}>
              <SelectTrigger id="elective-demand" className="w-full bg-muted/40 shadow-none">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DEMAND_OPTS.map((d) => (
                  <SelectItem key={d.label} value={d.label}>
                    {d.label} (x{d.mult})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="elective-payer" className="font-mono text-[11px] tracking-wide text-muted-foreground uppercase">
              Payer
            </Label>
            <Select value={payer} onValueChange={setPayer}>
              <SelectTrigger id="elective-payer" className="w-full bg-muted/40 shadow-none">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PAYER_OPTS.map((p) => (
                  <SelectItem key={p.label} value={p.label}>
                    {p.label} (x{p.mult})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex flex-col justify-between gap-4 rounded-xl border p-4">
          <div className="space-y-1.5 text-sm">
            <p className="flex justify-between gap-2">
              <span className="text-muted-foreground">Base ({procedure})</span>
              <span className="font-mono">₹{base.toLocaleString("en-US")}</span>
            </p>
            <p className="flex justify-between gap-2">
              <span className="text-muted-foreground">Demand ({demand})</span>
              <span className="font-mono">x{demandMult}</span>
            </p>
            <p className="flex justify-between gap-2">
              <span className="text-muted-foreground">Payer ({payer})</span>
              <span className="font-mono">x{payerMult}</span>
            </p>
            <p className="flex justify-between gap-2 border-t pt-2 font-medium">
              <span>Estimate</span>
              <span className="font-mono">{estimateLabel}</span>
            </p>
            <p className="font-mono text-xs text-muted-foreground">
              ₹{base.toLocaleString("en-US")} x {demandMult} x {payerMult}
            </p>
          </div>
          <Button onClick={() => onCreate(estimateLabel)}>
            Create bill from estimate
          </Button>
        </div>
      </div>
    </Card>
  );
}

export default function Billing() {
  const role = useCurrentRole();
  const [billsState, setBillsState] = useState<Bill[]>(bills);
  const [manageOpen, setManageOpen] = useState(false);
  const [methods, setMethods] = useState({ Cash: true, UPI: true, Card: true });
  const [duesInsight, setDuesInsight] = useState<string | null>(null);
  const [duesLoading, setDuesLoading] = useState(false);

  function nextBillId(): string {
    const maxNum = billsState.reduce(
      (m, b) => Math.max(m, Number(b.id.replace(/\D/g, "")) || 0),
      7000,
    );
    return `BILL-${maxNum + 1}`;
  }

  function persistBill(bill: Bill) {
    if (!getSupabase()) return;
    void addBill({
      id: bill.id,
      patient: bill.patient,
      date: bill.date,
      department: bill.department,
      amount: bill.amount,
      status: bill.status,
    }).catch(() => {});
  }

  function handleEstimatorCreate(amount: string) {
    const bill: Bill = {
      id: nextBillId(),
      patient: "Elective Patient",
      date: "6 Nov 2025",
      department: "General",
      amount,
      status: "Pending",
    };
    setBillsState((r) => [bill, ...r]);
    persistBill(bill);
  }

  async function getDuesFollowUp() {
    if (duesLoading) return;
    setDuesLoading(true);
    try {
      const dues = billsState.filter((b) => b.status !== "Paid").slice(0, 10);
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role,
          user: "staff",
          messages: [
            {
              role: "user",
              content: `List the top dues follow-ups in priority order, one short line each: ${dues.map((b) => `${b.id} ${b.patient} ${b.amount} ${b.status}`).join("; ") || "no pending dues"}.`,
            },
          ],
        }),
      });
      const payload = (await res.json()) as { reply?: string; error?: string };
      if (!res.ok || !payload.reply) throw new Error(payload.error || "ai_failed");
      setDuesInsight(payload.reply);
    } catch {
      setDuesInsight("AI is unavailable right now. Please try again later.");
    } finally {
      setDuesLoading(false);
    }
  }

  return (
    <Shell breadcrumb="Billing & Invoices" active="Billing & Invoices">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-medium tracking-tight">Billing & Invoices</h1>
        <AddDialog
          href="/billing"
          title="New Bill"
          submitLabel="Create Bill"
          fields={[
            { name: "patient", label: "Patient", placeholder: "Patient name" },
            { name: "department", label: "Department", options: [...DEPARTMENTS] },
            { name: "amount", label: "Amount", type: "number", placeholder: "5000" },
            { name: "status", label: "Status", options: ["Paid", "Pending", "Overdue", "Partial"] },
          ]}
          onSubmit={(v) => {
            const bill: Bill = {
              id: nextBillId(),
              patient: v.patient,
              date: "6 Nov 2025",
              department: v.department,
              amount: money(v.amount),
              status: v.status as Bill["status"],
            };
            setBillsState((r) => [bill, ...r]);
            persistBill(bill);
          }}
          trigger={
            <Button size="lg">
              <HugeiconsIcon icon={PlusSignIcon} size={14} data-icon="inline-start" />
              New Bill
            </Button>
          }
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <Card className="gap-0 bg-muted/50 p-1 ring-0 shadow-sm dark:bg-muted xl:col-span-2">
          <div className="flex items-center justify-between px-3 py-2">
            <PanelTitle title="Today's Collection" />
            <MoreButton />
          </div>
          <div className="flex-1 space-y-4 rounded-xl bg-card p-4">
            <div className="flex items-center gap-2.5">
              <p className="font-medium">Hospital Billing</p>
              <StatusBadge status="Active" />
            </div>
            <p className="font-mono text-[28px] leading-none font-medium tracking-tight">
              ₹24,680
              <span className="ml-2 font-sans text-xs font-normal text-muted-foreground">
                collected today
              </span>
            </p>
            <p className="text-sm text-muted-foreground">
              Consultation, pharmacy, lab and room charges across all departments.
            </p>
            <div className="space-y-2.5">
              {planFeatures.map((feature) => (
                <div key={feature} className="flex items-center gap-2 text-sm">
                  <span className="size-1.5 rounded-full bg-foreground" />
                  {feature}
                </div>
              ))}
            </div>
          </div>
          <div className="flex items-center justify-end px-4 py-2.5">
            <span className="font-mono text-xs text-muted-foreground">12 pending bills - ₹3,240</span>
          </div>
        </Card>

        <Card className="gap-0 bg-muted/50 p-1 ring-0 shadow-sm dark:bg-muted">
          <div className="flex items-center justify-between px-3 py-2">
            <PanelTitle title="Payment Method" />
            <MoreButton />
          </div>
          <div className="flex-1 space-y-4 rounded-xl bg-card p-4">
            <div className="flex items-center justify-between gap-3 rounded-xl border p-3">
              <div>
                <p className="font-mono text-sm font-medium">
                  {Object.entries(methods)
                    .filter(([, on]) => on)
                    .map(([m]) => m)
                    .join(" + ") || "No methods"}
                </p>
                <p className="text-xs text-muted-foreground">Counter 1 - Billing Staff</p>
              </div>
              <Button variant="outline" size="sm" onClick={() => setManageOpen(true)}>
                Manage
              </Button>
            </div>
            <button
              onClick={() => void getDuesFollowUp()}
              disabled={duesLoading}
              className="flex w-full items-center gap-2.5 rounded-xl bg-muted p-2 text-left text-sm text-muted-foreground hover:bg-muted/70 disabled:opacity-60"
            >
              <span className="flex size-7 shrink-0 items-center justify-center rounded-lg border bg-card">
                <HugeiconsIcon icon={AiMagicIcon} size={14} className={duesLoading ? "animate-pulse" : undefined} />
              </span>
              {duesLoading ? "Analyzing dues..." : (duesInsight ?? "Get AI dues follow-up list")}
            </button>
          </div>
        </Card>

        <ElectivePriceEstimator onCreate={handleEstimatorCreate} />

        <InvoicesTable rows={billsState} onChange={setBillsState} />
      </div>

      <Dialog open={manageOpen} onOpenChange={setManageOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Payment methods</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Choose which payment methods Counter 1 accepts.
          </p>
          <div className="space-y-2.5">
            {(Object.keys(methods) as (keyof typeof methods)[]).map((m) => (
              <label key={m} className="flex cursor-pointer items-center gap-2.5 text-sm">
                <Checkbox
                  checked={methods[m]}
                  onCheckedChange={(v) =>
                    setMethods((prev) => ({ ...prev, [m]: v === true }))
                  }
                  aria-label={`Accept ${m}`}
                />
                {m}
              </label>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setManageOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => setManageOpen(false)}>Save methods</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Shell>
  );
}
