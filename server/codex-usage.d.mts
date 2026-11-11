import type { IncomingMessage, ServerResponse } from 'node:http';
import type { CodexUsageData } from '../src/types/codex';
export function createUsageHandler(options: { projectDir: string; codexHome?: string }): (req: IncomingMessage, res: ServerResponse) => Promise<void>;
export function readCodexUsage(projectDir: string, options?: { codexHome?: string; scope?: string; now?: Date }): Promise<CodexUsageData>;
