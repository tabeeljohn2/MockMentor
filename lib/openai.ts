import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.GEMINI_API_KEY,
  baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
});

const MODEL = process.env.AI_MODEL as string;
if (!MODEL) throw new Error("AI_MODEL is not set in .env.local");

// Server-side only. Returns the raw JSON text from the model.
export async function chatJson(system: string, user: string): Promise<string> {
  const res = await client.chat.completions.create(
    {
      model: MODEL,
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
      temperature: 0.7
    },
    { timeout: 60000, maxRetries: 0 }
  );
  return res.choices[0]?.message?.content ?? "";
}

// Calls the model and retries once if the JSON is invalid.
export async function askAi<T>(
  system: string,
  user: string,
  parse: (text: string) => T | null
): Promise<T> {
  for (let i = 0; i < 2; i++) {
    const text = await chatJson(system, user);
    const out = parse(text);
    if (out !== null) return out;
  }
  throw new Error("AI returned invalid JSON");
}