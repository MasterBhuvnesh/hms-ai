"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import { MoreHorizontalIcon, Search01Icon } from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { MoreButton, PanelTitle, StatusBadge } from "@/components/dashboard/cards";
import { TablePagination } from "@/components/dashboard/table-pagination";
import { FilterPills, num, Th, useDataTable } from "@/components/dashboard/use-table";
import { campaigns } from "@/data/mock";

export function CampaignsTable() {
  const t = useDataTable(campaigns, {
    searchFields: (r) => [r.name, r.channel],
    filterField: (r) => r.status,
    sorters: {
      name: (r) => r.name,
      channel: (r) => r.channel,
      status: (r) => r.status,
      budget: (r) => num(r.budget),
      spent: (r) => num(r.spent),
      clicks: (r) => num(r.clicks),
      ctr: (r) => num(r.ctr),
    },
  });

  return (
    <Card className="gap-0 bg-muted/50 p-1 ring-0 shadow-sm dark:bg-muted">
      <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2">
        <PanelTitle title="All Campaigns" />
        <div className="flex items-center gap-2">
          <FilterPills
            options={["All", "Active", "Paused", "Ended"]}
            value={t.filter}
            onChange={t.setFilter}
          />
          <div className="relative hidden md:block">
            <HugeiconsIcon
              icon={Search01Icon}
              size={14}
              className="absolute top-1/2 left-2.5 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              value={t.query}
              onChange={(e) => t.setQuery(e.target.value)}
              placeholder="Search campaigns..."
              className="h-8 w-56 rounded-lg bg-muted/40 pl-8 shadow-none"
            />
          </div>
          <MoreButton />
        </div>
      </div>
      <div className="overflow-hidden rounded-xl bg-card py-2">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-12 pl-4">
                <Checkbox aria-label="Select all" />
              </TableHead>
              <Th label="Campaign" k="name" sort={t} />
              <Th label="Channel" k="channel" sort={t} />
              <Th label="Status" k="status" sort={t} />
              <Th label="Budget" k="budget" sort={t} />
              <Th label="Spent" k="spent" sort={t} />
              <Th label="Clicks" k="clicks" sort={t} />
              <Th label="CTR" k="ctr" sort={t} />
              <TableHead className="pr-4 text-right font-mono text-[10px] tracking-wider text-muted-foreground uppercase">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {t.rows.length === 0 && (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={9} className="py-8 text-center text-sm text-muted-foreground">
                  No results found
                </TableCell>
              </TableRow>
            )}
            {t.rows.map((campaign) => (
              <TableRow
                key={campaign.name}
                className={campaign.status === "Ended" ? "opacity-60" : ""}
              >
                <TableCell className="pl-4">
                  <Checkbox aria-label={`Select ${campaign.name}`} />
                </TableCell>
                <TableCell className="font-medium">{campaign.name}</TableCell>
                <TableCell>{campaign.channel}</TableCell>
                <TableCell>
                  <StatusBadge status={campaign.status} />
                </TableCell>
                <TableCell className="font-mono">{campaign.budget}</TableCell>
                <TableCell className="font-mono">{campaign.spent}</TableCell>
                <TableCell className="font-mono">{campaign.clicks}</TableCell>
                <TableCell className="font-mono">{campaign.ctr}</TableCell>
                <TableCell className="pr-4 text-right">
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label={`Actions for ${campaign.name}`}
                  >
                    <HugeiconsIcon icon={MoreHorizontalIcon} size={16} />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <TablePagination
        page={t.page}
        pageSize={t.pageSize}
        total={t.total}
        onPageChange={t.setPage}
        onPageSizeChange={t.setPageSize}
      />
    </Card>
  );
}
