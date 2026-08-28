const fs = require('fs');

let schema = fs.readFileSync('packages/database/prisma/schema.prisma', 'utf8');

// Strip off the Layer 3B section
const marker = '// ============================================\r\n// LAYER 3B';
const marker2 = '// ============================================\n// LAYER 3B';
let index = schema.indexOf(marker);
if (index === -1) index = schema.indexOf(marker2);
if (index !== -1) {
  schema = schema.substring(0, index);
}

// Now we need to remove all the garbage we added to Organization, AcademicSession, Branch, Student, UserAccount, etc.
// Basically, we can just remove these exact string lines:
const garbageLines = [
  'classLevels ClassLevel[]',
  'sections Section[]',
  'courses Course[]',
  'batches Batch[]',
  'studentEnrollments StudentEnrollment[]',
  'schoolPlacements SchoolEnrollmentPlacement[]',
  'tuitionPlacements TuitionEnrollmentPlacement[]',
  'sections                  Section[]',
  'batches                   Batch[]',
  'studentEnrollments        StudentEnrollment[]',
  'sections       Section[]',
  'batches        Batch[]'
];

let lines = schema.split('\n').map(l => l.replace('\r', ''));
lines = lines.filter(line => {
  const t = line.trim();
  return !garbageLines.includes(t);
});

// Now we add the relations exactly where they belong by finding the end of the models.
function insertIntoModel(modelName, relations) {
  let inModel = false;
  let braceDepth = 0;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.match(new RegExp(`^model\\s+${modelName}\\s+\\{`))) {
      inModel = true;
      braceDepth = 1;
      continue;
    }
    if (inModel) {
      if (line.includes('{')) braceDepth++;
      if (line.includes('}')) braceDepth--;
      if (braceDepth === 0) {
        // We are at the end of the model. Insert relations here.
        lines.splice(i, 0, ...relations.map(r => `  ${r}`));
        break;
      }
    }
  }
}

insertIntoModel('Organization', [
  'classLevels           ClassLevel[]',
  'sections              Section[]',
  'courses               Course[]',
  'batches               Batch[]',
  'studentEnrollments    StudentEnrollment[]',
  'schoolPlacements      SchoolEnrollmentPlacement[]',
  'tuitionPlacements     TuitionEnrollmentPlacement[]'
]);

insertIntoModel('Student', [
  'studentEnrollments StudentEnrollment[]'
]);

insertIntoModel('Branch', [
  'sections           Section[]',
  'batches            Batch[]',
  'studentEnrollments StudentEnrollment[]'
]);

insertIntoModel('AcademicSession', [
  'sections Section[]',
  'batches  Batch[]'
]);

// Append Layer 3B
const layer3B = `
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

fs.writeFileSync('packages/database/prisma/schema.prisma', lines.join('\n') + layer3B, 'utf8');
