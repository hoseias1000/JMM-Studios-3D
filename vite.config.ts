import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { codexUsagePlugin } from './server/codex-plugin';
export default defineConfig({ plugins: [react(), codexUsagePlugin()] });
