const fs = require("fs");

let schema = fs.readFileSync("packages/database/prisma/schema.prisma", "utf8");

// Insert models at the bottom
const models = `
// ============================================
// LAYER 3B: ACADEMIC STRUCTURE & ENROLLMENT
// ============================================

enum SectionStatus {
  ACTIVE
  INACTIVE
  ARCHIVED
}

enum BatchStatus {
  PLANNED
  ACTIVE
  COMPLETED
  CANCELLED
  ARCHIVED
}

enum EnrollmentPlacementType {
  SCHOOL
  TUITION
}

enum EnrollmentStatus {
  PLANNED
  ACTIVE
  COMPLETED
  WITHDRAWN
  CANCELLED
}

enum EnrollmentEndReason {
  COMPLETED
  PROMOTED
  TRANSFERRED
  WITHDRAWN
  CANCELLED
  CORRECTED
}

model ClassLevel {
  id             String    @id @default(uuid()) @db.Uuid
  organizationId String    @db.Uuid
  
  name           String
  code           String
  sortOrder      Int       @default(0)
  
  isActive       Boolean   @default(true)
  archivedAt     DateTime?

  createdAt      DateTime  @default(now())
  updatedAt      DateTime  @updatedAt

  organization   Organization @relation(fields: [organizationId], references: [id])
  sections       Section[]
  
  @@unique([organizationId, code])
}

model Section {
  id                String    @id @default(uuid()) @db.Uuid
  organizationId    String    @db.Uuid
  academicSessionId String    @db.Uuid
  branchId          String    @db.Uuid
  classLevelId      String    @db.Uuid
  
  name              String
  code              String
  capacity          Int?
  
  status            SectionStatus @default(ACTIVE)
  archivedAt        DateTime?
  
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt

  organization      Organization    @relation(fields: [organizationId], references: [id])
  academicSession   AcademicSession @relation(fields: [academicSessionId], references: [id])
  branch            Branch          @relation(fields: [branchId], references: [id])
  classLevel        ClassLevel      @relation(fields: [classLevelId], references: [id])
  schoolPlacements  SchoolEnrollmentPlacement[]

  @@unique([organizationId, academicSessionId, branchId, classLevelId, code])
}

model Course {
  id             String    @id @default(uuid()) @db.Uuid
  organizationId String    @db.Uuid

  name           String
  code           String
  description    String?

  isActive       Boolean   @default(true)
  archivedAt     DateTime?

  createdAt      DateTime  @default(now())
  updatedAt      DateTime  @updatedAt

  organization   Organization @relation(fields: [organizationId], references: [id])
  batches        Batch[]

  @@unique([organizationId, code])
}

model Batch {
  id                String    @id @default(uuid()) @db.Uuid
  organizationId    String    @db.Uuid
  courseId          String    @db.Uuid
  branchId          String    @db.Uuid
  academicSessionId String?   @db.Uuid

  name              String
  code              String
  startDate         DateTime  @db.Date
  endDate           DateTime? @db.Date
  capacity          Int?

  status            BatchStatus @default(PLANNED)
  archivedAt        DateTime?

  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt

  organization      Organization     @relation(fields: [organizationId], references: [id])
  course            Course           @relation(fields: [courseId], references: [id])
  branch            Branch           @relation(fields: [branchId], references: [id])
  academicSession   AcademicSession? @relation(fields: [academicSessionId], references: [id])
  tuitionPlacements TuitionEnrollmentPlacement[]

  @@unique([organizationId, courseId, branchId, academicSessionId, code])
}

model StudentEnrollment {
  id             String    @id @default(uuid()) @db.Uuid
  organizationId String    @db.Uuid
  studentId      String    @db.Uuid
  branchId       String    @db.Uuid

  placementType  EnrollmentPlacementType
  status         EnrollmentStatus @default(ACTIVE)

  startDate      DateTime  @db.Date
  endDate        DateTime? @db.Date
  endReason      EnrollmentEndReason?

  createdAt      DateTime  @default(now())
  updatedAt      DateTime  @updatedAt

  organization   Organization @relation(fields: [organizationId], references: [id])
  student        Student      @relation(fields: [studentId], references: [id])
  branch         Branch       @relation(fields: [branchId], references: [id])

  schoolPlacement  SchoolEnrollmentPlacement?
  tuitionPlacement TuitionEnrollmentPlacement?

  @@index([organizationId])
  @@index([studentId, status])
  @@index([organizationId, branchId])
}

model SchoolEnrollmentPlacement {
  id             String    @id @default(uuid()) @db.Uuid
  organizationId String    @db.Uuid
  enrollmentId   String    @db.Uuid @unique
  sectionId      String    @db.Uuid
  rollNumber     String?

  createdAt      DateTime  @default(now())
  updatedAt      DateTime  @updatedAt

  organization   Organization      @relation(fields: [organizationId], references: [id])
  enrollment     StudentEnrollment @relation(fields: [enrollmentId], references: [id])
  section        Section           @relation(fields: [sectionId], references: [id])

  @@index([organizationId])
  @@index([sectionId])
}

model TuitionEnrollmentPlacement {
  id             String    @id @default(uuid()) @db.Uuid
  organizationId String    @db.Uuid
  enrollmentId   String    @db.Uuid @unique
  batchId        String    @db.Uuid

  createdAt      DateTime  @default(now())
  updatedAt      DateTime  @updatedAt

  organization   Organization      @relation(fields: [organizationId], references: [id])
  enrollment     StudentEnrollment @relation(fields: [enrollmentId], references: [id])
  batch          Batch             @relation(fields: [batchId], references: [id])

  @@index([organizationId])
  @@index([batchId])
}

`;

schema += models;

// Append to Organization
schema = schema.replace(
  /academicSessions\s+AcademicSession\[\]/g,
  `academicSessions AcademicSession[]
  classLevels ClassLevel[]
  sections Section[]
  courses Course[]
  batches Batch[]
  studentEnrollments StudentEnrollment[]
  schoolPlacements SchoolEnrollmentPlacement[]
  tuitionPlacements TuitionEnrollmentPlacement[]`,
);

// Append to AcademicSession
schema = schema.replace(
  /organization\s+Organization\s+@relation\(fields:\s*\[organizationId\],\s*references:\s*\[id\]\)/g,
  `organization Organization @relation(fields: [organizationId], references: [id])
  sections Section[]
  batches Batch[]`,
);

// Append to Branch
schema = schema.replace(
  /studentAdmissionSequences\s+StudentAdmissionSequence\[\]/g,
  `studentAdmissionSequences StudentAdmissionSequence[]
  sections Section[]
  batches Batch[]
  studentEnrollments StudentEnrollment[]`,
);

// Append to Student
schema = schema.replace(
  /studentGuardians\s+StudentGuardian\[\]/g,
  `studentGuardians StudentGuardian[]
  studentEnrollments StudentEnrollment[]`,
);

fs.writeFileSync("packages/database/prisma/schema.prisma", schema, "utf8");
