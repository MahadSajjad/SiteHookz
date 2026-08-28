const fs = require('fs');
let code = fs.readFileSync('packages/database/src/seed.ts', 'utf8');

const newPermissions = `
  // Education Layer 3C
  { key: "education.subjects.read", description: "Read subjects", category: "Education" },
  { key: "education.subjects.create", description: "Create subjects", category: "Education" },
  { key: "education.subjects.update", description: "Update subjects", category: "Education" },
  { key: "education.subjects.archive", description: "Archive subjects", category: "Education" },
  { key: "education.subjects.restore", description: "Restore subjects", category: "Education" },

  { key: "education.subject_offerings.read", description: "Read subject offerings", category: "Education" },
  { key: "education.subject_offerings.create", description: "Create subject offerings", category: "Education" },
  { key: "education.subject_offerings.update", description: "Update subject offerings", category: "Education" },
  { key: "education.subject_offerings.archive", description: "Archive subject offerings", category: "Education" },
  { key: "education.subject_offerings.restore", description: "Restore subject offerings", category: "Education" },

  { key: "education.teaching_assignments.read", description: "Read teaching assignments", category: "Education" },
  { key: "education.teaching_assignments.create", description: "Create teaching assignments", category: "Education" },
  { key: "education.teaching_assignments.update", description: "Update teaching assignments", category: "Education" },
  { key: "education.teaching_assignments.end", description: "End teaching assignments", category: "Education" },
`;

if (!code.includes("education.subjects.read")) {
  code = code.replace("];", newPermissions + "\n];");
  fs.writeFileSync('packages/database/src/seed.ts', code, 'utf8');
}
