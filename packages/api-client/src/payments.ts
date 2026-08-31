import { apiClient } from "./client";
import { CreatePaymentDto, VoidPaymentDto } from "@sitehookz/education";

export const paymentsApi = {
  createPayment: (data: CreatePaymentDto) => apiClient.post("/education/payments", data),
  voidPayment: (id: string, data: VoidPaymentDto) => apiClient.post(`/education/payments/${id}/void`, data),
};
