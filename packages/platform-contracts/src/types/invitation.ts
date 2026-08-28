import { InvitationStatus } from "../enums";

export interface InvitationDto {
  id: string;
  organizationId: string;
  email: string;
  status: InvitationStatus;
  expiresAt: string;
  createdAt: string;
}
