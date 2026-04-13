import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../../firebase";
import { NotificationProvider, NotificationEventInput } from "./notificationProvider";

export class FirebaseNotificationProvider implements NotificationProvider {
  async notifyInApp(input: NotificationEventInput): Promise<void> {
    await addDoc(collection(db, "notifications"), {
      ...input,
      isRead: false,
      createdAt: serverTimestamp(),
    });
  }

  async notifyEmail(input: NotificationEventInput & { email?: string }): Promise<void> {
    await addDoc(collection(db, "outboxEmails"), {
      ...input,
      channel: "email",
      status: "queued",
      createdAt: serverTimestamp(),
    });
  }

  async notifySms(input: NotificationEventInput & { phone?: string }): Promise<void> {
    await addDoc(collection(db, "outboxSms"), {
      ...input,
      channel: "sms",
      status: "queued",
      createdAt: serverTimestamp(),
    });
  }
}
