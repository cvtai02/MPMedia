import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const FILE_TYPES: { name: string; openStrategy: string }[] = [
  { name: 'audio',         openStrategy: 'audio'    },
  { name: 'video',         openStrategy: 'video'    },
  { name: 'image',         openStrategy: 'image'    },
  { name: 'readable text', openStrategy: 'text'     },
  { name: 'other',         openStrategy: 'download' },
];

const COLLECTIONS: { name: string; order: number; labels: string[] }[] = [
  { name: 'mood',  order: 0, labels: ['chill','tension','funny','sad','mystery','dark','inspiring','romantic','epic','neutral'] },
  { name: 'style', order: 1, labels: ['lofi','piano','ambient','cinematic','ukulele','electronic','orchestral','synth','acoustic'] },
  { name: 'vocal', order: 2, labels: ['no-vocal','vocal','humming','choir','speech-sample'] },
  { name: 'speed', order: 3, labels: ['slow','medium','fast'] },
];

async function main() {
  const passwordHash = await bcrypt.hash('admin123', 10);
  await prisma.adminAccount.upsert({
    where: { email: 'admin@mpmedia.local' },
    update: {},
    create: {
      email: 'admin@mpmedia.local',
      passwordHash,
      displayName: 'Super Admin',
      role: 'Owner',
      isActive: true,
    },
  });

  for (let i = 0; i < FILE_TYPES.length; i++) {
    await prisma.fileType.upsert({
      where: { name: FILE_TYPES[i].name },
      update: { order: i, openStrategy: FILE_TYPES[i].openStrategy },
      create: { name: FILE_TYPES[i].name, openStrategy: FILE_TYPES[i].openStrategy, order: i },
    });
  }

  for (const col of COLLECTIONS) {
    const collection = await prisma.collection.upsert({
      where: { name: col.name },
      update: { order: col.order },
      create: { name: col.name, order: col.order },
    });
    for (let i = 0; i < col.labels.length; i++) {
      await prisma.collectionLabel.upsert({
        where: { collectionId_value: { collectionId: collection.id, value: col.labels[i] } },
        update: { order: i },
        create: { collectionId: collection.id, value: col.labels[i], order: i },
      });
    }
  }

  console.log('Seed complete');
}

main().catch(console.error).finally(() => prisma.$disconnect());
