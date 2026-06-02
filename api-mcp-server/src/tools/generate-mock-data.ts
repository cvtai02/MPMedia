import { get, post, uploadFile } from '../client.js';

export const generateMockDataTool = {
  name: 'generate_mock_data',
  description: 'Generate and upload mock media items to the API for testing purposes.',
  inputSchema: {
    type: 'object' as const,
    properties: {
      count: { type: 'number', description: 'Number of mock items to create (default 5, max 50)' },
      mediaType: {
        type: 'string',
        enum: ['text', 'json', 'mixed'],
        description: 'Type of mock files to generate (default mixed)',
      },
    },
  },
};

function makeTextContent(index: number): Buffer {
  return Buffer.from(
    `Mock media file #${index}\nGenerated at: ${new Date().toISOString()}\n` +
    `Content: ${'Lorem ipsum dolor sit amet. '.repeat(10)}\n`,
    'utf-8'
  );
}

function makeJsonContent(index: number): Buffer {
  return Buffer.from(
    JSON.stringify({
      mockIndex: index,
      generatedAt: new Date().toISOString(),
      data: Array.from({ length: 5 }, (_, i) => ({ id: i, value: Math.random() })),
    }, null, 2),
    'utf-8'
  );
}

export async function generateMockData(input: Record<string, unknown>) {
  const count = Math.min(Number(input['count'] ?? 5), 50);
  const mediaType = String(input['mediaType'] ?? 'mixed');

  // Ensure an active storage provider exists
  const providers = await get<Array<{ id: string; isActive: boolean }>>('/storage-providers');
  const active = providers.find(p => p.isActive);
  if (!active) {
    return 'No active storage provider configured. Please activate one via POST /storage-providers/:id/activate first.';
  }

  const results: string[] = [];
  for (let i = 1; i <= count; i++) {
    const useJson = mediaType === 'json' || (mediaType === 'mixed' && i % 2 === 0);
    const filename = useJson ? `mock-${i}.json` : `mock-${i}.txt`;
    const content = useJson ? makeJsonContent(i) : makeTextContent(i);
    const mime = useJson ? 'application/json' : 'text/plain';

    try {
      const item = await uploadFile<{ id: string; originalName: string; status: string }>(
        '/media/upload', filename, content, mime
      );
      results.push(`  [${i}/${count}] OK  id=${item.id}  name=${item.originalName}  status=${item.status}`);
    } catch (err) {
      results.push(`  [${i}/${count}] ERR ${String(err)}`);
    }
  }

  return [`Generated ${count} mock media items:`, ...results].join('\n');
}
