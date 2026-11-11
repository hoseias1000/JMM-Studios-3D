import { lazy, Suspense, useState, useRef, useEffect } from 'react';
import { Activity, ArrowDownRight, ArrowUpRight, Box, CheckCircle2, ChevronRight, CircleHelp, Clapperboard, Film, Focus, LayoutDashboard, Maximize2, Menu, Monitor, MousePointer2, Plus, Radio, RotateCcw, Settings2, Users, Workflow, X } from 'lucide-react';
import { agents, channels } from './data/demo';
import { officeRoomCount } from './components/office/layout';
import { companyBrand } from './data/branding';
import { Coins } from 'lucide-react';
import TokenUsagePanel from './components/ui/TokenUsagePanel';
import { agentStatus, useStudio } from './store';
import AgentPanel, { Avatar, Status } from './components/ui/AgentPanel';
import TaskModal from './components/ui/TaskModal';
import Kanban from './components/ui/Kanban';
const OfficeScene = lazy(() => import('./components/office/OfficeScene'));
const navigation = [
  { name: 'Visão Geral', icon: LayoutDashboard }, { name: 'Escritório 3D', icon: Box },
  { name: 'Agentes', icon: Users }, { name: 'Produção', icon: Clapperboard },
  { name: 'Canais', icon: Radio }, { name: 'Tokens Codex', icon: Coins }, { name: 'Configurações', icon: Settings2 },
];
export default function App() {
  const [page, setPage] = useState('Escritório 3D');
  const [modal, setModal] = useState(false);
  const [menu, setMenu] = useState(false);
  const [resetKey, setResetKey] = useState(0);
  const [expanded, setExpanded] = useState(false);
  const [help, setHelp] = useState(false);
  const officeRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const sync = () => { if (!document.fullscreenElement) setExpanded(false); };
    const escape = (e: KeyboardEvent) => { if (e.key === 'Escape' && !document.querySelector('dialog[open]')) setExpanded(false); };
    document.addEventListener('fullscreenchange', sync);
    document.addEventListener('keydown', escape);
    return () => { document.removeEventListener('fullscreenchange', sync); document.removeEventListener('keydown', escape); };
  }, []);
  async function toggleOffice() {
    if (expanded) {
      setExpanded(false);
      if (document.fullscreenElement === officeRef.current) await document.exitFullscreen().catch(() => {});
    } else {
      setExpanded(true);
      await officeRef.current?.requestFullscreen?.().catch(() => { /* CSS viewport expansion remains available. */ });
    }
  }
  const { tasks, statuses, selectedId, selectAgent, preferences, setPreference, storageError } = useStudio();
  const active = tasks.filter(t => t.stage !== 'Concluído');
  const production = tasks.filter(t => t.stage !== 'Ideia' && t.stage !== 'Concluído');
  const completed = tasks.filter(t => t.stage === 'Concluído');
  const working = agents.filter(a => agentStatus(a.id, tasks, statuses) === 'Trabalhando').length;
  const go = (name: string) => {
    setPage(name);
    setMenu(false);
    setExpanded(false);
    if (document.fullscreenElement && document.fullscreenElement === officeRef.current) {
      void document.exitFullscreen().catch(() => {});
    }
  };
  const newTask = () => setModal(true);
  return <div className="app-shell">
    {menu && <button className="sidebar-backdrop" aria-label="Fechar menu" onClick={() => setMenu(false)}/>}
    <aside className={`sidebar ${menu ? 'open' : ''}`}>
      <a className="brand company-brand" href="#" aria-label={`${companyBrand.studioName} — início`} onClick={e => { e.preventDefault(); go('Escritório 3D'); }}><img src={companyBrand.logoUrl} alt="JMM Commerce — logo oficial" width="166" height="110"/><span className="studio-product-label">JMM STUDIOS<span>PRODUÇÃO AUDIOVISUAL</span></span></a>
      <div className="workspace-label">WORKSPACE <span>LOCAL</span></div>
      <div className="studio-switch"><span className="studio-icon">J</span><div><strong>Meu estúdio</strong><small>Ambiente de demonstração</small></div><ChevronRight size={15}/></div>
      <div className="nav-caption">ESTÚDIO</div>
      <nav aria-label="Menu principal">{navigation.map(({ name, icon: Icon }) => <button key={name} className={page === name ? 'active' : ''} onClick={() => go(name)} aria-current={page === name ? 'page' : undefined}><Icon size={19}/><span>{name}</span>{name === 'Agentes' && <small>{agents.length}</small>}{name === 'Escritório 3D' && <i/>}</button>)}</nav>
      <div className="sidebar-bottom"><div className="local-card"><span><i/> Modo simulação</span><p>Grandes ideias.<br/>Um estúdio só seu.</p><small>Sem APIs · Sem custos externos</small></div><button className="help-button" onClick={() => setHelp(true)}><CircleHelp size={17}/>Primeiros passos<ArrowUpRight size={14}/></button><div className="user"><span>JM</span><div><strong>JMM Creator</strong><small>Administrador local</small></div><Settings2 size={16}/></div></div>
    </aside>
    <div className="main-shell">
      <header className="topbar"><div className="breadcrumb"><button className="icon-button mobile-menu" onClick={() => setMenu(true)} aria-label="Abrir menu"><Menu size={20}/></button><span>Workspace</span><ChevronRight size={13}/><strong>{page}</strong></div><div className="topbar-right"><span className="local-indicator"><i/>Localhost</span><span className="version">V 0.2</span><button className="user-circle" onClick={() => go('Configurações')} aria-label="Configurações">JM</button></div></header>
      <main>
        <section className="page-heading"><div><div className="eyebrow"><span className="title-line"/> SEU ESTÚDIO EM MOVIMENTO</div><h1>{page === 'Escritório 3D' ? 'O próximo vídeo começa aqui.' : page === 'Visão Geral' ? 'Uma visão de todo o estúdio.' : page === 'Agentes' ? 'Pessoas virtuais. Grandes ideias.' : page === 'Produção' ? 'Da primeira ideia ao último corte.' : page === 'Canais' ? 'Cada canal, um novo universo.' : page === 'Tokens Codex' ? 'Consumo do Codex, em detalhes.' : 'Do seu jeito, no seu ritmo.'}</h1><p>{page === 'Escritório 3D' ? 'Explore o escritório, acompanhe o time e dê vida às suas ideias.' : page === 'Tokens Codex' ? 'Acompanhe os tokens locais e os limites registrados pelo Codex.' : 'Organize sua produtora em um ambiente local de demonstração.'}</p></div>{page !== 'Tokens Codex' && <button className="button primary" onClick={newTask}><Plus size={17}/>Nova tarefa</button>}</section>
        {storageError && <div className="storage-warning" role="alert">O navegador não permitiu salvar os dados. As alterações estão apenas nesta sessão; verifique o armazenamento local.</div>}
        {page !== 'Tokens Codex' && <section className="stats" aria-label="Resumo do estúdio"><Stat icon={<Users size={20}/>} label="Agentes no estúdio" value={String(agents.length).padStart(2, '0')} detail={`${working} trabalhando agora`} color="purple"/><Stat icon={<Workflow size={20}/>} label="Tarefas ativas" value={String(active.length).padStart(2, '0')} detail="Distribuídas entre o time" color="green"/><Stat icon={<Clapperboard size={20}/>} label="Vídeos em produção" value={String(production.length).padStart(2, '0')} detail="Ideias ganhando forma" color="blue"/><Stat icon={<CheckCircle2 size={20}/>} label="Vídeos concluídos" value={String(completed.length).padStart(2, '0')} detail="Demonstração · sem arquivos" color="orange"/></section>}
        <div className={`workspace-content ${selectedId && page !== 'Escritório 3D' && page !== 'Tokens Codex' ? 'with-agent' : ''}`}>
          <div className="page-content">
            {page === 'Escritório 3D' && <div ref={officeRef} className={`office-layout ${selectedId ? 'agent-selected' : ''} ${expanded ? 'expanded-office' : ''}`}><section className="office-card"><header className="office-header"><div><span className="office-icon"><Box size={18}/></span><div><h2>Escritório virtual</h2><span>JMM Studios · {officeRoomCount} salas</span></div></div><span className="live-badge"><i/>SIMULAÇÃO</span></header><div className="scene-container"><Suspense fallback={<div className="scene-fallback">Preparando o escritório 3D…</div>}><OfficeScene resetKey={resetKey} onNavigate={go}/></Suspense><div className="scene-caption"><span className="scene-tag"><i/> {agents.length} AGENTES NO ESCRITÓRIO</span><span className="scene-floor">ESTÚDIO / 001</span></div><div className="scene-controls"><button onClick={() => setResetKey(k => k + 1)} aria-label="Restaurar câmera" title="Restaurar câmera"><RotateCcw size={17}/></button><button onClick={() => { void toggleOffice(); }} aria-label={expanded ? 'Sair da visão ampliada' : 'Ampliar escritório'} title="Ampliar escritório">{expanded ? <X size={17}/> : <Maximize2 size={17}/>}</button></div><button type="button" className="scene-tip" onClick={() => go('Agentes')}><MousePointer2 size={14}/><span>Selecionar agente</span></button></div><footer className="office-footer"><div><span><i/>Direção</span><span><i/>Roteiros</span><span><i/>Edição</span><span><i/>Revisão</span></div><small><Focus size={14}/>Arraste: girar · Direito: mover · Roda: zoom</small></footer></section><AgentPanel onNewTask={newTask}/></div>}
            {page === 'Agentes' && <section className="agents-grid">{agents.map(a => <button key={a.id} className={`agent-card ${selectedId === a.id ? 'chosen' : ''}`} onClick={() => selectAgent(a.id)}><div className="agent-card-top"><Avatar agent={a} large/><ArrowUpRight size={18}/></div><h2>{a.name}</h2><p>{a.role}</p><Status status={agentStatus(a.id, tasks, statuses)}/><div className="agent-card-bottom"><span>{a.sector}</span><small>{tasks.filter(t => t.agentId === a.id && t.stage !== 'Concluído').length} tarefas ativas</small></div></button>)}</section>}
            {page === 'Produção' && <section className="production-page"><div className="section-heading"><div><h2>Fluxo de produção</h2><p>Arraste os cartões ou escolha a etapa no seletor.</p></div><span className="outline-tag">{tasks.length} tarefas · simulação</span></div><Kanban/></section>}
            {page === 'Visão Geral' && <><section className="overview-banner"><div className="eyebrow">BEM-VINDO AO JMM STUDIOS</div><h2>Seu próximo grande projeto<br/>tem espaço para acontecer.</h2><p>Uma equipe virtual, três canais e muitas histórias pela frente.</p><button className="button primary" onClick={() => go('Escritório 3D')}>Entrar no escritório<ArrowUpRight size={17}/></button><div className="banner-orbit"><Film size={72}/></div></section><div className="overview-grid"><section className="surface"><div className="section-heading"><h2>O time hoje</h2><button className="text-button" onClick={() => go('Agentes')}>Ver todos<ArrowUpRight size={14}/></button></div>{agents.map(a => <button className="team-row" key={a.id} onClick={() => selectAgent(a.id)}><Avatar agent={a}/><span><strong>{a.name}</strong><small>{a.role}</small></span><Status status={agentStatus(a.id, tasks, statuses)}/></button>)}</section><section className="surface"><div className="section-heading"><h2>Pipeline do estúdio</h2><Activity size={18}/></div>{['Ideia', 'Roteiro', 'Cenas', 'Edição', 'Revisão', 'Concluído'].map((s, i) => <div className="pipeline-row" key={s}><span><small>0{i + 1}</small>{s}</span><div><span style={{ width: `${Math.max(3, tasks.filter(t => t.stage === s).length / Math.max(tasks.length, 1) * 100)}%` }}/></div><strong>{tasks.filter(t => t.stage === s).length}</strong></div>)}<button className="button subtle full" onClick={() => go('Produção')}>Abrir produção<ArrowUpRight size={16}/></button></section></div></>}
            {page === 'Canais' && <section className="channels-grid">{channels.map(c => <article className="channel-card" key={c.id}><div className="channel-art"><span>{c.initial}</span><Radio size={32}/></div><div className="channel-body"><span className="eyebrow">CANAL DE DEMONSTRAÇÃO</span><h2>{c.name}</h2><p>{c.category}</p><div className="channel-count"><strong>{tasks.filter(t => t.channelId === c.id).length}</strong><span>tarefas no pipeline</span></div><span className="outline-tag">Publicação não conectada</span><button className="button subtle full" onClick={newTask}>Criar tarefa<Plus size={16}/></button></div></article>)}</section>}
            {page === 'Tokens Codex' && <TokenUsagePanel/>}
            {page === 'Configurações' && <section className="settings-page surface"><div className="section-heading"><div><h2>Preferências do estúdio</h2><p>Salvas neste navegador, neste endereço local.</p></div><Settings2 size={22}/></div><Toggle label="Modo leve" description="Reduz a resolução e desativa a suavização. Ativado automaticamente em telas pequenas." value={preferences.lowQuality} onChange={v => setPreference('lowQuality', v)}/><Toggle label="Animações dos agentes" description="Movimentos leves de trabalho, espera e deslocamento. Desative para reduzir o uso da GPU." value={preferences.animate} onChange={v => setPreference('animate', v)}/><div className="integration-note"><Monitor size={22}/><div><h3>100% local. 100% demonstração.</h3><p>Agentes, canais, tarefas e registros de produção são simulados. Nenhum vídeo ou arquivo de mídia é gerado. Não há envio de dados, credenciais ou conexão com serviços de IA.</p></div></div><h3 className="integration-title">Próximas conexões</h3><div className="integration-list">{['Paperclip / Codex', 'Modelos de IA', 'FFmpeg', 'Imagens e vozes', 'Publicação em canais'].map(s => <div key={s}><span>{s}</span><span className="outline-tag">Não implementado</span></div>)}</div><p className="muted">Os contratos para futuros adaptadores estão em src/services/production.ts. Integrações reais exigem implementação e configuração próprias.</p></section>}
          </div>
          {selectedId && page !== 'Escritório 3D' && page !== 'Tokens Codex' && <AgentPanel onNewTask={newTask}/>}
        </div>
        {page === 'Escritório 3D' && <section className="bottom-strip"><div className="bottom-strip-icon"><Clapperboard size={22}/></div><div><h3>Histórias em construção</h3><p>{production.length} projetos avançando no seu estúdio virtual.</p></div><div className="stacked-avatars">{agents.slice(2, 5).map(a => <span key={a.id}>{a.initials}</span>)}</div><button className="text-button" onClick={() => go('Produção')}>Acompanhar produção<ArrowUpRight size={16}/></button></section>}
        <footer className="app-footer"><span><i/>{page === 'Tokens Codex' ? 'Codex local · contadores registrados, sem consulta à fatura' : 'Dados de demonstração · agentes e atividades simulados'}</span><span>JMM STUDIOS <ArrowDownRight size={12}/> CRIE O QUE VEM A SEGUIR.</span></footer>
      </main>
    </div>
    {modal && <TaskModal onClose={() => setModal(false)}/>}
    {help && <div className="help-overlay" onClick={() => setHelp(false)}><section className="help-content" role="dialog" aria-modal="true" aria-label="Primeiros passos" onClick={e => e.stopPropagation()}><button autoFocus className="icon-button help-close" onClick={() => setHelp(false)} aria-label="Fechar ajuda"><X size={20}/></button><span className="eyebrow">BEM-VINDO AO ESTÚDIO</span><h2>Comece com uma ideia.</h2><ol><li>Arraste o escritório para girar e use a roda do mouse para aproximar. No celular, use um dedo para girar e dois para zoom.</li><li>Clique em um personagem ou escolha alguém na aba Agentes.</li><li>Crie uma tarefa e acompanhe as etapas em Produção.</li><li>Altere o estado de um agente para ver a mudança no escritório.</li></ol><p>Os dados ficam no localStorage deste navegador. Use sempre o mesmo endereço e porta para reencontrá-los. Esta versão simula uma produtora: não executa agentes de IA nem gera vídeos.</p><button className="button primary" onClick={() => setHelp(false)}>Explorar estúdio<ArrowUpRight size={16}/></button></section></div>}
  </div>;
}
function Stat({ icon, label, value, detail, color }: { icon: React.ReactNode; label: string; value: string; detail: string; color: string }) { return <article className="stat-card"><div className={`stat-icon ${color}`}>{icon}</div><div className="stat-label">{label}</div><strong>{value}</strong><small>{detail}</small><span className="stat-decoration"/></article>; }
function Toggle({ label, description, value, onChange }: { label: string; description: string; value: boolean; onChange: (value: boolean) => void }) { return <label className="toggle-row"><span><strong>{label}</strong><small>{description}</small></span><input type="checkbox" checked={value} onChange={e => onChange(e.target.checked)}/><span className="toggle"/></label>; }
