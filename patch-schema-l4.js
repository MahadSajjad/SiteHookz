const fs = require('fs');

let c = fs.readFileSync('packages/database/prisma/schema.prisma', 'utf8');

function injectInModel(modelName, newFields) {
  const regex = new RegExp(`(model ${modelName} \\{[\\s\\S]*?\\n)(\\})`);
  c = c.replace(regex, `$1  ${newFields}\n$2`);
}

injectInModel('Organization', `attendanceSessions AttendanceSession[]
  schoolAttendanceContexts SchoolAttendanceContext[]
  tuitionAttendanceContexts TuitionAttendanceContext[]
  studentAttendanceRecords StudentAttendanceRecord[]`);

injectInModel('Branch', `attendanceSessions AttendanceSession[]`);
injectInModel('Section', `schoolAttendanceContexts SchoolAttendanceContext[]`);
injectInModel('Batch', `tuitionAttendanceContexts TuitionAttendanceContext[]`);
injectInModel('SubjectOffering', `schoolAttendanceContexts SchoolAttendanceContext[]\n  tuitionAttendanceContexts TuitionAttendanceContext[]`);
injectInModel('StudentEnrollment', `attendanceRecords StudentAttendanceRecord[]`);

c += `
// ============================================
// LAYER 4: STUDENT ATTENDANCE
// ============================================

enum AttendanceMode {
  SCHOOL
  TUITION
}
enum AttendanceSessionStatus {
  DRAFT
  FINALIZED
  CANCELLED
}
enum StudentAttendanceStatus {
  PRESENT
  ABSENT
  LATE
  EXCUSED
}
model AttendanceSession {
  id String @id @default(uuid()) @db.Uuid
  organizationId String @db.Uuid
  branchId String @db.Uuid
  mode AttendanceMode
  attendanceDate DateTime @db.Date
  occurrenceNumber Int @default(1)
  note String?
  status AttendanceSessionStatus @default(DRAFT)
  finalizedAt DateTime?
  finalizedByMembershipId String? @db.Uuid
  cancelledAt DateTime?
  cancelledByMembershipId String? @db.Uuid
  createdByMembershipId String @db.Uuid
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  organization Organization @relation(fields: [organizationId], references: [id])
  branch Branch @relation(fields: [branchId], references: [id])
  schoolContext SchoolAttendanceContext?
  tuitionContext TuitionAttendanceContext?
  records StudentAttendanceRecord[]
  @@index([organizationId])
  @@index([branchId])
  @@index([attendanceDate])
  @@index([status])
}
model SchoolAttendanceContext {
  id String @id @default(uuid()) @db.Uuid
  organizationId String @db.Uuid
  attendanceSessionId String @unique @db.Uuid
  sectionId String @db.Uuid
  subjectOfferingId String? @db.Uuid
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  organization Organization @relation(fields: [organizationId], references: [id])
  attendanceSession AttendanceSession @relation(fields: [attendanceSessionId], references: [id])
  section Section @relation(fields: [sectionId], references: [id])
  subjectOffering SubjectOffering? @relation(fields: [subjectOfferingId], references: [id])
  @@index([organizationId])
  @@index([sectionId])
}
model TuitionAttendanceContext {
  id String @id @default(uuid()) @db.Uuid
  organizationId String @db.Uuid
  attendanceSessionId String @unique @db.Uuid
  batchId String @db.Uuid
  subjectOfferingId String? @db.Uuid
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  organization Organization @relation(fields: [organizationId], references: [id])
  attendanceSession AttendanceSession @relation(fields: [attendanceSessionId], references: [id])
  batch Batch @relation(fields: [batchId], references: [id])
  subjectOffering SubjectOffering? @relation(fields: [subjectOfferingId], references: [id])
  @@index([organizationId])
  @@index([batchId])
}
model StudentAttendanceRecord {
  id String @id @default(uuid()) @db.Uuid
  organizationId String @db.Uuid
  attendanceSessionId String @db.Uuid
  studentEnrollmentId String @db.Uuid
  status StudentAttendanceStatus
  note String?
  markedByMembershipId String @db.Uuid
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  organization Organization @relation(fields: [organizationId], references: [id])
  attendanceSession AttendanceSession @relation(fields: [attendanceSessionId], references: [id])
  studentEnrollment StudentEnrollment @relation(fields: [studentEnrollmentId], references: [id])
  @@unique([attendanceSessionId, studentEnrollmentId])
  @@index([organizationId])
  @@index([studentEnrollmentId])
}
`;

fs.writeFileSync('packages/database/prisma/schema.prisma', c);
