import { get } from '../client.js';

export const listMediaTool = {
  name: 'list_media',
  description: 'List media items with optional filters. Returns paginated results.',
  inputSchema: {
    type: 'object' as const,
    properties: {
      page: { type: 'number', description: 'Page number (default 1)' },
      limit: { type: 'number', description: 'Items per page (default 20)' },
      mediaType: { type: 'string', enum: ['image', 'video', 'audio', 'document', 'archive', 'other'], description: 'Filter by media type' },
      status: { type: 'string', enum: ['Uploaded', 'Cached', 'Deleted'], description: 'Filter by status' },
      labelId: { type: 'string', description: 'Filter by label ID' },
    },
  },
};

export async function listMedia(input: Record<string, unknown>) {
  const params = new URLSearchParams();
  if (input['page']) params.set('page', String(input['page']));
  if (input['limit']) params.set('limit', String(input['limit']));
  if (input['mediaType']) params.set('mediaType', String(input['mediaType']));
  if (input['status']) params.set('status', String(input['status']));
  if (input['labelId']) params.set('labelId', String(input['labelId']));

  const query = params.toString();
  const data = await get<{ data: unknown[]; total: number; page: number; limit: number }>(
    `/media${query ? `?${query}` : ''}`
  );
  return JSON.stringify(data, null, 2);
}
