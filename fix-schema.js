const fs = require('fs');
let schema = fs.readFileSync('packages/database/prisma/schema.prisma', 'utf8');

schema = schema.replace(/model StudentAdmissionSequence \{[\s\S]*?@@unique\(\[organizationId, branchPrefix\]\)[\s\S]*?\}/, 
`model StudentAdmissionSequence {
  id             String @id @default(uuid()) @db.Uuid
  organizationId String @db.Uuid
  branchId       String? @db.Uuid
  prefix         String
  nextValue      Int    @default(1)

  organization  Organization @relation(fields: [organizationId], references: [id])
  branch        Branch?      @relation(fields: [branchId], references: [id])

  @@unique([organizationId, branchId])
}`);

// Also fix userAccountId if it's there
schema = schema.replace(/userAccount\s+UserAccount\?\s+@relation\(fields:\s*\[userAccountId\],\s*references:\s*\[id\]\)\n\s*userAccountId\s+String\?\s+@db\.Uuid/g, '');

fs.writeFileSync('packages/database/prisma/schema.prisma', schema, 'utf8');
