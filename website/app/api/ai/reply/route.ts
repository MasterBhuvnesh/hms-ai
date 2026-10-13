import OpenAI from "openai";
import { normalizeRole } from "@/lib/permissions";

function config() {
  const apiKey = process.env.NVIDIA_API_KEY;
  const baseURL = process.env.AI_BASE_URL ?? "https://integrate.api.nvidia.com/v1";
  const model = process.env.AI_MODEL ?? "meta/llama-3.1-70b-instruct";
  if (!apiKey) throw new Error("missing NVIDIA_API_KEY");
  return { apiKey, baseURL, model };
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      intent?: string;
      patient?: string;
      role?: string;
      history?: { from: string; text: string }[];
    };
    const intent = (body.intent ?? "general reply").slice(0, 200);
    const patient = (body.patient ?? "the patient").slice(0, 100);
    const role = normalizeRole(body.role);
    const history = Array.isArray(body.history) ? body.history.slice(-8) : [];
    const context = history.map((m) => `${m.from === "me" ? "Staff" : patient}: ${m.text}`).join("\n");

    const { apiKey, baseURL, model } = config();
    const client = new OpenAI({ apiKey, baseURL });
    const res = await client.chat.completions.create({
      model,
      temperature: 0.4,
      max_tokens: 150,
      messages: [
        {
          role: "system",
          content: [
            `You are CityCare Hospital's messaging assistant. The operator's role is ${role}.`,
            "Draft one short patient-facing message (max 3 sentences, plain text, no markdown).",
            "Amounts are in Indian rupees. Be warm, clear, and professional.",
            "Never invent tracking numbers, invoice links, or medical advice beyond the request.",
          ].join(" "),
        },
        {
          role: "user",
          content: `Patient: ${patient}\nIntent: ${intent}\nConversation so far:\n${context || "(none)"}\n\nWrite the staff reply:`,
        },
      ],
    });
    const reply = res.choices[0]?.message?.content?.trim() || "";
    if (!reply) return Response.json({ error: "empty_reply" }, { status: 502 });
    return Response.json({ reply });
  } catch (err) {
    const message = err instanceof Error ? err.message : "ai_error";
    const status = message.includes("NVIDIA_API_KEY") ? 500 : 502;
    return Response.json({ error: message }, { status });
  }
}
