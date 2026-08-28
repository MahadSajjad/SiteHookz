import { P } from "@sitehookz/platform-permissions";
import {
  EDUCATION_SUBJECTS_PERMISSIONS,
  EDUCATION_SUBJECT_OFFERINGS_PERMISSIONS,
  EDUCATION_TEACHING_ASSIGNMENTS_PERMISSIONS,
} from "../permissions/education-permissions";

export interface RoleTemplate {
  name: string;
  key: string;
  scopeType: "ORGANIZATION" | "BRANCH";
  isEditable: boolean;
  isDeletable: boolean;
  permissions: string[];
}

export const PLATFORM_ROLE_TEMPLATES: RoleTemplate[] = [
  {
    name: "Organization Owner",
    key: "organization_owner",
    scopeType: "ORGANIZATION",
    isEditable: false,
    isDeletable: false,
    permissions: [
      P.PLATFORM.ORGANIZATION.READ,
      P.PLATFORM.ORGANIZATION.UPDATE,
      P.PLATFORM.BRANCHES.READ,
      P.PLATFORM.BRANCHES.CREATE,
      P.PLATFORM.BRANCHES.UPDATE,
      P.PLATFORM.BRANCHES.ARCHIVE,
      P.PLATFORM.BRANCHES.RESTORE,
      P.PLATFORM.MEMBERSHIPS.READ,
      P.PLATFORM.MEMBERSHIPS.INVITE,
      P.PLATFORM.MEMBERSHIPS.UPDATE,
      P.PLATFORM.MEMBERSHIPS.SUSPEND,
      P.PLATFORM.MEMBERSHIPS.REMOVE,
      P.PLATFORM.ROLES.READ,
      P.PLATFORM.ROLES.CREATE,
      P.PLATFORM.ROLES.UPDATE,
      P.PLATFORM.ROLES.DELETE,
      P.PLATFORM.ROLES.ASSIGN,
      P.PLATFORM.PERMISSIONS.READ,
      P.PLATFORM.INVITATIONS.READ,
      P.PLATFORM.INVITATIONS.CREATE,
      P.PLATFORM.INVITATIONS.REVOKE,
      P.EDUCATION.ACADEMIC_SESSIONS.READ,
      P.EDUCATION.ACADEMIC_SESSIONS.CREATE,
      P.EDUCATION.ACADEMIC_SESSIONS.UPDATE,
      P.EDUCATION.ACADEMIC_SESSIONS.ARCHIVE,
    ],
  },
  {
    name: "Organization Administrator",
    key: "organization_admin",
    scopeType: "ORGANIZATION",
    isEditable: true,
    isDeletable: false,
    permissions: [
      P.PLATFORM.ORGANIZATION.READ,
      P.PLATFORM.BRANCHES.READ,
      P.PLATFORM.BRANCHES.CREATE,
      P.PLATFORM.BRANCHES.UPDATE,
      P.PLATFORM.MEMBERSHIPS.READ,
      P.PLATFORM.MEMBERSHIPS.INVITE,
      P.PLATFORM.MEMBERSHIPS.UPDATE,
      P.PLATFORM.ROLES.READ,
      P.PLATFORM.ROLES.ASSIGN,
      P.PLATFORM.PERMISSIONS.READ,
      P.PLATFORM.INVITATIONS.READ,
      P.PLATFORM.INVITATIONS.CREATE,
      P.EDUCATION.ACADEMIC_SESSIONS.READ,
      P.EDUCATION.ACADEMIC_SESSIONS.CREATE,
      P.EDUCATION.ACADEMIC_SESSIONS.UPDATE,
    ],
  },
  {
    name: "Branch Administrator",
    key: "branch_admin",
    scopeType: "BRANCH",
    isEditable: true,
    isDeletable: false,
    permissions: [
      P.PLATFORM.BRANCHES.READ,
      P.PLATFORM.BRANCHES.UPDATE,
      P.PLATFORM.MEMBERSHIPS.READ,
      P.PLATFORM.ROLES.READ,
      P.EDUCATION.ACADEMIC_SESSIONS.READ,
    ],
  },
];

export const EDUCATION_ROLE_TEMPLATES: RoleTemplate[] = [
  {
    name: "Principal",
    key: "principal",
    scopeType: "BRANCH",
    isEditable: true,
    isDeletable: true,
    permissions: [
      P.PLATFORM.BRANCHES.READ,
      P.PLATFORM.BRANCHES.UPDATE,
      P.PLATFORM.MEMBERSHIPS.READ,
      P.EDUCATION.ACADEMIC_SESSIONS.READ,
      ...Object.values(EDUCATION_SUBJECTS_PERMISSIONS),
      ...Object.values(EDUCATION_SUBJECT_OFFERINGS_PERMISSIONS),
      ...Object.values(EDUCATION_TEACHING_ASSIGNMENTS_PERMISSIONS),
    ],
  },
  {
    name: "Academic Coordinator",
    key: "academic_coordinator",
    scopeType: "BRANCH",
    isEditable: true,
    isDeletable: true,
    permissions: [
      P.PLATFORM.BRANCHES.READ,
      P.EDUCATION.ACADEMIC_SESSIONS.READ,
      EDUCATION_SUBJECTS_PERMISSIONS.READ,
      EDUCATION_SUBJECT_OFFERINGS_PERMISSIONS.READ,
      EDUCATION_SUBJECT_OFFERINGS_PERMISSIONS.CREATE,
      EDUCATION_SUBJECT_OFFERINGS_PERMISSIONS.UPDATE,
      EDUCATION_TEACHING_ASSIGNMENTS_PERMISSIONS.READ,
      EDUCATION_TEACHING_ASSIGNMENTS_PERMISSIONS.CREATE,
      EDUCATION_TEACHING_ASSIGNMENTS_PERMISSIONS.END,
    ],
  },
  {
    name: "Finance Manager",
    key: "finance_manager",
    scopeType: "ORGANIZATION",
    isEditable: true,
    isDeletable: true,
    permissions: [P.PLATFORM.ORGANIZATION.READ, P.PLATFORM.BRANCHES.READ],
  },
  {
    name: "Accountant",
    key: "accountant",
    scopeType: "BRANCH",
    isEditable: true,
    isDeletable: true,
    permissions: [P.PLATFORM.BRANCHES.READ],
  },
  {
    name: "Instructor",
    key: "instructor",
    scopeType: "BRANCH",
    isEditable: true,
    isDeletable: true,
    permissions: [
      P.EDUCATION.ACADEMIC_SESSIONS.READ,
      EDUCATION_SUBJECTS_PERMISSIONS.READ,
      EDUCATION_SUBJECT_OFFERINGS_PERMISSIONS.READ,
      EDUCATION_TEACHING_ASSIGNMENTS_PERMISSIONS.READ,
    ],
  },
  {
    name: "Receptionist",
    key: "receptionist",
    scopeType: "BRANCH",
    isEditable: true,
    isDeletable: true,
    permissions: [P.PLATFORM.BRANCHES.READ],
  },
  {
    name: "Staff",
    key: "staff",
    scopeType: "BRANCH",
    isEditable: true,
    isDeletable: true,
    permissions: [P.PLATFORM.BRANCHES.READ],
  },
];

export const ALL_EDUCATION_ORG_ROLE_TEMPLATES = [
  ...PLATFORM_ROLE_TEMPLATES,
  ...EDUCATION_ROLE_TEMPLATES,
];
