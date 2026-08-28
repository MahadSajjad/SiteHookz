const fs = require('fs');
let schema = fs.readFileSync('packages/database/prisma/schema.prisma', 'utf8');

const tablesToStrip = ['StudentAdmissionSequence', 'Student', 'Guardian', 'StudentGuardian', 'StaffMember', 'StaffPosition', 'StaffBranchAssignment'];

for (const table of tablesToStrip) {
  const regex = new RegExp(`model ${table} \\{[\\s\\S]*?\\}`, 'g');
  schema = schema.replace(regex, (match) => {
    let clean = match.replace(/userAccountId\s+String\?\s+@db\.Uuid\n?/g, '');
    clean = clean.replace(/userAccount\s+UserAccount\?\s+@relation\(fields:\s*\[userAccountId\],\s*references:\s*\[id\]\)\n?/g, '');
    return clean;
  });
}

fs.writeFileSync('packages/database/prisma/schema.prisma', schema, 'utf8');
