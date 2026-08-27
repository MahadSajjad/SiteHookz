# SiteHookz Project Plan

## Current Phase
**Foundation (Step 1 + Step 2) — COMPLETED**

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
