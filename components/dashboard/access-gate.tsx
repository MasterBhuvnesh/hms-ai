"use client";

import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import { UserLock01Icon } from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useCurrentRole } from "@/components/dashboard/use-current-role";
import { canAccess } from "@/lib/permissions";

/** Blocks direct-URL access to pages the current role may not visit. */
export function AccessGate({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  const role = useCurrentRole();

  if (!canAccess(href, role)) {
    return (
      <Card className="mx-auto mt-10 max-w-md gap-0 bg-muted/50 p-1 ring-0 shadow-sm dark:bg-muted">
        <div className="space-y-3 rounded-xl bg-card p-6 text-center">
          <span className="mx-auto flex size-11 items-center justify-center rounded-xl border bg-muted/50">
            <HugeiconsIcon icon={UserLock01Icon} size={20} className="text-muted-foreground" />
          </span>
          <p className="font-medium">Access denied</p>
          <p className="text-sm text-muted-foreground">
            The {role} role cannot open this page. Switch role or go back to your dashboard.
          </p>
          <Button asChild size="lg" className="mt-2">
            <Link href="/">Back to Dashboard</Link>
          </Button>
        </div>
      </Card>
    );
  }

  return <>{children}</>;
}
