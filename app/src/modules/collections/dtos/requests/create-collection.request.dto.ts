import { IsInt, IsOptional, IsString, MaxLength, Min } from 'class-validator';

export class CreateCollectionDto {
  @IsString()
  @MaxLength(64)
  name: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  order?: number;
}
