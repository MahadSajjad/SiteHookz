import { AcademicSessionStatus } from '../enums';

export interface AcademicSessionDto {
  id: string;
  organizationId: string;
  name: string;
  code: string;
  startDate: string;
  endDate: string;
  status: AcademicSessionStatus;
  createdAt: string;
  updatedAt: string;
}
