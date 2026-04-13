export type PaymentInitInput = {
  userId: string;
  orderId: string;
  amount: number;
  currency: "TRY";
  method: "card" | "bank_transfer" | "wallet";
};

export type PaymentInitResult = {
  providerRef: string;
  redirectUrl?: string;
  status: "requires_action" | "authorized";
};

export type PaymentConfirmInput = {
  providerRef: string;
  payload?: Record<string, unknown>;
};

export type PaymentCaptureInput = {
  userId: string;
  providerRef: string;
  amount: number;
};

export type PaymentRefundInput = {
  userId: string;
  providerRef: string;
  amount: number;
  reason: string;
};

export interface PaymentProvider {
  initPayment(input: PaymentInitInput): Promise<PaymentInitResult>;
  confirm3DS(input: PaymentConfirmInput): Promise<{ status: "authorized" | "failed" }>;
  capture(input: PaymentCaptureInput): Promise<{ status: "captured" | "failed" }>;
  refund(input: PaymentRefundInput): Promise<{ status: "refunded" | "failed" }>;
}
