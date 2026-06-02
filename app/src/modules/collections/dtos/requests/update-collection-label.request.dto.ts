import { IsInt, IsOptional, IsString, MaxLength, Min } from 'class-validator';

export class UpdateCollectionLabelDto {
  @IsOptional()
  @IsString()
  @MaxLength(64)
  value?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  order?: number;
}
