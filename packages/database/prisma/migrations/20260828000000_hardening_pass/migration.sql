-- CreateEnum
CREATE TYPE "RevokeReason" AS ENUM ('LOGOUT', 'LOGOUT_ALL', 'PASSWORD_RESET', 'ROTATED', 'REPLAY_DETECTED', 'ADMIN_REVOKED');

-- AlterTable
ALTER TABLE "AuthSession" DROP COLUMN "revokeReason";
ALTER TABLE "AuthSession" ADD COLUMN "revokeReason" "RevokeReason";

-- CreateIndex
CREATE UNIQUE INDEX "OrganizationInvitationRoleAssignment_invitation_role_key" ON "OrganizationInvitationRoleAssignment"("invitationId", "roleId") WHERE "branchId" IS NULL;

-- CreateIndex
CREATE UNIQUE INDEX "OrganizationInvitationRoleAssignment_invitation_role_branch_key" ON "OrganizationInvitationRoleAssignment"("invitationId", "roleId", "branchId") WHERE "branchId" IS NOT NULL;
