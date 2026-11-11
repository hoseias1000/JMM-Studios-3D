import { createReadStream } from 'node:fs';
import { readdir, stat } from 'node:fs/promises';
import { createInterface } from 'node:readline';
import { createHash } from 'node:crypto';
import { homedir } from 'node:os';
import path from 'node:path';

export const TIME_ZONE = 'America/Sao_Paulo';
const dayFormatter = new Intl.DateTimeFormat('en-CA', { timeZone: TIME_ZONE, year: 'numeric', month: '2-digit', day: '2-digit' });
const zero = () => ({ input: 0, cached: 0, output: 0, reasoning: 0, total: 0 });
const count = value => Number.isSafeInteger(value) && value >= 0 ? value : 0;
export function normalizeUsage(raw) {
  if (!raw || typeof raw !== 'object') return null;
  if (!Number.isSafeInteger(raw.input_tokens) || raw.input_tokens < 0 || !Number.isSafeInteger(raw.output_tokens) || raw.output_tokens < 0) return null;
  const input = count(raw.input_tokens), output = count(raw.output_tokens);
  return { input, cached: Math.min(input, count(raw.cached_input_tokens)), output, reasoning: Math.min(output, count(raw.reasoning_output_tokens)), total: input + output };
}
function cleanLimits(raw, timestamp) {
  if (!raw || typeof raw !== 'object') return null;
  const window = value => value && Number.isFinite(value.used_percent) && Number.isFinite(value.window_minutes) ? {
    usedPercent: Math.max(0, value.used_percent), windowMinutes: Math.max(0, value.window_minutes),
    resetsAt: Number.isFinite(value.resets_at) && Math.abs(value.resets_at) < 8.64e12 ? new Date(value.resets_at * 1000).toISOString() : null,
  } : null;
  const primary = window(raw.primary), secondary = window(raw.secondary);
  if (!primary && !secondary) return null;
  const plan = ['free', 'go', 'plus', 'pro', 'team', 'business', 'enterprise', 'edu'].includes(raw.plan_type) ? raw.plan_type : null;
  return { timestamp, primary, secondary, plan };
}
/** Only counters and a few metadata fields are retained. Messages/tool output never leave this module. */
export function createRolloutAccumulator() {
  let previous = null, model = 'unknown', cwd = '', sessionId = '', lastEventAt = null, limits = null, malformed = 0;
  const grouped = new Map();
  return {
    consume(row) {
      if (!row || typeof row !== 'object') return;
      const p = row.payload;
      if (!p || typeof p !== 'object') return;
      if (row.type === 'session_meta') {
        if (typeof p.cwd === 'string') cwd = p.cwd;
        if (typeof p.id === 'string' || typeof p.session_id === 'string') sessionId = p.id || p.session_id;
        return;
      }
      if (row.type === 'turn_context') {
        if (!cwd && typeof p.cwd === 'string') cwd = p.cwd;
        if (typeof p.model === 'string' && /^[a-z\d_.:-]{1,100}$/i.test(p.model)) model = p.model;
        return;
      }
      if (row.type !== 'event_msg' || p.type !== 'token_count') return;
      const timestamp = typeof row.timestamp === 'string' && Number.isFinite(Date.parse(row.timestamp)) ? row.timestamp : null;
      if (!timestamp) return;
      const nextLimits = cleanLimits(p.rate_limits, timestamp);
      if (nextLimits && (!limits || timestamp >= limits.timestamp)) limits = nextLimits;
      const cumulative = normalizeUsage(p.info?.total_token_usage);
      if (!cumulative || (lastEventAt && timestamp < lastEventAt)) return;
      let delta;
      if (!previous || cumulative.input < previous.input || cumulative.output < previous.output || cumulative.cached < previous.cached) {
        // A fork/resumed log may inherit a prior cumulative baseline. Count its last request,
        // then use cumulative differences for the remaining events in that file.
        delta = normalizeUsage(p.info?.last_token_usage) || cumulative;
      } else {
        delta = Object.fromEntries(Object.keys(cumulative).map(key => [key, Math.max(0, cumulative[key] - previous[key])]));
        delta.cached = Math.min(delta.cached, delta.input);
        delta.reasoning = Math.min(delta.reasoning, delta.output);
        delta.total = delta.input + delta.output;
      }
      previous = cumulative; lastEventAt = timestamp;
      if (delta.total === 0) return; // repeated quota snapshots are not new token usage
      const day = dayFormatter.format(new Date(timestamp));
      const key = `${day}/${model}`;
      const record = grouped.get(key) || { day, model, ...zero(), requests: 0 };
      for (const field of Object.keys(zero())) record[field] += delta[field];
      record.requests++;
      grouped.set(key, record);
    },
    malformed() { malformed++; },
    result() { return { cwd, sessionId, records: [...grouped.values()], lastEventAt, limits, malformed }; },
  };
}
export function parseRollout(text) {
  const accumulator = createRolloutAccumulator();
  for (const line of text.split(/\r?\n/)) {
    if (!line.trim()) continue;
    try { accumulator.consume(JSON.parse(line)); } catch { accumulator.malformed(); }
  }
  return accumulator.result();
}
const normalizePath = value => String(value || '').replace(/\\/g, '/').replace(/\/+$/, '').toLowerCase();
export function workspaceMatch(cwd, projectDir) {
  const a = normalizePath(cwd), b = normalizePath(projectDir);
  return !!a && !!b && (a === b || a.startsWith(`${b}/`) || b.startsWith(`${a}/`));
}
const fileCache = new Map();
async function readRollout(filename, info) {
  const cached = fileCache.get(filename);
  if (cached && cached.mtime === info.mtimeMs && cached.size === info.size) return cached.value;
  const accumulator = createRolloutAccumulator();
  const input = createReadStream(filename, { encoding: 'utf8' });
  const lines = createInterface({ input, crlfDelay: Infinity });
  try {
    for await (const line of lines) {
      // Skip transcript text before JSON parsing; never retain prompts, replies or tool results.
      if (!/"type"\s*:\s*"(session_meta|turn_context|token_count)"/.test(line)) continue;
      try { accumulator.consume(JSON.parse(line)); } catch { accumulator.malformed(); }
    }
  } finally { lines.close(); input.destroy(); }
  const value = accumulator.result();
  fileCache.set(filename, { mtime: info.mtimeMs, size: info.size, value });
  return value;
}
async function listRollouts(root) {
  const files = [];
  async function visit(directory, depth) {
    if (depth > 5 || files.length >= 1500) return;
    for (const entry of await readdir(directory, { withFileTypes: true })) {
      const filename = path.join(directory, entry.name);
      if (entry.isDirectory() && !entry.isSymbolicLink()) await visit(filename, depth + 1);
      else if (entry.isFile() && entry.name.endsWith('.jsonl')) files.push(filename);
    }
  }
  await visit(root, 0);
  return files;
}
export async function readCodexUsage(projectDir, { codexHome = process.env.CODEX_HOME || path.join(homedir(), '.codex'), scope = 'workspace', now = new Date() } = {}) {
  const base = { source: 'local-codex-logs', timeZone: TIME_ZONE, generatedAt: now.toISOString(), scope, records: [], limits: null, sessions: 0, filesScanned: 0, ignoredFiles: 0, malformedLines: 0, parentWorkspaceIncluded: false, truncated: false };
  let files;
  try { files = await listRollouts(path.join(codexHome, 'sessions')); }
  catch { return { ...base, available: false, message: 'Não foi possível ler a pasta local de sessões do Codex.' }; }
  const entries = [];
  for (const filename of files) {
    try { entries.push({ filename, info: await stat(filename) }); } catch { base.ignoredFiles++; }
  }
  entries.sort((a, b) => b.info.mtimeMs - a.info.mtimeMs);
  base.truncated = entries.length > 600 || files.length >= 1500;
  const sessions = new Map();
  let bytes = 0;
  for (const { filename, info } of entries.slice(0, 600)) {
    if (info.size > 40 * 1024 * 1024 || bytes + info.size > 200 * 1024 * 1024) { base.ignoredFiles++; base.truncated = true; continue; }
    bytes += info.size;
    try {
      const parsed = await readRollout(filename, info);
      base.filesScanned++; base.malformedLines += parsed.malformed;
      if (parsed.limits && (!base.limits || parsed.limits.timestamp > base.limits.timestamp)) base.limits = parsed.limits;
      if (scope === 'workspace' && !workspaceMatch(parsed.cwd, projectDir)) continue;
      if (scope === 'workspace' && normalizePath(projectDir).startsWith(`${normalizePath(parsed.cwd)}/`)) base.parentWorkspaceIncluded = true;
      const id = createHash('sha256').update(parsed.sessionId || filename).digest('hex').slice(0, 16);
      const existing = sessions.get(id);
      if (!existing || existing.modified < info.mtimeMs) sessions.set(id, { parsed, modified: info.mtimeMs });
    } catch { base.ignoredFiles++; }
  }
  for (const [session, { parsed }] of sessions) {
    if (parsed.records.length) base.sessions++;
    base.records.push(...parsed.records.map(record => ({ ...record, session })));
  }
  base.records.sort((a, b) => a.day.localeCompare(b.day));
  return { ...base, available: true, message: base.records.length ? 'Contadores de uso encontrados nos registros locais.' : 'Nenhum contador de tokens encontrado para este filtro.' };
}

export function createUsageHandler({ projectDir, codexHome } = {}) {
  const cache = new Map();
  return async (req, res) => {
    const send = (status, body) => { res.statusCode = status; res.setHeader('Content-Type', 'application/json; charset=utf-8'); res.setHeader('Cache-Control', 'no-store'); res.end(JSON.stringify(body)); };
    const host = String(req.headers.host || '').toLowerCase();
    if (!/^(localhost|127\.0\.0\.1|\[::1\])(:\d+)?$/.test(host)) return send(403, { error: 'Acesso disponível somente em localhost.' });
    if (req.headers.origin) {
      try { const origin = new URL(req.headers.origin); if (!['http:', 'https:'].includes(origin.protocol) || origin.host.toLowerCase() !== host) return send(403, { error: 'Origem não permitida.' }); }
      catch { return send(403, { error: 'Origem inválida.' }); }
    }
    if (req.headers['sec-fetch-site'] === 'cross-site') return send(403, { error: 'Origem não permitida.' });
    if (req.method !== 'GET') { res.setHeader('Allow', 'GET'); return send(405, { error: 'Apenas leitura é permitida.' }); }
    const url = new URL(req.url || '/', `http://${host}`);
    if (url.pathname !== '/' && url.pathname !== '') return send(404, { error: 'Rota não encontrada.' });
    const scope = url.searchParams.get('scope') === 'all' ? 'all' : 'workspace';
    try {
      let entry = cache.get(scope);
      if (!entry || Date.now() - entry.created > 15000 || url.searchParams.get('refresh') === '1') {
        entry = { created: Date.now(), promise: readCodexUsage(projectDir, { codexHome, scope }) };
        cache.set(scope, entry);
      }
      send(200, await entry.promise);
    } catch { cache.delete(scope); send(500, { error: 'Não foi possível atualizar os contadores locais.' }); }
  };
}
