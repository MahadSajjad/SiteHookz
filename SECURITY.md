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
