export const stages = ['Ideia', 'Roteiro', 'Cenas', 'Edição', 'Revisão', 'Concluído'] as const;
export type Stage = typeof stages[number];
export type AgentStatus = 'Trabalhando' | 'Disponível' | 'Em pausa' | 'Em deslocamento' | 'Em reunião';
export interface Agent { id: string; name: string; role: string; managerId: string | null; sector: string; color: string; initials: string; position: [number, number, number] }
export interface SimulationPreview { kind: 'simulation'; title: string; body: string; createdAt: string }
export interface Task { id: string; title: string; channelId: string; agentId: string; stage: Stage; createdAt: string; updatedAt: string; instructions?: string; source?: 'task' | 'order'; preview?: SimulationPreview }
export interface LogEntry { id: string; agentId: string; message: string; time: string }
export interface Preferences { lowQuality: boolean; animate: boolean }
