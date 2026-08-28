export interface TenantContext {
  organizationId: string;
  organizationSlug: string;
  userAccountId: string;
  membershipId: string;
  roleAssignments: {
    roleId: string;
    roleScopeType: "ORGANIZATION" | "BRANCH";
    branchId: string | null;
    permissions: string[];
  }[];
  accessibleBranchIds: string[];
}
