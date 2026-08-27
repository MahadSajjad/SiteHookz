export interface LoginRequestDto {
  email: string;
  passwordHash: string; // Plain password at client, but hashed for transmission logic or just password string based on impl. Usually it's password.
}
