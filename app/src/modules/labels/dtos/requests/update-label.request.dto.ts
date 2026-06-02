import { IsHexColor, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateLabelRequestDto {
  @IsOptional()
  @IsString()
  @MaxLength(64)
  name?: string;

  @IsOptional()
  @IsHexColor()
  color?: string;
}
