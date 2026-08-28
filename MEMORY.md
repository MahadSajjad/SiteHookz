# Project Memory & Core Context

This file contains confirmed decisions and long-lived context for the SiteHookz platform.

## Platform & Architecture Context

- **SiteHookz** is a multi-product SaaS platform.
- **First product** is SiteHookz Education.
- **Frontend Stack**: React + TypeScript + Vite + Tailwind CSS + TanStack Query + React Hook Form + Zod + Zustand (non-sensitive state only).
- **Backend Stack**: NestJS + TypeScript (modular monolith).
- **Database**: PostgreSQL + Prisma ORM.
- **Repository**: pnpm monorepo with Turborepo.
- **Node Environment**: Node 22 LTS, pnpm 10, TypeScript 5.7.
- **API Versioning**: `/api/v1/`.
  - Education API namespace: `/api/v1/education/*`.
- **Testing**: Jest + Supertest for API tests, Vitest for frontend/packages.

## Tenancy & Organization

- **Tenant root** is `Organization` (product-agnostic).
- Organization `slug` generates subdomain: `<slug>.sitehookz.com`.
- Organization has NO `organizationType` — classification belongs to product profiles (e.g., `EducationOrganizationProfile`).
- **Internal term**: `Branch` (Education may display "Campus" for schools).
- **Platform Core** MUST NOT depend on Education (or any product).

## Domain Terminology & Future Plans

- `AcademicSession` (Education-specific).
- `Student` remains Student (future).
- `Guardian` replaces Parent-only architecture (future).
- `StaffMember` will replace separate Teacher identity (future).
- Students will have immutable UUID + human-facing admission number (`FSD-{BRANCH}-{SEQ}`).

## Security & Auth

- **UserAccount** is separate from domain persons (Student, StaffMember, Guardian). One person may have multiple roles across domains.
- **Auth**: short-lived JWT access token + rotating HttpOnly refresh cookie.
- **Permissions**: format `namespace.resource.action` (e.g., `platform.branches.create`, `education.academic_sessions.read`).
- **Authorization**: Permission-based authorization (never hardcode role checks).
- Roles belong to organizations, not globally.
- System roles provisioned per-organization during creation.
- Education role templates (Principal, Instructor, etc.) defined in `products/education`.
- Platform admin is a separate security boundary.

## Localization (i18n)

- Supported Locales: `en`, `ur`.
- RTL (Right-to-Left) support is required.
