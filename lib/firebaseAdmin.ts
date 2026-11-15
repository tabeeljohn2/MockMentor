import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";

const raw = process.env.FIREBASE_ADMIN_SERVICE_ACCOUNT;
if (!raw) throw new Error("FIREBASE_ADMIN_SERVICE_ACCOUNT is not set in .env.local");

const serviceAccount = JSON.parse(raw);
// Make sure the private key has real line breaks
serviceAccount.private_key = serviceAccount.private_key?.replace(/\\n/g, "\n");

const app = getApps().length
  ? getApps()[0]
  : initializeApp({ credential: cert(serviceAccount) });

export const adminDb = getFirestore(app);
export const adminAuth = getAuth(app);