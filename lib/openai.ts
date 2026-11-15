import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.GEMINI_API_KEY,
  baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
});

const MODEL = process.env.AI_MODEL as string;

// Server-side only. Returns the raw JSON text from the model.
export async function chatJson(system: string, user: string): Promise<string> {
  const res = await client.chat.completions.create({
    model: MODEL,
    messages: [
      { role: "system", content: system },
      { role: "user", content: user },
    ],
    temperature: 0.7,
  });
  return res.choices[0]?.message?.content ?? "";
}