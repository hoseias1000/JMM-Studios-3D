import { useState, type FormEvent } from 'react';
import { ArrowRight, Check, FileText, Pause, Play, Send } from 'lucide-react';
import { channels } from '../../data/demo';
import { useStudio } from '../../store';
import { stages, type Agent, type AgentStatus, type Task } from '../../types';
import './agent-orders.css';

export function WorkControls({ agent, task, status }: { agent: Agent; task: Task | undefined; status: AgentStatus }) {
  const { startTask, setStatus, moveTask, simulateTask } = useStudio();
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [error, setError] = useState('');
  const working = status === 'Trabalhando';
  async function execute(action: () => void | Promise<void>, message: string) {
    setBusy(true); setError('');
    try { await action(); setFeedback(message); }
    catch (err) { setError(err instanceof Error ? err.message : 'Não foi possível aplicar a ordem.'); }
    finally { setBusy(false); }
  }
  return <div className="agent-work-controls">
    <div className="agent-control-grid">
      <button className="button subtle" disabled={!task || working || busy} onClick={() => { if (task) void execute(() => startTask(agent.id, task.id), 'Trabalho simulado retomado na estação.'); }}><Play size={13}/>{status === 'Em pausa' ? 'Retomar' : 'Iniciar tarefa'}</button>
      <button className="button subtle" disabled={!task || !working || busy} onClick={() => { void execute(() => setStatus(agent.id, 'Em pausa'), 'Trabalho pausado; agente enviado ao descanso.'); }}><Pause size={13}/>Pausar trabalho</button>
      <button className="button subtle" disabled={!task || !working || busy} onClick={() => { if (task) void execute(() => moveTask(task.id, stages[Math.min(stages.indexOf(task.stage) + 1, stages.length - 1)]), 'Etapa simulada avançada no Kanban.'); }}><ArrowRight size={13}/>Avançar etapa</button>
      <button className="button subtle" disabled={!task || !working || busy} onClick={() => { if (task) void execute(() => moveTask(task.id, 'Concluído'), 'Tarefa simulada concluída. Nenhum vídeo real foi gerado.'); }}><Check size={13}/>Concluir tarefa</button>
    </div>
    <button className="button subtle full" disabled={!task || busy} onClick={() => { if (task) void execute(() => simulateTask(task.id), 'Prévia de exemplo disponível nas entregas simuladas abaixo.'); }}><FileText size={14}/>{task?.preview ? 'Refazer prévia simulada' : 'Gerar prévia simulada'}</button>
    {task && !working && <p className="agent-command-note">Inicie ou retome o trabalho para avançar ou concluir a tarefa.</p>}
    {feedback && <p className="agent-command-feedback" aria-live="polite">{feedback}</p>}
    {error && <p className="agent-command-error" role="alert">{error}</p>}
  </div>;
}

export function OrderComposer({ agent, defaultChannelId }: { agent: Agent; defaultChannelId?: string }) {
  const sendOrder = useStudio(s => s.sendOrder);
  const [instructions, setInstructions] = useState('');
  const [channelId, setChannelId] = useState(defaultChannelId || channels[0].id);
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [error, setError] = useState('');
  const examples: Record<string, string> = {
    ceo: 'Defina a proposta de um vídeo curto sobre mistérios do oceano.',
    producer: 'Organize a produção de um vídeo de 30 segundos sobre astronomia.',
    writer: 'Crie um roteiro de 30 segundos sobre auroras boreais, com um gancho inicial.',
    visual: 'Planeje três cenas para um vídeo sobre cidades submersas.',
    editor: 'Planeje a edição vertical, com legendas e cortes rápidos.',
    reviewer: 'Revise o briefing e prepare um checklist de qualidade para o vídeo.',
    receptionist: 'Receba um visitante e organize uma reunião com a direção.',
  };
  async function submit(e: FormEvent) {
    e.preventDefault(); if (busy) return;
    setBusy(true); setError(''); setFeedback('');
    try { await sendOrder(agent.id, instructions, channelId); setInstructions(''); setFeedback(`Ordem simulada recebida por ${agent.name.split(' ')[0]}. A tarefa está em foco; veja a prévia de exemplo abaixo.`); }
    catch (err) { setError(err instanceof Error ? err.message : 'Não foi possível enviar a ordem.'); }
    finally { setBusy(false); }
  }
  return <form className="agent-order-composer" onSubmit={submit} aria-label={`Dar ordem a ${agent.name}`}>
    <div className="section-line"><h3>Dar uma ordem</h3><span className="outline-tag">Simulação</span></div>
    <p className="agent-command-note">A ordem cria uma tarefa para este agente e uma prévia feita por regras locais. Não executa IA nem usa tokens ou APIs.</p>
    <label className="field">O que você quer que o agente faça?<textarea aria-label="Ordem para o agente" required minLength={3} maxLength={2000} rows={4} value={instructions} onChange={e => { setInstructions(e.target.value); setFeedback(''); }} placeholder={examples[agent.id]}/></label>
    <div className="agent-order-count">{instructions.length}/2.000 caracteres</div>
    <label className="field">Canal da ordem<select aria-label="Canal da ordem" value={channelId} onChange={e => setChannelId(e.target.value)}>{channels.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></label>
    <button className="button primary full" disabled={busy || instructions.trim().length < 3}>{busy ? 'Registrando…' : 'Enviar ordem'}<Send size={14}/></button>
    {feedback && <p className="agent-command-feedback" aria-live="polite">{feedback}</p>}
    {error && <p className="agent-command-error" role="alert">{error}</p>}
  </form>;
}

export function SimulatedDeliveries({ tasks, currentId }: { tasks: Task[]; currentId?: string }) {
  const deliveries = tasks.filter(t => t.preview?.kind === 'simulation').sort((a, b) => (b.preview?.createdAt || '').localeCompare(a.preview?.createdAt || ''));
  if (!deliveries.length) return null;
  return <section className="agent-deliveries" aria-label="Entregas simuladas"><div className="section-line"><h3>Entregas simuladas</h3><span className="small-badge">{deliveries.length}</span></div>{deliveries.map(task => <details className="agent-preview" key={`${task.id}-${task.preview!.createdAt}`} open={task.id === currentId}><summary>{task.preview!.title}<small>{task.title}</small></summary><div className="agent-preview-meta">Exemplo local · {new Date(task.preview!.createdAt).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo', dateStyle: 'short', timeStyle: 'short' })}</div><pre>{task.preview!.body}</pre></details>)}</section>;
}
