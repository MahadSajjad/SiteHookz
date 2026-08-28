const fs = require('fs');
let seed = fs.readFileSync('packages/database/src/seed.ts', 'utf8');

const newPerms = `
  // Education People - Students
  { key: 'education.students.read', description: 'Read students', category: 'Education' },
  { key: 'education.students.create', description: 'Create students', category: 'Education' },
  { key: 'education.students.update', description: 'Update students', category: 'Education' },
  { key: 'education.students.archive', description: 'Archive students', category: 'Education' },
  { key: 'education.students.restore', description: 'Restore students', category: 'Education' },
  // Education People - Guardians
  { key: 'education.guardians.read', description: 'Read guardians', category: 'Education' },
  { key: 'education.guardians.create', description: 'Create guardians', category: 'Education' },
  { key: 'education.guardians.update', description: 'Update guardians', category: 'Education' },
  { key: 'education.guardians.archive', description: 'Archive guardians', category: 'Education' },
  { key: 'education.guardians.restore', description: 'Restore guardians', category: 'Education' },
  // Education People - StudentGuardians
  { key: 'education.student_guardians.read', description: 'Read student-guardian links', category: 'Education' },
  { key: 'education.student_guardians.manage', description: 'Manage student-guardian links', category: 'Education' },
  // Education People - Staff
  { key: 'education.staff.read', description: 'Read staff', category: 'Education' },
  { key: 'education.staff.create', description: 'Create staff', category: 'Education' },
  { key: 'education.staff.update', description: 'Update staff', category: 'Education' },
  { key: 'education.staff.archive', description: 'Archive staff', category: 'Education' },
  { key: 'education.staff.restore', description: 'Restore staff', category: 'Education' },
  // Education People - Positions
  { key: 'education.staff_positions.read', description: 'Read staff positions', category: 'Education' },
  { key: 'education.staff_positions.create', description: 'Create staff positions', category: 'Education' },
  { key: 'education.staff_positions.update', description: 'Update staff positions', category: 'Education' },
  { key: 'education.staff_positions.archive', description: 'Archive staff positions', category: 'Education' },
  // Education People - Assignments
  { key: 'education.staff_assignments.read', description: 'Read staff assignments', category: 'Education' },
  { key: 'education.staff_assignments.create', description: 'Create staff assignments', category: 'Education' },
  { key: 'education.staff_assignments.update', description: 'Update staff assignments', category: 'Education' },
  { key: 'education.staff_assignments.end', description: 'End staff assignments', category: 'Education' },
`;

seed = seed.replace(/const permissions = \[/, `const permissions = [\n${newPerms}`);
fs.writeFileSync('packages/database/src/seed.ts', seed, 'utf8');
