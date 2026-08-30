const fs = require('fs');
let file = 'apps/education-web/src/hooks/useApiClient.ts';
let code = fs.readFileSync(file, 'utf8');
code = code.replace(/import \{ type ApiClient \} from "@sitehookz\/api-client";\n/, '');
code = code.replace(/export function useApiClient\(\): ApiClient/, 'const api = {\n  courses: coursesApi,\n  batches: batchesApi,\n  classLevels: classLevelsApi,\n  sections: sectionsApi,\n  enrollments: enrollmentsApi,\n  students: studentsApi,\n  guardians: guardiansApi,\n  staff: staffApi,\n  subjects: subjectsApi,\n  subjectOfferings: subjectOfferingsApi,\n  teachingAssignments: teachingAssignmentsApi,\n};\n\nexport type ApiClientType = typeof api;\n\nexport function useApiClient(): ApiClientType');
code = code.replace(/return \{\n.*\n.*\n.*\n.*\n.*\n.*\n.*\n.*\n.*\n.*\n.*\n  \};/s, 'return api;');
fs.writeFileSync(file, code);
