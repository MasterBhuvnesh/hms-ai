"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { HugeiconsIcon } from "@hugeicons/react";
import { AiMagicIcon, Search01Icon } from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { MoreButton, PanelTitle } from "@/components/dashboard/cards";
import { Shell } from "@/components/dashboard/shell";

const articles = [
  {
    title: "Getting started with your dashboard",
    readTime: "3 min",
    body: "Use the sidebar to switch modules. The role switcher at the bottom changes which pages and actions you may access. KPIs at the top reflect the current hospital dataset.",
  },
  {
    title: "Connecting a payment provider",
    readTime: "5 min",
    body: "Open Billing and use Manage next to the payment method card to choose which methods Counter 1 accepts. Changes apply immediately to new bills.",
  },
  {
    title: "Exporting transactions to CSV",
    readTime: "2 min",
    body: "Every table page has an Export button in the title row. To export a subset, select rows with the checkboxes and use Export selected in the bulk bar.",
  },
  {
    title: "Inviting team members and roles",
    readTime: "4 min",
    body: "Go to Team Performance and use Add Member. Roles gate pages and actions: only Admin and Management may delete records.",
  },
  {
    title: "Setting monthly revenue goals",
    readTime: "3 min",
    body: "Open Reports and Analytics to review monthly revenue, department share, and top medicines before setting targets with management.",
  },
  {
    title: "Understanding refunds and disputes",
    readTime: "6 min",
    body: "Refunded payments stay in the list, greyed out. They are excluded from success-rate KPIs and subtracted from revenue totals.",
  },
];

const faqs = [
  {
    question: "How do I change my billing plan?",
    answer:
      "Open System Settings, pick a plan under Team & Workspace, and the change applies at the start of the next billing cycle.",
  },
  {
    question: "Can I export my hospital data?",
    answer:
      "Yes. Every table page has an Export CSV button in the title row that downloads the current view.",
  },
  {
    question: "How are refunds shown in reports?",
    answer:
      "Refunded transactions stay in the list, greyed out, and are subtracted from revenue totals in reports.",
  },
  {
    question: "How do I add a new team member?",
    answer:
      "Go to Team Performance and use Add Member. Invitees get an email link and appear in the leaderboard once they join.",
  },
  {
    question: "Is there an API for custom integrations?",
    answer:
      "Yes. Generate an API key in System Settings and use the webhook endpoints documented in the developer guide.",
  },
];

export default function HelpCenter() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [openArticle, setOpenArticle] = useState<string | null>(null);

  const q = query.trim().toLowerCase();
  const visibleArticles = articles.filter(
    (a) => !q || a.title.toLowerCase().includes(q) || a.body.toLowerCase().includes(q),
  );
  const visibleFaqs = faqs.filter(
    (f) => !q || f.question.toLowerCase().includes(q) || f.answer.toLowerCase().includes(q),
  );
  const selected = articles.find((a) => a.title === openArticle) ?? null;

  return (
    <Shell breadcrumb="Help Center" active="Help Center">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-medium tracking-tight">Help Center</h1>
        <Button
          variant="outline"
          size="lg"
          className="bg-card"
          onClick={() => router.push("/support")}
        >
          Contact Support
        </Button>
      </div>

      <Card className="gap-0 bg-muted/50 p-1 ring-0 shadow-sm dark:bg-muted">
        <div className="flex items-center justify-between px-3 py-2">
          <PanelTitle title="Search" />
          <MoreButton />
        </div>
        <div className="rounded-xl bg-card p-8">
          <div className="space-y-4 text-center">
            <div className="space-y-1">
              <h2 className="text-xl font-medium">How can we help?</h2>
              <p className="text-sm text-muted-foreground">
                Search guides, articles and answers from the team.
              </p>
            </div>
            <div className="relative mx-auto max-w-md">
              <HugeiconsIcon
                icon={Search01Icon}
                size={14}
                className="absolute top-1/2 left-2.5 -translate-y-1/2 text-muted-foreground"
              />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search help articles..."
                aria-label="Search help articles"
                className="h-9 rounded-lg bg-muted/40 pl-8 shadow-none"
              />
            </div>
          </div>
        </div>
      </Card>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card className="gap-0 bg-muted/50 p-1 ring-0 shadow-sm dark:bg-muted">
          <div className="flex items-center justify-between px-3 py-2">
            <PanelTitle title="Popular Articles" />
            <MoreButton />
          </div>
          <div className="flex-1 rounded-xl bg-card p-4">
            {visibleArticles.length === 0 && (
              <p className="px-2 py-8 text-center text-sm text-muted-foreground">
                No articles match your search.
              </p>
            )}
            {visibleArticles.map((article) => (
              <button
                key={article.title}
                onClick={() => setOpenArticle(article.title)}
                className="flex w-full items-center justify-between rounded-lg p-2 text-left hover:bg-muted/40"
              >
                <span className="text-sm">{article.title}</span>
                <span className="font-mono text-xs text-muted-foreground">{article.readTime}</span>
              </button>
            ))}
          </div>
        </Card>

        <Card className="gap-0 bg-muted/50 p-1 ring-0 shadow-sm dark:bg-muted">
          <div className="flex items-center justify-between px-3 py-2">
            <PanelTitle title="FAQ" />
            <MoreButton />
          </div>
          <div className="flex-1 rounded-xl bg-card p-4">
            <div className="divide-y">
              {visibleFaqs.length === 0 && (
                <p className="px-2 py-8 text-center text-sm text-muted-foreground">
                  No answers match your search.
                </p>
              )}
              {visibleFaqs.map((faq) => (
                <details key={faq.question}>
                  <summary className="cursor-pointer py-2 text-sm font-medium">
                    {faq.question}
                  </summary>
                  <p className="pb-2 text-sm text-muted-foreground">{faq.answer}</p>
                </details>
              ))}
            </div>
            <button
              onClick={() => router.push("/support")}
              className="mt-4 flex w-full items-center gap-2.5 rounded-xl bg-muted p-2 text-left text-sm text-muted-foreground hover:bg-muted/70"
            >
              <span className="flex size-7 shrink-0 items-center justify-center rounded-lg border bg-card">
                <HugeiconsIcon icon={AiMagicIcon} size={14} />
              </span>
              Ask AI assistant for instant answers
            </button>
          </div>
        </Card>
      </div>

      <Dialog open={selected !== null} onOpenChange={(o) => !o && setOpenArticle(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{selected?.title}</DialogTitle>
          </DialogHeader>
          <p className="font-mono text-xs text-muted-foreground">{selected?.readTime} read</p>
          <p className="text-sm text-muted-foreground">{selected?.body}</p>
        </DialogContent>
      </Dialog>
    </Shell>
  );
}
