const fs = require('fs');
const path = require('path');

const schemaPath = path.join(__dirname, 'packages', 'database', 'prisma', 'schema.prisma');
let schema = fs.readFileSync(schemaPath, 'utf8');

// Inject relations into existing models
function injectRelation(modelName, relationStr) {
  const modelRegex = new RegExp(`(model ${modelName} \\{[^}]*)(\\})`, 'g');
  schema = schema.replace(modelRegex, `$1  ${relationStr}\n$2`);
}

injectRelation('Organization', 'gradingScales GradingScale[]\n  reportCards ReportCard[]');
injectRelation('AcademicSession', 'reportCards ReportCard[]');
injectRelation('StudentEnrollment', 'reportCards ReportCard[]');
injectRelation('Section', 'reportCards ReportCard[]');
injectRelation('Batch', 'reportCards ReportCard[]');
injectRelation('Subject', 'reportCardResults ReportCardSubjectResult[]');

const newModels = `
// -----------------------------------------
// LAYER 8: Report Cards & Academic Reports
// -----------------------------------------

enum GradingScaleStatus {
  DRAFT
  ACTIVE
  ARCHIVED
}

enum ReportCardStatus {
  DRAFT
  PUBLISHED
  ARCHIVED
}

enum ReportCardPassStatus {
  PASS
  FAIL
  EXEMPT
  NOT_GRADED
}

model GradingScale {
  id              String             @id @default(uuid())
  organizationId  String
  name            String
  status          GradingScaleStatus @default(DRAFT)
  description     String?
  createdAt       DateTime           @default(now())
  updatedAt       DateTime           @updatedAt

  bands           GradingScaleBand[]

  organization    Organization       @relation(fields: [organizationId], references: [id], onDelete: Cascade)

  @@index([organizationId])
}

model GradingScaleBand {
  id              String       @id @default(uuid())
  gradingScaleId  String
  name            String
  code            String
  minimumPercentage Decimal    @db.Decimal(5, 2)
  isPassing       Boolean
  remarks         String?
  createdAt       DateTime     @default(now())
  updatedAt       DateTime     @updatedAt

  gradingScale    GradingScale @relation(fields: [gradingScaleId], references: [id], onDelete: Cascade)

  @@unique([gradingScaleId, code])
  @@index([gradingScaleId])
}

model ReportCard {
  id                String               @id @default(uuid())
  organizationId    String
  academicSessionId String
  studentEnrollmentId String
  sectionId         String?
  batchId           String?
  
  title             String
  periodStart       DateTime
  periodEnd         DateTime
  status            ReportCardStatus     @default(DRAFT)
  passStatus        ReportCardPassStatus @default(NOT_GRADED)
  
  totalObtainedMarks Decimal             @db.Decimal(8, 2)
  totalMaximumMarks  Decimal             @db.Decimal(8, 2)
  percentage         Decimal             @db.Decimal(5, 2)
  overallGradeCode   String?
  overallGradeName   String?
  remarks            String?
  
  publishedAt       DateTime?
  createdAt         DateTime             @default(now())
  updatedAt         DateTime             @updatedAt

  organization      Organization         @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  academicSession   AcademicSession      @relation(fields: [academicSessionId], references: [id], onDelete: Cascade)
  studentEnrollment StudentEnrollment    @relation(fields: [studentEnrollmentId], references: [id], onDelete: Cascade)
  section           Section?             @relation(fields: [sectionId], references: [id], onDelete: SetNull)
  batch             Batch?               @relation(fields: [batchId], references: [id], onDelete: SetNull)
  
  subjectResults    ReportCardSubjectResult[]

  @@index([organizationId])
  @@index([studentEnrollmentId])
  @@index([academicSessionId])
  @@index([sectionId])
  @@index([batchId])
}

model ReportCardSubjectResult {
  id                String       @id @default(uuid())
  reportCardId      String
  subjectId         String
  subjectName       String
  subjectCode       String
  
  obtainedMarks     Decimal      @db.Decimal(8, 2)
  maximumMarks      Decimal      @db.Decimal(8, 2)
  percentage        Decimal      @db.Decimal(5, 2)
  gradeCode         String?
  gradeName         String?
  isPassing         Boolean
  
  isExempt          Boolean      @default(false)
  isAbsent          Boolean      @default(false)
  
  remarks           String?
  createdAt         DateTime     @default(now())
  updatedAt         DateTime     @updatedAt

  reportCard        ReportCard   @relation(fields: [reportCardId], references: [id], onDelete: Cascade)
  subject           Subject      @relation(fields: [subjectId], references: [id], onDelete: Cascade)

  @@unique([reportCardId, subjectId])
  @@index([reportCardId])
}
`;

fs.writeFileSync(schemaPath, schema + newModels, 'utf8');
console.log('Schema patched.');
