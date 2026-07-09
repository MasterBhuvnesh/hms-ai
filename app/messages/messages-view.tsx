"use client";

import { useState, type Dispatch, type SetStateAction } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { AiMagicIcon, Attachment01Icon, Search01Icon, Sent02Icon } from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { initials, MoreButton, PanelTitle } from "@/components/dashboard/cards";
import type { ChatMessage, Conversation } from "@/data/mock";

const SUGGESTIONS = ["Send tracking link", "Share invoice copy", "Ask for a review"];

export function MessagesView({
  convos,
  setConvos,
  threadMap,
  setThreadMap,
  activeId,
  setActiveId,
}: {
  convos: Conversation[];
  setConvos: Dispatch<SetStateAction<Conversation[]>>;
  threadMap: Record<number, ChatMessage[]>;
  setThreadMap: Dispatch<SetStateAction<Record<number, ChatMessage[]>>>;
  activeId: number;
  setActiveId: Dispatch<SetStateAction<number>>;
}) {
  const [query, setQuery] = useState("");
  const [draft, setDraft] = useState("");

  const active = convos.find((c) => c.id === activeId);
  const thread = threadMap[activeId] ?? [];

  const q = query.trim().toLowerCase();
  const visible = convos.filter(
    (c) => !q || c.name.toLowerCase().includes(q) || c.preview.toLowerCase().includes(q),
  );

  function selectConversation(id: number) {
    setActiveId(id);
    setConvos((cs) => cs.map((c) => (c.id === id ? { ...c, unread: 0 } : c)));
  }

  function send() {
    const text = draft.trim();
    if (!text) return;
    setThreadMap((m) => ({ ...m, [activeId]: [...(m[activeId] ?? []), { from: "me", text, time: "Now" }] }));
    setConvos((cs) => cs.map((c) => (c.id === activeId ? { ...c, preview: text, time: "Now" } : c)));
    setDraft("");
  }

  return (
    <div className="grid gap-4 md:h-[calc(100dvh-11.5rem)] md:grid-cols-3">
      <Card className="gap-0 bg-muted/50 p-1 ring-0 shadow-sm dark:bg-muted">
        <div className="flex items-center justify-between px-3 py-2">
          <PanelTitle title="Inbox" />
          <MoreButton />
        </div>
        <div className="flex min-h-0 flex-1 flex-col rounded-xl bg-card p-2">
          <div className="relative mb-2">
            <HugeiconsIcon
              icon={Search01Icon}
              size={14}
              className="absolute top-1/2 left-2.5 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search messages..."
              className="h-8 rounded-lg bg-muted/40 pl-8 shadow-none"
            />
          </div>
          <div className="-mr-1 min-h-0 flex-1 space-y-0.5 overflow-y-auto pr-1">
            {visible.length === 0 && (
              <p className="px-2 py-8 text-center text-sm text-muted-foreground">No conversations</p>
            )}
            {visible.map((convo) => (
              <button
                key={convo.id}
                onClick={() => selectConversation(convo.id)}
                className={`flex w-full items-center gap-2.5 rounded-lg p-2 text-left ${
                  convo.id === activeId ? "bg-muted/60" : "hover:bg-muted/40"
                }`}
              >
                <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted font-mono text-xs font-semibold">
                  {initials(convo.name)}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium">{convo.name}</span>
                  <span className="block truncate text-xs text-muted-foreground">
                    {convo.preview}
                  </span>
                </span>
                <span className="flex shrink-0 flex-col items-end gap-1">
                  <span className="font-mono text-[10px] text-muted-foreground">{convo.time}</span>
                  {convo.unread > 0 && (
                    <span className="flex size-4.5 items-center justify-center rounded-full bg-foreground font-mono text-[10px] text-background">
                      {convo.unread}
                    </span>
                  )}
                </span>
              </button>
            ))}
          </div>
        </div>
      </Card>

      <Card className="gap-0 bg-muted/50 p-1 ring-0 shadow-sm dark:bg-muted md:col-span-2">
        <div className="flex items-center justify-between px-3 py-2">
          <div className="flex items-center gap-2.5">
            <span className="flex size-7 items-center justify-center rounded-full bg-muted font-mono text-[10px] font-semibold">
              {active ? initials(active.name) : "?"}
            </span>
            <span className="text-sm font-medium">{active?.name}</span>
          </div>
          <MoreButton />
        </div>
        <div className="flex min-h-0 flex-1 flex-col rounded-xl bg-card p-4">
          <div className="scrollbar-hidden min-h-0 flex-1 space-y-4 overflow-y-auto">
            {thread.map((msg, i) => {
              const mine = msg.from === "me";
              return (
                <div key={i} className={`flex flex-col ${mine ? "items-end" : "items-start"}`}>
                  <div
                    className={`max-w-[75%] rounded-xl px-3.5 py-2.5 text-sm ${
                      mine ? "rounded-br-sm border bg-card shadow-xs" : "rounded-bl-sm bg-muted"
                    }`}
                  >
                    {msg.text}
                  </div>
                  <span className="mt-1 font-mono text-[10px] text-muted-foreground">
                    {msg.time}
                  </span>
                </div>
              );
            })}
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-2 border-t pt-4">
            <span className="flex size-7 shrink-0 items-center justify-center rounded-lg border bg-card">
              <HugeiconsIcon icon={AiMagicIcon} size={14} />
            </span>
            {SUGGESTIONS.map((reply) => (
              <Button
                key={reply}
                onClick={() => setDraft(reply)}
                variant="outline"
                size="sm"
                className="rounded-full font-normal text-muted-foreground"
              >
                {reply}
              </Button>
            ))}
          </div>
          <div className="mt-3 flex items-center gap-2">
            <Button variant="ghost" size="icon-lg" aria-label="Attach file">
              <HugeiconsIcon icon={Attachment01Icon} size={16} />
            </Button>
            <Input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  send();
                }
              }}
              placeholder="Type a message..."
              className="h-9 rounded-lg bg-muted/40 shadow-none"
            />
            <Button size="icon-lg" aria-label="Send message" onClick={send}>
              <HugeiconsIcon icon={Sent02Icon} size={16} />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
