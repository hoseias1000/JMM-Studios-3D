import { test, expect } from '@playwright/test';
import { OrthographicCamera, Vector3 } from 'three';
import { officeView } from '../src/components/office/layout';
import { localDay } from '../src/services/codex-usage';

test('tela 3D abre tokens, filtros de produção e alteração persistente de etapa', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  let requests = 0;
  await page.route('**/api/codex-usage?*', route => {
    requests++;
    return route.fulfill({ contentType: 'application/json', body: JSON.stringify({
      source: 'local-codex-logs', available: true, message: '', scope: 'workspace', timeZone: 'America/Sao_Paulo',
      generatedAt: new Date().toISOString(), sessions: 1, filesScanned: 1, ignoredFiles: 0, malformedLines: 0,
      truncated: false, parentWorkspaceIncluded: false, limits: null,
      records: [{ session: 'test-session', day: localDay(), model: 'gpt-6.1-sol', input: 1000, cached: 300, output: 500, reasoning: 200, total: 1500, requests: 1 }],
    }) });
  });
  await page.goto('/');
  await expect(page.getByRole('button', { name: /^Selecionar Beatriz Nunes,/ })).toBeVisible();
  const canvas = page.locator('canvas');
  await canvas.scrollIntoViewIfNeeded();
  const box = (await canvas.boundingBox())!;
  const camera = new OrthographicCamera(-box.width / 2, box.width / 2, box.height / 2, -box.height / 2, .1, 140);
  camera.position.set(...officeView.position);
  camera.lookAt(...officeView.target);
  camera.zoom = Math.max(6, Math.min((box.width - 38) / officeView.projectedWidth, (box.height - 76) / officeView.projectedHeight, 66));
  camera.updateProjectionMatrix();
  camera.updateMatrixWorld();
  const screen = new Vector3(-8.88, 1.5, 11.65).project(camera);
  await page.mouse.click(box.x + (screen.x + 1) * box.width / 2, box.y + (1 - screen.y) * box.height / 2);
  const dialog = page.getByRole('dialog', { name: 'Painel do estúdio' });
  await expect(dialog).toBeVisible();
  await expect(dialog.locator('.studio-monitor-metrics strong').first()).toHaveAttribute('title', '1.500');
  await dialog.getByLabel('Período dos tokens').selectOption('1');
  await expect(dialog.locator('.studio-monitor-metrics strong').nth(1)).toHaveAttribute('title', '700');
  await expect(dialog.locator('.studio-monitor-metrics strong').nth(2)).toHaveAttribute('title', '300');
  const beforeRefresh = requests;
  await dialog.getByRole('button', { name: 'Atualizar tokens', exact: true }).click();
  await expect.poll(() => requests).toBeGreaterThan(beforeRefresh);
  await dialog.getByLabel('Canal das produções').selectOption('mundo');
  await expect(dialog.locator('.studio-monitor-task')).toHaveCount(2);
  const title = 'Por que os oceanos brilham?';
  await dialog.getByLabel(`Etapa no painel de ${title}`, { exact: true }).selectOption('Edição');
  await dialog.getByLabel('Etapa das produções').selectOption('Edição');
  await expect(dialog.locator('.studio-monitor-task')).toHaveCount(1);
  await expect(dialog.locator('.studio-monitor-task')).toContainText(title);
  const storedStage = await page.evaluate(() => JSON.parse(localStorage.getItem('jmm-studios-v1')!).state.tasks.find((task: { id: string }) => task.id === 'demo-3').stage);
  expect(storedStage).toBe('Edição');
  await page.screenshot({ path: 'test-results/painel-estudio-desktop.png' });
  await page.keyboard.press('Escape');
  await expect(dialog).toHaveCount(0);
  await page.getByRole('button', { name: 'Ampliar escritório', exact: true }).click();
  await page.getByRole('button', { name: 'Abrir painel do estúdio' }).click();
  await expect(dialog).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(dialog).toHaveCount(0);
  await expect(page.locator('.expanded-office')).toBeVisible();
  await page.getByRole('button', { name: 'Abrir painel do estúdio' }).click();
  await dialog.getByRole('button', { name: 'Abrir produção', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Fluxo de produção' })).toBeVisible();
  await expect(page.getByLabel(`Etapa de ${title}`, { exact: true })).toHaveValue('Edição');
  await page.getByRole('navigation').getByRole('button', { name: 'Escritório 3D', exact: true }).click();
  await expect(page.locator('.expanded-office')).toHaveCount(0);
  await page.evaluate(() => {
    Element.prototype.requestFullscreen = async () => { throw new Error('Fullscreen unavailable in this test'); };
  });
  await page.getByRole('button', { name: 'Ampliar escritório', exact: true }).click();
  await expect(page.locator('.expanded-office')).toBeVisible();
  await page.getByRole('button', { name: 'Abrir painel do estúdio' }).click();
  await dialog.getByRole('button', { name: 'Abrir produção', exact: true }).click();
  await page.getByRole('navigation').getByRole('button', { name: 'Escritório 3D', exact: true }).click();
  await expect(page.locator('.expanded-office')).toHaveCount(0);
  expect(errors).toEqual([]);
});

test('painel no celular abre pelo botão e informa falta de tokens', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.route('**/api/codex-usage?*', route => route.fulfill({ status: 503, body: 'Serviço indisponível' }));
  await page.goto('/');
  await page.getByRole('button', { name: 'Abrir painel do estúdio' }).click();
  const dialog = page.getByRole('dialog', { name: 'Painel do estúdio' });
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole('alert')).toContainText('serviço de leitura local');
  await expect(dialog.locator('.studio-monitor-metrics strong').first()).toHaveText('—');
  expect(await dialog.evaluate(element => element.scrollWidth <= element.clientWidth)).toBe(true);
  await page.screenshot({ path: 'test-results/painel-estudio-mobile.png' });
  await dialog.getByRole('button', { name: 'Fechar painel do estúdio' }).click();
  await expect(dialog).toHaveCount(0);
  await page.getByRole('button', { name: 'Abrir painel do estúdio' }).click();
  await dialog.getByRole('button', { name: 'Ver detalhes dos tokens' }).click();
  await expect(page.getByRole('heading', { name: 'Uso local do Codex' })).toBeVisible();
});
