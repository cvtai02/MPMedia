import { BaseApiClient } from '../shared/base.client';
import { LoginRequest, LoginResponse, MeResponse } from './auth.types';

export class AuthClient extends BaseApiClient {
  login(body: LoginRequest): Promise<LoginResponse> {
    return this.post<LoginResponse>('/auth/login', body);
  }

  logout(): Promise<void> {
    return this.post<void>('/auth/logout');
  }

  me(): Promise<MeResponse> {
    return this.get<MeResponse>('/auth/me');
  }
}
