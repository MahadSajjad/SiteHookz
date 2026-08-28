
import { AxiosInstance } from 'axios';
export class GuardiansClient {
  constructor(private client: AxiosInstance) {}
  async list(params: any) { const res = await this.client.get('/education/guardians', { params }); return res.data; }
  async get(id: string) { const res = await this.client.get(`/education/guardians/${id}`); return res.data; }
  async create(data: any) { const res = await this.client.post('/education/guardians', data); return res.data; }
  async update(id: string, data: any) { const res = await this.client.patch(`/education/guardians/${id}`, data); return res.data; }
  async getStudentGuardians(studentId: string) { const res = await this.client.get(`/education/students/${studentId}/guardians`); return res.data; }
  async linkGuardian(studentId: string, data: any) { const res = await this.client.post(`/education/students/${studentId}/guardians`, data); return res.data; }
  async unlinkGuardian(studentId: string, relationshipId: string) { const res = await this.client.delete(`/education/students/${studentId}/guardians/${relationshipId}`); return res.data; }
}
