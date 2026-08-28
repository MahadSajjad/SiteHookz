const fs = require('fs');

const students = `
import { AxiosInstance } from 'axios';
export class StudentsClient {
  constructor(private client: AxiosInstance) {}
  async list(params: any) { const res = await this.client.get('/education/students', { params }); return res.data; }
  async get(id: string) { const res = await this.client.get(\`/education/students/\${id}\`); return res.data; }
  async create(data: any) { const res = await this.client.post('/education/students', data); return res.data; }
  async update(id: string, data: any) { const res = await this.client.patch(\`/education/students/\${id}\`, data); return res.data; }
  async archive(id: string) { const res = await this.client.post(\`/education/students/\${id}/archive\`); return res.data; }
  async restore(id: string) { const res = await this.client.post(\`/education/students/\${id}/restore\`); return res.data; }
}
`;

const guardians = `
import { AxiosInstance } from 'axios';
export class GuardiansClient {
  constructor(private client: AxiosInstance) {}
  async list(params: any) { const res = await this.client.get('/education/guardians', { params }); return res.data; }
  async get(id: string) { const res = await this.client.get(\`/education/guardians/\${id}\`); return res.data; }
  async create(data: any) { const res = await this.client.post('/education/guardians', data); return res.data; }
  async update(id: string, data: any) { const res = await this.client.patch(\`/education/guardians/\${id}\`, data); return res.data; }
  async getStudentGuardians(studentId: string) { const res = await this.client.get(\`/education/students/\${studentId}/guardians\`); return res.data; }
  async linkGuardian(studentId: string, data: any) { const res = await this.client.post(\`/education/students/\${studentId}/guardians\`, data); return res.data; }
  async unlinkGuardian(studentId: string, relationshipId: string) { const res = await this.client.delete(\`/education/students/\${studentId}/guardians/\${relationshipId}\`); return res.data; }
}
`;

const staff = `
import { AxiosInstance } from 'axios';
export class StaffClient {
  constructor(private client: AxiosInstance) {}
  async list(params: any) { const res = await this.client.get('/education/staff', { params }); return res.data; }
  async get(id: string) { const res = await this.client.get(\`/education/staff/\${id}\`); return res.data; }
  async create(data: any) { const res = await this.client.post('/education/staff', data); return res.data; }
  async listPositions() { const res = await this.client.get('/education/staff-positions'); return res.data; }
  async createPosition(data: any) { const res = await this.client.post('/education/staff-positions', data); return res.data; }
  async listAssignments(staffId: string) { const res = await this.client.get(\`/education/staff/\${staffId}/assignments\`); return res.data; }
  async createAssignment(staffId: string, data: any) { const res = await this.client.post(\`/education/staff/\${staffId}/assignments\`, data); return res.data; }
  async endAssignment(staffId: string, assignmentId: string) { const res = await this.client.post(\`/education/staff/\${staffId}/assignments/\${assignmentId}/end\`); return res.data; }
}
`;

fs.writeFileSync('packages/api-client/src/students.ts', students, 'utf8');
fs.writeFileSync('packages/api-client/src/guardians.ts', guardians, 'utf8');
fs.writeFileSync('packages/api-client/src/staff.ts', staff, 'utf8');

let clientTs = fs.readFileSync('packages/api-client/src/client.ts', 'utf8');
clientTs = `import { StudentsClient } from './students';\nimport { GuardiansClient } from './guardians';\nimport { StaffClient } from './staff';\n` + clientTs;
clientTs = clientTs.replace(/public academicSessions: AcademicSessionsClient;/g, `public academicSessions: AcademicSessionsClient;\n  public students: StudentsClient;\n  public guardians: GuardiansClient;\n  public staff: StaffClient;`);
clientTs = clientTs.replace(/this\.academicSessions = new AcademicSessionsClient\(this\.api\);/g, `this.academicSessions = new AcademicSessionsClient(this.api);\n    this.students = new StudentsClient(this.api);\n    this.guardians = new GuardiansClient(this.api);\n    this.staff = new StaffClient(this.api);`);
fs.writeFileSync('packages/api-client/src/client.ts', clientTs, 'utf8');

let idxTs = fs.readFileSync('packages/api-client/src/index.ts', 'utf8');
idxTs += `\nexport * from './students';\nexport * from './guardians';\nexport * from './staff';\n`;
fs.writeFileSync('packages/api-client/src/index.ts', idxTs, 'utf8');
