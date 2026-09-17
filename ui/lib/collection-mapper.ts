export function mapCollection(col: {
  id: string; name: string; order: number; createdAt: Date; updatedAt: Date;
  labels?: Array<{ id: string; collectionId: string; value: string; order: number; createdAt: Date; updatedAt: Date }>;
}) {
  return {
    id: col.id,
    name: col.name,
    order: col.order,
    createdAt: col.createdAt,
    updatedAt: col.updatedAt,
    labels: (col.labels ?? []).map(l => ({
      id: l.id, collectionId: l.collectionId, value: l.value,
      order: l.order, createdAt: l.createdAt, updatedAt: l.updatedAt,
    })),
  };
}
