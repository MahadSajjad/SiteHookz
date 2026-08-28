# Security Requirements

## Tenant Isolation

- **CRITICAL**: Every query must be scoped by `organizationId`.
- Never load by UUID alone for tenant data.
- Enforced by `TenantGuard`. Cross-tenant access is considered a critical vulnerability.

## Password Hashing

- Use Argon2id with recommended parameters.
- Never log password hashes.

## Token Security

- **Access token**: JWT, 15min expiry, Bearer header.
- **Refresh token**: Random bytes, SHA-256 hash stored in DB, HttpOnly secure cookie, 7 day expiry, rotation on use, revocation support.

## Secure Cookies

- Use `HttpOnly`, `Secure` (in production), `SameSite=Lax`, Domain scoped.

## Refresh Token Rotation

- On each refresh, the old session is revoked, and a new token is issued.
- Detects token reuse attacks.

## Invitation Token Hashing

- Generated via `crypto.randomBytes(32)`.
- SHA-256 hash stored in the database.
- Raw token sent via email only. Single-use.

## Authorization

- Permission-based, never role-name-based.
- Branch-aware.
- Enforced via the `@RequirePermission` decorator and `PermissionGuard`.

## CORS

- Whitelist specific origins.
- No wildcard in production.

## Rate Limiting

- Handled by NestJS Throttler.
- General endpoints: 60 req/min.
- Auth endpoints: 10 req/min.

## Environment Secrets

- `.env` must not be committed.
- `.env.example` provides placeholder values.
- Environment variables must be validated at startup.

## Log Redaction

- **Never log**: passwords, password hashes, tokens, refresh tokens, authorization headers, cookies, or secrets.

## Brute-Force Protection

- Apply rate limiting on login, register, forgot-password, and reset-password endpoints.

## Production vs Development Tenant Resolution

- **Production**: Uses hostname only.
- **Development**: Uses `X-Organization-Slug` header (MUST be explicitly enabled, impossible in production).

## Account/Membership Suspension

- A suspended `UserAccount` cannot authenticate.
- A suspended `OrganizationMembership` blocks access to the tenant.
- Use clear business error codes.

## Principle of Least Privilege

- System roles have conservative default permissions.
- Custom roles start with no permissions by default.

## Platform Admin Boundary

- Platform Admin is a SEPARATE security boundary.
- NOT an Organization Owner with extra permissions. Requires different authentication/authorization (future implementation).

## Email Enumeration Prevention

- `forgot-password` must return the same response regardless of whether the email exists.

## Session Revocation on Password Reset

- All auth sessions are instantly revoked when a user resets their password.

## Authentication & Token Security

- Refresh tokens MUST be cryptographically random and securely hashed before storage in \AuthSession\.
- Refresh tokens MUST be transmitted via \HttpOnly\ cookies, never exposed to JavaScript.
- Replaying a revoked refresh token MUST trigger immediate revocation of all user sessions.
- Password resets MUST revoke all active \AuthSession\s.
- Access tokens MUST be kept in memory by the client application.

## Tenant Isolation & Authorization

- The `X-SiteHookz-Organization` header is an untrusted tenant selector.
- `TenantGuard` enforces that the authenticated user possesses an `ACTIVE` `OrganizationMembership` for the requested tenant.
- Permissions are strictly namespaced (e.g. `platform.organization.read`) and verified against the user's `RoleAssignments` in the requested tenant.
- Branch-scoped permissions must evaluate the `branchId` constraint on the `RoleAssignment`.
- **Permission Escalation Ceiling**: A user assigning permissions to a custom role may only grant permissions they themselves possess at an equal or broader scope, unless they hold an explicit privileged grant capability (e.g. `platform.roles.manage_all`). Organization Owners act as the ultimate organization authority.

## Invitation Security

- Invitations use opaque, cryptographically random tokens (not JWTs).
- The raw token is emailed to the user, and only the SHA-256 hash is stored.
- Invitations are validated transactionally against the user's authenticated email to prevent hijacking.
