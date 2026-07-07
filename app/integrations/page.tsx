import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/dashboard/cards";
import { Shell } from "@/components/dashboard/shell";

const integrations = [
  {
    name: "Slack",
    status: "Connected",
    description: "Send sales alerts and daily summaries straight to your team channels.",
    category: "Communication",
  },
  {
    name: "Notion",
    status: "Disconnected",
    description: "Sync reports and meeting notes into your team workspace automatically.",
    category: "Docs",
  },
  {
    name: "Stripe",
    status: "Connected",
    description: "Import payments, payouts and refunds to keep revenue data in sync.",
    category: "Payments",
  },
  {
    name: "Zapier",
    status: "Connected",
    description: "Automate workflows by connecting the dashboard to 5,000+ other apps.",
    category: "Automation",
  },
  {
    name: "HubSpot",
    status: "Disconnected",
    description: "Sync contacts and deals so your pipeline matches your CRM records.",
    category: "CRM",
  },
  {
    name: "QuickBooks",
    status: "Disconnected",
    description: "Push invoices and transaction data into your accounting ledger.",
    category: "Accounting",
  },
];

export default function Integrations() {
  return (
    <Shell breadcrumb="Integrations" active="Integrations">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-medium tracking-tight">Integrations</h1>
        <Button size="lg">Browse All</Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {integrations.map((integration) => {
          const connected = integration.status === "Connected";
          return (
            <Card key={integration.name} className="gap-0 bg-muted/50 p-1 ring-0 shadow-sm dark:bg-muted">
              <div className="flex-1 space-y-3 rounded-xl bg-card p-4">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-medium">{integration.name}</p>
                  <StatusBadge status={integration.status} />
                </div>
                <p className="text-sm text-muted-foreground">{integration.description}</p>
                <Button variant="outline" size="sm">
                  {connected ? "Configure" : "Connect"}
                </Button>
              </div>
              <div className="flex items-center justify-end px-4 py-2.5">
                <span className="font-mono text-xs text-muted-foreground">
                  {integration.category}
                </span>
              </div>
            </Card>
          );
        })}
      </div>
    </Shell>
  );
}
