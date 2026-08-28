export enum SubjectOfferingType {
  SCHOOL = "SCHOOL",
  TUITION = "TUITION",
}

export enum SubjectOfferingStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
  ARCHIVED = "ARCHIVED",
}

export interface SubjectOfferingDto {
  id: string;
  subjectId: string;
  offeringType: SubjectOfferingType;
  status: SubjectOfferingStatus;
  createdAt: string;
  updatedAt: string;
}

export interface SchoolSubjectOfferingDto extends SubjectOfferingDto {
  schoolOfferingId: string;
  sectionId: string;
}

export interface TuitionSubjectOfferingDto extends SubjectOfferingDto {
  tuitionOfferingId: string;
  batchId: string;
}
