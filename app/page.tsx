import { Shell } from "@/components/dashboard/shell";
import { DashboardContent } from "@/components/dashboard/dashboard-content";

export default function Dashboard() {
  return (
    <Shell breadcrumb="Overview" active="Dashboard">
      <DashboardContent />
    </Shell>
  );
}
