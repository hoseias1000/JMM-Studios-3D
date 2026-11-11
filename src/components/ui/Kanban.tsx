import { ArrowRight, Check, GripVertical } from 'lucide-react';
import { agents, channels } from '../../data/demo';
import { stages, type Stage, type Task } from '../../types';
import { useStudio } from '../../store';
const stageColors = ['#777777', '#999999', '#aaaaaa', '#bbbbbb', '#cccccc', '#eeeeee'];
export default function Kanban() {
  const { tasks, moveTask, selectAgent } = useStudio();
  const move = (task: Task, stage: Stage) => { void moveTask(task.id, stage); };
  return <div className="kanban">{stages.map((stage, index) => <section className="kanban-column" key={stage} onDragOver={e => e.preventDefault()} onDrop={e => { e.preventDefault(); const task = tasks.find(t => t.id === e.dataTransfer.getData('text/plain')); if (task) move(task, stage); }}>
    <header><i style={{ background: stageColors[index] }}/><h3>{stage}</h3><span>{tasks.filter(t => t.stage === stage).length}</span></header>
    <div className="kanban-cards">{tasks.filter(t => t.stage === stage).map(task => {
      const channel = channels.find(c => c.id === task.channelId)!;
      const agent = agents.find(a => a.id === task.agentId)!;
      return <article className="task-card" key={task.id} draggable onDragStart={e => e.dataTransfer.setData('text/plain', task.id)}>
        <div className="task-top"><span>{channel.name}</span><GripVertical size={13}/></div><h4>{task.title}</h4>
        <div className="task-owner"><button onClick={() => selectAgent(agent.id)} title={`Ver ${agent.name}`}>{agent.initials}</button><span>{agent.name.split(' ')[0]}</span>{stage === 'Concluído' ? <Check size={14} color="currentColor"/> : <ArrowRight size={14}/>}</div>
        <label className="stage-select">Etapa<select aria-label={`Etapa de ${task.title}`} value={task.stage} onChange={e => move(task, e.target.value as Stage)}>{stages.map(s => <option key={s}>{s}</option>)}</select></label>
      </article>;
    })}{!tasks.some(t => t.stage === stage) && <div className="drop-hint">Arraste uma tarefa para cá<br/>ou use o seletor de etapa.</div>}</div>
  </section>)}</div>;
}
