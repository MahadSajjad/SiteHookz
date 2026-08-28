const fs = require("fs");
const path = require("path");

const baseDir = path.join("packages", "api-client", "src");

fs.writeFileSync(
  path.join(baseDir, "courses.ts"),
  `
import { apiClient } from './client';

export const coursesApi = {
  list: (params?: any) => apiClient.get('/education/courses', { params }).then(res => res.data),
  get: (id: string) => apiClient.get(\`/education/courses/\${id}\`).then(res => res.data),
  create: (data: any) => apiClient.post('/education/courses', data).then(res => res.data),
  update: (id: string, data: any) => apiClient.patch(\`/education/courses/\${id}\`, data).then(res => res.data),
};
`,
);

fs.writeFileSync(
  path.join(baseDir, "batches.ts"),
  `
import { apiClient } from './client';

export const batchesApi = {
  list: (params?: any) => apiClient.get('/education/batches', { params }).then(res => res.data),
  get: (id: string) => apiClient.get(\`/education/batches/\${id}\`).then(res => res.data),
  create: (data: any) => apiClient.post('/education/batches', data).then(res => res.data),
  update: (id: string, data: any) => apiClient.patch(\`/education/batches/\${id}\`, data).then(res => res.data),
};
`,
);

const enrollmentsClientPath = path.join(baseDir, "enrollments.ts");
fs.writeFileSync(
  enrollmentsClientPath,
  `
import { apiClient } from './client';

export const enrollmentsApi = {
  studentHistory: (studentId: string) => apiClient.get(\`/education/students/\${studentId}/enrollments\`).then(res => res.data),
  createSchool: (studentId: string, data: any) => apiClient.post(\`/education/students/\${studentId}/enrollments/school\`, data).then(res => res.data),
  createTuition: (studentId: string, data: any) => apiClient.post(\`/education/students/\${studentId}/enrollments/tuition\`, data).then(res => res.data),
  endEnrollment: (id: string, data: any) => apiClient.post(\`/education/enrollments/\${id}/end\`, data).then(res => res.data),
  promote: (id: string, data: any) => apiClient.post(\`/education/enrollments/\${id}/promote\`, data).then(res => res.data),
  transfer: (id: string, data: any) => apiClient.post(\`/education/enrollments/\${id}/transfer\`, data).then(res => res.data),
  changeSection: (id: string, data: any) => apiClient.post(\`/education/enrollments/\${id}/change-section\`, data).then(res => res.data),
  changeBatch: (id: string, data: any) => apiClient.post(\`/education/enrollments/\${id}/change-batch\`, data).then(res => res.data),
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

if (!hook.includes("coursesApi")) {
  hook =
    `import { coursesApi } from '@sitehookz/api-client/src/courses';\nimport { batchesApi } from '@sitehookz/api-client/src/batches';\n` +
    hook;
  hook = hook.replace(
    "return {",
    "return {\n    courses: coursesApi,\n    batches: batchesApi,",
  );
  fs.writeFileSync(hookPath, hook, "utf8");
}

console.log("API clients updated.");
