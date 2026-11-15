import { adminDb } from "@/lib/firebaseAdmin";
import { getUid } from "@/lib/apiAuth";

export async function GET(req: Request) {
  const uid = await getUid(req);
  if (!uid) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const id = new URL(req.url).searchParams.get("id");
  if (!id) return Response.json({ error: "Missing id" }, { status: 400 });

  const snap = await adminDb.collection("sessions").doc(id).get();
  if (!snap.exists || snap.data()?.uid !== uid) {
    return Response.json({ error: "Session not found" }, { status: 404 });
  }
  const s = snap.data()!;
  return Response.json({
    role: s.role,
    level: s.level,
    status: s.status,
    answeredCount: s.answeredCount,
    totalQuestions: s.totalQuestions,
    currentQuestion: s.currentQuestion ?? "",
    currentDifficulty: s.currentDifficulty ?? "",
    overallScore: s.overallScore ?? null,
    summary: s.summary ?? null,
    topImprovements: s.topImprovements ?? [],
  });
}