import { adminAuth } from "./firebaseAdmin";

// Reads "Authorization: Bearer <Firebase ID token>" and returns the user's uid.
export async function getUid(req: Request): Promise<string | null> {
  const header = req.headers.get("authorization") ?? "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";
  if (!token) return null;
  try {
    return (await adminAuth.verifyIdToken(token)).uid;
  } catch {
    return null;
  }
}