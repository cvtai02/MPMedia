#!/usr/bin/env node
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';

import { listMedia } from './tools/list-media.js';
import { generateMockData } from './tools/generate-mock-data.js';
import { smokeTest } from './tools/smoke-test.js';
import { verifyStorage, verifyBackup } from './tools/verify-storage.js';
import {
  listLabels,
  listStorageProviders,
  testStorageProvider,
  getSettings,
  clearOrphanCaches,
} from './tools/maintenance.js';

const server = new McpServer({
  name: 'mpmedia-api',
  version: '0.1.0',
});

// ── List Media ──────────────────────────────────────────────────────────────
server.tool(
  'list_media',
  'List media items with optional filters. Returns paginated results.',
  {
    page: z.number().optional().describe('Page number (default 1)'),
    limit: z.number().optional().describe('Items per page (default 20)'),
    mediaType: z.enum(['image', 'video', 'audio', 'document', 'archive', 'other']).optional().describe('Filter by media type'),
    status: z.enum(['Uploaded', 'Cached', 'Deleted']).optional().describe('Filter by status'),
    labelId: z.string().optional().describe('Filter by label ID'),
  },
  async (input) => ({
    content: [{ type: 'text', text: await listMedia(input as Record<string, unknown>) }],
  })
);

// ── Generate Mock Data ──────────────────────────────────────────────────────
server.tool(
  'generate_mock_data',
  'Generate and upload mock media items to the API for testing purposes.',
  {
    count: z.number().optional().describe('Number of mock items to create (default 5, max 50)'),
    mediaType: z.enum(['text', 'json', 'mixed']).optional().describe('Type of mock files to generate (default mixed)'),
  },
  async (input) => ({
    content: [{ type: 'text', text: await generateMockData(input as Record<string, unknown>) }],
  })
);

// ── Smoke Test ──────────────────────────────────────────────────────────────
server.tool(
  'smoke_test',
  'Run a full smoke test against the API: upload, download, cache, labels, and cleanup.',
  {
    cleanup: z.boolean().optional().describe('Delete created resources after test (default true)'),
  },
  async (input) => ({
    content: [{ type: 'text', text: await smokeTest(input as Record<string, unknown>) }],
  })
);

// ── Verify Storage ──────────────────────────────────────────────────────────
server.tool(
  'verify_storage',
  'Check cached media files — verifies each local cache file exists on disk. Optionally re-caches missing ones.',
  {
    fix: z.boolean().optional().describe('Re-cache missing files automatically (default false)'),
  },
  async (input) => ({
    content: [{ type: 'text', text: await verifyStorage(input as Record<string, unknown>) }],
  })
);

// ── Verify Backup ───────────────────────────────────────────────────────────
server.tool(
  'verify_backup',
  'List all backup jobs and their recent run status.',
  {},
  async (input) => ({
    content: [{ type: 'text', text: await verifyBackup(input as Record<string, unknown>) }],
  })
);

// ── Labels ──────────────────────────────────────────────────────────────────
server.tool(
  'list_labels',
  'List all labels with their IDs, names, and colors.',
  {},
  async (input) => ({
    content: [{ type: 'text', text: await listLabels(input as Record<string, unknown>) }],
  })
);

// ── Storage Providers ───────────────────────────────────────────────────────
server.tool(
  'list_storage_providers',
  'List all storage providers and which one is active.',
  {},
  async (input) => ({
    content: [{ type: 'text', text: await listStorageProviders(input as Record<string, unknown>) }],
  })
);

server.tool(
  'test_storage_provider',
  'Run a health check on a specific storage provider.',
  {
    providerId: z.string().describe('Storage provider ID'),
  },
  async (input) => ({
    content: [{ type: 'text', text: await testStorageProvider(input as Record<string, unknown>) }],
  })
);

// ── Settings ─────────────────────────────────────────────────────────────────
server.tool(
  'get_settings',
  'Get current application settings (cache path, active provider, backup config).',
  {},
  async (input) => ({
    content: [{ type: 'text', text: await getSettings(input as Record<string, unknown>) }],
  })
);

// ── Maintenance ──────────────────────────────────────────────────────────────
server.tool(
  'clear_orphan_caches',
  'Find media items stuck in Cached status with no primary file, and clear them.',
  {
    dryRun: z.boolean().optional().describe('Only report without making changes (default true)'),
  },
  async (input) => ({
    content: [{ type: 'text', text: await clearOrphanCaches(input as Record<string, unknown>) }],
  })
);

// ── Start ────────────────────────────────────────────────────────────────────
const transport = new StdioServerTransport();
await server.connect(transport);
