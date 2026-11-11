import { useMemo, useState } from 'react';
import { ArrowUpRight, Coins, Database, Download, Info, RefreshCw, ShieldCheck, Zap } from 'lucide-react';
import { codexPricingSource, codexRates, codexUsageDashboard } from '../../data/codex-rates';
import { addCounts, emptyCounts, exportUsageCsv, filterPeriod, standardCredits } from '../../services/codex-usage';
import { useCodexUsage } from '../../hooks/useCodexUsage';
import type { TokenCounts, UsageWindow } from '../../types/codex';
import './token-usage.css';

const integer = new Intl.NumberFormat('pt-BR');
const compact = new Intl.NumberFormat('pt-BR', { notation: 'compact', maximumFractionDigits: 1 });
const decimal = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 2 });
const time = (value: string) => new Date(value).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo', dateStyle: 'short', timeStyle: 'short' });
export default function TokenUsagePanel() {
  const [scope, setScope] = useState('workspace');
  const [period, setPeriod] = useState('30');
  const { data, busy, error, refresh } = useCodexUsage(scope);
  const records = useMemo(() => filterPeriod(data?.records ?? [], period), [data, period]);
  const total = records.reduce(addCounts, emptyCounts());
  const sessions = new Set(records.map(r => r.session)).size;
  const models = useMemo(() => {
    const map = new Map<string, TokenCounts & { model: string }>();
    for (const record of records) map.set(record.model, { model: record.model, ...addCounts(map.get(record.model) || emptyCounts(), record) });
    return [...map.values()].sort((a, b) => b.total - a.total);
  }, [records]);
  const creditEstimate = models.reduce((sum, model) => sum + (standardCredits(model) ?? 0), 0);
  const unknownModels = models.filter(m => standardCredits(m) === null);
  const pricedModels = models.length - unknownModels.length;
  const days = useMemo(() => {
    const map = new Map<string, TokenCounts>();
    for (const record of records) map.set(record.day, addCounts(map.get(record.day) || emptyCounts(), record));
    return [...map.entries()].sort(([a], [b]) => a.localeCompare(b)).slice(-14);
  }, [records]);
  const peak = Math.max(1, ...days.map(([, counts]) => counts.total));
  const ready = !!data?.available;
  return <section className="token-page">
    <div className="token-toolbar"><div><h2>Uso local do Codex</h2><p>Contadores reais dos registros desta máquina. Os agentes do escritório continuam simulados.</p></div><div className="token-actions"><button className="button subtle" disabled={busy} onClick={refresh}><RefreshCw size={15} className={busy ? 'token-spin' : ''}/>{busy ? 'Lendo registros…' : 'Atualizar'}</button><button className="button subtle" disabled={!records.length} onClick={() => exportUsageCsv(records)}><Download size={15}/>Exportar CSV</button></div></div>
    <div className="token-filters"><label>Escopo<select aria-label="Escopo" value={scope} onChange={e => setScope(e.target.value)}><option value="workspace">Workspace atual</option><option value="all">Todas as sessões locais</option></select></label><label>Período<select aria-label="Período" value={period} onChange={e => setPeriod(e.target.value)}><option value="1">Hoje</option><option value="7">Últimos 7 dias</option><option value="30">Últimos 30 dias</option><option value="all">Todo o histórico local</option></select></label><span><ShieldCheck size={14}/>Somente leitura · atualização a cada 30 s</span></div>
    {data?.parentWorkspaceIncluded && scope === 'workspace' && <p className="token-muted token-scope-note">Inclui sessões iniciadas na pasta pai do projeto; os logs não separam o consumo de cada arquivo ou projeto editado nesse workspace.</p>}
    {data && (data.truncated || data.ignoredFiles > 0) && <div className="token-notice" role="status"><Info size={18}/><p>Relatório parcial: alguns arquivos não puderam ser lidos ou o limite de leitura foi atingido. Consulte os detalhes de origem abaixo.</p></div>}
    {error && <div className="token-notice" role="alert"><Info size={18}/><p>{error}</p></div>}
    {data && !data.available && <div className="token-notice" role="status"><Info size={18}/><p>{data.message} Abra o Codex nesta máquina e tente novamente. Nenhum consumo de demonstração será inventado.</p></div>}
    <div className="token-metrics"><Metric label="Tokens registrados" value={ready ? total.total : null} note={ready ? `${sessions} sessões no período` : 'Sem dados carregados'} icon={<Zap size={18}/>}/><Metric label="Entrada sem cache" value={ready ? total.input - total.cached : null} note="Contexto processado sem cache" icon={<ArrowUpRight size={18}/>}/><Metric label="Entrada em cache" value={ready ? total.cached : null} note={total.input ? `${decimal.format(total.cached / total.input * 100)}% da entrada` : 'Cache já incluído na entrada'} icon={<Database size={18}/>}/><Metric label="Tokens de saída" value={ready ? total.output : null} note={ready ? `${integer.format(total.reasoning)} de raciocínio, já incluídos` : 'Raciocínio já incluído na saída'} icon={<Coins size={18}/>}/></div>
    <div className="token-split"><section className="surface token-chart"><div className="section-heading"><div><h3>Consumo por dia</h3><p>Até 14 dias com registros no período · horário de Brasília</p></div><span className="outline-tag">Dados locais</span></div><div className="token-legend"><span><i className="token-uncached"/>Entrada sem cache</span><span><i className="token-cached"/>Cache</span><span><i className="token-output"/>Saída</span></div>{days.length ? <div className="token-daily">{days.map(([day, counts]) => <div className="token-day" key={day}><time dateTime={day}>{day.slice(8)}/{day.slice(5, 7)}</time><div className="token-daily-track" title={`${integer.format(counts.total)} tokens`}><span className="token-uncached" style={{ width: `${(counts.input - counts.cached) / peak * 100}%` }}/><span className="token-cached" style={{ width: `${counts.cached / peak * 100}%` }}/><span className="token-output" style={{ width: `${counts.output / peak * 100}%` }}/></div><strong>{compact.format(counts.total)}</strong></div>)}</div> : <div className="token-empty">{busy ? 'Lendo os contadores locais…' : 'Nenhum consumo encontrado neste período e escopo.'}</div>}</section>
    <section className="surface token-limits"><div className="section-heading"><h3>Últimos limites registrados</h3><Info size={16}/></div>{data?.limits ? <><Quota value={data.limits.primary}/><Quota value={data.limits.secondary}/><p className="token-muted">Registro de {time(data.limits.timestamp)}{data.limits.plan ? ` · plano ${data.limits.plan}` : ''}. Estes percentuais podem estar defasados e não representam uma consulta ao saldo atual da conta.</p></> : <p className="token-muted">Os arquivos locais ainda não informaram limites do plano.</p>}<a className="button subtle full" href={codexUsageDashboard} target="_blank" rel="noreferrer">Ver uso oficial da conta<ArrowUpRight size={14}/></a></section></div>
    <section className="surface token-cost"><div><span className="eyebrow">REFERÊNCIA DE CONSUMO · NÃO É FATURA</span><h3>{ready && pricedModels ? `${decimal.format(creditEstimate)} créditos equivalentes` : 'Créditos equivalentes indisponíveis'}{unknownModels.length > 0 && pricedModels > 0 && <span className="outline-tag">Estimativa parcial</span>}</h3><p>Estimativa pelas taxas Standard publicadas por modelo, conferidas em 11/11/2026. Modos Fast/Ultrafast, ferramentas, descontos, contratos e uso incluído no plano podem ter regras diferentes.</p></div><div className="token-invoice"><span>Cobrança em dinheiro</span><strong>Não disponível</strong><small>Os logs não são uma fatura e não permitem calcular a cobrança da assinatura.</small></div></section>
    <section className="surface token-models"><div className="section-heading"><h3>Detalhamento por modelo</h3><span className="outline-tag">{models.length} modelos</span></div><div className="token-table-scroll"><table><thead><tr><th>Modelo registrado</th><th>Entrada sem cache</th><th>Cache</th><th>Saída</th><th>Total</th><th>Créditos Standard*</th></tr></thead><tbody>{models.map(model => <tr key={model.model}><td>{model.model === 'unknown' ? 'Modelo não identificado' : model.model}</td><td>{integer.format(model.input - model.cached)}</td><td>{integer.format(model.cached)}</td><td title={`Inclui ${integer.format(model.reasoning)} tokens de raciocínio`}>{integer.format(model.output)}</td><td>{integer.format(model.total)}</td><td>{standardCredits(model) === null ? 'Taxa não cadastrada' : decimal.format(standardCredits(model)!)}</td></tr>)}</tbody></table></div>{!models.length && <div className="token-empty">Sem registros para detalhar.</div>}<p className="token-muted">*Referência, sem cobrança real. Modelos sem taxa cadastrada ficam fora da estimativa. Cache não é somado novamente à entrada; raciocínio não é somado novamente à saída.</p></section>
    <details className="surface token-method"><summary>Origem dos dados e método de cálculo</summary><p>Leitura de eventos token_count em ~/.codex/sessions. São retidos somente contadores, datas, modelo e um identificador anonimizado de sessão. Mensagens, código, nomes de arquivos e credenciais não são enviados ao navegador. Contadores cumulativos repetidos são deduplicados; linhas incompletas são ignoradas. O formato dos logs pode mudar e o histórico pode estar incompleto.</p>{data?.parentWorkspaceIncluded && <p>O escopo atual inclui sessões iniciadas na pasta pai do projeto. O Codex registra o workspace de abertura, portanto esse consumo não separa cada arquivo ou projeto editado dentro dessa pasta.</p>}<p>{data ? `${data.filesScanned} arquivos lidos · ${data.ignoredFiles} ignorados · ${data.malformedLines} linhas incompletas/inválidas. ${data.truncated ? 'A leitura atingiu o limite de segurança; o relatório é parcial.' : ''} Atualização: ${time(data.generatedAt)}.` : 'Serviço local do Vite necessário: npm.cmd run dev ou npm.cmd run preview.'}</p><p>As taxas de referência em créditos por milhão são aplicadas à entrada sem cache, entrada em cache e saída. O total em reais/dólares e o saldo atual devem ser verificados na conta oficial.</p><div className="token-rate-list">{Object.entries(codexRates).map(([model, rates]) => <span key={model}>{model}: {rates.input} / {rates.cached} / {rates.output}</span>)}</div><a href={codexPricingSource} target="_blank" rel="noreferrer">Documentação oficial de preços e limites<ArrowUpRight size={13}/></a></details>
  </section>;
}
function Metric({ label, value, note, icon }: { label: string; value: number | null; note: string; icon: React.ReactNode }) {
  return <article className="token-metric"><span>{label}{icon}</span><strong title={value === null ? 'Sem leitura disponível' : integer.format(value)}>{value === null ? '—' : compact.format(value)}</strong><small>{note}</small></article>;
}
function Quota({ value }: { value: UsageWindow | null }) {
  if (!value) return null;
  const expired = !!value.resetsAt && new Date(value.resetsAt).getTime() <= Date.now();
  const hours = value.windowMinutes / 60;
  const label = hours >= 24 ? `${decimal.format(hours / 24)} dias` : `${decimal.format(hours)} horas`;
  return <div className="token-quota"><div><span>Janela de {label}</span><strong>{decimal.format(value.usedPercent)}% usado</strong></div><div className="token-quota-track"><span style={{ width: `${Math.min(value.usedPercent, 100)}%` }}/></div><small>{expired ? 'Janela expirada; consulte um registro mais recente.' : value.resetsAt ? `Redefinição registrada: ${time(value.resetsAt)}` : 'Sem horário de redefinição informado.'}</small></div>;
}
