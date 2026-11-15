import { FieldValue } from "firebase-admin/firestore";
import { adminDb } from "@/lib/firebaseAdmin";
import { getUid } from "@/lib/apiAuth";
import { askAi } from "@/lib/openai";
import { systemPrompt, summaryPrompt, parseSummary } from "@/lib/prompts";

export const maxDuration = 60;

export async function POST(req: Request) {
  const uid = await getUid(req);
  if (!uid) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { sessionId } = await req.json().catch(() => ({}));
  if (typeof sessionId !== "string") {
    return Response.json({ error: "Bad request" }, { status: 400 });
  }

  const ref = adminDb.collection("sessions").doc(sessionId);
  const snap = await ref.get();
  if (!snap.exists || snap.data()?.uid !== uid) {
    return Response.json({ error: "Session not found" }, { status: 404 });
  }
  const s = snap.data()!;

  if (s.status === "completed") {
    return Response.json({
      overallScore: s.overallScore,
      summary: s.summary,
      topImprovements: s.topImprovements,
    });
  }

  try {
    const turnsSnap = await ref.collection("turns").orderBy("order").get();
    if (turnsSnap.empty) {
      return Response.json({ error: "No answers to summarize yet" }, { status: 400 });
    }
    const turns = turnsSnap.docs.map((d) => d.data() as {
      question: string; score: number; improvements: string[];
    });

    // Overall score is calculated in code, not by the AI
    const overallScore = Math.round((turns.reduce((a, t) => a + t.score, 0) / turns.length) * 10) / 10;

    const result = await askAi(systemPrompt(s.role, s.level), summaryPrompt(turns), parseSummary);

    await ref.update({
      status: "completed",
      completedAt: FieldValue.serverTimestamp(),
      overallScore,
      summary: result.summary,
      topImprovements: result.topImprovements,
    });

    return Response.json({ overallScore, summary: result.summary, topImprovements: result.topImprovements });
  } catch (err) {
    console.error("finish failed:", err);
    return Response.json({ error: "Could not create the summary. Please try again." }, { status: 500 });
  }
}