import { FieldValue } from "firebase-admin/firestore";
import { adminDb } from "@/lib/firebaseAdmin";
import { getUid } from "@/lib/apiAuth";
import { askAi } from "@/lib/openai";
import { getNextStep, isInterviewComplete } from "@/lib/adaptive";
import {
  systemPrompt, feedbackPrompt, parseFeedback,
  nextQuestionPrompt, parseQuestion,
} from "@/lib/prompts";

export const maxDuration = 60;

const MAX_ANSWER = 2000;

export async function POST(req: Request) {
  const uid = await getUid(req);
  if (!uid) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { sessionId, answer } = await req.json().catch(() => ({}));
  if (typeof sessionId !== "string" || typeof answer !== "string") {
    return Response.json({ error: "Bad request" }, { status: 400 });
  }
  const text = answer.trim();
  if (!text || text.length > MAX_ANSWER) {
    return Response.json({ error: `Answer must be 1-${MAX_ANSWER} characters` }, { status: 400 });
  }

  const ref = adminDb.collection("sessions").doc(sessionId);
  const snap = await ref.get();
  if (!snap.exists || snap.data()?.uid !== uid) {
    return Response.json({ error: "Session not found" }, { status: 404 });
  }
  const s = snap.data()!;
  if (s.status !== "in_progress" || isInterviewComplete(s.answeredCount)) {
    return Response.json({ error: "All questions answered. Finish the interview." }, { status: 400 });
  }

  try {
    const turns = await ref.collection("turns").orderBy("order").get();
    const asked = turns.docs.map((d) => d.data().question as string);
    asked.push(s.currentQuestion);

    const sys = systemPrompt(s.role, s.level);
    const feedback = await askAi(sys, feedbackPrompt(s.currentQuestion, text), parseFeedback);

    const order = s.answeredCount + 1;
    const done = isInterviewComplete(order);
    let nextQuestion: string | null = null;
    let nextDifficulty = s.currentDifficulty;

    if (!done) {
      const next = getNextStep(feedback.score, s.currentDifficulty);
      nextDifficulty = next.difficulty;
      nextQuestion = await askAi(
        sys,
        nextQuestionPrompt(next, s.currentQuestion, text, asked),
        parseQuestion
      );
    }

    // Save the turn and update the session together
    const batch = adminDb.batch();
    batch.set(ref.collection("turns").doc(), {
      order,
      question: s.currentQuestion,
      answer: text,
      score: feedback.score,
      strengths: feedback.strengths,
      improvements: feedback.improvements,
      difficulty: s.currentDifficulty,
      createdAt: FieldValue.serverTimestamp(),
    });
    batch.update(ref, {
      answeredCount: order,
      ...(done ? {} : { currentQuestion: nextQuestion, currentDifficulty: nextDifficulty }),
    });
    await batch.commit();

    return Response.json({ feedback, done, nextQuestion, difficulty: nextDifficulty, order: order + 1 });
  } catch (err) {
    console.error("answer failed:", err);
    return Response.json({ error: "Could not analyze your answer. Please try again." }, { status: 500 });
  }
}