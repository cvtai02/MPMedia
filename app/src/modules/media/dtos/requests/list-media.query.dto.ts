import { Type } from 'class-transformer';
import { IsBoolean, IsIn, IsInt, IsOptional, IsString, Min } from 'class-validator';

export class ListMediaQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 20;

  @IsOptional()
  @IsString()
  collectionLabelId?: string;

  @IsOptional()
  @IsIn(['image', 'video', 'audio', 'document', 'archive', 'other'])
  mediaType?: string;

  @IsOptional()
  @IsIn(['Uploaded', 'Cached', 'BackedUp', 'Failed', 'Deleted'])
  status?: string;

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  unlabeled?: boolean;
}

export class PaginatedMediaResponseDto {
  data: import('../responses/media-item.response.dto').MediaItemResponseDto[];
  total: number;
  page: number;
  limit: number;
}
