import { AxiosInstance } from "axios";
import {
  TimetableSchedule,
  TimetableDetail,
  CreateSchoolTimetableDto,
  CreateTuitionTimetableDto,
  CreateTimetableEntryDto,
  UpdateTimetableEntryDto,
  TimetableEntry,
} from "@sitehookz/education";

export class TimetablesApi {
  constructor(private readonly api: AxiosInstance) {}

  async listSchoolTimetables(sectionId: string, params?: Record<string, any>) {
    const { data } = await this.api.get<{ data: TimetableSchedule[] }>(
      `/education/sections/${sectionId}/timetables`,
      { params },
    );
    return data;
  }

  async createSchoolTimetable(
    sectionId: string,
    dto: CreateSchoolTimetableDto,
  ) {
    const { data } = await this.api.post<{ data: TimetableSchedule }>(
      `/education/sections/${sectionId}/timetables`,
      dto,
    );
    return data;
  }

  async listTuitionTimetables(batchId: string, params?: Record<string, any>) {
    const { data } = await this.api.get<{ data: TimetableSchedule[] }>(
      `/education/batches/${batchId}/timetables`,
      { params },
    );
    return data;
  }

  async createTuitionTimetable(
    batchId: string,
    dto: CreateTuitionTimetableDto,
  ) {
    const { data } = await this.api.post<{ data: TimetableSchedule }>(
      `/education/batches/${batchId}/timetables`,
      dto,
    );
    return data;
  }

  async getTimetableDetail(id: string) {
    const { data } = await this.api.get<{ data: TimetableDetail }>(
      `/education/timetables/${id}`,
    );
    return data;
  }

  async publishTimetable(id: string) {
    const { data } = await this.api.post<{ data: TimetableSchedule }>(
      `/education/timetables/${id}/publish`,
    );
    return data;
  }

  async archiveTimetable(id: string) {
    const { data } = await this.api.post<{ data: TimetableSchedule }>(
      `/education/timetables/${id}/archive`,
    );
    return data;
  }

  async createEntry(timetableId: string, dto: CreateTimetableEntryDto) {
    const { data } = await this.api.post<{ data: TimetableEntry }>(
      `/education/timetables/${timetableId}/entries`,
      dto,
    );
    return data;
  }

  async updateEntry(
    timetableId: string,
    entryId: string,
    dto: UpdateTimetableEntryDto,
  ) {
    const { data } = await this.api.patch<{ data: TimetableEntry }>(
      `/education/timetables/${timetableId}/entries/${entryId}`,
      dto,
    );
    return data;
  }

  async deleteEntry(timetableId: string, entryId: string) {
    await this.api.delete(
      `/education/timetables/${timetableId}/entries/${entryId}`,
    );
  }

  async getStaffTimetable(staffId: string) {
    const { data } = await this.api.get<{ data: TimetableEntry[] }>(
      `/education/staff/${staffId}/timetable`,
    );
    return data;
  }
}
