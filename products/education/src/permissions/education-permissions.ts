export const EDUCATION_SUBJECTS_PERMISSIONS = {
  READ: "education.subjects.read",
  CREATE: "education.subjects.create",
  UPDATE: "education.subjects.update",
  ARCHIVE: "education.subjects.archive",
  RESTORE: "education.subjects.restore",
} as const;

export const EDUCATION_SUBJECT_OFFERINGS_PERMISSIONS = {
  READ: "education.subject_offerings.read",
  CREATE: "education.subject_offerings.create",
  UPDATE: "education.subject_offerings.update",
  ARCHIVE: "education.subject_offerings.archive",
  RESTORE: "education.subject_offerings.restore",
} as const;

export const EDUCATION_ATTENDANCE_SESSIONS_PERMISSIONS = {
  READ: "education.attendance_sessions.read",
  CREATE: "education.attendance_sessions.create",
  UPDATE: "education.attendance_sessions.update",
  FINALIZE: "education.attendance_sessions.finalize",
  CANCEL: "education.attendance_sessions.cancel",
} as const;

export const EDUCATION_STUDENT_ATTENDANCE_PERMISSIONS = {
  READ: "education.student_attendance.read",
  MARK: "education.student_attendance.mark",
} as const;

export const EDUCATION_TIMETABLES_PERMISSIONS = {
  READ: "education.timetables.read",
  CREATE: "education.timetables.create",
  UPDATE: "education.timetables.update",
  PUBLISH: "education.timetables.publish",
  ARCHIVE: "education.timetables.archive",
} as const;

export const EDUCATION_TEACHING_ASSIGNMENTS_PERMISSIONS = {
  READ: "education.teaching_assignments.read",
  CREATE: "education.teaching_assignments.create",
  UPDATE: "education.teaching_assignments.update",
  END: "education.teaching_assignments.end",
} as const;

// Re-export old ones for compatibility until they are moved over.

