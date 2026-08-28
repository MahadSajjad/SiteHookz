import { apiClient } from "./client";
import {
  SubjectDto,
  CreateSubjectDto,
  UpdateSubjectDto,
} from "@sitehookz/education";

export const subjectsApi = {
  create: async (data: CreateSubjectDto) => {
    const response = await apiClient.post<SubjectDto>(
      "/education/subjects",
      data,
    );
    return response.data;
  },

  getAll: async () => {
    const response = await apiClient.get<SubjectDto[]>("/education/subjects");
    return response.data;
  },

  getById: async (id: string) => {
    const response = await apiClient.get<SubjectDto>(
      `/education/subjects/${id}`,
    );
    return response.data;
  },

  update: async (id: string, data: UpdateSubjectDto) => {
    const response = await apiClient.patch<SubjectDto>(
      `/education/subjects/${id}`,
      data,
    );
    return response.data;
  },

  archive: async (id: string) => {
    const response = await apiClient.post<{ success: boolean }>(
      `/education/subjects/${id}/archive`,
    );
    return response.data;
  },
};
