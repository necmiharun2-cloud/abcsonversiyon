/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_ADMIN_EMAILS?: string;
  /** `firebase` (mock/Functions) | `shopier` */
  readonly VITE_PAYMENT_PROVIDER?: string;
}
