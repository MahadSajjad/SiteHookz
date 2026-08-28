export enum OrganizationStatus {
  ONBOARDING = "ONBOARDING",
  TRIAL = "TRIAL",
  ACTIVE = "ACTIVE",
  PAST_DUE = "PAST_DUE",
  SUSPENDED = "SUSPENDED",
  CANCELLED = "CANCELLED",
  ARCHIVED = "ARCHIVED",
}

export enum BranchStatus {
  ACTIVE = "ACTIVE",
  ARCHIVED = "ARCHIVED",
}

export enum UserAccountStatus {
  ACTIVE = "ACTIVE",
  SUSPENDED = "SUSPENDED",
  DEACTIVATED = "DEACTIVATED",
}

export enum MembershipStatus {
  ACTIVE = "ACTIVE",
  SUSPENDED = "SUSPENDED",
  LEFT = "LEFT",
}

export enum RoleType {
  SYSTEM = "SYSTEM",
  CUSTOM = "CUSTOM",
}

export enum RoleScopeType {
  ORGANIZATION = "ORGANIZATION",
  BRANCH = "BRANCH",
}

export enum InvitationStatus {
  PENDING = "PENDING",
  ACCEPTED = "ACCEPTED",
  EXPIRED = "EXPIRED",
  REVOKED = "REVOKED",
}

export enum AcademicSessionStatus {
  PLANNED = "PLANNED",
  ACTIVE = "ACTIVE",
  COMPLETED = "COMPLETED",
  ARCHIVED = "ARCHIVED",
}

export enum EducationInstitutionType {
  SCHOOL = "SCHOOL",
  TUITION_CENTER = "TUITION_CENTER",
}
