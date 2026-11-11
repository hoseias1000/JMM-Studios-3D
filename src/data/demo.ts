import type { Agent, Task } from '../types';
export const agents: Agent[] = [
  { id: 'ceo', name: 'Marina Costa', role: 'Diretora Geral / CEO', managerId: null, sector: 'Sala da CEO', color: '#b9a5fa', initials: 'MC', position: [15.3, 0, -3.9] },
  { id: 'producer', name: 'Lucas Mendes', role: 'Gestor de Produção', managerId: 'ceo', sector: 'Direção', color: '#ffb977', initials: 'LM', position: [-2, 0, -2.1] },
  { id: 'writer', name: 'Sofia Almeida', role: 'Roteirista', managerId: 'producer', sector: 'Roteiros', color: '#7dd7ba', initials: 'SA', position: [2.2, 0, -2.1] },
  { id: 'visual', name: 'Rafael Lima', role: 'Diretor Visual', managerId: 'producer', sector: 'Edição', color: '#78b4f4', initials: 'RL', position: [-4.3, 0, 2.1] },
  { id: 'editor', name: 'Diego Santos', role: 'Editor de Vídeo', managerId: 'producer', sector: 'Edição', color: '#f1cc72', initials: 'DS', position: [-2, 0, 2.1] },
  { id: 'reviewer', name: 'Clara Rocha', role: 'Revisora', managerId: 'producer', sector: 'Revisão', color: '#f298b4', initials: 'CR', position: [2.2, 0, 2.1] },
  { id: 'receptionist', name: 'Beatriz Nunes', role: 'Recepcionista', managerId: 'producer', sector: 'Recepção', color: '#c1addc', initials: 'BN', position: [-1.5, 0, 10.5] },
];
export const channels = [
  { id: 'alem', name: 'Além do Olhar', category: 'Mistérios & descobertas', color: '#b9a5fa', initial: 'AO' },
  { id: 'historias', name: 'Histórias Dramáticas', category: 'Narrativas & emoção', color: '#f298b4', initial: 'HD' },
  { id: 'mundo', name: 'Mundo Curioso', category: 'Ciência & curiosidades', color: '#7dd7ba', initial: 'MC' },
];
const createdAt = '2026-11-10T12:00:00.000Z';
export const demoTasks: Task[] = [
  { id: 'demo-1', title: 'O mistério das cidades submersas', channelId: 'alem', agentId: 'writer', stage: 'Roteiro', createdAt, updatedAt: createdAt },
  { id: 'demo-2', title: 'Uma carta que mudou tudo', channelId: 'historias', agentId: 'editor', stage: 'Edição', createdAt, updatedAt: createdAt },
  { id: 'demo-3', title: 'Por que os oceanos brilham?', channelId: 'mundo', agentId: 'visual', stage: 'Cenas', createdAt, updatedAt: createdAt },
  { id: 'demo-4', title: 'O lugar onde o sol não se põe', channelId: 'mundo', agentId: 'reviewer', stage: 'Revisão', createdAt, updatedAt: createdAt },
  { id: 'demo-5', title: 'Segredos da biblioteca perdida', channelId: 'alem', agentId: 'producer', stage: 'Ideia', createdAt, updatedAt: createdAt },
  { id: 'demo-6', title: 'O reencontro na estação', channelId: 'historias', agentId: 'reviewer', stage: 'Concluído', createdAt, updatedAt: createdAt },
];
