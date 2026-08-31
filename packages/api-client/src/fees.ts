import { apiClient } from "./client";
import {
  CreateFeeHeadDto,
  UpdateFeeHeadDto,
  CreateFeePlanDto,
  UpdateFeePlanDto,
  CreateEnrollmentFeePlanAssignmentDto,
  GenerateFeeChargesDto,
  VoidFeeChargeDto,
} from "@sitehookz/education";

export const feesApi = {
  // Fee Heads
  getFeeHeads: () => apiClient.get("/education/fee-heads"),
  getFeeHead: (id: string) => apiClient.get(`/education/fee-heads/${id}`),
  createFeeHead: (data: CreateFeeHeadDto) =>
    apiClient.post("/education/fee-heads", data),
  updateFeeHead: (id: string, data: UpdateFeeHeadDto) =>
    apiClient.patch(`/education/fee-heads/${id}`, data),
  deleteFeeHead: (id: string) => apiClient.delete(`/education/fee-heads/${id}`),

  // Fee Plans
  getFeePlans: () => apiClient.get("/education/fee-plans"),
  getFeePlan: (id: string) => apiClient.get(`/education/fee-plans/${id}`),
  createFeePlan: (data: CreateFeePlanDto) =>
    apiClient.post("/education/fee-plans", data),
  updateFeePlan: (id: string, data: UpdateFeePlanDto) =>
    apiClient.patch(`/education/fee-plans/${id}`, data),
  activateFeePlan: (id: string) =>
    apiClient.post(`/education/fee-plans/${id}/activate`, {}),
  deleteFeePlan: (id: string) => apiClient.delete(`/education/fee-plans/${id}`),

  // Fee Assignments
  getFeeAssignments: (studentEnrollmentId?: string) => {
    const query = studentEnrollmentId
      ? `?studentEnrollmentId=${studentEnrollmentId}`
      : "";
    return apiClient.get(`/education/fee-assignments${query}`);
  },
  assignFeePlan: (data: CreateEnrollmentFeePlanAssignmentDto) =>
    apiClient.post("/education/fee-assignments", data),

  // Fee Charges
  generateFeeCharges: (assignmentId: string, data: GenerateFeeChargesDto) =>
    apiClient.post(
      `/education/fee-assignments/${assignmentId}/charges/generate`,
      data,
    ),
  voidFeeCharge: (chargeId: string, data: VoidFeeChargeDto) =>
    apiClient.post(`/education/fee-charges/${chargeId}/void`, data),

  // Financial Summary
  getStudentFinancialSummary: (studentId: string) =>
    apiClient.get(`/education/students/${studentId}/financial-summary`),
};
