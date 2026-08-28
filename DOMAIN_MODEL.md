# Domain Model

This document outlines the 15 core database models implemented using Prisma for SiteHookz.

## 1. Organization (Platform)

- **Purpose**: Product-agnostic tenant root.
- **Fields**: `id`, `name`, `slug`, `status`, `createdAt`, `updatedAt`, `archivedAt`
- **Constraints**: `slug` is unique.
- **Status**: Lifecycle status (ACTIVE, SUSPENDED, etc.)

## 2. Branch (Platform)

- **Purpose**: Tenant-scoped operational location.
- **Fields**: `id`, `organizationId`, `name`, `code`, `status`, `createdAt`, `updatedAt`, `archivedAt`
- **Constraints**: `(organizationId, code)` is unique.

## 3. UserAccount (Platform)

- **Purpose**: Pure authentication identity.
- **Fields**: `id`, `email`, `passwordHash`, `name`, `status`, `createdAt`, `updatedAt`
- **Constraints**: `email` is unique (case-insensitive).

## 4. AuthSession (Platform)

- **Purpose**: Tracks active refresh tokens.
- **Fields**: `id`, `userAccountId`, `tokenHash`, `expiresAt`, `isRevoked`, `createdAt`, `updatedAt`
- **Security**: Stores hash only; supports revocation.

## 5. EmailVerificationToken (Platform)

- **Purpose**: Email verification.
- **Fields**: `id`, `userAccountId`, `tokenHash`, `expiresAt`, `usedAt`, `createdAt`
- **Security**: Single-use.

## 6. PasswordResetToken (Platform)

- **Purpose**: Password reset.
- **Fields**: `id`, `userAccountId`, `tokenHash`, `expiresAt`, `usedAt`, `createdAt`
- **Security**: Single-use. Revokes all active sessions upon use.

## 7. OrganizationMembership (Platform)

- **Purpose**: Links user to an organization.
- **Fields**: `id`, `organizationId`, `userAccountId`, `status`, `createdAt`, `updatedAt`
- **Constraints**: `(organizationId, userAccountId)` is unique.

## 8. Permission (Platform)

- **Purpose**: Defines granular access controls.
- **Fields**: `id`, `key`, `description`, `createdAt`, `updatedAt`
- **Constraints**: `key` is unique. Format is `namespace.resource.action`.

## 9. Role (Platform)

- **Purpose**: Organizational roles.
- **Fields**: `id`, `organizationId`, `name`, `type` (SYSTEM/CUSTOM), `scope` (ORGANIZATION/BRANCH), `createdAt`, `updatedAt`

## 10. RolePermission (Platform)

- **Purpose**: Maps permissions to roles.
- **Fields**: `id`, `roleId`, `permissionId`
- **Constraints**: `(roleId, permissionId)` is unique.

## 11. RoleAssignment (Platform)

- **Purpose**: Assigns roles to memberships, optionally scoped to a branch.
- **Fields**: `id`, `membershipId`, `roleId`, `branchId`
- **Constraints**: Partial unique indexes handle nullable `branchId`.

## 12. OrganizationInvitation (Platform)

- **Purpose**: Invites users to join an organization.
- **Fields**: `id`, `organizationId`, `email`, `tokenHash`, `status`, `expiresAt`, `inviterId`, `createdAt`, `updatedAt`

## 13. OrganizationInvitationRoleAssignment (Platform)

- **Purpose**: Roles assigned upon invitation acceptance.
- **Fields**: `id`, `invitationId`, `roleId`, `branchId`

## 14. EducationOrganizationProfile (Education)

- **Purpose**: Product-specific profile for education organizations.
- **Fields**: `id`, `organizationId`, `institutionType` (SCHOOL | TUITION_CENTER), `createdAt`, `updatedAt`
- **Constraints**: `organizationId` is unique.

## 15. AcademicSession (Education)

- **Purpose**: Defines academic terms/sessions.
- **Fields**: `id`, `organizationId`, `name`, `code`, `startDate`, `endDate`, `status`, `createdAt`, `updatedAt`
- **Constraints**: `(organizationId, code)` is unique. Date validation applied.

## Future Plans: Student

- Students will have a UUID and a human-facing admission number (`FSD-{BRANCH}-{SEQ}`).
- Not implemented yet, documented for future reference.
