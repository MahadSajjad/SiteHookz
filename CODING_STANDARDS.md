# Coding Standards

## TypeScript
- **Strict Mode**: Required.
- **Types**: Avoid `any`. Warn on use.
- **Unused variables**: Prohibited.
- **Explicit Returns**: Require explicit return types on services and controllers.

## Naming Conventions
- **Files**: `kebab-case` (e.g., `user-account.service.ts`).
- **Classes**: `PascalCase` (e.g., `UserAccountService`).
- **Functions/Variables**: `camelCase`.
- **Enums**: `PascalCase` for names, `UPPER_SNAKE_CASE` for values.
- **Permissions**: `namespace.resource.action`.
- **Database Columns**: `camelCase` (Prisma convention).

## File Organization
- Organize by feature/domain, not by type. 
- Collocate related files (e.g., module, controller, service in one directory).

## React Patterns
- **Components**: Functional components only. Use hooks for logic.
- **Logic**: No business logic inside components.
- **Server State**: Use TanStack Query.
- **Client State**: Use Zustand only for small, non-sensitive client state.
- **Forms**: `react-hook-form` and `zod` for validation.

## NestJS Patterns
- **Architecture**: `Controller → Service → Repository → Prisma`.
- **Controllers**: Handle HTTP layer. No DB calls.
- **Services**: Handle business logic.
- **Repositories**: Handle data access. No business logic.

## DTO & Validation
- Use Zod schemas for all inputs.
- Validate in the controller layer using `ZodValidationPipe`.
- Backend validation is authoritative.

## Prisma Usage
- No raw SQL string concatenation. Use parameterized queries.
- Use the Repository pattern for complex queries.
- **CRITICAL**: Always scope by `organizationId` for tenant data.

## Error Conventions
- Use `BusinessException` with specific error codes.
- Follow the `ApiErrorResponse` format.
- Never leak SQL/Prisma internals.
- Include `requestId` in error logs/responses.

## API Response Conventions
- `ApiSuccessResponse<T>` for success.
- `ApiErrorResponse` for errors.
- Ensure consistent pagination.

## Permission Conventions
- Use `@RequirePermission('namespace.resource.action')`.
- Never check role names directly (e.g., `if (role === 'admin')`).
- Backend is authoritative.

## i18n Requirements
- All user-facing text uses `t()`.
- Locales: `en`, `ur`. No hardcoded English.

## Accessibility
- Use semantic HTML.
- Ensure ARIA labels, keyboard navigation, and focus management.

## Responsive Requirements
- Mobile-first approach.
- Target Desktop, tablet, mobile. No fixed-width assumptions.

## Testing Expectations
- **Integration Tests**: Critical paths (tenancy, auth, authorization).
- **Unit Tests**: Business logic. No meaningless mock-only tests.

## Import Organization
- Order: External packages → Internal packages (`@sitehookz/*`) → Relative imports.
- Group imports by type.
