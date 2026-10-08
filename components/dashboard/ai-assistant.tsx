"use client";

import { useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { AiMagicIcon, Cancel01Icon, SentIcon } from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useCurrentRole } from "@/components/dashboard/use-current-role";
import data from "@/data/dashboard.json";

type Msg = { role: "user" | "assistant"; content: string };

const STARTERS = [
  "How many beds are free in Emergency?",
  "Who is waiting in triage right now?",
  "Summarize today's billing.",
  "Which medicines are low on stock?",
];

export function AiAssistant() {
  const role = useCurrentRole();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([
    { role: "assistant", content: `Hi ${data.user.firstName}, I can look up hospital data for your role (${role}). What do you need?` },
  ]);

  async function send(text: string) {
    const content = text.trim();
    if (!content || busy) return;
    const next = [...msgs, { role: "user" as const, content }];
    setMsgs(next);
    setInput("");
    setBusy(true);
    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ messages: next, role, user: data.user.name }),
      });
      const body = (await res.json()) as { reply?: string };
      setMsgs([...next, { role: "assistant", content: body.reply ?? "No response." }]);
    } catch {
      setMsgs([...next, { role: "assistant", content: "Network error. Try again." }]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <Button
        size="icon-lg"
        aria-label="Open AI assistant"
        onClick={() => setOpen((o) => !o)}
        className="fixed right-5 bottom-5 z-50 rounded-full shadow-lg"
      >
        <HugeiconsIcon icon={open ? Cancel01Icon : AiMagicIcon} size={20} />
      </Button>
      {open && (
        <Card className="fixed right-5 bottom-20 z-50 flex max-h-[70vh] w-[min(24rem,calc(100vw-2.5rem))] flex-col gap-0 overflow-hidden p-0 shadow-xl">
          <div className="border-b px-4 py-3">
            <p className="font-medium">CityCare AI</p>
            <p className="font-mono text-[11px] text-muted-foreground uppercase">
              acting as {role}
            </p>
          </div>
          <div className="flex-1 space-y-3 overflow-y-auto p-4">
            {msgs.map((m, i) => (
              <div key={i} className={m.role === "user" ? "text-right" : "text-left"}>
                <span
                  className={`inline-block max-w-[90%] rounded-xl px-3 py-2 text-sm ${
                    m.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"
                  }`}
                >
                  {m.content}
                </span>
              </div>
            ))}
            {busy && <p className="text-sm text-muted-foreground">Thinking…</p>}
          </div>
          <div className="space-y-2 border-t p-3">
            <div className="flex flex-wrap gap-1.5">
              {STARTERS.map((s) => (
                <button
                  key={s}
                  onClick={() => send(s)}
                  className="rounded-full border px-2.5 py-1 text-xs text-muted-foreground hover:bg-accent hover:text-foreground"
                >
                  {s}
                </button>
              ))}
            </div>
            <form
              className="flex gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                send(input);
              }}
            >
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about hospital data..."
                className="bg-muted/40 shadow-none"
                aria-label="Ask the AI assistant"
              />
              <Button type="submit" size="icon" aria-label="Send" disabled={busy}>
                <HugeiconsIcon icon={SentIcon} size={16} />
              </Button>
            </form>
          </div>
        </Card>
      )}
    </>
  );
}
