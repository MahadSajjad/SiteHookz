const fs = require('fs');
let schema = fs.readFileSync('prisma/schema.prisma', 'utf8');

schema = schema.replace(/studentAdmissionSequences StudentAdmissionSequence\[\]\n\s*students\s+Student\[\]\n\s*guardians\s+Guardian\[\]\n\s*studentGuardians\s+StudentGuardian\[\]\n\s*staffMembers\s+StaffMember\[\]\n\s*staffPositions\s+StaffPosition\[\]\n\s*staffBranchAssignments\s+StaffBranchAssignment\[\]/, '');

const orgInsert = `
  studentAdmissionSequences StudentAdmissionSequence[]
  students                 Student[]
  guardians                Guardian[]
  studentGuardians         StudentGuardian[]
  staffMembers             StaffMember[]
  staffPositions           StaffPosition[]
  staffBranchAssignments   StaffBranchAssignment[]
`;

schema = schema.replace(/academicSessions       AcademicSession\[\]\s*}/, `academicSessions       AcademicSession[]\n${orgInsert}\n}`);

fs.writeFileSync('prisma/schema.prisma', schema, 'utf8');
