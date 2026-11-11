import { test, expect } from '@playwright/test';
import { roomDoors } from '../src/components/office/layout';

test('portas nas áreas comuns e nos acessos indicados de Edição e Revisão', () => {
  expect([...new Set(roomDoors.map(door => door.room))].sort()).toEqual(['break', 'ceo', 'editing', 'entrance', 'meeting', 'review']);
  expect(new Set(roomDoors.map(d => d.id)).size).toBe(roomDoors.length);
});

test('painel de tokens: dados medidos, estimativa parcial, filtros, CSV e leitura indisponível', async ({ page }) => {
  const day = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
  let unavailable = false;
  await page.route('**/api/codex-usage?*', route => route.fulfill({ contentType: 'application/json', body: JSON.stringify({
    source: 'local-codex-logs', available: !unavailable, message: unavailable ? 'Nenhum contador local disponível.' : 'Leitura local.', timeZone: 'America/Sao_Paulo', generatedAt: new Date().toISOString(), scope: 'workspace', sessions: 1, filesScanned: 1, ignoredFiles: 0, malformedLines: 0, truncated: false, parentWorkspaceIncluded: true,
    records: unavailable ? [] : [
      { session: 'anonymous-test', day, model: 'gpt-6.1-sol', input: 100000, cached: 80000, output: 10000, reasoning: 2000, total: 110000, requests: 2 },
      { session: 'anonymous-test', day, model: 'unpriced-model', input: 100, cached: 0, output: 20, reasoning: 0, total: 120, requests: 1 },
    ],
    limits: { timestamp: new Date().toISOString(), plan: 'plus', primary: { usedPercent: 20, windowMinutes: 300, resetsAt: new Date(Date.now() + 3600000).toISOString() }, secondary: null },
  }) }));
  await page.goto('/');
  await page.getByRole('button', { name: 'Tokens Codex', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Uso local do Codex' })).toBeVisible();
  await expect(page.locator('.token-metric').first().locator('strong')).toHaveAttribute('title', '110.120');
  await expect(page.locator('.token-cost')).toContainText('3,7 créditos equivalentes');
  await expect(page.locator('.token-cost')).toContainText('Estimativa parcial');
  await expect(page.locator('.token-invoice')).toContainText('Não disponível');
  await expect(page.locator('.token-models')).toContainText('Taxa não cadastrada');
  await expect(page.locator('.token-quota')).toContainText('20% usado');
  await expect(page.locator('.token-scope-note')).toContainText('pasta pai');
  await page.getByLabel('Período', { exact: true }).selectOption('1');
  const download = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Exportar CSV' }).click();
  const exported = await download;
  expect(exported.suggestedFilename()).toContain('jmm-codex-tokens-');
  const stream = await exported.createReadStream();
  let csv = '';
  for await (const chunk of stream!) csv += chunk.toString();
  expect(csv).toContain('"3,700000"');
  expect(csv).toContain('"20000"');
  await page.screenshot({ path: 'test-results/tokens-codex.png', fullPage: true });
  unavailable = true;
  await page.getByRole('button', { name: 'Atualizar', exact: true }).click();
  await expect(page.getByRole('status')).toContainText('Nenhum contador local disponível.');
  await expect(page.locator('.token-metric').first().locator('strong')).toHaveText('—');
});

test('leitor real expõe somente agregados de uso, sem conteúdo de sessões', async ({ request, page }) => {
  const response = await request.get('/api/codex-usage?scope=workspace');
  expect(response.status()).toBe(200);
  const report = await response.json();
  expect(report.source).toBe('local-codex-logs');
  expect(Array.isArray(report.records)).toBe(true);
  for (const record of report.records) {
    expect(record.total).toBe(record.input + record.output);
    expect(record.cached).toBeLessThanOrEqual(record.input);
    expect(record.reasoning).toBeLessThanOrEqual(record.output);
    expect(record.session).toMatch(/^[a-f0-9]{16}$/);
  }
  expect(JSON.stringify(report)).not.toContain('base_instructions');
  expect(JSON.stringify(report)).not.toContain('creator_account_id');
  expect(JSON.stringify(report)).not.toContain('"cwd"');
  await page.goto('/');
  await page.getByRole('button', { name: 'Tokens Codex', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Atualizar', exact: true })).toBeVisible({ timeout: 25000 });
  await page.screenshot({ path: 'test-results/tokens-codex-real.png', fullPage: true });
});

test('painel de tokens no celular sem transbordar a página', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await page.getByRole('button', { name: 'Abrir menu' }).click();
  await page.getByRole('button', { name: 'Tokens Codex', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Uso local do Codex' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Atualizar', exact: true })).toBeVisible({ timeout: 25000 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: 'test-results/tokens-codex-mobile.png', fullPage: true });
});
