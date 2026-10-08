"use client";

import { useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { PlusSignIcon } from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { AddDialog } from "@/components/dashboard/add-dialog";
import { Shell } from "@/components/dashboard/shell";
import { MessagesView } from "./messages-view";
import {
  conversations as seedConversations,
  threads as seedThreads,
  type ChatMessage,
  type Conversation,
} from "@/data/mock";

export default function Messages() {
  const [convos, setConvos] = useState<Conversation[]>(seedConversations);
  const [threadMap, setThreadMap] = useState<Record<number, ChatMessage[]>>(seedThreads);
  const [activeId, setActiveId] = useState(seedConversations[0]?.id ?? 0);

  return (
    <Shell breadcrumb="Messages" active="Messages">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-medium tracking-tight">Patient Messages</h1>
        <AddDialog
          title="New Message to Patient"
          submitLabel="Start Conversation"
          fields={[
            { name: "name", label: "To", placeholder: "Jane Cooper" },
            { name: "message", label: "Message", placeholder: "Hi there!" },
          ]}
          onSubmit={(v) => {
            const id = convos.reduce((m, c) => Math.max(m, c.id), 0) + 1;
            setConvos((cs) => [
              { id, name: v.name, preview: v.message, time: "Now", unread: 0 },
              ...cs,
            ]);
            setThreadMap((m) => ({ ...m, [id]: [{ from: "me", text: v.message, time: "Now" }] }));
            setActiveId(id);
          }}
          trigger={
            <Button size="lg">
              <HugeiconsIcon icon={PlusSignIcon} size={14} data-icon="inline-start" />
              New Message to Patient
            </Button>
          }
        />
      </div>

      <MessagesView
        convos={convos}
        setConvos={setConvos}
        threadMap={threadMap}
        setThreadMap={setThreadMap}
        activeId={activeId}
        setActiveId={setActiveId}
      />
    </Shell>
  );
}
