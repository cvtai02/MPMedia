import { Injectable } from '@nestjs/common';

@Injectable()
export class RunBackupNowUseCase {
  // TODO: implement trigger a backup run immediately
  async execute(_jobId: string): Promise<void> {
    throw new Error('Not implemented');
  }
}
