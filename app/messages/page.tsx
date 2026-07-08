import { HugeiconsIcon } from "@hugeicons/react";
import { PlusSignIcon } from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { Shell } from "@/components/dashboard/shell";
import { MessagesView } from "./messages-view";

export default function Messages() {
  return (
    <Shell breadcrumb="Messages" active="Messages">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-medium tracking-tight">Messages</h1>
        <Button size="lg">
          <HugeiconsIcon icon={PlusSignIcon} size={14} data-icon="inline-start" />
          New Message
        </Button>
      </div>

      <MessagesView />
    </Shell>
  );
}
