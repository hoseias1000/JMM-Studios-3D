import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Plus, X } from 'lucide-react';
import { agents, channels } from '../../data/demo';
import { useStudio } from '../../store';
export default function TaskModal({ onClose }: { onClose: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const selectedId = useStudio(s => s.selectedId);
  const createTask = useStudio(s => s.createTask);
  const [title, setTitle] = useState('');
  const [agentId, setAgentId] = useState(selectedId ?? 'producer');
  const [channelId, setChannelId] = useState('alem');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  useEffect(() => { dialog.current?.showModal(); }, []);
  async function submit(e: FormEvent) {
    e.preventDefault(); setBusy(true);
    try { await createTask(title, channelId, agentId); onClose(); } catch (err) { setError(err instanceof Error ? err.message : 'Não foi possível criar a tarefa.'); setBusy(false); }
  }
  return <dialog ref={dialog} className="task-dialog" onCancel={onClose} onClick={e => { if (e.target === dialog.current) onClose(); }}><form onSubmit={submit}>
    <div className="panel-heading"><span className="modal-icon"><Plus size={22}/></span><button type="button" className="icon-button" onClick={onClose} aria-label="Fechar"><X size={20}/></button></div>
    <h2>Uma nova ideia começa aqui.</h2><p>Crie uma tarefa simulada e escolha quem vai cuidar dela.</p>
    <label className="field">Nome da tarefa<input autoFocus required maxLength={100} value={title} onChange={e => setTitle(e.target.value)} placeholder="Ex.: Os mistérios do fundo do mar"/></label>
    <label className="field">Canal<select value={channelId} onChange={e => setChannelId(e.target.value)}>{channels.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></label>
    <label className="field">Agente responsável<select value={agentId} onChange={e => setAgentId(e.target.value)}>{agents.map(a => <option key={a.id} value={a.id}>{a.name} · {a.role}</option>)}</select></label>
    <div className="notice">A tarefa começa em Ideia. Movimente as etapas no painel do agente ou na aba Produção. Nenhuma API será chamada.</div>{error && <p role="alert" className="error">{error}</p>}
    <div className="modal-actions"><button type="button" className="button subtle" onClick={onClose}>Cancelar</button><button className="button primary" disabled={busy}>{busy ? 'Criando…' : 'Criar tarefa'}<Plus size={16}/></button></div>
  </form></dialog>;
}
