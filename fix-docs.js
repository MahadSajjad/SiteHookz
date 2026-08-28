const fs = require('fs');

const path = 'ARCHITECTURE.md';
let code = fs.readFileSync(path, 'utf8');

code += `
### Layer 3B Academic Structure & Student Enrollment Invariants
- **Placement Uniqueness**: The database constraints (e.g. \`UNIQUE(enrollmentId)\`) enforce a 1:1 mapping at the table level.
- **Polymorphic Exclusivity**: The exclusivity between \`SCHOOL\` and \`TUITION\` (a StudentEnrollment cannot have both) is a **transactional application invariant** maintained exclusively by \`EnrollmentsService\`.
- **Tuition Concurrency**: A student can have multiple active \`TUITION\` enrollments across different branches or batches simultaneously. Same-batch concurrency is prevented via \`SELECT ... FOR UPDATE\` serialization.
- **Student Authorization**: Read/update authorization for students uses **ANY** accessible active Enrollment rather than one arbitrary "current" branch.
- **Guardian Visibility**: Guardian listing visibility resolves strictly through authorized active Enrollment Branches of linked students.
`;

fs.writeFileSync(path, code, 'utf8');
console.log("Updated ARCHITECTURE.md");
