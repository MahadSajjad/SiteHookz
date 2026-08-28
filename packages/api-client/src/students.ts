
import { AxiosInstance } from 'axios';
export class StudentsClient {
  constructor(private client: AxiosInstance) {}
  async list(params: any) { const res = await this.client.get('/education/students', { params }); return res.data; }
  async get(id: string) { const res = await this.client.get(`/education/students/${id}`); return res.data; }
  async create(data: any) { const res = await this.client.post('/education/students', data); return res.data; }
  async update(id: string, data: any) { const res = await this.client.patch(`/education/students/${id}`, data); return res.data; }
  async archive(id: string) { const res = await this.client.post(`/education/students/${id}/archive`); return res.data; }
  async restore(id: string) { const res = await this.client.post(`/education/students/${id}/restore`); return res.data; }
}
