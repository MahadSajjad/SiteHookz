import { z } from "zod";

export const createOrganizationSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  slug: z
    .string()
    .min(3)
    .max(48)
    .regex(/^[a-z0-9-]+$/, "Lowercase alphanumeric and hyphens only")
    .refine(
      (val) => !val.startsWith("-") && !val.endsWith("-"),
      "Cannot start or end with hyphen",
    )
    .refine((val) => !val.includes("--"), "Cannot contain consecutive hyphens"),
  defaultLocale: z.string().default("en-US"),
  timezone: z.string().default("UTC"),
  currency: z.string().default("USD"),
});

export type CreateOrganizationDto = z.infer<typeof createOrganizationSchema>;
