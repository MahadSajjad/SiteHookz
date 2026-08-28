import { apiClient } from "./client";
import { SubjectOfferingDto, CreateSchoolSubjectOfferingDto, CreateTuitionSubjectOfferingDto } from "@sitehookz/education";

export const subjectOfferingsApi = {
  createSchoolOffering: async (data: CreateSchoolSubjectOfferingDto) => {
    const response = await apiClient.post<SubjectOfferingDto>('/education/subject-offerings/school', data);
    return response.data;
  },

  createTuitionOffering: async (data: CreateTuitionSubjectOfferingDto) => {
    const response = await apiClient.post<SubjectOfferingDto>('/education/subject-offerings/tuition', data);
    return response.data;
  },

  getBySectionId: async (sectionId: string) => {
    const response = await apiClient.get<SubjectOfferingDto[]>(`/education/subject-offerings/section/${sectionId}`);
    return response.data;
  },

  getByBatchId: async (batchId: string) => {
    const response = await apiClient.get<SubjectOfferingDto[]>(`/education/subject-offerings/batch/${batchId}`);
    return response.data;
  },

  archive: async (id: string) => {
    const response = await apiClient.post<{ success: boolean }>(`/education/subject-offerings/${id}/archive`);
    return response.data;
  }
};
