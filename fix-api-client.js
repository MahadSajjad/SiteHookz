const fs = require('fs');

const students = `
import { apiClient } from './client';

export const studentsApi = {
  list: (params?: any) => apiClient.get('/education/students', { params }).then(res => res.data),
  get: (id: string) => apiClient.get(\`/education/students/\${id}\`).then(res => res.data),
  create: (data: any) => apiClient.post('/education/students', data).then(res => res.data),
  update: (id: string, data: any) => apiClient.patch(\`/education/students/\${id}\`, data).then(res => res.data),
  archive: (id: string) => apiClient.post(\`/education/students/\${id}/archive\`).then(res => res.data),
  restore: (id: string) => apiClient.post(\`/education/students/\${id}/restore\`).then(res => res.data),
};
`;

const guardians = `
import { apiClient } from './client';

export const guardiansApi = {
  list: (params?: any) => apiClient.get('/education/guardians', { params }).then(res => res.data),
  get: (id: string) => apiClient.get(\`/education/guardians/\${id}\`).then(res => res.data),
  create: (data: any) => apiClient.post('/education/guardians', data).then(res => res.data),
  update: (id: string, data: any) => apiClient.patch(\`/education/guardians/\${id}\`, data).then(res => res.data),
  getStudentGuardians: (studentId: string) => apiClient.get(\`/education/students/\${studentId}/guardians\`).then(res => res.data),
  linkGuardian: (studentId: string, data: any) => apiClient.post(\`/education/students/\${studentId}/guardians\`, data).then(res => res.data),
  unlinkGuardian: (studentId: string, relationshipId: string) => apiClient.delete(\`/education/students/\${studentId}/guardians/\${relationshipId}\`).then(res => res.data),
};
`;

const staff = `
import { apiClient } from './client';

export const staffApi = {
  list: (params?: any) => apiClient.get('/education/staff', { params }).then(res => res.data),
  get: (id: string) => apiClient.get(\`/education/staff/\${id}\`).then(res => res.data),
  create: (data: any) => apiClient.post('/education/staff', data).then(res => res.data),
  listPositions: () => apiClient.get('/education/staff-positions').then(res => res.data),
  createPosition: (data: any) => apiClient.post('/education/staff-positions', data).then(res => res.data),
  listAssignments: (staffId: string) => apiClient.get(\`/education/staff/\${staffId}/assignments\`).then(res => res.data),
  createAssignment: (staffId: string, data: any) => apiClient.post(\`/education/staff/\${staffId}/assignments\`, data).then(res => res.data),
  endAssignment: (staffId: string, assignmentId: string) => apiClient.post(\`/education/staff/\${staffId}/assignments/\${assignmentId}/end\`).then(res => res.data),
};
`;

fs.writeFileSync('packages/api-client/src/students.ts', students, 'utf8');
fs.writeFileSync('packages/api-client/src/guardians.ts', guardians, 'utf8');
fs.writeFileSync('packages/api-client/src/staff.ts', staff, 'utf8');

let clientTs = fs.readFileSync('packages/api-client/src/client.ts', 'utf8');
clientTs = clientTs.replace(/import \{ StudentsClient \} from '.\/students';\n/g, '');
clientTs = clientTs.replace(/import \{ GuardiansClient \} from '.\/guardians';\n/g, '');
clientTs = clientTs.replace(/import \{ StaffClient \} from '.\/staff';\n/g, '');
fs.writeFileSync('packages/api-client/src/client.ts', clientTs, 'utf8');

fs.writeFileSync('apps/education-web/src/hooks/useApiClient.ts', `
import { studentsApi, guardiansApi, staffApi, apiClient, setAccessToken } from '@sitehookz/api-client';

export function useApiClient() {
  return {
    students: studentsApi,
    guardians: guardiansApi,
    staff: staffApi,
  };
}
`, 'utf8');

// Fix StudentsPage.tsx import of React
let sp = fs.readFileSync('apps/education-web/src/pages/dashboard/students/StudentsPage.tsx', 'utf8');
sp = sp.replace(/import React, \{ useState \} from 'react';/, `import { useState } from 'react';`);
fs.writeFileSync('apps/education-web/src/pages/dashboard/students/StudentsPage.tsx', sp, 'utf8');

