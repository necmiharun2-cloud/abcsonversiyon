import { addDoc, collection, doc, getDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../../firebase";
import { KycProvider, KycStartInput, KycResult } from "./kycProvider";

export class FirebaseKycProvider implements KycProvider {
  async startVerification(input: KycStartInput): Promise<KycResult> {
    const ref = await addDoc(collection(db, "kycRequests"), {
      ...input,
      status: "pending",
      createdAt: serverTimestamp(),
    });
    return { referenceId: ref.id, status: "pending" };
  }

  async checkStatus(referenceId: string): Promise<KycResult> {
    const snap = await getDoc(doc(db, "kycRequests", referenceId));
    if (!snap.exists()) {
      return { referenceId, status: "rejected" };
    }
    const status = (snap.data().status || "pending") as "pending" | "verified" | "rejected";
    return { referenceId, status };
  }
}
