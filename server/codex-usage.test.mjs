import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { createServer } from 'node:http';
import { createUsageHandler, normalizeUsage, parseRollout, readCodexUsage, workspaceMatch } from './codex-usage.mjs';

const usage = (input, cached, output, reasoning = 0) => ({ input_tokens: input, cached_input_tokens: cached, output_tokens: output, reasoning_output_tokens: reasoning, total_tokens: input + output });
const meta = (id = 'test-session', cwd = 'D:/work/JMM') => ({ type: 'session_meta', payload: { id, cwd, base_instructions: 'PRIVATE_CONTENT_MUST_NOT_LEAVE_SERVER' } });
const context = model => ({ type: 'turn_context', payload: { model } });
const event = (total, last = total, timestamp = '2026-11-11T02:30:00Z') => ({ type: 'event_msg', timestamp, payload: { type: 'token_count', info: { total_token_usage: total, last_token_usage: last } } });
const jsonl = rows => rows.map(r => typeof r === 'string' ? r : JSON.stringify(r)).join('\n');

test('cache is a subset of input and reasoning is a subset of output', () => {
  assert.deepEqual(normalizeUsage(usage(100, 140, 20, 40)), { input: 100, cached: 100, output: 20, reasoning: 20, total: 120 });
  assert.equal(normalizeUsage({}), null);
  assert.equal(normalizeUsage({ input_tokens: -1, output_tokens: 2 }), null);
});
test('cumulative snapshots are deduplicated and midnight uses Sao Paulo time', () => {
  const result = parseRollout(jsonl([meta(), context('gpt-6.1-sol'), event(usage(100, 80, 20, 5)), event(usage(100, 80, 20, 5)), event(usage(160, 120, 30, 9), usage(60, 40, 10, 4), '2026-11-11T03:30:00Z')]));
  assert.equal(result.records.length, 2);
  assert.equal(result.records[0].day, '2026-11-10');
  assert.equal(result.records[1].day, '2026-11-11');
  assert.equal(result.records.reduce((s, r) => s + r.total, 0), 190);
  assert.equal(result.records.reduce((s, r) => s + r.requests, 0), 2);
});
test('inherited baselines and counter resets do not bill inherited history again', () => {
  const result = parseRollout(jsonl([meta(), context('gpt-6.1-sol'), event(usage(1000, 800, 100, 10), usage(100, 80, 10, 1)), event(usage(1100, 880, 110, 11), usage(100, 80, 10, 1)), event(usage(50, 20, 5, 1), usage(50, 20, 5, 1))]));
  assert.equal(result.records[0].total, 275);
  assert.equal(result.records[0].input, 250);
  assert.equal(result.records[0].cached, 180);
});
test('model changes, malformed trailing lines and quota-only events are handled', () => {
  const a = event(usage(100, 80, 20));
  a.payload.rate_limits = { plan_type: 'plus', primary: { used_percent: 43, window_minutes: 300, resets_at: 1794372244 } };
  const result = parseRollout(jsonl([meta(), context('gpt-6.1-sol'), a, context('gpt-6-luna'), event(usage(160, 120, 30), usage(60, 40, 10)), { type: 'event_msg', timestamp: '2026-11-11T03:00:00Z', payload: { type: 'token_count', info: null } }, '{"type":"event_msg","payload":{"type":"token_count"']));
  assert.equal(result.records.length, 2);
  assert.equal(result.records[1].model, 'gpt-6-luna');
  assert.equal(result.records[1].total, 70);
  assert.equal(result.malformed, 1);
  assert.equal(result.limits.primary.usedPercent, 43);
});
test('workspace filtering includes the launch folder parent without prefix collisions', () => {
  assert.equal(workspaceMatch('D:\\work', 'd:/work/JMM'), true);
  assert.equal(workspaceMatch('D:/work/JMM/src', 'D:/work/JMM'), true);
  assert.equal(workspaceMatch('D:/work/JMM-other', 'D:/work/JMM'), false);
  assert.equal(workspaceMatch('', 'D:/work/JMM'), false);
});
test('reader aggregates local files, deduplicates copies and never returns transcript content', async () => {
  const directory = await mkdtemp(path.join(tmpdir(), 'jmm-usage-test-'));
  try {
    await mkdir(path.join(directory, 'sessions'));
    const rows = [meta('session-one'), context('gpt-6.1-sol'), { type: 'response_item', payload: { message: 'SECRET_API_KEY_EXAMPLE_DO_NOT_RETURN' } }, event(usage(100, 80, 20))];
    await writeFile(path.join(directory, 'sessions', 'one.jsonl'), jsonl(rows));
    await writeFile(path.join(directory, 'sessions', 'copy.jsonl'), jsonl(rows));
    await writeFile(path.join(directory, 'sessions', 'other.jsonl'), jsonl([meta('session-two', 'D:/elsewhere'), context('gpt-6-luna'), event(usage(50, 0, 10))]));
    const report = await readCodexUsage('D:/work/JMM', { codexHome: directory });
    assert.equal(report.available, true);
    assert.equal(report.sessions, 1);
    assert.equal(report.records.length, 1);
    assert.equal(report.records[0].total, 120);
    assert.equal(JSON.stringify(report).includes('SECRET'), false);
    assert.equal(JSON.stringify(report).includes('PRIVATE_CONTENT'), false);
    assert.equal(JSON.stringify(report).includes('D:/work'), false);
    const all = await readCodexUsage('D:/work/JMM', { codexHome: directory, scope: 'all' });
    assert.equal(all.sessions, 2);
    assert.equal(all.records.reduce((s, r) => s + r.total, 0), 180);
  } finally {
    const cleanupTarget = path.resolve(directory);
    assert.ok(cleanupTarget.startsWith(path.resolve(tmpdir()) + path.sep) && path.basename(cleanupTarget).startsWith('jmm-usage-test-'));
    await rm(cleanupTarget, { recursive: true, force: true });
  }
});
test('missing sessions produce unavailable, never fabricated consumption', async () => {
  const report = await readCodexUsage('D:/work/JMM', { codexHome: path.join(tmpdir(), 'jmm-nonexistent-usage-folder') });
  assert.equal(report.available, false);
  assert.deepEqual(report.records, []);
});
test('HTTP endpoint rejects foreign origins and mutations', async () => {
  const handler = createUsageHandler({ projectDir: 'D:/work/JMM', codexHome: path.join(tmpdir(), 'jmm-nonexistent-usage-folder') });
  const server = createServer(handler);
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  try {
    const base = `http://127.0.0.1:${server.address().port}/`;
    assert.equal((await fetch(base, { headers: { Origin: 'https://foreign.example' } })).status, 403);
    assert.equal((await fetch(base, { method: 'POST' })).status, 405);
    const response = await fetch(base);
    assert.equal(response.status, 200);
    assert.equal((await response.json()).available, false);
    assert.equal(response.headers.get('cache-control'), 'no-store');
  } finally { await new Promise(resolve => server.close(resolve)); }
});
