const fs = require("fs");
const path = require("path");

const baseDir = path.join("packages", "api-client", "src");

fs.writeFileSync(
  path.join(baseDir, "class-levels.ts"),
  `
import { apiClient } from './client';

export const classLevelsApi = {
  list: (params?: any) => apiClient.get('/education/class-levels', { params }).then(res => res.data),
  get: (id: string) => apiClient.get(\`/education/class-levels/\${id}\`).then(res => res.data),
  create: (data: any) => apiClient.post('/education/class-levels', data).then(res => res.data),
  update: (id: string, data: any) => apiClient.patch(\`/education/class-levels/\${id}\`, data).then(res => res.data),
  archive: (id: string) => apiClient.post(\`/education/class-levels/\${id}/archive\`).then(res => res.data),
  restore: (id: string) => apiClient.post(\`/education/class-levels/\${id}/restore\`).then(res => res.data),
};
`,
);

fs.writeFileSync(
  path.join(baseDir, "sections.ts"),
  `
import { apiClient } from './client';

export const sectionsApi = {
  list: (params?: any) => apiClient.get('/education/sections', { params }).then(res => res.data),
  get: (id: string) => apiClient.get(\`/education/sections/\${id}\`).then(res => res.data),
  create: (data: any) => apiClient.post('/education/sections', data).then(res => res.data),
  update: (id: string, data: any) => apiClient.patch(\`/education/sections/\${id}\`, data).then(res => res.data),
};
`,
);

fs.writeFileSync(
  path.join(baseDir, "enrollments.ts"),
  `
import { apiClient } from './client';

export const enrollmentsApi = {
  studentHistory: (studentId: string) => apiClient.get(\`/education/students/\${studentId}/enrollments\`).then(res => res.data),
  createSchool: (studentId: string, data: any) => apiClient.post(\`/education/students/\${studentId}/enrollments/school\`, data).then(res => res.data),
};
`,
);

let hookPath = path.join(
  "apps",
  "education-web",
  "src",
  "hooks",
  "useApiClient.ts",
);
let hook = fs.readFileSync(hookPath, "utf8");

// Insert imports
hook =
  `import { classLevelsApi } from '@sitehookz/api-client/src/class-levels';
import { sectionsApi } from '@sitehookz/api-client/src/sections';
import { enrollmentsApi } from '@sitehookz/api-client/src/enrollments';\n` +
  hook;

// Insert exports
hook = hook.replace(
  "return {",
  "return {\n    classLevels: classLevelsApi,\n    sections: sectionsApi,\n    enrollments: enrollmentsApi,",
);
fs.writeFileSync(hookPath, hook, "utf8");

console.log("Client generated");
