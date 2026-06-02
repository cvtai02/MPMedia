import { IsObject, IsOptional, IsString } from 'class-validator';

export class UpdateStorageProviderRequestDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsObject()
  @IsOptional()
  settings?: Record<string, unknown>;
}
