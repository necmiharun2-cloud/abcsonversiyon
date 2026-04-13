import { httpsCallable } from "firebase/functions";
import { functions } from "../../firebase";
import {
  PaymentProvider,
  PaymentInitInput,
  PaymentInitResult,
  PaymentConfirmInput,
  PaymentCaptureInput,
  PaymentRefundInput,
} from "./paymentProvider";
import { toCents } from "../../lib/money";

export class FirebasePaymentProvider implements PaymentProvider {
  async initPayment(input: PaymentInitInput): Promise<PaymentInitResult> {
    const requiresAction = input.method === "card";
    const intentStatus = requiresAction ? "requires_action" : "authorized";
    const call = httpsCallable(functions, "createPaymentIntent");
    const resp = await call({ orderId: input.orderId, amountCents: toCents(input.amount) });
    const intentId = (resp.data as any)?.intentId as string;
    return {
      providerRef: intentId,
      status: intentStatus,
      redirectUrl: requiresAction ? `/odeme/3ds/${intentId}` : undefined,
    };
  }

  async confirm3DS(input: PaymentConfirmInput): Promise<{ status: "authorized" | "failed" }> {
    // mock: 3DS adımı yok; sadece authorized kabul ediyoruz
    return { status: "authorized" };
  }

  async capture(input: PaymentCaptureInput): Promise<{ status: "captured" | "failed" }> {
    const call = httpsCallable(functions, "mockCapturePayment");
    const resp = await call({ intentId: input.providerRef });
    const status = (resp.data as any)?.status;
    return { status: status === "captured" ? "captured" : "failed" };
  }

  async refund(input: PaymentRefundInput): Promise<{ status: "refunded" | "failed" }> {
    // mock: iade akışını dispute/refund task'ında function tarafına taşıyacağız
    return { status: "failed" };
  }
}
