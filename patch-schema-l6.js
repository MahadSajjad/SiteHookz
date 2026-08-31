const fs = require('fs');

let c = fs.readFileSync('packages/database/prisma/schema.prisma', 'utf8');

function injectInModel(modelName, newFields) {
  const regex = new RegExp(`(model ${modelName} \\{[\\s\\S]*?\\n)(\\})`);
  c = c.replace(regex, `$1  ${newFields}\n$2`);
}

injectInModel('Organization', `feeHeads FeeHead[]
  feePlans FeePlan[]
  schoolFeePlanContexts SchoolFeePlanContext[]
  tuitionFeePlanContexts TuitionFeePlanContext[]
  feePlanItems FeePlanItem[]
  enrollmentFeePlanAssignments EnrollmentFeePlanAssignment[]
  feeCharges FeeCharge[]
  payments Payment[]
  paymentAllocations PaymentAllocation[]
  paymentReceiptSequences PaymentReceiptSequence[]`);

injectInModel('AcademicSession', `schoolFeePlanContexts SchoolFeePlanContext[]`);
injectInModel('Branch', `schoolFeePlanContexts SchoolFeePlanContext[]
  feeCharges FeeCharge[]
  payments Payment[]
  paymentReceiptSequences PaymentReceiptSequence[]`);
injectInModel('ClassLevel', `schoolFeePlanContexts SchoolFeePlanContext[]`);
injectInModel('Batch', `tuitionFeePlanContexts TuitionFeePlanContext[]`);
injectInModel('StudentEnrollment', `enrollmentFeePlanAssignments EnrollmentFeePlanAssignment[]
  feeCharges FeeCharge[]`);
injectInModel('Student', `payments Payment[]`);

c += `
// ============================================
// LAYER 6: FEES & PAYMENTS
// ============================================

enum FeePlanType {
  SCHOOL
  TUITION
}

enum FeePlanStatus {
  DRAFT
  ACTIVE
  ARCHIVED
}

enum FeeFrequency {
  ONE_TIME
  MONTHLY
}

enum PaymentMethod {
  CASH
  BANK_TRANSFER
  CARD
  OTHER
}

enum PaymentStatus {
  POSTED
  VOIDED
}

model FeeHead {
  id String @id @default(uuid()) @db.Uuid
  organizationId String @db.Uuid
  name String
  code String
  description String?
  isActive Boolean @default(true)
  archivedAt DateTime?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  organization Organization @relation(fields: [organizationId], references: [id])
  feePlanItems FeePlanItem[]

  @@unique([organizationId, code])
  @@index([organizationId])
  @@index([isActive])
}

model FeePlan {
  id String @id @default(uuid()) @db.Uuid
  organizationId String @db.Uuid
  name String
  planType FeePlanType
  status FeePlanStatus @default(DRAFT)
  defaultDueDay Int?
  archivedAt DateTime?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  organization Organization @relation(fields: [organizationId], references: [id])
  schoolContext SchoolFeePlanContext?
  tuitionContext TuitionFeePlanContext?
  items FeePlanItem[]
  assignments EnrollmentFeePlanAssignment[]

  @@index([organizationId])
  @@index([status])
  @@index([planType])
}

model SchoolFeePlanContext {
  id String @id @default(uuid()) @db.Uuid
  organizationId String @db.Uuid
  feePlanId String @unique @db.Uuid
  academicSessionId String @db.Uuid
  branchId String @db.Uuid
  classLevelId String @db.Uuid
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  organization Organization @relation(fields: [organizationId], references: [id])
  feePlan FeePlan @relation(fields: [feePlanId], references: [id])
  academicSession AcademicSession @relation(fields: [academicSessionId], references: [id])
  branch Branch @relation(fields: [branchId], references: [id])
  classLevel ClassLevel @relation(fields: [classLevelId], references: [id])

  @@index([branchId])
  @@index([academicSessionId])
  @@index([classLevelId])
}

model TuitionFeePlanContext {
  id String @id @default(uuid()) @db.Uuid
  organizationId String @db.Uuid
  feePlanId String @unique @db.Uuid
  batchId String @db.Uuid
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  organization Organization @relation(fields: [organizationId], references: [id])
  feePlan FeePlan @relation(fields: [feePlanId], references: [id])
  batch Batch @relation(fields: [batchId], references: [id])

  @@index([batchId])
}

model FeePlanItem {
  id String @id @default(uuid()) @db.Uuid
  organizationId String @db.Uuid
  feePlanId String @db.Uuid
  feeHeadId String @db.Uuid
  amount Decimal @db.Decimal(14, 2)
  frequency FeeFrequency
  description String?
  sortOrder Int @default(0)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  organization Organization @relation(fields: [organizationId], references: [id])
  feePlan FeePlan @relation(fields: [feePlanId], references: [id])
  feeHead FeeHead @relation(fields: [feeHeadId], references: [id])
  feeCharges FeeCharge[]

  @@unique([feePlanId, feeHeadId, frequency])
}

model EnrollmentFeePlanAssignment {
  id String @id @default(uuid()) @db.Uuid
  organizationId String @db.Uuid
  studentEnrollmentId String @db.Uuid
  feePlanId String @db.Uuid
  assignedAt DateTime @default(now())
  assignedByMembershipId String @db.Uuid
  endedAt DateTime?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  organization Organization @relation(fields: [organizationId], references: [id])
  studentEnrollment StudentEnrollment @relation(fields: [studentEnrollmentId], references: [id])
  feePlan FeePlan @relation(fields: [feePlanId], references: [id])
  feeCharges FeeCharge[]

  @@index([organizationId])
  @@index([studentEnrollmentId])
  @@index([feePlanId])
}

model FeeCharge {
  id String @id @default(uuid()) @db.Uuid
  organizationId String @db.Uuid
  enrollmentFeePlanAssignmentId String @db.Uuid
  feePlanItemId String @db.Uuid
  studentEnrollmentId String @db.Uuid
  branchId String @db.Uuid
  billingPeriodKey String
  amount Decimal @db.Decimal(14, 2)
  dueDate DateTime @db.Date
  description String?
  voidedAt DateTime?
  voidedByMembershipId String? @db.Uuid
  voidReason String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  organization Organization @relation(fields: [organizationId], references: [id])
  assignment EnrollmentFeePlanAssignment @relation(fields: [enrollmentFeePlanAssignmentId], references: [id])
  feePlanItem FeePlanItem @relation(fields: [feePlanItemId], references: [id])
  studentEnrollment StudentEnrollment @relation(fields: [studentEnrollmentId], references: [id])
  branch Branch @relation(fields: [branchId], references: [id])
  paymentAllocations PaymentAllocation[]

  @@unique([enrollmentFeePlanAssignmentId, feePlanItemId, billingPeriodKey])
  @@index([organizationId])
  @@index([studentEnrollmentId])
  @@index([branchId])
  @@index([dueDate])
  @@index([voidedAt])
}

model Payment {
  id String @id @default(uuid()) @db.Uuid
  organizationId String @db.Uuid
  branchId String @db.Uuid
  studentId String @db.Uuid
  receiptNumber String
  amount Decimal @db.Decimal(14, 2)
  paymentDate DateTime
  method PaymentMethod
  reference String?
  note String?
  status PaymentStatus @default(POSTED)
  receivedByMembershipId String @db.Uuid
  voidedAt DateTime?
  voidedByMembershipId String? @db.Uuid
  voidReason String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  organization Organization @relation(fields: [organizationId], references: [id])
  branch Branch @relation(fields: [branchId], references: [id])
  student Student @relation(fields: [studentId], references: [id])
  allocations PaymentAllocation[]

  @@index([organizationId])
  @@index([studentId])
  @@index([branchId])
  @@index([paymentDate])
  @@index([receiptNumber])
}

model PaymentAllocation {
  id String @id @default(uuid()) @db.Uuid
  organizationId String @db.Uuid
  paymentId String @db.Uuid
  feeChargeId String @db.Uuid
  amount Decimal @db.Decimal(14, 2)
  createdAt DateTime @default(now())

  organization Organization @relation(fields: [organizationId], references: [id])
  payment Payment @relation(fields: [paymentId], references: [id])
  feeCharge FeeCharge @relation(fields: [feeChargeId], references: [id])

  @@unique([paymentId, feeChargeId])
}

model PaymentReceiptSequence {
  id String @id @default(uuid()) @db.Uuid
  organizationId String @db.Uuid
  branchId String @db.Uuid
  nextValue Int @default(1)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  organization Organization @relation(fields: [organizationId], references: [id])
  branch Branch @relation(fields: [branchId], references: [id])

  @@unique([organizationId, branchId])
}
`;

fs.writeFileSync('packages/database/prisma/schema.prisma', c);
