export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  admin: {
    id: string;
    email: string;
    displayName: string | null;
    role: string;
  };
}

export interface MeResponse {
  id: string;
  email: string;
  displayName: string | null;
  role: string;
}
