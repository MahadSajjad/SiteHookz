import type { AxiosInstance } from "axios";
import type {
  StudentAttendanceRecord,
  BulkMarkAttendance,
  AttendanceHistoryItem,
} from "@sitehookz/education";

interface PaginatedResponse<T> {
  items: T[];
  total?: number;
}

export class StudentAttendanceApi {
  constructor(private readonly client: AxiosInstance) {}

  async bulkMarkAttendance(sessionId: string, payload: BulkMarkAttendance) {
    const { data } = await this.client.put<{ data: StudentAttendanceRecord[] }>(
      `/education/attendance-sessions/${sessionId}/records`,
      payload,
    );
    return data.data;
  }

  async getStudentHistory(
    studentId: string,
    params?: {
      dateFrom?: string;
      dateTo?: string;
      branchId?: string;
      status?: string;
      subjectId?: string;
      page?: number;
      limit?: number;
    },
  ) {
    const { data } = await this.client.get<
      PaginatedResponse<AttendanceHistoryItem>
    >(`/education/students/${studentId}/attendance`, { params });
    return data;
  }
}
