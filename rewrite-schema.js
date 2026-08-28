const fs = require('fs');

let schema = fs.readFileSync('packages/database/prisma/schema.prisma', 'utf8');

const orgInsert = `
  studentAdmissionSequences StudentAdmissionSequence[]
  students                 Student[]
  guardians                Guardian[]
  studentGuardians         StudentGuardian[]
  staffMembers             StaffMember[]
  staffPositions           StaffPosition[]
  staffBranchAssignments   StaffBranchAssignment[]
`;

schema = schema.replace(/passwordResetTokens      PasswordResetToken\[\]\s*}/, `passwordResetTokens      PasswordResetToken[]\n${orgInsert}\n}`);

const branchInsert = `
  admittedStudents       Student[]
  staffAssignments       StaffBranchAssignment[]
`;

schema = schema.replace(/roleAssignments        RoleAssignment\[\]\s*}/, `roleAssignments        RoleAssignment[]\n${branchInsert}\n}`);

const newModels = `
enum StudentStatus {
  ACTIVE
  INACTIVE
  GRADUATED
  WITHDRAWN
  ARCHIVED
}

enum Gender {
  MALE
  FEMALE
  OTHER
  UNSPECIFIED
}

model StudentAdmissionSequence {
  id             String @id @default(uuid()) @db.Uuid
  organizationId String @db.Uuid
  branchPrefix   String
  nextValue      Int    @default(1)

  organization Organization @relation(fields: [organizationId], references: [id])
  @@unique([organizationId, branchPrefix])
}

model Student {
  id                String        @id @default(uuid()) @db.Uuid
  organizationId    String        @db.Uuid
  admissionNumber   String

  firstName         String
  middleName        String?
  lastName          String?

  dateOfBirth       DateTime?     @db.Date
  gender            Gender?

  phone             String?
  email             String?

  admissionDate     DateTime?     @db.Date
  admissionBranchId String?       @db.Uuid

  status            StudentStatus @default(ACTIVE)

  archivedAt        DateTime?
  createdAt         DateTime      @default(now())
  updatedAt         DateTime      @updatedAt

  organization      Organization      @relation(fields: [organizationId], references: [id])
  admissionBranch   Branch?           @relation(fields: [admissionBranchId], references: [id], onDelete: Restrict)
  studentGuardians  StudentGuardian[]

  @@unique([organizationId, admissionNumber])
  @@index([organizationId])
  @@index([organizationId, status])
  @@index([organizationId, admissionBranchId])
}

model Guardian {
  id             String    @id @default(uuid()) @db.Uuid
  organizationId String    @db.Uuid

  firstName      String
  middleName     String?
  lastName       String?

  phone          String?
  alternatePhone String?
  email          String?

  nationalId     String?

  occupation     String?
  employer       String?

  addressLine1   String?
  addressLine2   String?
  city           String?
  region         String?
  postalCode     String?
  countryCode    String?

  archivedAt     DateTime?
  createdAt      DateTime  @default(now())
  updatedAt      DateTime  @updatedAt

  organization     Organization      @relation(fields: [organizationId], references: [id])
  studentGuardians StudentGuardian[]

  @@index([organizationId])
  @@index([organizationId, archivedAt])
}

enum GuardianRelationship {
  MOTHER
  FATHER
  LEGAL_GUARDIAN
  GRANDPARENT
  SIBLING
  RELATIVE
  OTHER
}

model StudentGuardian {
  id             String               @id @default(uuid()) @db.Uuid
  organizationId String               @db.Uuid
  studentId      String               @db.Uuid
  guardianId     String               @db.Uuid

  relationship   GuardianRelationship

  isPrimary          Boolean @default(false)
  isBillingContact   Boolean @default(false)
  isEmergencyContact Boolean @default(false)

  receivesSms        Boolean @default(true)
  receivesEmail      Boolean @default(true)
  canPickupStudent   Boolean @default(false)
  portalAccessEnabled Boolean @default(false)

  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt

  organization   Organization @relation(fields: [organizationId], references: [id])
  student        Student      @relation(fields: [studentId], references: [id], onDelete: Restrict)
  guardian       Guardian     @relation(fields: [guardianId], references: [id], onDelete: Restrict)

  @@unique([studentId, guardianId])
  @@index([organizationId])
  @@index([guardianId])
}

enum EmploymentStatus {
  ACTIVE
  ON_LEAVE
  SUSPENDED
  TERMINATED
  RESIGNED
  RETIRED
  ARCHIVED
}

model StaffMember {
  id             String           @id @default(uuid()) @db.Uuid
  organizationId String           @db.Uuid

  employeeNumber String?

  firstName      String
  middleName     String?
  lastName       String?

  email          String?
  phone          String?

  dateOfBirth    DateTime?        @db.Date
  gender         Gender?

  hireDate       DateTime?        @db.Date
  terminationDate DateTime?       @db.Date

  employmentStatus EmploymentStatus @default(ACTIVE)

  archivedAt     DateTime?
  createdAt      DateTime         @default(now())
  updatedAt      DateTime         @updatedAt

  organization   Organization             @relation(fields: [organizationId], references: [id])
  assignments    StaffBranchAssignment[]

  @@unique([organizationId, employeeNumber])
  @@index([organizationId])
  @@index([organizationId, employmentStatus])
}

enum StaffPositionCategory {
  ACADEMIC
  ADMINISTRATION
  FINANCE
  OPERATIONS
  SUPPORT
  OTHER
}

model StaffPosition {
  id             String                @id @default(uuid()) @db.Uuid
  organizationId String                @db.Uuid

  name           String
  code           String
  
  category       StaffPositionCategory?
  description    String?

  isActive       Boolean               @default(true)

  archivedAt     DateTime?
  createdAt      DateTime              @default(now())
  updatedAt      DateTime              @updatedAt

  organization   Organization            @relation(fields: [organizationId], references: [id])
  assignments    StaffBranchAssignment[]

  @@unique([organizationId, code])
  @@index([organizationId])
}

model StaffBranchAssignment {
  id             String    @id @default(uuid()) @db.Uuid
  organizationId String    @db.Uuid

  staffMemberId  String    @db.Uuid
  branchId       String    @db.Uuid
  positionId     String    @db.Uuid

  startDate      DateTime  @db.Date
  endDate        DateTime? @db.Date

  isPrimary      Boolean   @default(false)

  createdAt      DateTime  @default(now())
  updatedAt      DateTime  @updatedAt

  organization   Organization  @relation(fields: [organizationId], references: [id])
  staffMember    StaffMember   @relation(fields: [staffMemberId], references: [id], onDelete: Restrict)
  branch         Branch        @relation(fields: [branchId], references: [id], onDelete: Restrict)
  position       StaffPosition @relation(fields: [positionId], references: [id], onDelete: Restrict)

  @@index([organizationId])
  @@index([staffMemberId])
  @@index([branchId])
  @@index([positionId])
}
`;

schema += '\n' + newModels;
fs.writeFileSync('packages/database/prisma/schema.prisma', schema, 'utf8');
