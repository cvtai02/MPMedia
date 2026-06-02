import { get, del, post } from '../client.js';

export const listLabelsTool = {
  name: 'list_labels',
  description: 'List all labels with their IDs, names, and colors.',
  inputSchema: { type: 'object' as const, properties: {} },
};

export const listStorageProvidersTool = {
  name: 'list_storage_providers',
  description: 'List all storage providers and their active/health status.',
  inputSchema: { type: 'object' as const, properties: {} },
};

export const testStorageProviderTool = {
  name: 'test_storage_provider',
  description: 'Run a health check on a storage provider.',
  inputSchema: {
    type: 'object' as const,
    required: ['providerId'],
    properties: {
      providerId: { type: 'string', description: 'Storage provider ID' },
    },
  },
};

export const getSettingsTool = {
  name: 'get_settings',
  description: 'Get current application settings (cache, storage, backup config).',
  inputSchema: { type: 'object' as const, properties: {} },
};

export const clearOrphanCachesTool = {
  name: 'clear_orphan_caches',
  description: 'Find and clear cache entries for media items that are in Cached status but have no primary file record.',
  inputSchema: {
    type: 'object' as const,
    properties: {
      dryRun: { type: 'boolean', description: 'If true, only report without making changes (default true)' },
    },
  },
};

export async function listLabels(_input: Record<string, unknown>) {
  const labels = await get<Array<{ id: string; name: string; color: string | null; createdAt: string }>>('/labels');
  if (!labels.length) return 'No labels found.';
  return labels.map(l => `  ${l.id}  ${l.name}  ${l.color ?? '(no color)'}`).join('\n');
}

export async function listStorageProviders(_input: Record<string, unknown>) {
  const providers = await get<Array<{ id: string; name: string; type: string; isActive: boolean }>>('/storage-providers');
  if (!providers.length) return 'No storage providers configured.';
  return providers.map(p => `  ${p.isActive ? '[ACTIVE]' : '       '} ${p.type.padEnd(12)} ${p.name.padEnd(24)} id=${p.id}`).join('\n');
}

export async function testStorageProvider(input: Record<string, unknown>) {
  const providerId = String(input['providerId']);
  try {
    const result = await post<{ healthy: boolean; message: string }>(`/storage-providers/${providerId}/test`);
    return `${result.healthy ? 'HEALTHY' : 'UNHEALTHY'}: ${result.message}`;
  } catch (e) {
    return `Health check failed: ${String(e)}`;
  }
}

export async function getSettings(_input: Record<string, unknown>) {
  const settings = await get<unknown>('/settings');
  return JSON.stringify(settings, null, 2);
}

interface MediaItem {
  id: string;
  originalName: string;
  status: string;
  files: Array<{ isPrimary: boolean }>;
}

export async function clearOrphanCaches(input: Record<string, unknown>) {
  const dryRun = input['dryRun'] !== false;
  const lines: string[] = [`=== Orphan Cache Check (dryRun=${dryRun}) ===`, ''];

  const resp = await get<{ data: MediaItem[]; total: number }>('/media?status=Cached&limit=100');
  const orphans = resp.data.filter(item => !item.files?.some(f => f.isPrimary));

  if (!orphans.length) {
    lines.push('No orphan cache entries found.');
    return lines.join('\n');
  }

  lines.push(`Found ${orphans.length} item(s) with Cached status but no primary file:`);
  for (const item of orphans) {
    lines.push(`  id=${item.id}  name=${item.originalName}`);
    if (!dryRun) {
      try {
        await del(`/media/${item.id}/cache`);
        lines.push(`    → cache cleared`);
      } catch (e) {
        lines.push(`    → clear failed: ${String(e)}`);
      }
    }
  }
  if (dryRun) lines.push('\nRun with dryRun=false to clear these entries.');
  return lines.join('\n');
}
