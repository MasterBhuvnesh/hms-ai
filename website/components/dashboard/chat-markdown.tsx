"use client";

import { Fragment, type ReactNode } from "react";

function renderInline(text: string): ReactNode[] {
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
  return parts.map((p, i) => {
    if (p.length > 4 && p.startsWith("**") && p.endsWith("**")) {
      return <strong key={i}>{p.slice(2, -2)}</strong>;
    }
    if (p.length > 2 && p.startsWith("`") && p.endsWith("`")) {
      return (
        <code key={i} className="rounded bg-foreground/10 px-1 font-mono text-[0.85em]">
          {p.slice(1, -1)}
        </code>
      );
    }
    return <Fragment key={i}>{p}</Fragment>;
  });
}

function isTableRow(line: string): boolean {
  const t = line.trim();
  return t.startsWith("|") && t.endsWith("|") && t.includes("|", 1);
}

function isSeparatorRow(line: string): boolean {
  return /^[\s|:-]+$/.test(line.trim()) && line.includes("-");
}

function isListItem(line: string): boolean {
  return /^(\s*[-*]\s+|\s*\d+[.)]\s+)/.test(line);
}

/** Minimal markdown renderer for assistant replies: tables, lists, headings, bold, code. */
export function ChatMarkdown({ text }: { text: string }) {
  const lines = text.split("\n");
  const blocks: ReactNode[] = [];
  let i = 0;
  let key = 0;

  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    if (!trimmed) {
      i++;
      continue;
    }

    if (trimmed.startsWith("### ")) {
      blocks.push(<p key={key++} className="font-medium">{renderInline(trimmed.slice(4))}</p>);
      i++;
      continue;
    }
    if (trimmed.startsWith("## ")) {
      blocks.push(<p key={key++} className="font-medium">{renderInline(trimmed.slice(3))}</p>);
      i++;
      continue;
    }

    if (isTableRow(line)) {
      const rows: string[][] = [];
      while (i < lines.length && isTableRow(lines[i])) {
        if (!isSeparatorRow(lines[i])) {
          rows.push(lines[i].trim().slice(1, -1).split("|").map((c) => c.trim()));
        }
        i++;
      }
      if (rows.length > 0) {
        const [head, ...body] = rows;
        blocks.push(
          <div key={key++} className="overflow-x-auto rounded-lg border">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-muted/60">
                  {head.map((c, ci) => (
                    <th
                      key={ci}
                      className="px-2 py-1.5 text-left font-mono font-medium tracking-wide whitespace-nowrap uppercase"
                    >
                      {renderInline(c)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {body.map((r, ri) => (
                  <tr key={ri} className="border-t">
                    {r.map((c, ci) => (
                      <td key={ci} className="px-2 py-1.5 whitespace-nowrap">
                        {ci === 0 ? <span className="font-mono text-muted-foreground">{renderInline(c)}</span> : renderInline(c)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>,
        );
      }
      continue;
    }

    if (isListItem(line)) {
      const items: string[] = [];
      while (i < lines.length && (isListItem(lines[i]) || !lines[i].trim())) {
        if (isListItem(lines[i])) {
          items.push(lines[i].trim().replace(/^([-*]|\d+[.)])\s+/, ""));
        }
        i++;
      }
      blocks.push(
        <ul key={key++} className="list-disc space-y-1 pl-5">
          {items.map((it, ii) => (
            <li key={ii}>{renderInline(it)}</li>
          ))}
        </ul>,
      );
      continue;
    }

    blocks.push(<p key={key++}>{renderInline(trimmed)}</p>);
    i++;
  }

  return <div className="space-y-2 text-sm leading-relaxed">{blocks}</div>;
}
