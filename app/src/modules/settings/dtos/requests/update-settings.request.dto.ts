import { Type } from 'class-transformer';
import { IsBoolean, IsNumber, IsOptional, IsString, Min, ValidateNested } from 'class-validator';

class UpdateCacheSettingsDto {
  @IsOptional()
  @IsBoolean()
  enabled?: boolean;

  @IsOptional()
  @IsString()
  path?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  maxSizeMb?: number;
}

class UpdateStorageSettingsDto {
  @IsOptional()
  @IsString()
  activeProviderId?: string | null;
}

class UpdateBackupSettingsDto {
  @IsOptional()
  @IsBoolean()
  enabled?: boolean;
}

export class UpdateSettingsRequestDto {
  @IsOptional()
  @ValidateNested()
  @Type(() => UpdateCacheSettingsDto)
  cache?: UpdateCacheSettingsDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => UpdateStorageSettingsDto)
  storage?: UpdateStorageSettingsDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => UpdateBackupSettingsDto)
  backup?: UpdateBackupSettingsDto;
}
