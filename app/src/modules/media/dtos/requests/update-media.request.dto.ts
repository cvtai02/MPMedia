import { IsOptional, IsString } from 'class-validator';

export class UpdateMediaRequestDto {
  @IsOptional()
  @IsString()
  originalName?: string;
}
