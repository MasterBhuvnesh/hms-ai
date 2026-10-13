"use client";

import { useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { AiMagicIcon, Delete01Icon, SentIcon } from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { MoreButton, PanelTitle } from "@/components/dashboard/cards";
import { Shell } from "@/components/dashboard/shell";
import { useCurrentRole } from "@/components/dashboard/use-current-role";
import { ROLE_NAV_ACCESS, canAccess, normalizeRole } from "@/lib/permissions";
import data from "@/data/dashboard.json";

type Msg = { role: "user" | "assistant"; content: string };

const STARTERS: { text: string; href: string }[] = [
  { text: "How many beds are free in Emergency?", href: "/channels" },
  { text: "Who is waiting in triage right now?", href: "/triage" },
  { text: "Summarize today's billing.", href: "/billing" },
  { text: "Which medicines are low on stock?", href: "/products" },
  { text: "Show today's scheduled appointments.", href: "/orders" },
  { text: "Any critical lab reports pending?", href: "/lab" },
];

const TOPIC_LABELS: Record<string, string> = {
  "/customers": "Patients",
  "/orders": "Appointments",
  "/prescriptions": "Prescriptions",
  "/lab": "Labs",
  "/channels": "Beds",
  "/billing": "Billing",
  "/products": "Pharmacy",
  "/triage": "Triage",
};

function ChatScreen() {
  const role = useCurrentRole();
  const allowed = ROLE_NAV_ACCESS[normalizeRole(role)];
  const starters = STARTERS.filter((s) => canAccess(s.href, role));
  const topics = Object.entries(TOPIC_LABELS).filter(([href]) => allowed.includes(href));
  const [msgs, setMsgs] = useState<Msg[]>([
    { role: "assistant", content: `Hi ${data.user.firstName}, you are acting as ${role}. Ask me anything I can see for this role.` },
  ]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);

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
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-medium tracking-tight">AI Assistant</h1>
          <p className="text-sm text-muted-foreground">
            Acting as {role} - answers limited to your permissions
          </p>
        </div>
        <Button
          variant="outline"
          size="lg"
          className="bg-card"
          onClick={() => setMsgs(msgs.slice(0, 1))}
        >
          <HugeiconsIcon icon={Delete01Icon} size={14} data-icon="inline-start" />
          Clear chat
        </Button>
      </div>

      <Card className="gap-0 bg-muted/50 p-1 ring-0 shadow-sm dark:bg-muted">
        <div className="flex items-center justify-between px-3 py-2">
          <PanelTitle title="Ask about hospital data" />
          <MoreButton />
        </div>
        <div className="flex-1 space-y-4 rounded-xl bg-card p-4">
          <div>
            <p className="font-mono text-[11px] tracking-wide text-muted-foreground uppercase">
              You can ask about
            </p>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {topics.map(([, label]) => (
              <span
                key={label}
                className="rounded-full border px-2.5 py-1 font-mono text-[11px] text-muted-foreground"
              >
                {label}
              </span>
            ))}
          </div>
          <div className="max-h-[46vh] space-y-3 overflow-y-auto">
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
          <div className="flex flex-wrap gap-1.5">
            {starters.map((s) => (
              <button
                key={s.text}
                onClick={() => send(s.text)}
                className="rounded-full border px-2.5 py-1 text-xs text-muted-foreground hover:bg-accent hover:text-foreground"
              >
                {s.text}
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
          <p className="flex items-center gap-2 text-xs text-muted-foreground">
            <HugeiconsIcon icon={AiMagicIcon} size={14} />
            Denied topics are refused automatically based on the {role} role.
          </p>
        </div>
      </Card>
    </>
  );
}

export default function ChatPage() {
  return (
    <Shell breadcrumb="AI Assistant" active="AI Assistant">
      <ChatScreen />
    </Shell>
  );
}
