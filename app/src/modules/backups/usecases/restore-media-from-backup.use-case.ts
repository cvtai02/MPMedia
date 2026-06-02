import { Injectable } from '@nestjs/common';

@Injectable()
export class RestoreMediaFromBackupUseCase {
  // TODO: implement restore a media item from backup
  async execute(_mediaId: string): Promise<void> {
    throw new Error('Not implemented');
  }
}
