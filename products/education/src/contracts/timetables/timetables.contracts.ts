import { z } from "zod";

export const TimetableScheduleType = z.enum(["SCHOOL", "TUITION"]);
export const TimetableScheduleStatus = z.enum([
  "DRAFT",
  "PUBLISHED",
  "ARCHIVED",
]);
export const TimetableDay = z.enum([
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
  "SUNDAY",
]);

export const TimetableEntrySchema = z.object({
  id: z.string().uuid(),
  organizationId: z.string().uuid(),
  timetableScheduleId: z.string().uuid(),
  subjectOfferingId: z.string().uuid(),
  teachingAssignmentId: z.string().uuid().nullable(),
  dayOfWeek: TimetableDay,
  startMinute: z.number().int().min(0).max(1439),
  endMinute: z.number().int().min(1).max(1440),
  note: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type TimetableEntry = z.infer<typeof TimetableEntrySchema>;

export const TimetableScheduleSchema = z.object({
  id: z.string().uuid(),
  organizationId: z.string().uuid(),
  branchId: z.string().uuid(),
  scheduleType: TimetableScheduleType,
  name: z.string(),
  effectiveFrom: z.string(),
  effectiveTo: z.string().nullable(),
  status: TimetableScheduleStatus,
  publishedAt: z.string().nullable(),
  publishedByMembershipId: z.string().uuid().nullable(),
  archivedAt: z.string().nullable(),
  archivedByMembershipId: z.string().uuid().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type TimetableSchedule = z.infer<typeof TimetableScheduleSchema>;

export const TimetableDetailSchema = z.object({
  schedule: TimetableScheduleSchema,
  entries: z.array(TimetableEntrySchema),
  context: z.object({
    section: z.any().optional(),
    classLevel: z.any().optional(),
    batch: z.any().optional(),
    course: z.any().optional(),
    branch: z.any().optional(),
    academicSession: z.any().optional(),
  }),
});
export type TimetableDetail = z.infer<typeof TimetableDetailSchema>;

export const CreateSchoolTimetableSchema = z.object({
  name: z.string().min(1, "Name is required"),
  effectiveFrom: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), "Invalid date format"),
  effectiveTo: z
    .string()
    .nullable()
    .optional()
    .refine((val) => !val || !isNaN(Date.parse(val)), "Invalid date format"),
});
export type CreateSchoolTimetableDto = z.infer<
  typeof CreateSchoolTimetableSchema
>;

export const CreateTuitionTimetableSchema = CreateSchoolTimetableSchema;
export type CreateTuitionTimetableDto = z.infer<
  typeof CreateTuitionTimetableSchema
>;

export const CreateTimetableEntrySchema = z.object({
  subjectOfferingId: z.string().uuid(),
  teachingAssignmentId: z.string().uuid().nullable().optional(),
  dayOfWeek: TimetableDay,
  startMinute: z.number().int().min(0).max(1439),
  endMinute: z.number().int().min(1).max(1440),
  note: z.string().nullable().optional(),
});
export type CreateTimetableEntryDto = z.infer<
  typeof CreateTimetableEntrySchema
>;

export const UpdateTimetableEntrySchema = CreateTimetableEntrySchema.partial();
export type UpdateTimetableEntryDto = z.infer<
  typeof UpdateTimetableEntrySchema
>;

export const TimetableConflictSchema = z.object({
  type: z.enum(["CONTAINER_CONFLICT", "TEACHER_CONFLICT"]),
  message: z.string(),
  conflictingEntryIds: z.array(z.string().uuid()),
});
export type TimetableConflict = z.infer<typeof TimetableConflictSchema>;
