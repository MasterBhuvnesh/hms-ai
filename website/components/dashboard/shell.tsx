import Image from "next/image";
import { MobileNav } from "@/components/dashboard/mobile-nav";
import { Sidebar } from "@/components/dashboard/sidebar";
import { ThemeToggle } from "@/components/dashboard/theme-toggle";
import { TopbarControls } from "@/components/dashboard/topbar-controls";
import { AiAssistant } from "@/components/dashboard/ai-assistant";
import { AccessGate } from "@/components/dashboard/access-gate";
import { ACTIVE_HREFS } from "@/lib/permissions";
import data from "@/data/dashboard.json";

export function Shell({
  breadcrumb,
  active,
  children,
}: {
  breadcrumb: string;
  active: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar active={active} />

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-16 shrink-0 items-center justify-between gap-4 border-b-2 border-comp-border px-4 md:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <MobileNav>
              <Sidebar active={active} className="flex h-full" />
            </MobileNav>
            <nav className="flex items-center gap-2 text-sm whitespace-nowrap">
              <span className="hidden text-muted-foreground sm:inline">Dashboard</span>
              <span className="hidden text-muted-foreground sm:inline">›</span>
              <span className="truncate font-medium">{breadcrumb}</span>
            </nav>
          </div>
          <div className="flex items-center gap-2">
            <TopbarControls />
            <ThemeToggle />
            <Image
              src="/meow.png"
              alt={data.user.name}
              width={36}
              height={36}
              className="size-9 rounded-lg object-cover"
            />
          </div>
        </header>

        <main className="flex-1 space-y-4 overflow-y-auto p-4 md:p-6">
          <AccessGate href={ACTIVE_HREFS[active] ?? "/"}>{children}</AccessGate>
        </main>
      </div>
      <AiAssistant />
    </div>
  );
}
