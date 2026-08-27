# Prisma Migrations

After running the initial `prisma migrate dev`, you must add these custom partial unique indexes manually to the generated migration SQL file before applying it.

```sql
-- Partial unique index for organization-scoped role assignments (branchId IS NULL)
CREATE UNIQUE INDEX "RoleAssignment_membershipId_roleId_org_scope" 
  ON "RoleAssignment" ("membershipId", "roleId") 
  WHERE "branchId" IS NULL;

-- Partial unique index for branch-scoped role assignments (branchId IS NOT NULL)  
CREATE UNIQUE INDEX "RoleAssignment_membershipId_roleId_branchId_branch_scope" 
  ON "RoleAssignment" ("membershipId", "roleId", "branchId") 
  WHERE "branchId" IS NOT NULL;

-- Case-insensitive email uniqueness
CREATE UNIQUE INDEX "UserAccount_email_ci" ON "UserAccount" (LOWER("email"));
```
