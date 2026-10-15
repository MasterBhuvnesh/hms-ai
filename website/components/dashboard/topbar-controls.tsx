"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { HugeiconsIcon } from "@hugeicons/react";
import { InboxIcon, Notification01Icon, Search01Icon } from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function TopbarControls() {
  const router = useRouter();
  const [query, setQuery] = useState("");

  function submitSearch() {
    const q = query.trim();
    router.push(q ? `/customers?q=${encodeURIComponent(q)}` : "/customers");
  }

  return (
    <>
      <div className="relative hidden md:block">
        <HugeiconsIcon
          icon={Search01Icon}
          size={16}
          className="absolute top-1/2 left-3 -translate-y-1/2 text-muted-foreground"
        />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") submitSearch();
          }}
          placeholder="Search..."
          title="Search patients"
          aria-label="Search patients"
          className="h-9 w-72 rounded-lg border-transparent bg-muted/60 pr-12 pl-9 shadow-none"
        />
        <kbd className="absolute top-1/2 right-2.5 -translate-y-1/2 rounded border bg-card px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
          ⌘ K
        </kbd>
      </div>
      <Button
        variant="ghost"
        size="icon-lg"
        className="hidden border-2 border-comp-border sm:inline-flex"
        aria-label="Notifications"
        title="Notifications - open messages"
        onClick={() => router.push("/messages")}
      >
        <HugeiconsIcon icon={Notification01Icon} size={18} />
      </Button>
      <Button
        variant="ghost"
        size="icon-lg"
        className="hidden border-2 border-comp-border sm:inline-flex"
        aria-label="Inbox"
        title="Inbox - open messages"
        onClick={() => router.push("/messages")}
      >
        <HugeiconsIcon icon={InboxIcon} size={18} />
      </Button>
    </>
  );
}
