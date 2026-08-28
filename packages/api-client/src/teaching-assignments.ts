import { apiClient } from "./client";
import { TeachingAssignmentDto, AssignTeacherDto, EndTeachingAssignmentDto } from "@sitehookz/education";

export const teachingAssignmentsApi = {
  assign: async (data: AssignTeacherDto) => {
    const response = await apiClient.post<TeachingAssignmentDto>('/education/teaching-assignments', data);
    return response.data;
  },

  getBySubjectOfferingId: async (subjectOfferingId: string) => {
    const response = await apiClient.get<TeachingAssignmentDto[]>(`/education/teaching-assignments/offering/${subjectOfferingId}`);
    return response.data;
  },

  getByStaffMemberId: async (staffMemberId: string) => {
    const response = await apiClient.get<TeachingAssignmentDto[]>(`/education/teaching-assignments/staff/${staffMemberId}`);
    return response.data;
  },

  endAssignment: async (id: string, data: EndTeachingAssignmentDto) => {
    const response = await apiClient.post<TeachingAssignmentDto>(`/education/teaching-assignments/${id}/end`, data);
    return response.data;
  }
};
