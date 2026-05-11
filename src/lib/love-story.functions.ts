import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const inputSchema = z.object({
  chapters: z
    .array(
      z.object({
        title: z.string(),
        date: z.string(),
        seed: z.string(),
      }),
    )
    .min(1)
    .max(20),
});

export type LoveStoryChapter = { title: string; story: string };

export const generateLoveStory = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => inputSchema.parse(data))
  .handler(async ({ data }): Promise<{ chapters: LoveStoryChapter[] }> => {
    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) throw new Error("LOVABLE_API_KEY missing");

    const system = `You are a tender, poetic narrator writing a private love story between two real people: a developer who built this site, and his girlfriend Rhia (half Turkish, half Vietnamese). Write in warm, intimate second person addressed to "you" (Rhia). Style: handwritten-letter, lyrical but easy to read, modern, sincere — never purple, never cringe. Each chapter is ONE short paragraph, 2–3 sentences, ~45–70 words. No emojis, no quotes, no titles in the body.`;

    const user = `Write a chapter paragraph for each of the following moments. Return STRICT JSON: {"chapters":[{"title":"...","story":"..."}]} preserving order and titles.

Moments:
${data.chapters.map((c, i) => `${i + 1}. (${c.date}) ${c.title} — ${c.seed}`).join("\n")}`;

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Lovable-API-Key": apiKey,
        "X-Lovable-AIG-SDK": "raw",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (!res.ok) {
      const txt = await res.text();
      throw new Error(`AI gateway ${res.status}: ${txt.slice(0, 200)}`);
    }

    const json = (await res.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const content = json.choices?.[0]?.message?.content ?? "{}";
    const parsed = JSON.parse(content) as { chapters?: LoveStoryChapter[] };
    const chapters = (parsed.chapters ?? []).map((c, i) => ({
      title: c.title ?? data.chapters[i]?.title ?? "",
      story: (c.story ?? "").trim(),
    }));
    return { chapters };
  });
