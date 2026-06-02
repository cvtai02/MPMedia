import { BaseApiClient } from '../shared/base.client';
import { Admin, CreateAdminRequest, UpdateAdminRequest } from './admins.types';

export class AdminsClient extends BaseApiClient {
  list(): Promise<Admin[]> { return this.get<Admin[]>('/admins'); }
  create(body: CreateAdminRequest): Promise<Admin> { return this.post<Admin>('/admins', body); }
  update(id: string, body: UpdateAdminRequest): Promise<Admin> { return this.patch<Admin>(`/admins/${id}`, body); }
  remove(id: string): Promise<void> { return this.delete<void>(`/admins/${id}`); }
}
