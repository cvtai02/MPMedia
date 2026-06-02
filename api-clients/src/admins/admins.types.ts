export type AdminRole = 'Owner' | 'Admin';

export interface Admin {
  id: string;
  email: string;
  displayName: string | null;
  role: AdminRole;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAdminRequest { email: string; password: string; displayName?: string; role: AdminRole; }
export interface UpdateAdminRequest { displayName?: string; role?: AdminRole; isActive?: boolean; }
