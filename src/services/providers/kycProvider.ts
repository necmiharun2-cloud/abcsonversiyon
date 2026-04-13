export type KycStartInput = {
  userId: string;
  fullName: string;
  nationalId: string;
};

export type KycResult = {
  referenceId: string;
  status: "pending" | "verified" | "rejected";
};

export interface KycProvider {
  startVerification(input: KycStartInput): Promise<KycResult>;
  checkStatus(referenceId: string): Promise<KycResult>;
}
