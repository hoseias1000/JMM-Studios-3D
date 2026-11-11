import { test, expect } from '@playwright/test';

test('recepcionista: balcão, seleção, ordens, estados e persistência', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('/');
  await expect(page.getByRole('navigation').getByRole('button', { name: 'Agentes 7', exact: true })).toBeVisible();
  await expect(page.locator('.stat-card').first().locator('strong')).toHaveText('07');
  const label = (state: string) => page.getByRole('button', { name: `Selecionar Beatriz Nunes, ${state}`, exact: true });
  await label('Disponível').click();
  let panel = page.getByRole('complementary', { name: 'Detalhes de Beatriz Nunes' });
  await expect(panel.locator('.profile')).toContainText('Recepcionista');
  await expect(panel.locator('.profile-details')).toContainText('Recepção');
  await expect(panel.locator('.profile-details')).toContainText('Lucas Mendes');
  await expect(panel.locator('.quiet-box')).toContainText('Nenhuma tarefa pendente');
  await page.locator('.scene-container').screenshot({ path: 'test-results/recepcao-beatriz.png' });

  const brief = 'Receba um visitante e organize uma reunião com a direção.';
  await panel.getByLabel('Ordem para o agente', { exact: true }).fill(brief);
  await panel.getByRole('button', { name: 'Enviar ordem', exact: true }).click();
  await expect(label('Trabalhando')).toBeVisible();
  await expect(panel.locator('.current-task')).toContainText(brief);
  await expect(panel.locator('.current-task .progress-caption')).toContainText('Ideia');
  await expect(panel.locator('.agent-preview summary')).toContainText('Plano de atendimento demonstrativo');
  await expect(panel.locator('.agent-preview pre')).toContainText('Nenhum visitante real foi cadastrado');
  const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('jmm-studios-v1')!).state);
  expect(saved.tasks).toHaveLength(7);
  expect(saved.tasks.filter((task: { id: string }) => task.id.startsWith('demo-'))).toHaveLength(6);
  const order = saved.tasks.find((task: { instructions?: string }) => task.instructions === brief);
  expect(order.agentId).toBe('receptionist');
  expect(saved.currentTaskIds.receptionist).toBe(order.id);

  // The seventh agent needs a valid place in both shared rooms, too.
  for (const state of ['Em reunião', 'Em pausa', 'Em deslocamento', 'Trabalhando']) {
    await panel.getByLabel('Estado do agente').selectOption(state);
    await expect(label(state)).toBeVisible();
  }
  await page.reload();
  await label('Trabalhando').click();
  panel = page.getByRole('complementary', { name: 'Detalhes de Beatriz Nunes' });
  await expect(panel.locator('.current-task')).toContainText(brief);
  await expect(panel.locator('.agent-preview pre')).toContainText(brief);
  await page.getByRole('navigation').getByRole('button', { name: 'Agentes 7', exact: true }).click();
  await expect(page.locator('.agent-card').filter({ has: page.getByRole('heading', { name: 'Beatriz Nunes', exact: true }) })).toContainText('Recepcionista');
  expect(errors).toEqual([]);
});
