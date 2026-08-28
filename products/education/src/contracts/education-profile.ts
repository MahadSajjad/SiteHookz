import { EducationInstitutionType } from "@sitehookz/platform-contracts";

export interface EducationOrganizationProfileDto {
  id: string;
  organizationId: string;
  institutionType: EducationInstitutionType;
  createdAt: string;
  updatedAt: string;
}
