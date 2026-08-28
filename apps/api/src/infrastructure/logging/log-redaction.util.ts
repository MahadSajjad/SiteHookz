export const logRedactionKeys = [
  "password",
  "passwordHash",
  "token",
  "refreshToken",
  "authorization",
  "cookie",
];

export function redactSensitiveData(obj: any): any {
  if (!obj || typeof obj !== "object") return obj;

  if (Array.isArray(obj)) {
    return obj.map(redactSensitiveData);
  }

  const redacted = { ...obj };
  for (const key of Object.keys(redacted)) {
    if (
      logRedactionKeys.some((redactKey) =>
        key.toLowerCase().includes(redactKey.toLowerCase()),
      )
    ) {
      redacted[key] = "[REDACTED]";
    } else if (typeof redacted[key] === "object") {
      redacted[key] = redactSensitiveData(redacted[key]);
    }
  }
  return redacted;
}
