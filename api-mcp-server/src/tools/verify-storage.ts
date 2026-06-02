import * as fs from 'fs/promises';
import { get, post } from '../client.js';

export const verifyStorageTool = {
  name: 'verify_storage',
  description: 'Check all cached media files: verify the local cache file exists on disk. Reports missing files and optionally clears broken cache entries.',
  inputSchema: {
    type: 'object' as const,
    properties: {
      fix: {
        type: 'boolean',
        description: 'If true, automatically clear cache entries whose files are missing on disk (default false)',
      },
    },
  },
};

export const verifyBackupTool = {
  name: 'verify_backup',
  description: 'List all backup jobs and their recent runs, showing success/failure status.',
  inputSchema: {
    type: 'object' as const,
    properties: {},
  },
};

interface MediaFile {
  id: string;
  isPrimary: boolean;
  isCached: boolean;
  localCachePath: string | null;
  providerType: string;
  providerKey: string;
}

interface MediaItem {
  id: string;
  originalName: string;
  status: string;
  files: MediaFile[];
}

interface PaginatedMedia {
  data: MediaItem[];
  total: number;
  page: number;
  limit: number;
}

export async function verifyStorage(input: Record<string, unknown>) {
  const fix = input['fix'] === true;
  const lines: string[] = ['=== Storage Verification ===', ''];

  let page = 1;
  const limit = 50;
  let totalChecked = 0;
  const missing: Array<{ mediaId: string; name: string; path: string }> = [];

  while (true) {
    const resp = await get<PaginatedMedia>(`/media?page=${page}&limit=${limit}&status=Cached`);
    if (resp.data.length === 0) break;

    for (const item of resp.data) {
      totalChecked++;
      const primary = item.files?.find(f => f.isPrimary);
      if (!primary?.isCached || !primary.localCachePath) continue;

      try {
        await fs.access(primary.localCachePath);
      } catch {
        missing.push({ mediaId: item.id, name: item.originalName, path: primary.localCachePath });
      }
    }

    if (resp.data.length < limit) break;
    page++;
  }

  lines.push(`Checked ${totalChecked} cached items.`);

  if (missing.length === 0) {
    lines.push('All cache files present on disk. No issues found.');
  } else {
    lines.push(`Found ${missing.length} missing cache file(s):`);
    for (const m of missing) {
      lines.push(`  MISSING  id=${m.mediaId}  name=${m.name}`);
      lines.push(`           path=${m.path}`);

      if (fix) {
        try {
          await post(`/media/${m.mediaId}/cache`, undefined);
          lines.push(`           → re-cached OK`);
        } catch (e) {
          lines.push(`           → re-cache FAILED: ${String(e)}`);
        }
      }
    }
    if (!fix) {
      lines.push('');
      lines.push('Run with fix=true to re-cache missing files.');
    }
  }

  return lines.join('\n');
}

export async function verifyBackup(_input: Record<string, unknown>) {
  const lines: string[] = ['=== Backup Verification ===', ''];
  try {
    const jobs = await get<Array<{ id: string; name: string; isEnabled: boolean; lastRunAt: string | null }>>('/backups');
    if (!jobs.length) {
      return 'No backup jobs configured.';
    }
    for (const job of jobs) {
      lines.push(`Job: ${job.name} (id=${job.id}) enabled=${job.isEnabled} lastRun=${job.lastRunAt ?? 'never'}`);
    }
  } catch (e) {
    lines.push(`Could not fetch backup jobs: ${String(e)}`);
    lines.push('(Backup API may not be implemented yet)');
  }
  return lines.join('\n');
}
