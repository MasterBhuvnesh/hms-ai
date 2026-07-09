"use client";

import { useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { PlusSignIcon } from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MoreButton, PanelTitle, StatusBadge } from "@/components/dashboard/cards";
import { AddDialog, money } from "@/components/dashboard/add-dialog";
import { Shell } from "@/components/dashboard/shell";

type Channel = { name: string; status: string; revenue: string; share: number; delta: string };

const seedChannels: Channel[] = [
  {
    name: "Online Store",
    status: "Connected",
    revenue: "$12,480",
    share: 38,
    delta: "+4,2%",
  },
  {
    name: "Email",
    status: "Connected",
    revenue: "$5,120",
    share: 16,
    delta: "+2,8%",
  },
  {
    name: "Instagram",
    status: "Connected",
    revenue: "$4,760",
    share: 14,
    delta: "+6,1%",
  },
  {
    name: "Google Ads",
    status: "Connected",
    revenue: "$6,340",
    share: 19,
    delta: "+3,5%",
  },
  {
    name: "Facebook",
    status: "Disconnected",
    revenue: "$2,150",
    share: 7,
    delta: "+0,9%",
  },
  {
    name: "Marketplace",
    status: "Connected",
    revenue: "$1,980",
    share: 6,
    delta: "+1,4%",
  },
];

export default function Channels() {
  const [channels, setChannels] = useState<Channel[]>(seedChannels);

  return (
    <Shell breadcrumb="Channels" active="Channels">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-medium tracking-tight">Channels</h1>
        <AddDialog
          title="Add Channel"
          submitLabel="Add Channel"
          fields={[
            { name: "name", label: "Channel name", placeholder: "Pinterest" },
            { name: "status", label: "Status", options: ["Connected", "Disconnected"] },
            { name: "revenue", label: "Revenue this month", type: "number", placeholder: "0" },
            { name: "share", label: "Share %", type: "number", placeholder: "0" },
            { name: "delta", label: "Change", placeholder: "+0,0%" },
          ]}
          onSubmit={(v) =>
            setChannels((c) => [
              ...c,
              {
                name: v.name,
                status: v.status,
                revenue: money(v.revenue),
                share: Math.min(100, Math.max(0, Number(v.share) || 0)),
                delta: v.delta.trim() || "+0,0%",
              },
            ])
          }
          trigger={
            <Button size="lg">
              <HugeiconsIcon icon={PlusSignIcon} size={14} data-icon="inline-start" />
              Add Channel
            </Button>
          }
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {channels.map((channel) => (
          <Card key={channel.name} className="gap-0 bg-muted/50 p-1 ring-0 shadow-sm dark:bg-muted">
            <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2">
              <PanelTitle title={channel.name} />
              <MoreButton />
            </div>
            <div className="flex-1 space-y-4 rounded-xl bg-card p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="font-medium">{channel.name}</p>
                <StatusBadge status={channel.status} />
              </div>
              <p className="font-mono text-[28px] leading-none font-medium tracking-tight">
                {channel.revenue}
                <span className="ml-2 font-sans text-xs font-normal text-muted-foreground">
                  this month
                </span>
              </p>
              <div className="flex items-center gap-2.5">
                <span className="h-1.5 w-24 rounded-full bg-foreground/10">
                  <span
                    className="block h-full rounded-full bg-foreground"
                    style={{ width: `${channel.share}%` }}
                  />
                </span>
                <span className="font-mono text-xs text-muted-foreground">{channel.share}%</span>
              </div>
            </div>
            <div className="flex items-center justify-end px-4 py-2.5">
              <span className="text-xs font-medium">
                <span className="font-mono text-emerald-600 dark:text-emerald-500">{channel.delta}</span>{" "}
                <span className="font-sans text-muted-foreground">vs last month</span>
              </span>
            </div>
          </Card>
        ))}
      </div>
    </Shell>
  );
}
