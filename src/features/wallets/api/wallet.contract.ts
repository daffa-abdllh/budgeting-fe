import { z } from "zod";

export const walletSchema = z.object({
  name: z.string().min(1, "Wallet name is required").max(50, "Wallet name is too long"),
  balance: z.number({ message: "Initial balance is required" }).min(0, "Initial balance cannot be negative"),
});

export type CreateWalletInput = z.infer<typeof walletSchema>;
export type UpdateWalletInput = z.infer<typeof walletSchema>;

export interface Wallet {
  id: string;
  user_id: string;
  name: string;
  balance: string; // returned as decimal string from DB (e.g. "10000.00")
  is_deleted: boolean;
  created_at: string;
  updated_at: string | null;
  deleted_at: string | null;
}

export interface GetWalletsResponse {
  data: Wallet[];
  pagination: {
    page: number;
    limit: number;
    hasNextPage: boolean;
  };
}
