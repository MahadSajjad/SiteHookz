import { z } from "zod";

// Base Enums
export enum AttendanceMode {
  DAILY = "DAILY",
  SUBJECT = "SUBJECT",
}

export enum AttendanceSessionStatus {
  DRAFT = "DRAFT",
  FINALIZED = "FINALIZED",
  CANCELLED = "CANCELLED",
}

export enum StudentAttendanceStatus {
  PRESENT = "PRESENT",
  ABSENT = "ABSENT",
  LATE = "LATE",
  EXCUSED = "EXCUSED",
}

export interface AttendanceSession {
  id: string;
  organizationId: string;
  branchId: string;
  mode: AttendanceMode;
  attendanceDate: string;
  occurrenceNumber: number;
  status: AttendanceSessionStatus;
  note: string | null;
  createdByMembershipId: string;
  finalizedAt: string | null;
  finalizedByMembershipId: string | null;
  cancelledAt: string | null;
  cancelledByMembershipId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AttendanceSessionDetail extends AttendanceSession {
  branch: {
    id: string;
    name: string;
  };
  section?: {
    id: string;
    name: string;
  };
  batch?: {
    id: string;
    name: string;
  };
  classLevel?: {
    id: string;
    name: string;
  };
  course?: {
    id: string;
    name: string;
  };
  academicSession?: {
    id: string;
    name: string;
  };
  subject?: {
    id: string;
    name: string;
  };
}

export interface AttendanceRosterItem {
  studentId: string;
  studentEnrollmentId: string;
  admissionNumber: string;
  name: string;
  rollNumber?: string | null;
  existingStatus?: StudentAttendanceStatus | null;
  note?: string | null;
}

export interface StudentAttendanceRecord {
  id: string;
  attendanceSessionId: string;
  studentEnrollmentId: string;
  status: StudentAttendanceStatus;
  note: string | null;
  markedByMembershipId: string;
  markedAt: string;
}

export interface AttendanceHistoryItem {
  id: string;
  date: string;
  status: StudentAttendanceStatus;
  section?: {
    id: string;
    name: string;
  };
  classLevel?: {
    id: string;
    name: string;
  };
  batch?: {
    id: string;
    name: string;
  };
  course?: {
    id: string;
    name: string;
  };
  subject?: {
    id: string;
    name: string;
  };
  branch: {
    id: string;
    name: string;
  };
}

// Zod Schemas
export const CreateAttendanceSessionSchema = z.object({
  mode: z.nativeEnum(AttendanceMode),
  attendanceDate: z
    .string()
    .datetime({ offset: true })
    .or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)),
  subjectOfferingId: z.string().uuid().optional(),
  occurrenceNumber: z.number().int().min(1).optional(),
  note: z.string().max(500).optional().nullable(),
});

export type CreateAttendanceSession = z.infer<
  typeof CreateAttendanceSessionSchema
>;

export const StudentAttendanceRecordInputSchema = z.object({
  studentEnrollmentId: z.string().uuid(),
  status: z.nativeEnum(StudentAttendanceStatus),
  note: z.string().max(200).optional().nullable(),
});

export const BulkMarkAttendanceSchema = z.object({
  records: z.array(StudentAttendanceRecordInputSchema),
});

export type BulkMarkAttendance = z.infer<typeof BulkMarkAttendanceSchema>;
