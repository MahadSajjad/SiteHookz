# AI Agent Instructions for SiteHookz

**IMPORTANT: Read this file before making any code changes.**

## What SiteHookz Is

SiteHookz is a multi-product SaaS platform. The first product being built is **SiteHookz Education**. Future products will include Gym Management, POS, E-commerce, and other business SaaS applications. The **Organization** is the tenant root for all products.

## Current Product Scope

- **Education Product**: Only the Education product is currently implemented. It owns `AcademicSession` and `EducationOrganizationProfile`.
- **Platform Core**: Owns `Organization`, `Branch`, `UserAccount`, auth, memberships, roles, permissions, and invitations.

## Multi-Product Architecture

Strict boundaries exist between Platform Core and Products:

- Platform Core **MUST NOT** import Education (or any other product).
- Products import from the Platform Core.
- Each product adds its own domain models, permissions (`namespace.resource.action`), role templates, terminology, and i18n.

## Repository Boundaries

- `apps/api/src/platform/` — Platform Core modules
- `apps/api/src/products/education/` — Education product API
- `packages/*` — Shared reusable packages
- `products/education/` — Education product package (contracts, permissions, role templates)

## Authoritative Documentation Files

Before asking questions or making architectural decisions, consult:

- `PLAN.md`
- `MEMORY.md`
- `DECISIONS.md`
- `ARCHITECTURE.md`
- `DOMAIN_MODEL.md`
- `CODING_STANDARDS.md`
- `SECURITY.md`

## Rules for AI Agents

1. Read `AGENTS.md`, `MEMORY.md`, `DECISIONS.md`, `ARCHITECTURE.md`, and `CODING_STANDARDS.md` before coding.
2. Do not create one-off architectural patterns when an existing platform pattern exists.
3. Do not split meaningful features into unnecessary micro-components.
4. Do not create components that duplicate existing platform UI primitives.
5. Follow the `Controller → Service → Repository → Prisma` pattern.
6. All tenant-owned queries **MUST** include `organizationId`.
7. Use `@RequirePermission()` for authorization, never hardcode role checks.
8. Use `t()` for all user-facing text (i18n).
9. **Never** log passwords, tokens, hashes, or secrets.
10. **Never** store tokens in `localStorage`.

## Required Coding Workflow

1. Read documentation.
2. Understand existing patterns.
3. Implement following patterns.
4. Write tests.
5. Run typecheck + lint + tests.
6. Update documentation if architectural changes made.

## Definition of Done

- TypeScript strict mode passes.
- Lint passes.
- Tests pass.
- Build succeeds.
- Documentation updated.
- No `console.log` (use structured logger).
- No hardcoded strings (use i18n).
- No hardcoded colors (use theme tokens).
- Mobile responsive.
- Tenant isolation verified.
- Permissions checked.

## Security Requirements

See [SECURITY.md](SECURITY.md) for detailed requirements.

## i18n Requirements

- All user-facing text uses `t()`.
- Locales: `en`, `ur`.
- RTL support is required.

## Tenancy Rules

- `Organization` is the tenant root.
- The Organization `slug` generates the subdomain (e.g., `<slug>.sitehookz.com`).
- All queries must be scoped by `organizationId`.

## Permission Rules

- Format: `namespace.resource.action`.
- Enforced via `@RequirePermission` decorator.
- Branch-aware authorization is required where applicable.
