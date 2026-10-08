// Append-only AI audit log. Every assistant turn writes one event.
// Same field names as the future Supabase ai_interactions table.
// Server-only: never import from client components.

import { appendFile, mkdir } from "node:fs/promises";
import { dirname, join } from "node:path";

export type AiEvent = {
  trace_id: string;
  timestamp: string;
  user: string;
  role: string;
  module: string;
  action: string;
  model_provider: string;
  model: string;
  prompt_version: string;
  tool_calls: { name: string; args: unknown; rows: number }[];
  data_refs: string[];
  decision: "answered" | "refused" | "error";
  latency_ms: number;
};

const LOG_PATH = join(process.cwd(), "data", "ai-events.jsonl");

export async function logAiEvent(
  event: Omit<AiEvent, "timestamp">,
): Promise<void> {
  try {
    await mkdir(dirname(LOG_PATH), { recursive: true });
    await appendFile(
      LOG_PATH,
      JSON.stringify({ ...event, timestamp: new Date().toISOString() }) + "\n",
      "utf8",
    );
  } catch {
    // Logging must never break the request.
  }
}
