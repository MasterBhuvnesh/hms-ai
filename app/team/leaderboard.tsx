"use client";

import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { MoreButton, PanelTitle } from "@/components/dashboard/cards";
import { TablePagination } from "@/components/dashboard/table-pagination";
import { num, Th, useDataTable } from "@/components/dashboard/use-table";
import { members } from "@/data/mock";

export function Leaderboard() {
  const t = useDataTable(members, {
    searchFields: (r) => [r.name, r.role],
    sorters: {
      name: (r) => r.name,
      role: (r) => r.role,
      deals: (r) => r.deals,
      revenue: (r) => num(r.revenue),
      attainment: (r) => r.attainment,
    },
  });

  const offset = (t.page - 1) * t.pageSize;

  return (
    <Card className="gap-0 bg-muted/50 p-1 ring-0 shadow-sm dark:bg-muted xl:col-span-2">
      <div className="flex items-center justify-between px-3 py-2">
        <PanelTitle title="Leaderboard" />
        <MoreButton />
      </div>
      <div className="flex-1 overflow-hidden rounded-xl bg-card py-2">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-14 pl-4 font-mono text-[10px] tracking-wider text-muted-foreground uppercase">
                Rank
              </TableHead>
              <Th label="Member" k="name" sort={t} />
              <Th label="Role" k="role" sort={t} />
              <Th label="Deals" k="deals" sort={t} />
              <Th label="Revenue" k="revenue" sort={t} />
              <Th label="Attainment" k="attainment" sort={t} />
            </TableRow>
          </TableHeader>
          <TableBody>
            {t.rows.map((member, i) => (
              <TableRow key={member.name}>
                <TableCell className="pl-4 font-mono text-muted-foreground">
                  #{offset + i + 1}
                </TableCell>
                <TableCell className="font-medium">{member.name}</TableCell>
                <TableCell className="text-muted-foreground">{member.role}</TableCell>
                <TableCell className="font-mono">{member.deals}</TableCell>
                <TableCell className="font-mono">{member.revenue}</TableCell>
                <TableCell>
                  <span className="flex items-center gap-2.5">
                    <span className="h-1.5 w-24 rounded-full bg-foreground/10">
                      <span
                        className="block h-full rounded-full bg-foreground"
                        style={{ width: `${member.attainment}%` }}
                      />
                    </span>
                    <span className="font-mono text-xs text-muted-foreground">
                      {member.attainment}%
                    </span>
                  </span>
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
