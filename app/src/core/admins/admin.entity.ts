export type AdminRole = 'Owner' | 'Admin';

export interface AdminEntity {
  id: string;
  email: string;
  passwordHash: string;
  displayName: string | null;
  role: AdminRole;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
