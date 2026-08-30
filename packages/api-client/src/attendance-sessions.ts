import type { AxiosInstance } from "axios";
import type {
  AttendanceSession,
  AttendanceSessionDetail,
  AttendanceRosterItem,
  CreateAttendanceSession,
} from "@sitehookz/education";

interface PaginatedResponse<T> {
  items: T[];
  total?: number;
}

export class AttendanceSessionsApi {
  constructor(private readonly client: AxiosInstance) {}

  async getSchoolSessions(
    sectionId: string,
    params?: {
      dateFrom?: string;
      dateTo?: string;
      mode?: string;
      status?: string;
      subjectOfferingId?: string;
      page?: number;
      limit?: number;
    },
  ) {
    const { data } = await this.client.get<
      PaginatedResponse<AttendanceSession>
    >(`/education/sections/${sectionId}/attendance-sessions`, { params });
    return data;
  }

  async createSchoolSession(
    sectionId: string,
    payload: CreateAttendanceSession,
  ) {
    const { data } = await this.client.post<AttendanceSession>(
      `/education/sections/${sectionId}/attendance-sessions`,
      payload,
    );
    return data;
  }

  async getTuitionSessions(
    batchId: string,
    params?: {
      dateFrom?: string;
      dateTo?: string;
      mode?: string;
      status?: string;
      subjectOfferingId?: string;
      page?: number;
      limit?: number;
    },
  ) {
    const { data } = await this.client.get<
      PaginatedResponse<AttendanceSession>
    >(`/education/batches/${batchId}/attendance-sessions`, { params });
    return data;
  }

  async createTuitionSession(
    batchId: string,
    payload: CreateAttendanceSession,
  ) {
    const { data } = await this.client.post<AttendanceSession>(
      `/education/batches/${batchId}/attendance-sessions`,
      payload,
    );
    return data;
  }

  async getSessionDetail(sessionId: string) {
    const { data } = await this.client.get<AttendanceSessionDetail>(
      `/education/attendance-sessions/${sessionId}`,
    );
    return data;
  }

  async getSessionRoster(sessionId: string) {
    const { data } = await this.client.get<{ data: AttendanceRosterItem[] }>(
      `/education/attendance-sessions/${sessionId}/roster`,
    );
    return data.data;
  }

  async finalizeSession(sessionId: string) {
    const { data } = await this.client.post<AttendanceSession>(
      `/education/attendance-sessions/${sessionId}/finalize`,
    );
    return data;
  }

  async cancelSession(sessionId: string) {
    const { data } = await this.client.post<AttendanceSession>(
      `/education/attendance-sessions/${sessionId}/cancel`,
    );
    return data;
  }
}
