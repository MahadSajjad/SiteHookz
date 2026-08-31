import { z } from 'zod';

export enum PaymentMethod {
  CASH = 'CASH',
  BANK_TRANSFER = 'BANK_TRANSFER',
  CARD = 'CARD',
  OTHER = 'OTHER',
}

export enum PaymentStatus {
  POSTED = 'POSTED',
  VOIDED = 'VOIDED',
}

export const PaymentAllocationSchema = z.object({
  id: z.string().uuid(),
  organizationId: z.string().uuid(),
  paymentId: z.string().uuid(),
  feeChargeId: z.string().uuid(),
  amount: z.string().regex(/^\d+(\.\d{1,2})?$/),
  createdAt: z.coerce.date(),
});

export type PaymentAllocation = z.infer<typeof PaymentAllocationSchema>;

export const PaymentSchema = z.object({
  id: z.string().uuid(),
  organizationId: z.string().uuid(),
  branchId: z.string().uuid(),
  studentId: z.string().uuid(),
  receiptNumber: z.string(),
  amount: z.string().regex(/^\d+(\.\d{1,2})?$/),
  paymentDate: z.coerce.date(),
  method: z.nativeEnum(PaymentMethod),
  reference: z.string().nullable().optional(),
  note: z.string().nullable().optional(),
  status: z.nativeEnum(PaymentStatus),
  receivedByMembershipId: z.string().uuid(),
  voidedAt: z.coerce.date().nullable().optional(),
  voidedByMembershipId: z.string().uuid().nullable().optional(),
  voidReason: z.string().nullable().optional(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),

  allocations: z.array(PaymentAllocationSchema).optional(),
});

export type Payment = z.infer<typeof PaymentSchema>;

export const PaymentAllocationInputSchema = z.object({
  feeChargeId: z.string().uuid(),
  amount: z.string().regex(/^\d+(\.\d{1,2})?$/),
});

export type PaymentAllocationInput = z.infer<typeof PaymentAllocationInputSchema>;

export const CreatePaymentDtoSchema = z.object({
  branchId: z.string().uuid(),
  studentId: z.string().uuid(),
  amount: z.string().regex(/^\d+(\.\d{1,2})?$/),
  paymentDate: z.string().datetime().or(z.date()),
  method: z.nativeEnum(PaymentMethod),
  reference: z.string().nullable().optional(),
  note: z.string().nullable().optional(),
  allocations: z.array(PaymentAllocationInputSchema),
});

export type CreatePaymentDto = z.infer<typeof CreatePaymentDtoSchema>;

export const VoidPaymentDtoSchema = z.object({
  voidReason: z.string().min(1).max(255),
});

export type VoidPaymentDto = z.infer<typeof VoidPaymentDtoSchema>;

export const PaymentListResponseSchema = z.object({
  data: z.array(PaymentSchema),
  total: z.number(),
});

export type PaymentListResponse = z.infer<typeof PaymentListResponseSchema>;
