import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { agents, channels, demoTasks } from './data/demo';
import { stages, type AgentStatus, type LogEntry, type Preferences, type Stage, type Task } from './types';
import { production } from './services/production';

interface StudioState {
  tasks: Task[]; statuses: Record<string, AgentStatus>; logs: LogEntry[]; preferences: Preferences; storageError: boolean;
  currentTaskIds: Record<string, string>;
  selectedId: string | null; selectAgent: (id: string | null) => void;
  setStatus: (id: string, status: AgentStatus) => void;
  createTask: (title: string, channelId: string, agentId: string) => Promise<void>;
  moveTask: (id: string, stage: Stage) => Promise<void>;
  focusTask: (agentId: string, taskId: string) => void;
  startTask: (agentId: string, taskId: string) => void;
  sendOrder: (agentId: string, instructions: string, channelId: string) => Promise<void>;
  simulateTask: (taskId: string) => Promise<void>;
  setPreference: (key: keyof Preferences, value: boolean) => void;
}
const validStatuses: AgentStatus[] = ['Trabalhando', 'Disponível', 'Em pausa', 'Em deslocamento', 'Em reunião'];
const validAgent = (id: string) => agents.some(a => a.id === id);
const isTask = (task: unknown): task is Task => {
  if (!task || typeof task !== 'object') return false;
  const t = task as Task;
  return typeof t.id === 'string' && typeof t.title === 'string' && t.title.length > 0 && t.title.length <= 100 && validAgent(t.agentId) && channels.some(c => c.id === t.channelId) && stages.includes(t.stage) && typeof t.createdAt === 'string' && typeof t.updatedAt === 'string';
};
const log = (agentId: string, message: string): LogEntry => ({ id: crypto.randomUUID(), agentId, message, time: new Date().toISOString() });
export const useStudio = create<StudioState>()(persist((set, get) => ({
  tasks: demoTasks, statuses: {}, logs: [], currentTaskIds: {}, selectedId: null, storageError: false,
  preferences: { lowQuality: false, animate: true },
  selectAgent: selectedId => set({ selectedId }),
  setStatus: (id, status) => {
    if (!validAgent(id) || !validStatuses.includes(status)) return;
    set(s => ({ statuses: { ...s.statuses, [id]: status }, logs: [log(id, `Estado alterado para ${status.toLowerCase()}.`), ...s.logs].slice(0, 100) }));
  },
  createTask: async (title, channelId, agentId) => {
    title = title.trim();
    if (!title || title.length > 100 || !validAgent(agentId) || !channels.some(c => c.id === channelId)) throw new Error('Preencha os dados da tarefa.');
    const now = new Date().toISOString();
    const task = await production.createTask({ id: crypto.randomUUID(), title, channelId, agentId, stage: 'Ideia', createdAt: now, updatedAt: now });
    set(s => ({ tasks: [...s.tasks, task], currentTaskIds: { ...s.currentTaskIds, [agentId]: task.id }, logs: [log(agentId, `Tarefa criada: ${title}`), ...s.logs].slice(0, 100) }));
  },
  moveTask: async (id, stage) => {
    const task = get().tasks.find(t => t.id === id);
    if (!task || !stages.includes(stage) || task.stage === stage) return;
    const moved = await production.moveTask(task, stage);
    set(s => {
      const tasks = s.tasks.map(t => t.id === id ? { ...t, stage: moved.stage, updatedAt: moved.updatedAt } : t);
      const next = tasks.find(t => t.agentId === task.agentId && t.stage !== 'Concluído');
      const currentTaskIds = { ...s.currentTaskIds };
      if (stage === 'Concluído' && currentTaskIds[task.agentId] === id) {
        if (next) currentTaskIds[task.agentId] = next.id;
        else delete currentTaskIds[task.agentId];
      }
      const statuses = !next && s.statuses[task.agentId] === 'Trabalhando' ? { ...s.statuses, [task.agentId]: 'Disponível' as AgentStatus } : s.statuses;
      return { tasks, currentTaskIds, statuses, logs: [log(task.agentId, `“${task.title}” → ${stage}.`), ...s.logs].slice(0, 100) };
    });
  },
  focusTask: (agentId, taskId) => {
    const task = get().tasks.find(t => t.id === taskId && t.agentId === agentId && t.stage !== 'Concluído');
    if (!task) return;
    set(s => ({ currentTaskIds: { ...s.currentTaskIds, [agentId]: taskId }, logs: [log(agentId, `Tarefa em foco: ${task.title}`), ...s.logs].slice(0, 100) }));
  },
  startTask: (agentId, taskId) => {
    const task = get().tasks.find(t => t.id === taskId && t.agentId === agentId && t.stage !== 'Concluído');
    if (!task) throw new Error('Escolha uma tarefa pendente deste agente.');
    set(s => ({ currentTaskIds: { ...s.currentTaskIds, [agentId]: taskId }, statuses: { ...s.statuses, [agentId]: 'Trabalhando' }, logs: [log(agentId, `Trabalho simulado iniciado/retomado: ${task.title}`), ...s.logs].slice(0, 100) }));
  },
  sendOrder: async (agentId, instructions, channelId) => {
    const agent = agents.find(a => a.id === agentId);
    instructions = instructions.trim();
    if (!agent || !channels.some(c => c.id === channelId) || instructions.length < 3 || instructions.length > 2000) throw new Error('Escreva uma ordem entre 3 e 2.000 caracteres e escolha um canal.');
    const stageByAgent: Record<string, Stage> = { ceo: 'Ideia', producer: 'Ideia', writer: 'Roteiro', visual: 'Cenas', editor: 'Edição', reviewer: 'Revisão', receptionist: 'Ideia' };
    const now = new Date().toISOString();
    const title = instructions.split(/\r?\n/)[0].slice(0, 100);
    const task = await production.createTask({ id: crypto.randomUUID(), title, instructions, source: 'order', channelId, agentId, stage: stageByAgent[agentId] || 'Ideia', createdAt: now, updatedAt: now });
    const preview = await production.simulateTask(task, agent);
    set(s => ({ tasks: [...s.tasks, { ...task, preview }], currentTaskIds: { ...s.currentTaskIds, [agentId]: task.id }, statuses: { ...s.statuses, [agentId]: 'Trabalhando' }, logs: [log(agentId, `Prévia de exemplo criada por simulação local: ${preview.title}`), log(agentId, `Ordem simulada recebida: ${title}`), ...s.logs].slice(0, 100) }));
  },
  simulateTask: async taskId => {
    const task = get().tasks.find(t => t.id === taskId);
    const agent = agents.find(a => a.id === task?.agentId);
    if (!task || !agent) throw new Error('Tarefa não encontrada.');
    const preview = await production.simulateTask(task, agent);
    set(s => ({ tasks: s.tasks.map(t => t.id === taskId ? { ...t, preview, updatedAt: preview.createdAt } : t), logs: [log(agent.id, `Prévia simulada atualizada: ${task.title}`), ...s.logs].slice(0, 100) }));
  },
  setPreference: (key, value) => set(s => ({ preferences: { ...s.preferences, [key]: value } })),
}), {
  name: 'jmm-studios-v1', version: 1,
  storage: createJSONStorage(() => ({
    getItem: key => { try { return localStorage.getItem(key); } catch { queueMicrotask(() => { if (!useStudio.getState().storageError) useStudio.setState({ storageError: true }); }); return null; } },
    setItem: (key, value) => { try { localStorage.setItem(key, value); } catch { queueMicrotask(() => { if (!useStudio.getState().storageError) useStudio.setState({ storageError: true }); }); } },
    removeItem: key => localStorage.removeItem(key),
  })),
  partialize: s => ({ tasks: s.tasks, statuses: s.statuses, logs: s.logs, preferences: s.preferences, currentTaskIds: s.currentTaskIds }),
  merge: (persisted, current) => {
    const p = (persisted && typeof persisted === 'object' ? persisted : {}) as Partial<StudioState>;
    const tasks = Array.isArray(p.tasks) ? p.tasks.filter(isTask).map(sanitizeTask) : current.tasks;
    return { ...current,
      tasks,
      currentTaskIds: Object.fromEntries(Object.entries(p.currentTaskIds || {}).filter(([agentId, taskId]) => validAgent(agentId) && typeof taskId === 'string' && tasks.some(t => t.id === taskId && t.agentId === agentId && t.stage !== 'Concluído'))),
      statuses: Object.fromEntries(Object.entries(p.statuses || {}).filter(([id, status]) => validAgent(id) && validStatuses.includes(status))),
      logs: Array.isArray(p.logs) ? p.logs.filter(l => l && typeof l.message === 'string' && typeof l.time === 'string' && validAgent(l.agentId)).slice(0, 100) : [],
      preferences: { lowQuality: p.preferences?.lowQuality === true, animate: p.preferences?.animate !== false },
    };
  },
}));
export function agentStatus(id: string, tasks: Task[], statuses: Record<string, AgentStatus>): AgentStatus {
  return statuses[id] ?? (tasks.some(t => t.agentId === id && t.stage !== 'Concluído') ? 'Trabalhando' : 'Disponível');
}
export function taskProgress(stage: Stage) { return Math.round(stages.indexOf(stage) / (stages.length - 1) * 100); }
export function currentAgentTask(agentId: string, tasks: Task[], currentTaskIds: Record<string, string>) {
  const active = tasks.filter(t => t.agentId === agentId && t.stage !== 'Concluído');
  return active.find(t => t.id === currentTaskIds[agentId]) ?? active[0];
}
function sanitizeTask(task: Task): Task {
  const preview = task.preview;
  const validPreview = preview && preview.kind === 'simulation' && typeof preview.title === 'string' && typeof preview.body === 'string' && preview.body.length <= 12000 && typeof preview.createdAt === 'string';
  return { id: task.id, title: task.title, channelId: task.channelId, agentId: task.agentId, stage: task.stage, createdAt: task.createdAt, updatedAt: task.updatedAt,
    instructions: typeof task.instructions === 'string' ? task.instructions.slice(0, 2000) : undefined,
    source: task.source === 'order' ? 'order' : 'task',
    preview: validPreview ? { kind: 'simulation', title: preview.title.slice(0, 200), body: preview.body, createdAt: preview.createdAt } : undefined,
  };
}
