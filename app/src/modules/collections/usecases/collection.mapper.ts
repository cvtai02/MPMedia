import { CollectionLabelDto, CollectionResponseDto } from '../dtos';

export function mapCollection(collection: any): CollectionResponseDto {
  return {
    id: collection.id,
    name: collection.name,
    order: collection.order,
    createdAt: collection.createdAt,
    updatedAt: collection.updatedAt,
    labels: (collection.labels ?? []).map(
      (label: any): CollectionLabelDto => ({
        id: label.id,
        collectionId: label.collectionId,
        value: label.value,
        order: label.order,
        createdAt: label.createdAt,
        updatedAt: label.updatedAt,
      }),
    ),
  };
}
