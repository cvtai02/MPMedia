import { IsHexColor, IsString, MaxLength } from 'class-validator';

export class CreateLabelRequestDto {
  @IsString()
  @MaxLength(64)
  name: string;

  @IsHexColor()
  color: string;
}
