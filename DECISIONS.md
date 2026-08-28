# Architectural Decision Records (ADRs)

**ADR-001: PostgreSQL as Primary Database**

- **Decision:** Use PostgreSQL
- **Reasoning:** Relational integrity for SaaS, strong constraint support, UUID, JSON, partial indexes, case-insensitive indexes, mature ecosystem
- **Rejected:** MongoDB (no relational integrity for multi-tenant SaaS)

**ADR-002: Prisma as ORM**

- **Decision:** Use Prisma with custom SQL migrations where needed
- **Reasoning:** Type-safe queries, schema-first, migration system, good DX
- **Note:** Custom SQL used for partial unique indexes and case-insensitive email

**ADR-003: TypeScript Strict Mode**

- **Decision:** Strict TypeScript everywhere
- **Reasoning:** Catch errors at compile time, enforce type safety across monorepo

**ADR-004: pnpm Monorepo with Turborepo**

- **Decision:** pnpm workspaces + Turborepo
- **Reasoning:** Efficient disk usage, strict dependency isolation, fast builds with caching
- **Rejected:** Yarn workspaces, Lerna, Nx

**ADR-005: Modular Monolith Backend**

- **Decision:** NestJS modular monolith (not microservices)
- **Reasoning:** Simpler deployment, shared transactions, easier refactoring. Can extract services later if needed.
- **Rejected:** Microservices (premature complexity)

**ADR-006: Multi-Product Architecture**

- **Decision:** Platform Core + Product modules with strict dependency direction
- **Reasoning:** Organization/Branch/Auth/Permissions are reusable across products. Products own their domain.
- **Rule:** Platform MUST NOT import any product. Products import Platform.

**ADR-007: Organization as Product-Agnostic Tenant**

- **Decision:** Organization model has no product-specific fields (no organizationType)
- **Reasoning:** Organization is the SaaS tenant container. Product classification (SCHOOL, GYM, etc.) belongs to product-specific profile models.
- **Implementation:** EducationOrganizationProfile (institutionType: SCHOOL | TUITION_CENTER)

**ADR-008: Wildcard Organization Subdomains**

- **Decision:** Tenant URL pattern is <slug>.sitehookz.com
- **Reasoning:** Clean tenant isolation, branded URLs, scalable
- **Reserved:** www, api, admin, app, auth, mail, smtp, cdn, status, help, support, billing, docs, static, assets, system, root, superadmin, platform

**ADR-009: Branch as Platform Concept**

- **Decision:** Branch lives in Platform Core, not Education
- **Reasoning:** Physical/operational branches are universal across products (Gym branches, POS locations, etc.)
- **Terminology:** Internal always "Branch". Education displays "Campus" for schools.

**ADR-010: AcademicSession in Education Product**

- **Decision:** AcademicSession belongs to Education product boundary, not Platform
- **Reasoning:** Academic sessions are education-specific. POS/Gym don't need them.

**ADR-011: Permission-Based Authorization (namespace.resource.action)**

- **Decision:** Permissions use namespace.resource.action format
- **Reasoning:** Prevents collisions across products. platform.branches.create vs gym.memberships.create
- **Never:** Hardcode role checks (if role === 'admin')

**ADR-012: UserAccount Separate from Domain Persons**

- **Decision:** UserAccount is pure authentication identity. Student/Guardian/StaffMember are separate domain entities linked later.
- **Reasoning:** One person may be both a parent and a staff member. Authentication and business identity must be decoupled.

**ADR-013: Archive/Soft Delete Philosophy**

- **Decision:** Business records use archivedAt soft delete. No physical deletion through normal endpoints.
- **Reasoning:** Audit trail, data recovery, SaaS data retention requirements.

**ADR-014: Platform vs Product Dependency Direction**

- **Decision:** Products depend on Platform. Platform never depends on products.
- **Reasoning:** Adding a new product must not modify Platform Core or existing products.
- **Enforcement:** Import rules + code review + directory structure.

**ADR-015: Refresh Token Security**

- **Decision:** Rotating refresh tokens in HttpOnly secure cookies. Store SHA-256 hash in DB.
- **Reasoning:** Prevents XSS token theft. Rotation detects reuse. Hash prevents DB breach exposure.
- **Rejected:** localStorage (XSS vulnerable), plaintext storage (DB breach risk)

**ADR-016: Education Role Templates in Product Package**

- **Decision:** Education-specific roles (Principal, Instructor, etc.) defined in products/education/
- **Reasoning:** Platform doesn't know what a Principal is. Each product defines its own role templates.
- **Platform roles:** Organization Owner, Organization Administrator, Branch Administrator

**ADR-017: Case-Insensitive Email with PostgreSQL Index**

- **Decision:** Normalize email in application (trim + lowercase) AND enforce with PostgreSQL LOWER() unique index
- **Reasoning:** Belt-and-suspenders. Application normalization for consistency, DB index for integrity.

**ADR-018: Future Student Admission Number Format**

- **Decision:** Students will have UUID + human-facing admission number (FSD-{BRANCH}-{SEQ})
- **Reasoning:** Immutable admission number survives branch transfers. Internal UUID for foreign keys.
- **Note:** Not implemented yet. Documented for future reference.

**ADR-019: Jest for API, Vitest for Frontend**

- **Decision:** Jest + Supertest for NestJS API tests. Vitest for frontend + shared packages.
- **Reasoning:** NestJS has mature Jest integration. Vitest is faster for Vite-based apps. Unified pnpm test command works.

**ADR-020: API Versioning with Product Namespaces**

- **Decision:** /api/v1/ prefix. Products under /api/v1/{product}/
- **Reasoning:** Prevents route collisions. Clear ownership. /api/v1/education/academic-sessions vs /api/v1/gym/memberships
