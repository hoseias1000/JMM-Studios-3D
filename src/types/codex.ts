export interface TokenCounts { input: number; cached: number; output: number; reasoning: number; total: number }
export interface UsageRecord extends TokenCounts { day: string; model: string; session: string; requests: number }
export interface UsageWindow { usedPercent: number; windowMinutes: number; resetsAt: string | null }
export interface CodexUsageData {
  source: 'local-codex-logs'; available: boolean; message: string; timeZone: string; generatedAt: string;
  scope: string; records: UsageRecord[]; sessions: number; filesScanned: number; ignoredFiles: number;
  malformedLines: number; parentWorkspaceIncluded: boolean; truncated: boolean;
  limits: { timestamp: string; primary: UsageWindow | null; secondary: UsageWindow | null; plan: string | null } | null;
}
