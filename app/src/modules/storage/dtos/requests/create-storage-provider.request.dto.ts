import { IsIn, IsObject, IsString } from 'class-validator';

export class CreateStorageProviderRequestDto {
  @IsString()
  name: string;

  @IsIn(['LocalDisk', 'R2', 'GoogleDrive'])
  type: string;

  @IsObject()
  settings: Record<string, unknown>;
}
