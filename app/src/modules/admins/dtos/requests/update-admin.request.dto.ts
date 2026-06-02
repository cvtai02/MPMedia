import { IsBoolean, IsIn, IsOptional, IsString } from 'class-validator';

export class UpdateAdminRequestDto {
  @IsString()
  @IsOptional()
  displayName?: string;

  @IsIn(['Owner', 'Admin'])
  @IsOptional()
  role?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
