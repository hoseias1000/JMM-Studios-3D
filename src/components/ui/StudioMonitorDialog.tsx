import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowUpRight, Clapperboard, Coins, RefreshCw, X } from 'lucide-react';
import { agents, channels } from '../../data/demo';
import { addCounts, emptyCounts, filterPeriod } from '../../services/codex-usage';
import { useStudio } from '../../store';
import { stages, type Stage } from '../../types';
import type { CodexUsageData, TokenCounts } from '../../types/codex';
import './studio-monitor.css';

interface StudioMonitorDialogProps {
  data: CodexUsageData | null;
  busy: boolean;
  error: string;
  onRefresh: () => void;
  onClose: () => void;
  onNavigate: (page: 'Produção' | 'Tokens Codex') => void;
}

const integer = new Intl.NumberFormat('pt-BR');
const compact = new Intl.NumberFormat('pt-BR', { notation: 'compact', maximumFractionDigits: 1 });

export default function StudioMonitorDialog({ data, busy, error, onRefresh, onClose, onNavigate }: StudioMonitorDialogProps) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [period, setPeriod] = useState('1');
  const [channelId, setChannelId] = useState('');
  const [stage, setStage] = useState<Stage | ''>('');
  const [movingId, setMovingId] = useState<string | null>(null);
  const [taskError, setTaskError] = useState('');
  const tasks = useStudio(state => state.tasks);
  const moveTask = useStudio(state => state.moveTask);

  useEffect(() => {
    const element = dialog.current;
    element?.showModal();
    return () => element?.close();
  }, []);

  const records = useMemo(() => filterPeriod(data?.records ?? [], period), [data, period]);
  const total = records.reduce(addCounts, emptyCounts());
  const days = useMemo(() => {
    const counts = new Map<string, TokenCounts>();
    for (const record of records) {
      counts.set(record.day, addCounts(counts.get(record.day) ?? emptyCounts(), record));
    }
    return [...counts.entries()].sort(([a], [b]) => a.localeCompare(b)).slice(-7);
  }, [records]);
  const peak = Math.max(1, ...days.map(([, counts]) => counts.total));
  const channelTasks = tasks.filter(task => !channelId || task.channelId === channelId);
  const visibleTasks = channelTasks.filter(task => !stage || task.stage === stage);
  const ready = !!data?.available;
  const updated = data ? new Date(data.generatedAt).toLocaleString('pt-BR', {
    timeZone: 'America/Sao_Paulo', dateStyle: 'short', timeStyle: 'short',
  }) : '';

  async function updateStage(taskId: string, nextStage: Stage) {
    setMovingId(taskId);
    setTaskError('');
    try {
      await moveTask(taskId, nextStage);
    } catch (err) {
      setTaskError(err instanceof Error ? err.message : 'Não foi possível alterar a etapa.');
    } finally {
      setMovingId(null);
    }
  }

  return <dialog
    ref={dialog}
    className="studio-monitor-dialog"
    aria-labelledby="studio-monitor-title"
    onCancel={event => { event.preventDefault(); onClose(); }}
    onClick={event => { if (event.target === dialog.current) onClose(); }}
  >
    <header className="studio-monitor-heading">
      <div><h2 id="studio-monitor-title">Painel do estúdio</h2><p>Sala de reunião · JMM Studios</p></div>
      <button autoFocus type="button" className="icon-button" onClick={onClose} aria-label="Fechar painel do estúdio"><X size={20}/></button>
    </header>

    <section className="studio-monitor-section" aria-labelledby="studio-monitor-tokens">
      <div className="studio-monitor-section-heading">
        <div><h3 id="studio-monitor-tokens"><Coins size={17}/>Tokens Codex</h3><p>Registros reais do workspace · atualização a cada 30 s</p></div>
        <button type="button" className="button subtle" disabled={busy} onClick={onRefresh}><RefreshCw size={14} className={busy ? 'studio-monitor-spin' : ''}/>{busy ? 'Atualizando…' : 'Atualizar tokens'}</button>
      </div>
      <label className="studio-monitor-filter studio-monitor-period">Período dos tokens
        <select value={period} onChange={event => setPeriod(event.target.value)}>
          <option value="1">Hoje</option><option value="7">Últimos 7 dias</option><option value="30">Últimos 30 dias</option><option value="all">Todo o histórico local</option>
        </select>
      </label>
      {error && <p className="studio-monitor-notice" role="alert">{error}</p>}
      {data && !data.available && <p className="studio-monitor-notice" role="status">{data.message || 'Os registros locais ainda não forneceram contadores de uso.'}</p>}
      {data && (data.truncated || data.ignoredFiles > 0) && <p className="studio-monitor-notice" role="status">Leitura parcial. Alguns registros não puderam ser incluídos.</p>}
      <div className="studio-monitor-metrics">
        <TokenMetric label="Tokens registrados" value={ready ? total.total : null}/>
        <TokenMetric label="Entrada sem cache" value={ready ? total.input - total.cached : null}/>
        <TokenMetric label="Entrada em cache" value={ready ? total.cached : null}/>
        <TokenMetric label="Saída" value={ready ? total.output : null}/>
      </div>
      <div className="studio-monitor-chart" aria-label="Consumo diário de tokens">
        {days.length ? days.map(([day, counts]) => <div className="studio-monitor-day" key={day}>
          <time dateTime={day}>{day.slice(8)}/{day.slice(5, 7)}</time>
          <div className="studio-monitor-day-track"><span style={{ width: `${counts.total / peak * 100}%` }}/></div>
          <strong title={integer.format(counts.total)}>{compact.format(counts.total)}</strong>
        </div>) : <p className="studio-monitor-empty">{busy ? 'Lendo os registros locais…' : 'Sem consumo registrado no período selecionado.'}</p>}
      </div>
      {days.length > 0 && <p className="studio-monitor-note">Até 7 dias com registros no período selecionado.</p>}
      {data?.parentWorkspaceIncluded && <p className="studio-monitor-note">Inclui sessões iniciadas na pasta pai deste projeto.</p>}
      <div className="studio-monitor-section-footer">
        <small>{updated ? `Atualizado em ${updated} · Brasília` : 'Aguardando leitura local'}</small>
        <button type="button" className="text-button" onClick={() => onNavigate('Tokens Codex')}>Ver detalhes dos tokens<ArrowUpRight size={14}/></button>
      </div>
    </section>

    <section className="studio-monitor-section" aria-labelledby="studio-monitor-production">
      <div className="studio-monitor-section-heading">
        <div><h3 id="studio-monitor-production"><Clapperboard size={17}/>Produções</h3><p>Tarefas e avanço de produção simulados</p></div>
        <button type="button" className="text-button" onClick={() => onNavigate('Produção')}>Abrir produção<ArrowUpRight size={14}/></button>
      </div>
      <div className="studio-monitor-stages">{stages.map(item => <div key={item}><span>{item}</span><strong>{channelTasks.filter(task => task.stage === item).length}</strong></div>)}</div>
      <div className="studio-monitor-filters">
        <label className="studio-monitor-filter">Canal das produções<select value={channelId} onChange={event => setChannelId(event.target.value)}><option value="">Todos os canais</option>{channels.map(channel => <option key={channel.id} value={channel.id}>{channel.name}</option>)}</select></label>
        <label className="studio-monitor-filter">Etapa das produções<select value={stage} onChange={event => setStage(event.target.value as Stage | '')}><option value="">Todas as etapas</option>{stages.map(item => <option key={item}>{item}</option>)}</select></label>
      </div>
      {taskError && <p className="studio-monitor-notice" role="alert">{taskError}</p>}
      <div className="studio-monitor-tasks" aria-label="Produções do estúdio">
        {visibleTasks.map(task => <article className="studio-monitor-task" key={task.id}>
          <div><h4>{task.title}</h4><p>{channels.find(channel => channel.id === task.channelId)?.name} · {agents.find(agent => agent.id === task.agentId)?.name}</p></div>
          <select aria-label={`Etapa no painel de ${task.title}`} value={task.stage} disabled={movingId !== null} onChange={event => { void updateStage(task.id, event.target.value as Stage); }}>{stages.map(item => <option key={item}>{item}</option>)}</select>
        </article>)}
        {!visibleTasks.length && <p className="studio-monitor-empty">Nenhuma tarefa para os filtros selecionados.</p>}
      </div>
    </section>
  </dialog>;
}

function TokenMetric({ label, value }: { label: string; value: number | null }) {
  return <article><span>{label}</span><strong title={value === null ? 'Leitura indisponível' : integer.format(value)}>{value === null ? '—' : compact.format(value)}</strong></article>;
}
