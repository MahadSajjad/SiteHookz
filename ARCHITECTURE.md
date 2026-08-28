# SiteHookz Architecture

## Repository Structure

```text
sitehookz/
├── apps/
│   ├── api/                 # NestJS Backend API
│   │   └── src/
│   │       ├── platform/    # Platform Core modules
│   │       └── products/    # Product modules (e.g., education)
│   ├── education-web/       # Tenant App (Education)
│   ├── marketing-web/       # Public Site
│   ├── platform-admin-web/  # Internal Admin
│   └── worker/              # BullMQ Worker
├── packages/                # Shared libraries
│   ├── api-client/
│   ├── contracts/
│   ├── database/
│   ├── design-tokens/
│   ├── i18n/
│   ├── jobs/
│   └── permissions/
├── products/                # Product specific packages
│   └── education/           # Education contracts, permissions, role templates
├── infrastructure/          # Docker, K8s, Terraform
└── docs/                    # Architecture and developer docs
```

## Application Boundaries

- **marketing-web**: Public marketing pages.
- **education-web**: Main tenant application for the Education product.
- **platform-admin-web**: Internal administration app.
- **api**: NestJS backend modular monolith.
- **worker**: BullMQ background job processing.

## Product Boundaries

Platform Core is entirely decoupled from Products.
`Products` depend on `Platform Core`. `Platform Core` MUST NEVER depend on `Products`.

## Request Flow

```
Request
  → Helmet/CORS
  → RequestID Middleware
  → Rate Limiting
  → JWT Auth Guard
  → Tenant Guard
  → Permission Guard
  → Controller
  → Service
  → Repository
  → Prisma
  → PostgreSQL
```

## Tenant Resolution

- **Production**: Hostname extraction (e.g., `<slug>.sitehookz.com`).
- **Development**: Uses `X-Organization-Slug` header.
- **Reserved slugs**: `www`, `api`, `admin`, `app`, `auth`, `mail`, `smtp`, `cdn`, `status`, `help`, `support`, `billing`, `docs`, `static`, `assets`, `system`, `root`, `superadmin`, `platform`.
- Organization status is validated upon resolution.

## Auth Flow

- **Register**: Creates UserAccount.
- **Login**: Issues short-lived JWT access token & HttpOnly secure refresh cookie.
- **Refresh**: Token rotation strategy applied.
- **Logout**: Clears tokens and revokes session.

## Authorization Flow

1. **TenantGuard**: Loads user's memberships, role assignments, and permissions for the resolved tenant.
2. **PermissionGuard**: Checks against `@RequirePermission` metadata.
3. **Branch-Aware**: Evaluates scope (e.g., global organization access vs specific branch access).

## Database

- **PostgreSQL**: Primary data store.
- **Prisma**: ORM managing 15 core models.
- **Constraints**: Uses partial unique indexes and DB-level case-insensitive constraints.

## Redis

Used for BullMQ queues. In the future: caching and rate limiting state.

## BullMQ

- Queue architecture for background processing.
- Handles email queue and retry strategies.

## Frontend/API Relationship

- **React Frontend**: Communicates with the backend using `api-client` generated/shared types.
- **Auth Flow**: Relies on HttpOnly cookies, avoiding sensitive data in local storage.

## Production Hostname Model

- `<slug>.sitehookz.com`: Tenant instances.
- `sitehookz.com/www`: Marketing.
- `admin.sitehookz.com`: Platform admin.
- `api.sitehookz.com`: API.

## Local Development Tenant Strategy

Uses the `X-Organization-Slug` header **only in development mode**. This allows testing multi-tenant behavior locally without complex DNS configurations, but is securely disabled in production.

## Tenant Resolution Architecture

- Production API is centralized at \pi.sitehookz.com\.
- Frontend applications use <slug>.sitehookz.com (or similar) and extract the tenant slug.
- Frontend MUST send the \X-SiteHookz-Organization: <slug>\ header on all tenant-scoped requests.
- **SECURITY BOUNDARY**: The \X-SiteHookz-Organization\ header is an UNTRUSTED tenant selector. The \TenantGuard\ uses it to resolve the Organization, but MUST independently verify the authenticated \UserAccount\ has an \ACTIVE\ \OrganizationMembership\ before granting access.

## Authentication Architecture

- We use short-lived JWT access tokens and long-lived refresh tokens.
- Refresh tokens are cryptographically random hashes stored in the database (\AuthSession\).
- The refresh token is transmitted to the client strictly via a \HttpOnly\, \Secure\, \SameSite=lax\ cookie bound to the API domain path (\/api/v1/auth\).
- Access tokens are kept in memory by the client application and used as Bearer tokens.
- Password resets revoke all active \AuthSession\s for the user.

### Layer 3B Academic Structure & Student Enrollment Invariants

- **Placement Uniqueness**: The database constraints (e.g. `UNIQUE(enrollmentId)`) enforce a 1:1 mapping at the table level.
- **Polymorphic Exclusivity**: The exclusivity between `SCHOOL` and `TUITION` (a StudentEnrollment cannot have both) is a **transactional application invariant** maintained exclusively by `EnrollmentsService`.
- **Tuition Concurrency**: A student can have multiple active `TUITION` enrollments across different branches or batches simultaneously. Same-batch concurrency is prevented via `SELECT ... FOR UPDATE` serialization.
- **Student Authorization**: Read/update authorization for students uses **ANY** accessible active Enrollment rather than one arbitrary "current" branch.
- **Guardian Visibility**: Guardian listing visibility resolves strictly through authorized active Enrollment Branches of linked students.
