import { CollectionLabelDto } from './collection-label.response.dto';

export interface CollectionResponseDto {
  id: string;
  name: string;
  order: number;
  labels: CollectionLabelDto[];
  createdAt: Date;
  updatedAt: Date;
}
