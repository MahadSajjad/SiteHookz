import type { AxiosInstance } from "axios";

export enum AssessmentType {
  QUIZ = "QUIZ",
  ASSIGNMENT = "ASSIGNMENT",
  TEST = "TEST",
  MIDTERM = "MIDTERM",
  FINAL = "FINAL",
  PRACTICAL = "PRACTICAL",
  OTHER = "OTHER",
}

export enum AssessmentStatus {
  DRAFT = "DRAFT",
  ACTIVE = "ACTIVE",
  RESULTS_PUBLISHED = "RESULTS_PUBLISHED",
  ARCHIVED = "ARCHIVED",
}

export enum AssessmentResultStatus {
  GRADED = "GRADED",
  ABSENT = "ABSENT",
  EXEMPT = "EXEMPT",
}

export interface Assessment {
  id: string;
  organizationId: string;
  subjectOfferingId: string;
  title: string;
  assessmentType: AssessmentType;
  assessmentDate: string;
  maximumMarks: number;
  passingMarks?: number | null;
  status: AssessmentStatus;
  description?: string | null;
  createdByMembershipId: string;
  createdAt: string;
  updatedAt: string;
  subjectOffering?: any;
}

export interface AssessmentResult {
  id: string;
  organizationId: string;
  assessmentId: string;
  studentEnrollmentId: string;
  resultStatus: AssessmentResultStatus;
  marksObtained?: number | null;
  comment?: string | null;
  studentEnrollment?: any;
  assessment?: Assessment;
}

export interface CreateAssessmentDto {
  subjectOfferingId: string;
  title: string;
  assessmentType: AssessmentType;
  assessmentDate: string;
  maximumMarks: number;
  passingMarks?: number;
  description?: string;
}

export interface BulkSaveResultsDto {
  results: {
    studentEnrollmentId: string;
    resultStatus: AssessmentResultStatus;
    marksObtained?: number;
    comment?: string;
  }[];
}

export class AssessmentsApi {
  constructor(private client: AxiosInstance) {}

  async list(params?: {
    subjectOfferingId?: string;
    sectionId?: string;
    batchId?: string;
    status?: AssessmentStatus;
    type?: AssessmentType;
    page?: number;
    limit?: number;
  }) {
    const res = await this.client.get("/academics/assessments", { params });
    return res.data;
  }

  async get(id: string) {
    const res = await this.client.get(`/academics/assessments/${id}`);
    return res.data as Assessment;
  }

  async create(data: CreateAssessmentDto) {
    const res = await this.client.post("/academics/assessments", data);
    return res.data as Assessment;
  }

  async activate(id: string) {
    const res = await this.client.post(`/academics/assessments/${id}/activate`);
    return res.data;
  }

  async publish(id: string) {
    const res = await this.client.post(`/academics/assessments/${id}/publish`);
    return res.data;
  }

  async archive(id: string) {
    const res = await this.client.post(`/academics/assessments/${id}/archive`);
    return res.data;
  }

  async getResults(assessmentId: string) {
    const res = await this.client.get(
      `/academics/assessments/${assessmentId}/results`,
    );
    return res.data as AssessmentResult[];
  }

  async saveResults(assessmentId: string, data: BulkSaveResultsDto) {
    const res = await this.client.put(
      `/academics/assessments/${assessmentId}/results`,
      data,
    );
    return res.data;
  }

  async getStudentHistory(studentId: string) {
    const res = await this.client.get(
      `/academics/assessments/students/${studentId}/history`,
    );
    return res.data as AssessmentResult[];
  }
}
