import { z } from "zod";
import { FeeChargeSchema } from "./fee-charge";
import { PaymentSchema } from "./payment";

export const StudentFinancialSummarySchema = z.object({
  studentId: z.string().uuid(),
  totalCharges: z.string(),
  totalPaid: z.string(),
  totalOutstanding: z.string(),
  recentCharges: z.array(FeeChargeSchema),
  recentPayments: z.array(PaymentSchema),
});

export type StudentFinancialSummary = z.infer<
  typeof StudentFinancialSummarySchema
>;
