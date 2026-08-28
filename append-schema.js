const fs = require('fs');
let code = fs.readFileSync('packages/database/prisma/schema.prisma', 'utf8');

const newModels = `
// ============================================
// LAYER 3C: SUBJECTS & TEACHING
// ============================================

enum SubjectOfferingType {
  SCHOOL
  TUITION
}

enum SubjectOfferingStatus {
  ACTIVE
  INACTIVE
  ARCHIVED
}

model Subject {
  id             String @id @default(uuid()) @db.Uuid
  organizationId String @db.Uuid

  name        String
  code        String
  description String?

  isActive   Boolean   @default(true)
  archivedAt DateTime?

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  organization Organization      @relation(fields: [organizationId], references: [id])
  offerings    SubjectOffering[]

  @@unique([organizationId, code])
  @@index([organizationId])
}

model SubjectOffering {
  id             String @id @default(uuid()) @db.Uuid
  organizationId String @db.Uuid

  subjectId    String                @db.Uuid
  offeringType SubjectOfferingType

  status     SubjectOfferingStatus @default(ACTIVE)
  archivedAt DateTime?

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  organization Organization @relation(fields: [organizationId], references: [id])
  subject      Subject      @relation(fields: [subjectId], references: [id])

  schoolOffering  SchoolSubjectOffering?
  tuitionOffering TuitionSubjectOffering?

  teachingAssignments TeachingAssignment[]

  @@index([organizationId])
  @@index([subjectId])
}

model SchoolSubjectOffering {
  id                String @id @default(uuid()) @db.Uuid
  organizationId    String @db.Uuid

  subjectOfferingId String @unique @db.Uuid
  sectionId         String @db.Uuid

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  organization    Organization    @relation(fields: [organizationId], references: [id])
  subjectOffering SubjectOffering @relation(fields: [subjectOfferingId], references: [id])
  section         Section         @relation(fields: [sectionId], references: [id])

  @@index([organizationId])
  @@index([sectionId])
}

model TuitionSubjectOffering {
  id                String @id @default(uuid()) @db.Uuid
  organizationId    String @db.Uuid

  subjectOfferingId String @unique @db.Uuid
  batchId           String @db.Uuid

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  organization    Organization    @relation(fields: [organizationId], references: [id])
  subjectOffering SubjectOffering @relation(fields: [subjectOfferingId], references: [id])
  batch           Batch           @relation(fields: [batchId], references: [id])

  @@index([organizationId])
  @@index([batchId])
}

model TeachingAssignment {
  id                String @id @default(uuid()) @db.Uuid
  organizationId    String @db.Uuid

  subjectOfferingId String @db.Uuid
  staffMemberId     String @db.Uuid

  startDate DateTime  @db.Date
  endDate   DateTime? @db.Date

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  organization    Organization    @relation(fields: [organizationId], references: [id])
  subjectOffering SubjectOffering @relation(fields: [subjectOfferingId], references: [id])
  staffMember     StaffMember     @relation(fields: [staffMemberId], references: [id])

  @@index([organizationId])
  @@index([subjectOfferingId])
  @@index([staffMemberId])
}
`;

if (!code.includes("model Subject ")) {
  code = code + "\n" + newModels;
  
  // Also add inverse relations
  code = code.replace(/model Section \{([\s\S]*?)(@@unique\[)/, "model Section {$1  subjectOfferings SchoolSubjectOffering[]\n\n  $2");
  code = code.replace(/model Batch \{([\s\S]*?)(@@unique\[)/, "model Batch {$1  subjectOfferings TuitionSubjectOffering[]\n\n  $2");
  code = code.replace(/model StaffMember \{([\s\S]*?)(@@unique\[)/, "model StaffMember {$1  teachingAssignments TeachingAssignment[]\n\n  $2");
  
  fs.writeFileSync('packages/database/prisma/schema.prisma', code, 'utf8');
}
