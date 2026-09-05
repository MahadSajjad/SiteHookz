import type { AxiosInstance } from "axios";

export enum GradingScaleStatus {
  DRAFT = "DRAFT",
  ACTIVE = "ACTIVE",
  ARCHIVED = "ARCHIVED",
}

export enum ReportCardStatus {
  DRAFT = "DRAFT",
  PUBLISHED = "PUBLISHED",
  ARCHIVED = "ARCHIVED",
}

export enum ReportCardPassStatus {
  PASS = "PASS",
  FAIL = "FAIL",
  EXEMPT = "EXEMPT",
  NOT_GRADED = "NOT_GRADED",
}

export interface GradingScaleBand {
  id: string;
  gradingScaleId: string;
  name: string;
  code: string;
  minimumPercentage: number;
  isPassing: boolean;
  remarks?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface GradingScale {
  id: string;
  organizationId: string;
  name: string;
  status: GradingScaleStatus;
  description?: string | null;
  createdAt: string;
  updatedAt: string;
  bands?: GradingScaleBand[];
}

export interface CreateGradingScaleBandDto {
  name: string;
  code: string;
  minimumPercentage: number;
  isPassing: boolean;
  remarks?: string | null | undefined;
}

export interface CreateGradingScaleDto {
  name: string;
  description?: string | null | undefined;
  bands: CreateGradingScaleBandDto[];
}

export interface UpdateGradingScaleDto {
  name?: string | undefined;
  description?: string | null | undefined;
  status?: GradingScaleStatus | undefined;
  bands?: CreateGradingScaleBandDto[] | undefined;
}

export interface ReportCardSubjectResult {
  id: string;
  reportCardId: string;
  subjectId: string;
  subjectName: string;
  subjectCode: string;
  obtainedMarks: number;
  maximumMarks: number;
  percentage: number;
  gradeCode?: string | null;
  gradeName?: string | null;
  isPassing: boolean;
  isExempt: boolean;
  isAbsent: boolean;
  remarks?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ReportCard {
  id: string;
  organizationId: string;
  academicSessionId: string;
  studentEnrollmentId: string;
  sectionId?: string | null;
  batchId?: string | null;
  title: string;
  periodStart: string;
  periodEnd: string;
  status: ReportCardStatus;
  passStatus: ReportCardPassStatus;
  totalObtainedMarks: number;
  totalMaximumMarks: number;
  percentage: number;
  overallGradeCode?: string | null;
  overallGradeName?: string | null;
  remarks?: string | null;
  publishedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  subjectResults?: ReportCardSubjectResult[];
}

export interface GenerateReportCardsDto {
  title: string;
  periodStart: string;
  periodEnd: string;
  academicSessionId: string;
  sectionId?: string | undefined;
  batchId?: string | undefined;
  gradingScaleId?: string | undefined;
}

export interface PublishReportCardsDto {
  reportCardIds: string[];
}

export class GradingScalesApi {
  constructor(private client: AxiosInstance) {}

  async list(status?: GradingScaleStatus) {
    const res = await this.client.get("/education/grading-scales", {
      params: status ? { status } : undefined,
    });
    return res.data as GradingScale[];
  }

  async get(id: string) {
    const res = await this.client.get(`/education/grading-scales/${id}`);
    return res.data as GradingScale;
  }

  async create(dto: CreateGradingScaleDto) {
    const res = await this.client.post("/education/grading-scales", dto);
    return res.data as GradingScale;
  }

  async update(id: string, dto: UpdateGradingScaleDto) {
    const res = await this.client.patch(`/education/grading-scales/${id}`, dto);
    return res.data as GradingScale;
  }

  async activate(id: string) {
    const res = await this.client.post(`/education/grading-scales/${id}/activate`);
    return res.data as GradingScale;
  }

  async archive(id: string) {
    const res = await this.client.post(`/education/grading-scales/${id}/archive`);
    return res.data as GradingScale;
  }
}

export class ReportCardsApi {
  constructor(private client: AxiosInstance) {}

  async generate(dto: GenerateReportCardsDto) {
    const res = await this.client.post("/education/report-cards/generate", dto);
    return res.data as ReportCard[];
  }

  async publish(dto: PublishReportCardsDto) {
    const res = await this.client.post("/education/report-cards/publish", dto);
    return res.data as ReportCard[];
  }

  async get(id: string) {
    const res = await this.client.get(`/education/report-cards/${id}`);
    return res.data as ReportCard;
  }

  async getBySection(sectionId: string, status?: ReportCardStatus) {
    const res = await this.client.get(`/education/report-cards/sections/${sectionId}`, {
      params: status ? { status } : undefined,
    });
    return res.data as ReportCard[];
  }

  async getByBatch(batchId: string, status?: ReportCardStatus) {
    const res = await this.client.get(`/education/report-cards/batches/${batchId}`, {
      params: status ? { status } : undefined,
    });
    return res.data as ReportCard[];
  }

  async getByStudent(studentId: string) {
    const res = await this.client.get(`/education/report-cards/students/${studentId}`);
    return res.data as ReportCard[];
  }
}

export const createGradingScalesApi = (client: AxiosInstance) => new GradingScalesApi(client);
export const createReportCardsApi = (client: AxiosInstance) => new ReportCardsApi(client);
