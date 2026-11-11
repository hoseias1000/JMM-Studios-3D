import { test, expect } from '@playwright/test';

test('sala exclusiva da CEO, seleção e retorno à nova estação', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('/');
  await expect(page.locator('[data-room="ceo"]')).toContainText('SALA DA CEO');
  await expect(page.locator('.office-header')).toContainText('8 salas');
  const label = page.getByRole('button', { name: 'Selecionar Marina Costa, Disponível' });
  await label.click();
  const panel = page.getByRole('complementary', { name: 'Detalhes de Marina Costa' });
  await expect(panel.locator('.profile-details')).toContainText('Sala da CEO');
  const home = (await label.boundingBox())!;
  await page.getByLabel('Estado do agente').selectOption('Em reunião');
  const meeting = page.getByRole('button', { name: 'Selecionar Marina Costa, Em reunião' });
  await expect.poll(async () => Math.abs((await meeting.boundingBox())!.x - home.x)).toBeGreaterThan(100);
  await page.getByLabel('Estado do agente').selectOption('Disponível');
  await expect.poll(async () => Math.abs((await label.boundingBox())!.x - home.x)).toBeLessThan(3);
  await panel.getByRole('button', { name: 'Fechar painel' }).click();
  await page.getByRole('button', { name: 'Ampliar escritório', exact: true }).click();
  await page.screenshot({ path: 'test-results/sala-executiva-ceo.png', fullPage: true });
  expect(errors).toEqual([]);
});

for (const mobile of [false, true]) {
  test(`botão Selecionar agente abre a equipe e suas tarefas no ${mobile ? 'celular' : 'desktop'}`, async ({ page }) => {
    if (mobile) await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');
    await expect(page.locator('canvas')).toBeVisible();
    if (!mobile) await page.getByRole('button', { name: 'Ampliar escritório', exact: true }).click();
    await page.getByRole('button', { name: 'Selecionar agente', exact: true }).click();
    await expect(page.locator('.agents-grid')).toBeVisible();
    await page.locator('.agent-card').filter({ has: page.getByRole('heading', { name: 'Sofia Almeida', exact: true }) }).click();
    const panel = page.getByRole('complementary', { name: 'Detalhes de Sofia Almeida' });
    await expect(panel.locator('.current-task')).toContainText('O mistério das cidades submersas');
    await expect(panel.getByLabel('Ordem para o agente', { exact: true })).toBeEnabled();
  });
}

test('escritório 3D, seleção, criação, Kanban e persistência', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', err => errors.push(err.message));
  await page.goto('/');
  await expect(page.locator('canvas')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Selecionar Sofia Almeida, Trabalhando' })).toBeVisible();
  const labelBox = await page.getByRole('button', { name: 'Selecionar Sofia Almeida, Trabalhando' }).boundingBox();
  expect(labelBox!.width).toBeLessThan(150);
  await page.getByRole('button', { name: 'Selecionar Sofia Almeida, Trabalhando' }).click();
  const panel = page.getByRole('complementary', { name: 'Detalhes de Sofia Almeida' });
  await expect(panel.getByRole('heading', { name: 'Sofia Almeida', exact: true })).toBeVisible();
  await panel.getByLabel('Estado do agente').selectOption('Em pausa');
  await expect(page.getByRole('button', { name: 'Selecionar Sofia Almeida, Em pausa' })).toBeVisible();
  await page.getByRole('button', { name: 'Nova tarefa', exact: true }).click();
  await page.getByLabel('Nome da tarefa').fill('Vídeo de teste: auroras boreais');
  await page.getByRole('button', { name: 'Criar tarefa', exact: true }).click();
  await expect(page.locator('dialog')).toHaveCount(0);
  await expect(panel.locator('.assigned-tasks')).toContainText('Vídeo de teste: auroras boreais');
  await page.getByRole('button', { name: 'Produção', exact: true }).click();
  await page.getByLabel('Etapa de Vídeo de teste: auroras boreais', { exact: true }).selectOption('Revisão');
  await expect(page.locator('.kanban-column').filter({ has: page.getByRole('heading', { name: 'Revisão', exact: true }) })).toContainText('Vídeo de teste: auroras boreais');
  await page.reload();
  await page.getByRole('button', { name: 'Produção', exact: true }).click();
  await expect(page.getByLabel('Etapa de Vídeo de teste: auroras boreais', { exact: true })).toHaveValue('Revisão');
  await page.getByRole('button', { name: /^Agentes \d+$/ }).click();
  await page.getByRole('button').filter({ has: page.getByRole('heading', { name: 'Sofia Almeida', exact: true }) }).click();
  await expect(page.getByLabel('Estado do agente')).toHaveValue('Em pausa');
  await expect(page.locator('.activity-log')).toContainText('auroras boreais');
  await page.screenshot({ path: 'test-results/desktop-agentes.png', fullPage: true });
  expect(errors).toEqual([]);
});

test('câmera, preferências, canais e enquadramento desktop', async ({ page }) => {
  await page.goto('/');
  const logo = page.getByRole('img', { name: 'JMM Commerce — logo oficial' });
  await expect(logo).toBeVisible();
  await expect.poll(() => logo.evaluate(img => (img as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
  await expect(page.getByRole('button', { name: 'Selecionar Marina Costa, Disponível' })).toBeVisible();
  await page.screenshot({ path: 'test-results/desktop-escritorio.png', fullPage: true });
  await page.getByRole('button', { name: 'Restaurar câmera' }).click();
  await page.getByRole('button', { name: 'Ampliar escritório', exact: true }).click();
  await expect(page.locator('.expanded-office')).toBeVisible();
  await page.getByRole('button', { name: 'Sair da visão ampliada' }).click();
  await page.getByRole('navigation').getByRole('button', { name: 'Configurações', exact: true }).click();
  await page.getByRole('checkbox', { name: 'Modo leve' }).check();
  await page.getByRole('checkbox', { name: 'Animações dos agentes' }).uncheck();
  await page.reload();
  await page.getByRole('navigation').getByRole('button', { name: 'Configurações', exact: true }).click();
  await expect(page.getByRole('checkbox', { name: 'Modo leve' })).toBeChecked();
  await expect(page.getByRole('checkbox', { name: 'Animações dos agentes' })).not.toBeChecked();
  await page.getByRole('button', { name: 'Canais', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Além do Olhar' })).toBeVisible();
  await page.getByRole('button', { name: 'Visão Geral', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Pipeline do estúdio' })).toBeVisible();
});

test('celular: escritório simplificado, menu e tarefa', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const errors: string[] = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.goto('/');
  await expect(page.locator('canvas')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Selecionar Clara Rocha, Trabalhando' })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: 'test-results/mobile-escritorio.png', fullPage: true });
  await page.getByRole('button', { name: 'Abrir menu' }).click();
  await page.getByRole('button', { name: 'Produção', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Fluxo de produção' })).toBeVisible();
  await page.getByRole('button', { name: 'Nova tarefa', exact: true }).click();
  await page.getByLabel('Nome da tarefa').fill('Ideia criada no celular');
  await page.getByRole('button', { name: 'Criar tarefa', exact: true }).click();
  await expect(page.getByLabel('Etapa de Ideia criada no celular', { exact: true })).toHaveValue('Ideia');
  expect(errors).toEqual([]);
});

test('dados inválidos e armazenamento indisponível não bloqueiam o app', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('jmm-studios-v1', JSON.stringify({ version: 1, state: { tasks: [{ id: 'invalida', stage: '???' }], preferences: { lowQuality: true }, statuses: { hacker: 'Inexistente' } } })));
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'O próximo vídeo começa aqui.' })).toBeVisible();
  await page.getByRole('button', { name: 'Produção', exact: true }).click();
  await expect(page.locator('.task-card')).toHaveCount(0);
  await page.addInitScript(() => { Storage.prototype.setItem = () => { throw new Error('Storage indisponível'); }; });
  await page.reload();
  await page.getByRole('button', { name: 'Nova tarefa', exact: true }).click();
  await page.getByLabel('Nome da tarefa').fill('Tarefa só da sessão');
  await page.getByRole('button', { name: 'Criar tarefa', exact: true }).click();
  await expect(page.getByRole('alert')).toContainText('apenas nesta sessão');
});

test('v0.2: tema neutro, escritório amplo, reunião e poses preservadas', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.goto('/');
  await expect(page.locator('canvas')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Selecionar Sofia Almeida, Trabalhando' })).toBeVisible();
  expect(await page.locator('html').evaluate(e => getComputedStyle(e).backgroundColor)).toBe('rgb(11, 12, 15)');
  expect(await page.locator('.stat-card').first().evaluate(e => getComputedStyle(e).backgroundColor)).toBe('rgb(25, 27, 32)');
  expect(await page.locator('.primary').first().evaluate(e => getComputedStyle(e).backgroundColor)).toBe('rgb(245, 245, 245)');
  const mainWidth = (await page.locator('main').boundingBox())!.width;
  expect((await page.locator('.office-card').boundingBox())!.width).toBeGreaterThan(mainWidth * .85);
  await page.getByRole('button', { name: 'Selecionar Sofia Almeida, Trabalhando' }).click();
  const state = page.getByLabel('Estado do agente');
  await state.selectOption('Em reunião');
  const meeting = page.getByRole('button', { name: 'Selecionar Sofia Almeida, Em reunião' });
  await expect(meeting).toBeVisible();
  await expect.poll(() => page.evaluate(() => JSON.parse(localStorage.getItem('jmm-studios-v1')!).state.statuses.writer)).toBe('Em reunião');
  await page.screenshot({ path: 'test-results/v02-reuniao.png', fullPage: true });
  await state.selectOption('Em deslocamento');
  await expect(page.getByRole('button', { name: 'Selecionar Sofia Almeida, Em deslocamento' })).toBeVisible();
  await state.selectOption('Trabalhando');
  await expect(page.getByRole('button', { name: 'Selecionar Sofia Almeida, Trabalhando' })).toBeVisible();
  await page.getByRole('button', { name: 'Fechar painel' }).click();
  await page.getByRole('button', { name: 'Ampliar escritório', exact: true }).click();
  await expect(page.locator('.expanded-office')).toBeVisible();
  expect((await page.locator('.scene-container').boundingBox())!.height).toBeGreaterThan(800);
  await page.screenshot({ path: 'test-results/v02-tela-cheia.png', fullPage: true });
  await page.getByRole('button', { name: 'Sair da visão ampliada' }).click();
  expect(errors).toEqual([]);
});

test('nova ala: sete salas, pausa no descanso, reunião e restauração da vista', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.goto('/');
  const canvas = page.locator('canvas');
  await expect(canvas).toBeVisible();
  await expect(page.locator('[data-room="meeting"]')).toContainText('SALA DE REUNIÃO');
  await expect(page.locator('[data-room="break"]')).toContainText('SALA DE DESCANSO');
  await expect(page.locator('[data-room="entrance"]')).toContainText('ENTRADA / RECEPÇÃO');
  await expect(page.getByText('CORREDOR CENTRAL', { exact: true })).toBeVisible();
  await canvas.scrollIntoViewIfNeeded();
  const agent = page.getByRole('button', { name: 'Selecionar Sofia Almeida, Trabalhando' });
  const original = (await agent.boundingBox())!;
  const scene = (await canvas.boundingBox())!;
  await page.mouse.move(scene.x + scene.width * .5, scene.y + scene.height * .5);
  await page.mouse.down({ button: 'right' });
  await page.mouse.move(scene.x + scene.width * .5 + 110, scene.y + scene.height * .5 + 30, { steps: 8 });
  await page.mouse.up({ button: 'right' });
  await expect.poll(async () => Math.abs((await agent.boundingBox())!.x - original.x)).toBeGreaterThan(30);
  await page.getByRole('button', { name: 'Restaurar câmera' }).click();
  await expect.poll(async () => Math.abs((await agent.boundingBox())!.x - original.x)).toBeLessThan(3);
  await agent.click();
  const relative = async (name: string) => {
    const box = (await page.getByRole('button', { name }).boundingBox())!;
    const view = (await canvas.boundingBox())!;
    return { x: box.x - view.x, y: box.y - view.y };
  };
  const work = await relative('Selecionar Sofia Almeida, Trabalhando');
  await page.getByLabel('Estado do agente').selectOption('Em pausa');
  await expect.poll(async () => {
    const pause = await relative('Selecionar Sofia Almeida, Em pausa');
    return Math.hypot(pause.x - work.x, pause.y - work.y);
  }).toBeGreaterThan(60);
  const pause = await relative('Selecionar Sofia Almeida, Em pausa');
  await page.getByLabel('Estado do agente').selectOption('Em reunião');
  await expect.poll(async () => {
    const meeting = await relative('Selecionar Sofia Almeida, Em reunião');
    return Math.hypot(meeting.x - pause.x, meeting.y - pause.y);
  }).toBeGreaterThan(60);
  await page.getByRole('button', { name: 'Fechar painel' }).click();
  await page.getByRole('button', { name: 'Ampliar escritório', exact: true }).click();
  await page.screenshot({ path: 'test-results/escritorio-sete-salas.png', fullPage: true });
  await page.getByRole('button', { name: 'Sair da visão ampliada' }).click();
  expect(errors).toEqual([]);
});
