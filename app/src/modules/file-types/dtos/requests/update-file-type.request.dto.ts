import { IsIn, IsInt, IsOptional, IsString, MaxLength, Min } from 'class-validator';
import { OPEN_STRATEGIES } from '../open-strategy';
import type { OpenStrategy } from '../open-strategy';

export class UpdateFileTypeDto {
  @IsOptional()
  @IsString()
  @MaxLength(64)
  name?: string;

  @IsOptional()
  @IsIn(OPEN_STRATEGIES)
  openStrategy?: OpenStrategy;

  @IsOptional()
  @IsInt()
  @Min(0)
  order?: number;
}
