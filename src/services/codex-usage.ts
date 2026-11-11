import { codexRates } from '../data/codex-rates';
import type { CodexUsageData, TokenCounts, UsageRecord } from '../types/codex';

export const emptyCounts = (): TokenCounts => ({ input: 0, cached: 0, output: 0, reasoning: 0, total: 0 });
export function addCounts(a: TokenCounts, b: TokenCounts) {
  return { input: a.input + b.input, cached: a.cached + b.cached, output: a.output + b.output, reasoning: a.reasoning + b.reasoning, total: a.total + b.total };
}
export function standardCredits(record: TokenCounts & { model: string }): number | null {
  const rate = codexRates[record.model];
  if (!rate) return null;
  return (Math.max(0, record.input - record.cached) * rate.input + record.cached * rate.cached + record.output * rate.output) / 1_000_000;
}
export function localDay(date = new Date()) {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo', year: 'numeric', month: '2-digit', day: '2-digit' }).format(date);
}
export function filterPeriod(records: UsageRecord[], days: string) {
  if (days === 'all') return records;
  const today = localDay();
  const start = new Date(`${today}T12:00:00Z`);
  start.setUTCDate(start.getUTCDate() - Number(days) + 1);
  const from = start.toISOString().slice(0, 10);
  return records.filter(r => r.day >= from && r.day <= today);
}
export async function fetchCodexUsage(scope: string, refresh: boolean, signal: AbortSignal): Promise<CodexUsageData> {
  const response = await fetch(`/api/codex-usage?scope=${encodeURIComponent(scope)}${refresh ? '&refresh=1' : ''}`, { signal, cache: 'no-store' });
  if (!response.ok || !response.headers.get('content-type')?.includes('application/json')) throw new Error('O serviço de leitura local não está disponível. Reinicie npm.cmd run dev ou use npm.cmd run preview.');
  const data = await response.json();
  if (data.source !== 'local-codex-logs' || !Array.isArray(data.records)) throw new Error('O serviço local retornou dados em formato inesperado.');
  return data;
}
export function exportUsageCsv(records: UsageRecord[]) {
  const header = 'Data;Modelo;Entrada sem cache;Cache;Saida;Raciocinio incluido na saida;Total;Creditos equivalentes Standard';
  const lines = records.map(r => [r.day, r.model, r.input - r.cached, r.cached, r.output, r.reasoning, r.total, standardCredits(r)?.toFixed(6).replace('.', ',') ?? ''].map(v => `"${String(v).replaceAll('"', '""')}"`).join(';'));
  const blob = new Blob(['\uFEFF' + [header, ...lines].join('\r\n')], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a'); anchor.href = url; anchor.download = `jmm-codex-tokens-${localDay()}.csv`; anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
