import { BaseApiClient } from '../shared/base.client';
import { BackupJob, BackupRun, CreateBackupJobRequest, UpdateBackupJobRequest } from './backups.types';

export class BackupsClient extends BaseApiClient {
  listJobs(): Promise<BackupJob[]> { return this.get<BackupJob[]>('/backup-jobs'); }
  createJob(body: CreateBackupJobRequest): Promise<BackupJob> { return this.post<BackupJob>('/backup-jobs', body); }
  updateJob(id: string, body: UpdateBackupJobRequest): Promise<BackupJob> { return this.patch<BackupJob>(`/backup-jobs/${id}`, body); }
  deleteJob(id: string): Promise<void> { return this.delete<void>(`/backup-jobs/${id}`); }
  runJob(id: string): Promise<BackupRun> { return this.post<BackupRun>(`/backup-jobs/${id}/run`); }
  listRuns(): Promise<BackupRun[]> { return this.get<BackupRun[]>('/backup-runs'); }
  getRun(id: string): Promise<BackupRun> { return this.get<BackupRun>(`/backup-runs/${id}`); }
}
