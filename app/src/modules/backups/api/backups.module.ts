import { Module } from '@nestjs/common';
import { BackupsController } from './backups.controller';

@Module({
  controllers: [BackupsController],
  providers: [],
})
export class BackupsModule {}
