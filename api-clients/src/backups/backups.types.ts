export type BackupStrategy = 'Manual' | 'Scheduled' | 'MissingOnly' | 'All';
export type BackupStatus = 'Pending' | 'Running' | 'Completed' | 'Failed';

export interface BackupJob {
  id: string;
  name: string;
  sourceProvider: string | null;
  targetProvider: string;
  strategy: BackupStrategy;
  isEnabled: boolean;
  scheduleCron: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface BackupRun {
  id: string;
  backupJobId: string;
  status: BackupStatus;
  startedAt: string;
  finishedAt: string | null;
  message: string | null;
}

export interface CreateBackupJobRequest {
  name: string;
  sourceProvider?: string;
  targetProvider: string;
  strategy: BackupStrategy;
  scheduleCron?: string;
}

export interface UpdateBackupJobRequest {
  name?: string;
  strategy?: BackupStrategy;
  isEnabled?: boolean;
  scheduleCron?: string;
}
