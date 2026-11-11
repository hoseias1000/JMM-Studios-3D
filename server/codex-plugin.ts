import type { Plugin } from 'vite';
import { createUsageHandler } from './codex-usage.mjs';

export function codexUsagePlugin(): Plugin {
  const handler = createUsageHandler({ projectDir: process.cwd() });
  return {
    name: 'jmm-local-codex-usage',
    configureServer(server) { server.middlewares.use('/api/codex-usage', handler); },
    configurePreviewServer(server) { server.middlewares.use('/api/codex-usage', handler); },
  };
}
