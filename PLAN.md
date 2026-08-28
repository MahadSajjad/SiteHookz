# SiteHookz Project Plan

## Current Phase
**Foundation (Step 1 + Step 2) — COMPLETED**

## Execution Phase 2: Tenant & Auth Foundation Hardening
Status: `[COMPLETED]`

**Goal**: Establish enterprise-grade authentication, tenancy isolation, and authorization logic based strictly on the current Phase 1 foundation (UserAccount, AuthSession, Organization, Membership, Roles, Permissions). Do NOT introduce Layer 3 domain models yet.

**Changes Required**:
1.  **AuthSession Revocation & Rotation**:
    -   Enhance `AuthSession` with family grouping, revocation tracking, and rotation auditing.
    -   Implement JWT refresh rotation with replay detection.
2.  **Email Verification Enforcements**:
    -   Finalize the `EmailVerificationToken` lifecycle (creation, hashing, expiration, used state).
    -   Enforce verified email requirement for privileged actions like Organization creation.
3.  **Strict Tenancy Resolution**:
    -   Normalize `X-SiteHookz-Organization` parsing as untrusted.
    -   Ensure `TenantContext` precisely mirrors `OrganizationMembership` state and correctly aggregates permissions across scopes (`ORGANIZATION` vs `BRANCH`).
4.  **Authorization Ceilings & Consistency**:
    -   Enforce Permission Escalation Ceilings: Users cannot grant permissions to custom roles that they themselves do not possess at an equal or broader scope, unless they hold `platform.roles.manage_all`.
    -   Validate cross-organization boundaries on `RoleAssignment` and `OrganizationInvitation`.
5.  **Test Verification**:
    -   Implement integration tests confirming auth, tenancy, and authorization behavior.

## Completed Foundation Work
- Monorepo (pnpm workspaces + Turborepo)
- Shared packages (database, contracts, permissions, design-tokens, i18n, api-client, jobs)
- NestJS API with modular monolith architecture
- PostgreSQL with Prisma (15 models)
- Redis + BullMQ worker
- Authentication (register, login, refresh, logout, email verification, password reset)
- Tenant resolution (hostname + dev header)
- Authorization (permission-based, branch-aware)
- Organization management (transactional creation with role provisioning)
- Branch management (CRUD, archive/restore)
- Membership management (list, suspend, reactivate)
- Role management (CRUD, permission assignment, role assignment)
- Invitation system (invite, accept, revoke)
- AcademicSession (Education product boundary)
- Frontend shells (marketing, education, platform-admin)
- Documentation system
- Integration tests

## Next Major Phase: Domain Layer
- Student, Guardian, StudentGuardian
- StaffMember, StaffPosition, StaffBranchAssignment
- Education-specific dashboard

## Future Phases
- Classes
- Fees
- Attendance
- Timetable
- Reports
- Billing/Subscriptions
