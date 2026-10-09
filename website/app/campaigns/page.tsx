"use client";

import { useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { FileExportIcon, PlusSignIcon } from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { KpiCard } from "@/components/dashboard/cards";
import { AddDialog, money } from "@/components/dashboard/add-dialog";
import { Shell } from "@/components/dashboard/shell";
import { CampaignsTable } from "./campaigns-table";
import { healthCampaigns as campaignsSeed, type HealthCampaign } from "@/data/hospital";

const kpis = [
  {
    label: "Active drives",
    value: "3",
    suffix: "",
    delta: "+1",
    deltaLabel: "this month",
    spark: [2, 3, 2, 4, 3, 5, 4, 6, 5, 7],
  },
  {
    label: "People reached",
    value: "75,590",
    suffix: "",
    delta: "+8,4%",
    deltaLabel: "vs last month",
    spark: [4, 6, 5, 8, 6, 9, 7, 10, 8, 12],
  },
  {
    label: "Coverage",
    value: "3,8%",
    suffix: "",
    delta: "+0,4%",
    deltaLabel: "vs last month",
    spark: [3, 4, 3, 5, 4, 6, 5, 7, 6, 8],
  },
  {
    label: "Spend",
    value: "₹14,160",
    suffix: "of ₹18,000",
    delta: "+5,1%",
    deltaLabel: "vs last month",
    spark: [5, 7, 6, 8, 7, 9, 8, 10, 9, 12],
  },
];

export default function HealthCampaigns() {
  const [rows, setRows] = useState<HealthCampaign[]>(campaignsSeed);

  return (
    <Shell breadcrumb="Health Campaigns" active="Health Campaigns">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-medium tracking-tight">Health Campaigns</h1>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="lg" className="bg-card">
            <HugeiconsIcon icon={FileExportIcon} size={14} data-icon="inline-start" />
            Export
          </Button>
          <AddDialog
            href="/campaigns"
            title="New Drive"
            submitLabel="Create Drive"
            fields={[
              { name: "name", label: "Drive name", placeholder: "Polio Drive Dec" },
              {
                name: "channel",
                label: "Channel",
                options: ["Camp", "SMS", "Email", "Poster", "ASHA Visit"],
              },
              { name: "status", label: "Status", options: ["Active", "Paused", "Ended"] },
              { name: "budget", label: "Budget", type: "number", placeholder: "3000" },
              { name: "spent", label: "Spent", type: "number", placeholder: "0" },
              { name: "reached", label: "Reached", type: "number", placeholder: "0" },
              { name: "coverage", label: "Coverage", placeholder: "3,5%" },
            ]}
            onSubmit={(v) =>
              setRows((r) => [
                {
                  name: v.name,
                  channel: v.channel as HealthCampaign["channel"],
                  status: v.status as HealthCampaign["status"],
                  budget: money(v.budget),
                  spent: money(v.spent),
                  reached: (Number(v.reached) || 0).toLocaleString("en-US"),
                  coverage: v.coverage.trim() || "0,0%",
                },
                ...r,
              ])
            }
            trigger={
              <Button size="lg">
                <HugeiconsIcon icon={PlusSignIcon} size={14} data-icon="inline-start" />
                New Drive
              </Button>
            }
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((kpi) => (
          <KpiCard key={kpi.label} kpi={kpi} />
        ))}
      </div>

      <CampaignsTable rows={rows} onChange={setRows} />
    </Shell>
  );
}
