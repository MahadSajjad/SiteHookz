import { MembershipStatus } from "../enums";

export interface MembershipDto {
  id: string;
  organizationId: string;
  userAccountId: string;
  status: MembershipStatus;
  createdAt: string;
  updatedAt: string;
}
