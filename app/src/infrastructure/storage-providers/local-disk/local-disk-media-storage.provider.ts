import * as fs from 'fs';
import * as path from 'path';
import {
  MediaStorageProvider,
  StorageHealthStatus,
  UploadMediaObjectInput,
  UploadedMediaObject,
  DownloadMediaObjectInput,
  DeleteMediaObjectInput,
  CheckMediaObjectInput,
} from '../media-storage-provider.interface';

export interface LocalDiskSettings {
  basePath: string;
}

export class LocalDiskMediaStorageProvider implements MediaStorageProvider {
  constructor(private readonly basePath: string) {}

  async upload(input: UploadMediaObjectInput): Promise<UploadedMediaObject> {
    const filePath = path.join(this.basePath, input.key);
    await fs.promises.mkdir(path.dirname(filePath), { recursive: true });
    await fs.promises.writeFile(filePath, input.buffer);
    return {
      key: input.key,
      providerKey: input.key,
      storagePath: filePath,
      publicUrl: null,
    };
  }

  async download(input: DownloadMediaObjectInput): Promise<NodeJS.ReadableStream> {
    const filePath = path.join(this.basePath, input.key);
    return fs.createReadStream(filePath);
  }

  async delete(input: DeleteMediaObjectInput): Promise<void> {
    const filePath = path.join(this.basePath, input.key);
    await fs.promises.unlink(filePath).catch(() => {});
  }

  async exists(input: CheckMediaObjectInput): Promise<boolean> {
    const filePath = path.join(this.basePath, input.key);
    return fs.promises.access(filePath).then(() => true).catch(() => false);
  }

  async healthCheck(): Promise<StorageHealthStatus> {
    try {
      await fs.promises.mkdir(this.basePath, { recursive: true });
      const probe = path.join(this.basePath, '.health-check');
      await fs.promises.writeFile(probe, 'ok');
      await fs.promises.unlink(probe);
      return { healthy: true, message: `Local disk at "${this.basePath}" is accessible` };
    } catch (e) {
      return { healthy: false, message: (e as Error).message };
    }
  }
}
