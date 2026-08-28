
import { AxiosInstance } from 'axios';
export class StaffClient {
  constructor(private client: AxiosInstance) {}
  async list(params: any) { const res = await this.client.get('/education/staff', { params }); return res.data; }
  async get(id: string) { const res = await this.client.get(`/education/staff/${id}`); return res.data; }
  async create(data: any) { const res = await this.client.post('/education/staff', data); return res.data; }
  async listPositions() { const res = await this.client.get('/education/staff-positions'); return res.data; }
  async createPosition(data: any) { const res = await this.client.post('/education/staff-positions', data); return res.data; }
  async listAssignments(staffId: string) { const res = await this.client.get(`/education/staff/${staffId}/assignments`); return res.data; }
  async createAssignment(staffId: string, data: any) { const res = await this.client.post(`/education/staff/${staffId}/assignments`, data); return res.data; }
  async endAssignment(staffId: string, assignmentId: string) { const res = await this.client.post(`/education/staff/${staffId}/assignments/${assignmentId}/end`); return res.data; }
}
