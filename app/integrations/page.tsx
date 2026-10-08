import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/dashboard/cards";
import { Shell } from "@/components/dashboard/shell";

const integrations = [
  {
    name: "LIS",
    status: "Connected",
    description: "Sync lab orders, samples and test results with the central laboratory automatically.",
    category: "Lab",
  },
  {
    name: "PACS",
    status: "Connected",
    description: "View radiology images and diagnostic reports straight from imaging modalities.",
    category: "Radiology",
  },
  {
    name: "SMS Gateway",
    status: "Connected",
    description: "Send appointment reminders, OTP codes and report alerts to patients via SMS.",
    category: "Comms",
  },
  {
    name: "UPI Payments",
    status: "Connected",
    description: "Collect OPD, pharmacy and discharge payments via UPI with instant reconciliation.",
    category: "Payments",
  },
  {
    name: "ABDM",
    status: "Disconnected",
    description: "Link patient records with ABHA IDs under the national digital health stack.",
    category: "Records",
  },
  {
    name: "Pharmacy ERP",
    status: "Disconnected",
    description: "Sync medicine stock, purchase orders and billing with the pharmacy store.",
    category: "Records",
  },
];

export default function Integrations() {
  return (
    <Shell breadcrumb="Integrations" active="Integrations">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-medium tracking-tight">Clinical Integrations</h1>
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
