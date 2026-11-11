import { useEffect, useMemo } from 'react';
import { CanvasTexture, SRGBColorSpace } from 'three';
import { agents, channels } from '../../data/demo';
import { agentStatus, currentAgentTask, taskProgress, useStudio } from '../../store';
import { stages, type Agent } from '../../types';
import { stations } from './layout';

const width = 640, height = 376;

function WorkScreen({ agent, secondary = false }: { agent: Agent; secondary?: boolean }) {
  const tasks = useStudio(state => state.tasks);
  const statuses = useStudio(state => state.statuses);
  const currentTaskIds = useStudio(state => state.currentTaskIds);
  const selectAgent = useStudio(state => state.selectAgent);
  const current = currentAgentTask(agent.id, tasks, currentTaskIds);
  const status = agentStatus(agent.id, tasks, statuses);
  const channel = channels.find(item => item.id === current?.channelId);
  const display = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const texture = new CanvasTexture(canvas);
    texture.colorSpace = SRGBColorSpace;
    texture.anisotropy = 4;
    return { canvas, texture };
  }, []);

  useEffect(() => {
    const ctx = display.canvas.getContext('2d');
    if (!ctx) return;
    const accent = channel?.color ?? agent.color;
    const text = (value: string, x: number, y: number, size = 18, color = '#d9e5ef') => {
      ctx.fillStyle = color;
      ctx.font = `500 ${size}px system-ui, sans-serif`;
      ctx.fillText(value, x, y);
    };
    const fit = (value: string, maxWidth: number) => {
      let result = value;
      while (result.length && ctx.measureText(result).width > maxWidth) result = result.slice(0, -1);
      return result === value ? value : `${result.slice(0, -1)}…`;
    };
    const thumbnail = (x: number, y: number, w: number, h: number, scene: number) => {
      ctx.fillStyle = ['#284d68', '#514967', '#34616b'][scene % 3];
      ctx.fillRect(x, y, w, h);
      ctx.fillStyle = '#cbd9be';
      ctx.beginPath(); ctx.arc(x + w * .73, y + h * .28, h * .12, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#172d43';
      ctx.beginPath(); ctx.moveTo(x, y + h); ctx.lineTo(x + w * .38, y + h * .4);
      ctx.lineTo(x + w * .7, y + h * .82); ctx.lineTo(x + w, y + h * .5);
      ctx.lineTo(x + w, y + h); ctx.fill();
    };
    ctx.fillStyle = '#101923'; ctx.fillRect(0, 0, width, height);
    ctx.fillStyle = '#1d2b3a'; ctx.fillRect(0, 0, width, 37);
    text('JMM / PRODUÇÃO', 20, 25, 17);
    text('SIMULAÇÃO', 504, 25, 14, '#a9bacb');
    ctx.fillStyle = accent; ctx.fillRect(0, 37, 7, height - 37);
    text(channel?.name ?? 'Visão do estúdio', 22, 66, 18, accent);
    ctx.font = '600 24px system-ui, sans-serif';
    text(fit(current?.title ?? 'Acompanhamento das produções', 592), 22, 100, 24);

    const queued = tasks.filter(task => secondary ? task.agentId === agent.id : true);
    if (secondary || agent.id === 'ceo' || agent.id === 'producer' || !current) {
      if (secondary) {
        text('FILA DA ESTAÇÃO', 22, 135, 16, '#9eb3c7');
        queued.slice(0, 4).forEach((task, i) => {
          const y = 171 + i * 40;
          text(fit(task.title, 420), 22, y, 17);
          text(task.stage, 475, y, 15, accent);
        });
        if (!queued.length) text('Aguardando tarefas', 22, 184, 21);
      } else {
        const counts = stages.map(stage => tasks.filter(task => task.stage === stage).length);
        const peak = Math.max(1, ...counts);
        stages.forEach((stage, i) => {
          const x = 26 + i * 99, h = counts[i] / peak * 112;
          ctx.fillStyle = '#243445'; ctx.fillRect(x, 151, 73, 128);
          ctx.fillStyle = accent; ctx.fillRect(x, 279 - h, 73, h);
          text(String(counts[i]), x + 28, 271 - h, 18);
          text(stage, x, 302, 14, '#adbed0');
        });
      }
    } else if (agent.id === 'editor') {
      thumbnail(22, 122, 258, 135, 0);
      text('EDIÇÃO VERTICAL', 305, 151, 19, accent);
      text('Cortes · legendas · áudio', 305, 183, 16);
      text('Plano de edição simulado', 305, 220, 15, '#9eb3c7');
      [0, 1, 2].forEach(track => {
        ctx.fillStyle = '#263747'; ctx.fillRect(22, 271 + track * 17, 590, 12);
        [0, 1, 2, 3].forEach(clip => {
          ctx.fillStyle = ['#7facc7', '#b5a2ce', '#76a8a3'][track];
          ctx.fillRect(25 + clip * 145 + track * 13, 272 + track * 17, 110 - track * 12, 10);
        });
      });
    } else if (agent.id === 'visual') {
      text('STORYBOARD / PRÉVIA ILUSTRATIVA', 22, 138, 17, '#9eb3c7');
      [0, 1, 2].forEach(scene => {
        const x = 22 + scene * 202;
        thumbnail(x, 155, 186, 116, scene);
        text(`Cena ${scene + 1}`, x, 297, 17, accent);
      });
    } else if (agent.id === 'writer') {
      const lines = (current.instructions ?? 'Gancho inicial · desenvolvimento · encerramento').split(/\s+/);
      text('ROTEIRO / BRIEFING', 22, 137, 17, accent);
      let line = '', y = 172;
      ctx.font = '500 19px system-ui, sans-serif';
      for (const word of lines) {
        if (ctx.measureText(`${line} ${word}`).width > 560) {
          text(line, 22, y, 19); y += 28; line = '';
        }
        if (y > 250) break;
        line += `${line ? ' ' : ''}${word}`;
      }
      if (y <= 250) text(line, 22, y, 19);
      [0, 1].forEach(i => { ctx.fillStyle = '#314659'; ctx.fillRect(22, 280 + i * 16, 480 - i * 100, 5); });
    } else {
      text(agent.id === 'reviewer' ? 'CHECKLIST DE PRODUÇÃO' : 'ATENDIMENTO / BRIEFING', 22, 140, 17, accent);
      const labels = agent.id === 'reviewer' ? ['Conferir roteiro e fatos', 'Revisar legendas e áudio', 'Verificar formato do canal'] : ['Receber briefing', 'Encaminhar ao responsável', 'Organizar reunião'];
      labels.forEach((label, i) => {
        ctx.strokeStyle = accent; ctx.strokeRect(24, 166 + i * 44, 19, 19);
        text(label, 59, 182 + i * 44, 20);
      });
    }
    ctx.fillStyle = '#1d2b3a'; ctx.fillRect(0, 333, width, 43);
    const progress = current ? taskProgress(current.stage) : 0;
    text(`${current?.stage ?? 'Visão geral'} · ${status}`, 20, 360, 16);
    ctx.fillStyle = '#3c4d5e'; ctx.fillRect(439, 351, 122, 8);
    ctx.fillStyle = accent; ctx.fillRect(439, 351, 122 * progress / 100, 8);
    text(`${progress}%`, 574, 362, 16);
    display.texture.needsUpdate = true;
  }, [agent, channel, current, display, secondary, status, tasks]);

  useEffect(() => () => display.texture.dispose(), [display]);
  return <mesh onClick={event => { event.stopPropagation(); selectAgent(agent.id); }} userData={{ workScreen: agent.id, secondary }}>
    <planeGeometry args={[1.02, .6]}/>
    <meshBasicMaterial map={display.texture} toneMapped={false}/>
  </mesh>;
}

/** Keep dynamic screen textures outside StaticBatch so task changes remain visible. */
export default function AgentWorkScreens() {
  return <>{agents.map(agent => {
    const station = stations[agent.id];
    const editing = agent.sector === 'Edição';
    if (agent.id === 'receptionist') return <group key={agent.id} position={[-1.5, 1.62, 11.475]} rotation={[0, Math.PI, 0]} scale={[.598, .55, 1]}><WorkScreen agent={agent}/></group>;
    return <group key={agent.id} position={station.position} rotation={[0, station.rotation, 0]}>
      <group position={[editing ? -.3 : 0, 1.685, -1.058]}><WorkScreen agent={agent}/></group>
      {editing && <group position={[.78, 1.65, -1.08]} rotation={[0, -.18, 0]} scale={[.55, .9, 1]}>
        <group position={[0, .015, .062]}><WorkScreen agent={agent} secondary/></group>
      </group>}
    </group>;
  })}</>;
}
