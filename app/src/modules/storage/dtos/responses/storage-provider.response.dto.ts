export class StorageProviderResponseDto {
  id: string;
  name: string;
  type: string;
  isActive: boolean;
  settings: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}
