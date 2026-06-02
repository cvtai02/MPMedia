export type BackupStrategy = 'Manual' | 'Scheduled' | 'MissingOnly' | 'All';
export type BackupStatus = 'Pending' | 'Running' | 'Completed' | 'Failed';

export interface BackupJobEntity {
  id: string;
  name: string;
  sourceProvider: string | null;
  targetProvider: string;
  strategy: BackupStrategy;
  isEnabled: boolean;
  scheduleCron: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface BackupRunEntity {
  id: string;
  backupJobId: string;
  status: BackupStatus;
  startedAt: Date;
  finishedAt: Date | null;
  message: string | null;
}
