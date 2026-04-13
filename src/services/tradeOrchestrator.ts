import { FirebaseNotificationProvider } from "./providers/firebaseNotificationProvider";
import { FirebasePaymentProvider } from "./providers/firebasePaymentProvider";
import { FirebaseKycProvider } from "./providers/firebaseKycProvider";
import { ShopierPaymentProvider } from "./providers/shopierPaymentProvider";
import { getPaymentProviderName } from "../config/payment";

const paymentProvider =
  getPaymentProviderName() === "shopier"
    ? new ShopierPaymentProvider()
    : new FirebasePaymentProvider();
const notificationProvider = new FirebaseNotificationProvider();
const kycProvider = new FirebaseKycProvider();

export const tradeOrchestrator = {
  paymentProvider,
  notificationProvider,
  kycProvider,
};
