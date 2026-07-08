import { HugeiconsIcon } from "@hugeicons/react";
import { AiMagicIcon } from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MoreButton, PanelTitle, StatusBadge } from "@/components/dashboard/cards";
import { Shell } from "@/components/dashboard/shell";
import { InvoicesTable } from "./invoices-table";

const planFeatures = [
  "Unlimited products and transactions",
  "Up to 10 team members",
  "Advanced reports & analytics",
  "Priority email support",
  "API access",
];

export default function Billing() {
  return (
    <Shell breadcrumb="Billing & Subscription" active="Billing & Subscription">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-medium tracking-tight">Billing & Subscription</h1>
        <Button size="lg">Upgrade Plan</Button>
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <Card className="gap-0 bg-muted/50 p-1 ring-0 shadow-sm dark:bg-muted xl:col-span-2">
          <div className="flex items-center justify-between px-3 py-2">
            <PanelTitle title="Current Plan" />
            <MoreButton />
          </div>
          <div className="flex-1 space-y-4 rounded-xl bg-card p-4">
            <div className="flex items-center gap-2.5">
              <p className="font-medium">Growth</p>
              <StatusBadge status="Active" />
            </div>
            <p className="font-mono text-[28px] leading-none font-medium tracking-tight">
              $49
              <span className="ml-2 font-sans text-xs font-normal text-muted-foreground">
                /month
              </span>
            </p>
            <p className="text-sm text-muted-foreground">
              Everything a growing sales team needs to track, sell and report.
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
            <span className="font-mono text-xs text-muted-foreground">Renews 1 Dec 2025</span>
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
                <p className="font-mono text-sm font-medium">Visa •••• 4242</p>
                <p className="text-xs text-muted-foreground">Expires 08/27</p>
              </div>
              <Button variant="outline" size="sm">
                Update
              </Button>
            </div>
            <div className="flex items-center gap-2.5 rounded-xl bg-muted p-2 text-sm text-muted-foreground">
              <span className="flex size-7 items-center justify-center rounded-lg border bg-card">
                <HugeiconsIcon icon={AiMagicIcon} size={14} />
              </span>
              Get AI cost-saving suggestions
            </div>
          </div>
        </Card>

        <InvoicesTable />
      </div>
    </Shell>
  );
}
