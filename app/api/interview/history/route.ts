import { adminDb } from "@/lib/firebaseAdmin";
import { getUid } from "@/lib/apiAuth";

export async function GET(req: Request) {
  const uid = await getUid(req);
  if (!uid) return Response.json({ error: "Unauthorized" }, { status: 401 });

  try {
    // Filter by user only, then sort in code (avoids needing a Firestore index)
    const snap = await adminDb.collection("sessions").where("uid", "==", uid).get();
    const sessions = snap.docs
      .map((d) => {
        const s = d.data();
        return {
          id: d.id,
          role: s.role,
          level: s.level,
          status: s.status,
          answeredCount: s.answeredCount ?? 0,
          totalQuestions: s.totalQuestions ?? 6,
          overallScore: s.overallScore ?? null,
          startedAt: s.startedAt?.toMillis?.() ?? 0,
        };
      })
      .sort((a, b) => b.startedAt - a.startedAt)
      .slice(0, 50);
    return Response.json({ sessions });
  } catch (err) {
    console.error("history failed:", err);
    return Response.json({ error: "Could not load your history." }, { status: 500 });
  }
}