import { UserAccountStatus } from '../enums';

export interface UserAccountDto {
  id: string;
  email: string;
  status: UserAccountStatus;
  createdAt: string;
  updatedAt: string;
}
