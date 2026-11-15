import { FieldValue } from "firebase-admin/firestore";
import { adminDb } from "@/lib/firebaseAdmin";
import { getUid } from "@/lib/apiAuth";
import { askAi } from "@/lib/openai";
import { startingDifficulty, TOTAL_QUESTIONS, type Level } from "@/lib/adaptive";
import { systemPrompt, firstQuestionPrompt, parseQuestion } from "@/lib/prompts";

const ROLES = ["Frontend Developer", "Backend Developer", "Data Analyst", "Product Manager"];
const LEVELS = ["Junior", "Mid", "Senior"];

export async function POST(req: Request) {
  const uid = await getUid(req);
  if (!uid) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { role, level } = await req.json().catch(() => ({}));
  if (!ROLES.includes(role) || !LEVELS.includes(level)) {
    return Response.json({ error: "Invalid role or level" }, { status: 400 });
  }

  try {
    const difficulty = startingDifficulty(level as Level);
    const question = await askAi(
      systemPrompt(role, level),
      firstQuestionPrompt(difficulty),
      parseQuestion
    );
    const ref = await adminDb.collection("sessions").add({
      uid,
      role,
      level,
      status: "in_progress",
      startedAt: FieldValue.serverTimestamp(),
      totalQuestions: TOTAL_QUESTIONS,
      answeredCount: 0,
      currentQuestion: question,
      currentDifficulty: difficulty,
    });
    return Response.json({ sessionId: ref.id, question, difficulty, order: 1, total: TOTAL_QUESTIONS });
  } catch (err) {
    console.error("start failed:", err);
    return Response.json({ error: "Could not start the interview. Please try again." }, { status: 500 });
  }
}