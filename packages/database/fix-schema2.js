const fs = require('fs');
let schema = fs.readFileSync('prisma/schema.prisma', 'utf8');

schema = schema.replace(/studentAdmissionSequences StudentAdmissionSequence\[\]/g, '');
schema = schema.replace(/students                 Student\[\]/g, '');
schema = schema.replace(/guardians                Guardian\[\]/g, '');
schema = schema.replace(/studentGuardians         StudentGuardian\[\]/g, '');
schema = schema.replace(/staffMembers             StaffMember\[\]/g, '');
schema = schema.replace(/staffPositions           StaffPosition\[\]/g, '');
schema = schema.replace(/staffBranchAssignments   StaffBranchAssignment\[\]/g, '');

schema = schema.replace(/userAccountId  String\?   @db\.Uuid/g, '');
schema = schema.replace(/userAccount    UserAccount\? @relation\(fields: \[userAccountId\], references: \[id\]\)/g, '');

fs.writeFileSync('prisma/schema.prisma', schema, 'utf8');
