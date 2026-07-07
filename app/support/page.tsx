import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowUpDownIcon,
  MoreHorizontalIcon,
  PlusSignIcon,
  Search01Icon,
} from "@hugeicons/core-free-icons";
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
import { KpiCard, MoreButton, PanelTitle, StatusBadge } from "@/components/dashboard/cards";
import { Shell } from "@/components/dashboard/shell";

const kpis = [
  {
    label: "Open Tickets",
    value: "24",
    suffix: "",
    delta: "+1,2%",
    deltaLabel: "this week",
    spark: [10, 14, 12, 16, 13, 18, 15, 20, 17, 22],
  },
  {
    label: "Avg First Response",
    value: "42m",
    suffix: "",
    delta: "-6m",
    deltaLabel: "vs last week",
    spark: [4, 6, 5, 7, 6, 8, 7, 9, 8, 12],
  },
  {
    label: "Resolved Today",
    value: "18",
    suffix: "",
    delta: "+3,5%",
    deltaLabel: "vs yesterday",
    spark: [6, 9, 7, 11, 8, 12, 10, 14, 11, 16],
  },
  {
    label: "CSAT",
    value: "4,6",
    suffix: "",
    delta: "+0,2",
    deltaLabel: "this month",
    spark: [3, 5, 4, 6, 5, 7, 6, 8, 7, 10],
  },
];

const tickets = [
  { id: "#T-1042", customer: "Marcus Chen", subject: "Payment failed on checkout", priority: "High", status: "Open", updated: "2h ago" },
  { id: "#T-1041", customer: "Elena Vargas", subject: "Cannot export monthly report", priority: "Medium", status: "Pending", updated: "4h ago" },
  { id: "#T-1040", customer: "Priya Nair", subject: "Invoice shows wrong currency", priority: "High", status: "Open", updated: "6h ago" },
  { id: "#T-1039", customer: "Tom Becker", subject: "Login loop after password reset", priority: "Medium", status: "Resolved", updated: "8h ago" },
  { id: "#T-1038", customer: "Aisha Bello", subject: "Slow dashboard loading", priority: "Low", status: "Pending", updated: "1d ago" },
  { id: "#T-1037", customer: "Jonas Weber", subject: "Duplicate transaction entries", priority: "High", status: "Open", updated: "1d ago" },
  { id: "#T-1036", customer: "Sofia Rossi", subject: "Update billing address", priority: "Low", status: "Resolved", updated: "2d ago" },
  { id: "#T-1035", customer: "Liam O'Brien", subject: "API webhook not firing", priority: "Medium", status: "Open", updated: "2d ago" },
];

export default function CustomerSupport() {
  return (
    <Shell breadcrumb="Customer Support" active="Customer Support">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-medium tracking-tight">Customer Support</h1>
        <Button size="lg">
          <HugeiconsIcon icon={PlusSignIcon} size={14} data-icon="inline-start" />
          New Ticket
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((kpi) => (
          <KpiCard key={kpi.label} kpi={kpi} />
        ))}
      </div>

      <Card className="gap-0 bg-muted/50 p-1 ring-0 shadow-sm dark:bg-muted">
        <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2">
          <PanelTitle title="Tickets" />
          <div className="flex items-center gap-2">
            <div className="flex rounded-lg bg-muted p-0.5 text-xs font-medium">
              {["All", "Open", "Pending", "Resolved"].map((tab) => (
                <button
                  key={tab}
                  className={
                    tab === "All"
                      ? "rounded-md bg-card px-3 py-1.5 shadow-xs"
                      : "px-3 py-1.5 text-muted-foreground"
                  }
                >
                  {tab}
                </button>
              ))}
            </div>
            <div className="relative hidden md:block">
              <HugeiconsIcon
                icon={Search01Icon}
                size={14}
                className="absolute top-1/2 left-2.5 -translate-y-1/2 text-muted-foreground"
              />
              <Input
                placeholder="Search tickets..."
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
                {["ID", "Customer", "Subject", "Priority", "Status", "Updated"].map((heading) => (
                  <TableHead key={heading}>
                    <span className="flex items-center gap-1 font-mono text-[10px] tracking-wider text-muted-foreground uppercase">
                      {heading}
                      <HugeiconsIcon icon={ArrowUpDownIcon} size={12} />
                    </span>
                  </TableHead>
                ))}
                <TableHead className="pr-4 text-right font-mono text-[10px] tracking-wider text-muted-foreground uppercase">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tickets.map((ticket) => (
                <TableRow key={ticket.id} className={ticket.status === "Resolved" ? "opacity-60" : ""}>
                  <TableCell className="pl-4">
                    <Checkbox aria-label={`Select ${ticket.id}`} />
                  </TableCell>
                  <TableCell className="font-mono text-muted-foreground">{ticket.id}</TableCell>
                  <TableCell className="font-medium">{ticket.customer}</TableCell>
                  <TableCell>{ticket.subject}</TableCell>
                  <TableCell className="font-mono">{ticket.priority}</TableCell>
                  <TableCell>
                    <StatusBadge status={ticket.status} />
                  </TableCell>
                  <TableCell className="font-mono text-muted-foreground">{ticket.updated}</TableCell>
                  <TableCell className="pr-4 text-right">
                    <Button variant="ghost" size="icon-sm" aria-label={`Actions for ${ticket.id}`}>
                      <HugeiconsIcon icon={MoreHorizontalIcon} size={16} />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>
    </Shell>
  );
}
