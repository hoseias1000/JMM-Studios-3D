import { useEffect, useRef } from 'react';
import { ArrowUpRight, Clock3, Coffee, X } from 'lucide-react';
import { agents, channels } from '../../data/demo';
import { agentStatus, currentAgentTask, taskProgress, useStudio } from '../../store';
import type { Agent, AgentStatus } from '../../types';
import { OrderComposer, SimulatedDeliveries, WorkControls } from './AgentOrders';
export function Avatar({ agent, large = false }: { agent: Agent; large?: boolean }) {
  return <div className={`avatar ${large ? 'large' : ''}`}><span className="avatar-head"/><span className="avatar-body"/><b>{agent.initials}</b></div>;
}
export function Status({ status }: { status: AgentStatus }) { return <span className={`status status-${status === 'Trabalhando' ? 'working' : status === 'Em pausa' ? 'paused' : status === 'Em deslocamento' ? 'moving' : 'idle'}`}><i />{status}</span>; }
export default function AgentPanel({ onNewTask }: { onNewTask: () => void }) {
  const { selectedId, tasks, statuses, logs, currentTaskIds, selectAgent, setStatus, focusTask } = useStudio();
  const panelRef = useRef<HTMLElement>(null);
  useEffect(() => {
    if (!selectedId || window.innerWidth > 1100 || document.fullscreenElement) return;
    const frame = requestAnimationFrame(() => panelRef.current?.scrollIntoView({ block: 'start', behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' }));
    return () => cancelAnimationFrame(frame);
  }, [selectedId]);
  const agent = agents.find(a => a.id === selectedId);
  if (!agent) return <aside className="agent-panel empty-panel"><div className="panel-heading"><h3>Seu time, conectado</h3><span className="small-badge">{String(agents.length).padStart(2, '0')}</span></div><div className="empty-illustration"><span/><span/><span/></div><h3>Conheça os bastidores</h3><p>Selecione um personagem no escritório para acompanhar suas tarefas e seu estado simulado.</p><div className="mini-roster">{agents.map(a => <button key={a.id} onClick={() => selectAgent(a.id)}><Avatar agent={a}/><span><strong>{a.name}</strong><small>{a.role}</small></span><ArrowUpRight size={15}/></button>)}</div><div className="panel-note"><Coffee size={16}/><span>Um estúdio inteiro de possibilidades.<br/>Tudo simulado, por enquanto.</span></div></aside>;
  const assigned = tasks.filter(t => t.agentId === agent.id);
  const active = assigned.filter(t => t.stage !== 'Concluído');
  const current = currentAgentTask(agent.id, tasks, currentTaskIds);
  const status = agentStatus(agent.id, tasks, statuses);
  const manager = agents.find(a => a.id === agent.managerId);
  const entries = logs.filter(l => l.agentId === agent.id).slice(0, 8);
  const description = !current ? 'Sem trabalho pendente. Envie uma ordem ou atribua uma tarefa.' : status === 'Trabalhando' ? `Trabalho simulado em andamento na etapa ${current.stage}.` : status === 'Em pausa' ? 'Trabalho pausado. O agente está na sala de descanso.' : status === 'Em reunião' ? 'O agente está em reunião. Retome para continuar a tarefa.' : status === 'Em deslocamento' ? 'O agente está no corredor. Retome para continuar a tarefa.' : 'Tarefa em foco, aguardando início do trabalho simulado.';
  return <aside ref={panelRef} className="agent-panel selected-panel agent-command-panel" aria-label={`Detalhes de ${agent.name}`}>
    <div className="panel-heading"><h3>Central do agente</h3><button className="icon-button" onClick={() => selectAgent(null)} aria-label="Fechar painel"><X size={18}/></button></div>
    <div className="profile"><Avatar agent={agent} large/><div><h2>{agent.name}</h2><p>{agent.role}</p><Status status={status}/></div></div>
    <div className="agent-simulation-label">Agente simulado · sem execução de IA ou mídia real</div>
    <div className="section-line"><h3>Tarefa atual</h3><span className="small-badge">{active.length} pendentes</span></div>
    <p className="agent-work-description" aria-live="polite">{description}</p>
    {current ? <div className="current-task"><span className="eyebrow">{channels.find(c => c.id === current.channelId)?.name}</span><h4>{current.title}</h4>{current.instructions && <div className="agent-task-brief"><strong>ORDEM RECEBIDA</strong>{current.instructions}</div>}<div className="progress-caption"><span>{current.stage}</span><strong>{taskProgress(current.stage)}%</strong></div><div className="progress"><span style={{ width: `${taskProgress(current.stage)}%` }}/></div><small>Progresso por etapa · avanço manual da simulação</small></div> : <div className="quiet-box">Nenhuma tarefa pendente para este agente.</div>}
    {active.length > 1 && <label className="field agent-current-picker">Tarefa em foco<select aria-label="Tarefa em foco" value={current?.id || ''} onChange={e => focusTask(agent.id, e.target.value)}>{active.map(t => <option key={t.id} value={t.id}>{t.title}</option>)}</select></label>}
    <label className="field status-field">Estado do agente<select value={status} onChange={e => setStatus(agent.id, e.target.value as AgentStatus)}>{(['Trabalhando', 'Disponível', 'Em pausa', 'Em deslocamento', 'Em reunião'] as const).map(s => <option key={s}>{s}</option>)}</select></label>
    <WorkControls key={`controls-${agent.id}`} agent={agent} task={current} status={status}/>
    <OrderComposer key={`order-${agent.id}`} agent={agent} defaultChannelId={current?.channelId}/>
    <SimulatedDeliveries tasks={assigned} currentId={current?.id}/>
    <div className="section-line"><h3>Tarefas atribuídas</h3><span className="small-badge">{assigned.length}</span></div>
    <div className="assigned-tasks">{assigned.map(t => <div key={t.id}><span>{t.title}</span><small>{t.stage}</small>{t.id === current?.id ? <span className="in-focus">EM FOCO</span> : t.stage !== 'Concluído' && <button onClick={() => focusTask(agent.id, t.id)} aria-label={`Focar tarefa ${t.title}`}>Colocar em foco</button>}</div>)}</div>
    <button className="button subtle full" onClick={onNewTask}>Atribuir nova tarefa <ArrowUpRight size={15}/></button>
    <div className="profile-details"><div><span>Setor</span><strong>{agent.sector}</strong></div><div><span>Superior</span><strong>{manager?.name ?? 'Direção do estúdio'}</strong></div><div><span>Identificador</span><code>{agent.id}</code></div></div>
    <div className="section-line"><h3>Registros simulados</h3><Clock3 size={15}/></div>
    <div className="activity-log">{entries.length ? entries.map(l => <div key={l.id}><i/><span>{l.message}<small>{new Date(l.time).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</small></span></div>) : <p>Agente carregado no escritório de demonstração. Ações aparecerão aqui.</p>}</div>
  </aside>;
}
