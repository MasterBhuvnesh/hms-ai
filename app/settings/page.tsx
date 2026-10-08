"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { MoreButton, PanelTitle, StatusBadge } from "@/components/dashboard/cards";
import { Shell } from "@/components/dashboard/shell";

const preferences = [
  {
    label: "Email notifications",
    description: "Get an email when a helpdesk ticket needs attention.",
    checked: true,
  },
  {
    label: "Weekly summary",
    description: "A digest of patient volumes and team performance every Monday.",
    checked: true,
  },
  {
    label: "Product updates",
    description: "News about new features and improvements.",
    checked: true,
  },
  {
    label: "Dark mode",
    description: "Use the dark theme across the dashboard.",
    checked: false,
  },
];

const workspaceMeta = [
  { label: "Timezone", value: "GMT+7" },
  { label: "Currency", value: "USD $" },
];

const labelClass = "font-mono text-[11px] tracking-wide text-muted-foreground uppercase";
const inputClass = "h-9 rounded-lg border-transparent bg-muted/40 shadow-none";

type ComplianceStatus = "Valid" | "Renewal due" | "Expired";

type ComplianceItem = {
  name: string;
  expires: string;
  status: ComplianceStatus;
};

const COMPLIANCE_SEED: ComplianceItem[] = [
  { name: "Fire NOC", expires: "Dec 2026", status: "Valid" },
  { name: "BMW Authorization", expires: "Nov 2026", status: "Valid" },
  { name: "Drug License", expires: "Oct 2026", status: "Renewal due" },
  { name: "AERB X-ray", expires: "Jan 2027", status: "Valid" },
  { name: "Clinical Establishment", expires: "Sep 2026", status: "Expired" },
  { name: "PCPNDT", expires: "Mar 2027", status: "Valid" },
];

function badgeFor(status: ComplianceStatus): string {
  if (status === "Valid") return "Active";
  if (status === "Renewal due") return "Pending";
  return "Overdue";
}

function CompliancePanel() {
  const [items, setItems] = useState<ComplianceItem[]>(COMPLIANCE_SEED);
  const expired = items.filter((i) => i.status === "Expired").length;
  const due = items.filter((i) => i.status === "Renewal due").length;

  return (
    <Card className="gap-0 bg-muted/50 p-1 ring-0 shadow-sm dark:bg-muted">
      <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2">
        <PanelTitle title="Compliance & Licenses" />
        <div className="flex items-center gap-2">
          <span className="font-mono text-[11px] text-red-600 dark:text-red-400">{expired} expired,</span>
          <span className="font-mono text-[11px] text-amber-600 dark:text-amber-400">{due} due</span>
          <MoreButton />
        </div>
      </div>
      <div className="rounded-xl bg-card p-4">
        <ul className="divide-y">
          {items.map((item) => (
            <li key={item.name} className="flex flex-wrap items-center justify-between gap-2 py-2">
              <div>
                <p className="text-sm font-medium">{item.name}</p>
                <p className="font-mono text-xs text-muted-foreground">expires {item.expires}</p>
              </div>
              <div className="flex items-center gap-2">
                <StatusBadge status={badgeFor(item.status)} />
                <span className="w-20 font-mono text-[11px] text-muted-foreground">{item.status}</span>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={item.status === "Valid"}
                  onClick={() =>
                    setItems((prev) => prev.map((p) => (p.name === item.name ? { ...p, status: "Valid" } : p)))
                  }
                >
                  Mark renewed
                </Button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </Card>
  );
}

export default function SystemSettings() {
  return (
    <Shell breadcrumb="System Settings" active="System Settings">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-medium tracking-tight">System Settings</h1>
        <Button size="lg">Save Changes</Button>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card className="gap-0 bg-muted/50 p-1 ring-0 shadow-sm dark:bg-muted">
          <div className="flex items-center justify-between px-3 py-2">
            <PanelTitle title="Profile" />
            <MoreButton />
          </div>
          <div className="flex-1 space-y-4 rounded-xl bg-card p-4">
            <div className="space-y-2">
              <label htmlFor="profile-name" className={labelClass}>
                Name
              </label>
              <Input id="profile-name" defaultValue="Bhuvnesh Verma" className={inputClass} />
            </div>
            <div className="space-y-2">
              <label htmlFor="profile-email" className={labelClass}>
                Email
              </label>
              <Input id="profile-email" defaultValue="salung@sparkpixel.com" className={inputClass} />
            </div>
          </div>
        </Card>

        <Card className="gap-0 bg-muted/50 p-1 ring-0 shadow-sm dark:bg-muted">
          <div className="flex items-center justify-between px-3 py-2">
            <PanelTitle title="Preferences" />
            <MoreButton />
          </div>
          <div className="flex-1 rounded-xl bg-card p-4">
            <div className="divide-y">
              {preferences.map((pref) => (
                <div key={pref.label} className="flex items-center justify-between py-2">
                  <div>
                    <p className="text-sm">{pref.label}</p>
                    <p className="text-xs text-muted-foreground">{pref.description}</p>
                  </div>
                  <Checkbox defaultChecked={pref.checked} aria-label={pref.label} />
                </div>
              ))}
            </div>
          </div>
        </Card>

        <Card className="gap-0 bg-muted/50 p-1 ring-0 shadow-sm dark:bg-muted">
          <div className="flex items-center justify-between px-3 py-2">
            <PanelTitle title="Team & Workspace" />
            <MoreButton />
          </div>
          <div className="flex-1 space-y-4 rounded-xl bg-card p-4">
            <div className="space-y-2">
              <label htmlFor="workspace-name" className={labelClass}>
                Workspace Name
              </label>
              <Input id="workspace-name" defaultValue="Spark Pixel Team" className={inputClass} />
            </div>
            <div className="divide-y rounded-xl border">
              {workspaceMeta.map((row) => (
                <div key={row.label} className="flex items-center justify-between p-3">
                  <span className="text-sm text-muted-foreground">{row.label}</span>
                  <span className="font-mono text-sm">{row.value}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>

        <Card className="gap-0 bg-muted/50 p-1 ring-0 shadow-sm dark:bg-muted">
          <div className="flex items-center justify-between px-3 py-2">
            <PanelTitle title="Danger Zone" />
            <MoreButton />
          </div>
          <div className="flex-1 space-y-4 rounded-xl bg-card p-4">
            <p className="text-sm text-muted-foreground">
              Deleting the workspace permanently removes all data, members and reports. This action
              cannot be undone.
            </p>
            <Button variant="destructive">Delete Workspace</Button>
          </div>
        </Card>
      </div>

      <CompliancePanel />
    </Shell>
  );
}
