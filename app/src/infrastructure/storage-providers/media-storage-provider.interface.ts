export interface UploadMediaObjectInput {
  key: string;
  buffer: Buffer;
  mimeType: string;
  sizeBytes: number;
}

export interface UploadedMediaObject {
  key: string;
  providerKey: string;
  storagePath: string;
  publicUrl: string | null;
}

export interface DownloadMediaObjectInput {
  key: string;
}

export interface DeleteMediaObjectInput {
  key: string;
}

export interface CheckMediaObjectInput {
  key: string;
}

export interface GetSignedDownloadUrlInput {
  key: string;
  expiresInSeconds?: number;
}

export interface StorageHealthStatus {
  healthy: boolean;
  message: string;
}

export interface MediaStorageProvider {
  upload(input: UploadMediaObjectInput): Promise<UploadedMediaObject>;
  download(input: DownloadMediaObjectInput): Promise<NodeJS.ReadableStream>;
  delete(input: DeleteMediaObjectInput): Promise<void>;
  exists(input: CheckMediaObjectInput): Promise<boolean>;
  getSignedDownloadUrl?(input: GetSignedDownloadUrlInput): Promise<string>;
  healthCheck(): Promise<StorageHealthStatus>;
}
