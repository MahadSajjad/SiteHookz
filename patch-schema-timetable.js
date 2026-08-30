const fs = require('fs');

let c = fs.readFileSync('packages/database/prisma/schema.prisma', 'utf8');

c = c.replace(
  /schoolAttendanceContexts SchoolAttendanceContext\[\]\n\n  @@unique/g,
  `schoolAttendanceContexts SchoolAttendanceContext[]
  schoolTimetableContexts  SchoolTimetableContext[]

  @@unique`
);

c = c.replace(
  /tuitionAttendanceContexts TuitionAttendanceContext\[\]\n\n  @@unique/g,
  `tuitionAttendanceContexts TuitionAttendanceContext[]
  tuitionTimetableContexts TuitionTimetableContext[]

  @@unique`
);

c = c.replace(
  /teachingAssignments       TeachingAssignment\[\]/g,
  `teachingAssignments       TeachingAssignment[]
  timetableEntries          TimetableEntry[]`
);

c = c.replace(
  /tuitionAttendanceContexts TuitionAttendanceContext\[\]/g,
  `tuitionAttendanceContexts TuitionAttendanceContext[]
  timetableEntries          TimetableEntry[]`
);

c += `
// ============================================
// LAYER 5: TIMETABLE & ACADEMIC SCHEDULING
// ============================================

enum TimetableScheduleType {
  SCHOOL
  TUITION
}

enum TimetableScheduleStatus {
  DRAFT
  PUBLISHED
  ARCHIVED
}

model TimetableSchedule {
  id             String @id @default(uuid()) @db.Uuid
  organizationId String @db.Uuid
  branchId       String @db.Uuid

  scheduleType TimetableScheduleType

  name String

  effectiveFrom DateTime  @db.Date
  effectiveTo   DateTime? @db.Date

  status TimetableScheduleStatus @default(DRAFT)

  publishedAt             DateTime?
  publishedByMembershipId String?   @db.Uuid

  archivedAt             DateTime?
  archivedByMembershipId String?   @db.Uuid

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  organization Organization @relation(fields: [organizationId], references: [id])
  branch       Branch       @relation(fields: [branchId], references: [id])

  schoolContext  SchoolTimetableContext?
  tuitionContext TuitionTimetableContext?
  entries        TimetableEntry[]

  @@index([organizationId])
  @@index([branchId])
  @@index([status])
  @@index([effectiveFrom])
  @@index([effectiveTo])
}

model SchoolTimetableContext {
  id             String @id @default(uuid()) @db.Uuid
  organizationId String @db.Uuid

  timetableScheduleId String @unique @db.Uuid
  sectionId           String @db.Uuid

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  organization      Organization      @relation(fields: [organizationId], references: [id])
  timetableSchedule TimetableSchedule @relation(fields: [timetableScheduleId], references: [id])
  section           Section           @relation(fields: [sectionId], references: [id])

  @@index([organizationId])
  @@index([sectionId])
}

model TuitionTimetableContext {
  id             String @id @default(uuid()) @db.Uuid
  organizationId String @db.Uuid

  timetableScheduleId String @unique @db.Uuid
  batchId             String @db.Uuid

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  organization      Organization      @relation(fields: [organizationId], references: [id])
  timetableSchedule TimetableSchedule @relation(fields: [timetableScheduleId], references: [id])
  batch             Batch             @relation(fields: [batchId], references: [id])

  @@index([organizationId])
  @@index([batchId])
}

enum TimetableDay {
  MONDAY
  TUESDAY
  WEDNESDAY
  THURSDAY
  FRIDAY
  SATURDAY
  SUNDAY
}

model TimetableEntry {
  id             String @id @default(uuid()) @db.Uuid
  organizationId String @db.Uuid

  timetableScheduleId String @db.Uuid

  subjectOfferingId    String  @db.Uuid
  teachingAssignmentId String? @db.Uuid

  dayOfWeek TimetableDay

  startMinute Int
  endMinute   Int

  note String?

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  organization       Organization       @relation(fields: [organizationId], references: [id])
  timetableSchedule  TimetableSchedule  @relation(fields: [timetableScheduleId], references: [id])
  subjectOffering    SubjectOffering    @relation(fields: [subjectOfferingId], references: [id])
  teachingAssignment TeachingAssignment? @relation(fields: [teachingAssignmentId], references: [id])

  @@index([organizationId])
  @@index([timetableScheduleId])
  @@index([dayOfWeek])
  @@index([subjectOfferingId])
  @@index([teachingAssignmentId])
}
`;

fs.writeFileSync('packages/database/prisma/schema.prisma', c);
