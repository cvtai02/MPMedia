import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../infrastructure/prisma/prisma.service';
import { StorageProviderFactory, StorageProviderType } from '../../../infrastructure/storage-providers/storage-provider.factory';
import { NotFoundException } from '../../../shared/errors/app-exceptions';

@Injectable()
export class DeleteMediaUseCase {
  constructor(
    private readonly prisma: PrismaService,
    private readonly factory: StorageProviderFactory,
  ) {}

  async execute(id: string): Promise<void> {
    const item = await this.prisma.mediaItem.findUnique({
      where: { id },
      include: { files: true },
    });
    if (!item || item.status === 'Deleted') throw new NotFoundException('MediaItem', id);

    // Best-effort delete from each provider — don't fail if storage delete fails
    await Promise.allSettled(
      item.files.map(async (file) => {
        const providerRow = await this.prisma.storageProviderSetting.findFirst({
          where: { type: file.providerType },
        });
        if (!providerRow) return;
        const provider = this.factory.create(file.providerType as StorageProviderType, providerRow.settingsJson);
        await provider.delete({ key: file.providerKey });
      }),
    );

    await this.prisma.mediaItem.update({
      where: { id },
      data: { status: 'Deleted' },
    });
  }
}
