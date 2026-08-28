import { RoleType, RoleScopeType } from "../enums";

export interface RoleDto {
  id: string;
  organizationId: string;
  name: string;
  key: string;
  type: RoleType;
  scopeType: RoleScopeType;
  createdAt: string;
  updatedAt: string;
}
