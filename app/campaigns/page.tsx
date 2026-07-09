"use client";

import { useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { FileExportIcon, PlusSignIcon } from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { KpiCard } from "@/components/dashboard/cards";
import { AddDialog, money } from "@/components/dashboard/add-dialog";
import { Shell } from "@/components/dashboard/shell";
import { CampaignsTable } from "./campaigns-table";
import { campaigns as campaignsSeed, type Campaign } from "@/data/mock";
import data from "@/data/dashboard.json";

export default function Campaigns() {
  const [rows, setRows] = useState<Campaign[]>(campaignsSeed);

  return (
    <Shell breadcrumb="Campaigns" active="Campaigns">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-medium tracking-tight">Campaigns</h1>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="lg" className="bg-card">
            <HugeiconsIcon icon={FileExportIcon} size={14} data-icon="inline-start" />
            Export CSV
          </Button>
          <AddDialog
            title="New Campaign"
            submitLabel="Create Campaign"
            fields={[
              { name: "name", label: "Campaign name", placeholder: "Summer Sale Blast" },
              {
                name: "channel",
                label: "Channel",
                options: ["Email", "Instagram", "Google Ads", "Facebook", "TikTok", "Marketplace"],
              },
              { name: "status", label: "Status", options: ["Active", "Paused", "Ended"] },
              { name: "budget", label: "Budget", type: "number", placeholder: "3000" },
              { name: "spent", label: "Spent", type: "number", placeholder: "0" },
              { name: "clicks", label: "Clicks", type: "number", placeholder: "0" },
              { name: "ctr", label: "CTR", placeholder: "3,5%" },
            ]}
            onSubmit={(v) =>
              setRows((r) => [
                {
                  name: v.name,
                  channel: v.channel as Campaign["channel"],
                  status: v.status as Campaign["status"],
                  budget: money(v.budget),
                  spent: money(v.spent),
                  clicks: (Number(v.clicks) || 0).toLocaleString("en-US"),
                  ctr: v.ctr.trim() || "0,0%",
                },
                ...r,
              ])
            }
            trigger={
              <Button size="lg">
                <HugeiconsIcon icon={PlusSignIcon} size={14} data-icon="inline-start" />
                New Campaign
              </Button>
            }
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {data.campaigns.kpis.map((kpi) => (
          <KpiCard key={kpi.label} kpi={kpi} />
        ))}
      </div>

      <CampaignsTable rows={rows} />
    </Shell>
  );
}
