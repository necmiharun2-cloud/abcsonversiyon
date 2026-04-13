export type NotificationEventInput = {
  userId: string;
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "error";
};

export interface NotificationProvider {
  notifyInApp(input: NotificationEventInput): Promise<void>;
  notifyEmail(input: NotificationEventInput & { email?: string }): Promise<void>;
  notifySms(input: NotificationEventInput & { phone?: string }): Promise<void>;
}
