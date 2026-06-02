import { IsInt, IsOptional, IsString, MaxLength, Min } from 'class-validator';

export class CreateCollectionLabelDto {
  @IsString()
  @MaxLength(64)
  value: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  order?: number;
}
