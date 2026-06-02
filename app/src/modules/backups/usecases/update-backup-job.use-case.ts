import { Injectable } from '@nestjs/common';

@Injectable()
export class UpdateBackupJobUseCase {
  // TODO: implement update a backup job
  async execute(_id: string, _data: unknown): Promise<void> {
    throw new Error('Not implemented');
  }
}
