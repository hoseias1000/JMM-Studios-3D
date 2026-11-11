import { useEffect, useMemo, useState } from 'react';
import { useCursor } from '@react-three/drei';
import { CanvasTexture, SRGBColorSpace } from 'three';
import type { Stage } from '../../types';
import { Block } from './primitives';

export interface StudioMonitorSummary {
  tokensToday: number | null;
  busy: boolean;
  production: number;
  completed: number;
  stages: { stage: Stage; count: number }[];
}

const compact = new Intl.NumberFormat('pt-BR', { notation: 'compact', maximumFractionDigits: 1 });
const stageLabels = ['IDEIA', 'ROTEIRO', 'CENAS', 'EDIÇÃO', 'REVISÃO', 'FIM'];

/** The display is a real GPU texture, redrawn only when its counters change. */
export default function StudioWallMonitor({ summary, onOpen }: { summary: StudioMonitorSummary; onOpen: () => void }) {
  const [hovered, setHovered] = useState(false);
  useCursor(hovered);
  const display = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 512;
    const texture = new CanvasTexture(canvas);
    texture.colorSpace = SRGBColorSpace;
    texture.anisotropy = 4;
    return { canvas, texture };
  }, []);

  useEffect(() => {
    const context = display.canvas.getContext('2d');
    if (!context) return;
    context.fillStyle = '#101e2a';
    context.fillRect(0, 0, 1024, 512);
    context.fillStyle = '#d7e3eb';
    context.font = '600 27px system-ui, sans-serif';
    context.fillText('JMM / PAINEL DO ESTÚDIO', 42, 49);
    context.fillStyle = '#7696ac';
    context.fillRect(42, 70, 940, 2);

    const metrics = [
      { label: 'TOKENS CODEX · HOJE', value: summary.tokensToday === null ? summary.busy ? 'Lendo…' : 'Indisponível' : compact.format(summary.tokensToday) },
      { label: 'EM PRODUÇÃO', value: String(summary.production) },
      { label: 'CONCLUÍDOS', value: String(summary.completed) },
    ];
    metrics.forEach((metric, index) => {
      const x = 42 + index * 323;
      context.fillStyle = '#9cb3c4';
      context.font = '500 18px system-ui, sans-serif';
      context.fillText(metric.label, x, 111);
      context.fillStyle = '#f2f5f7';
      context.font = `600 ${metric.value.length > 10 ? 31 : 47}px system-ui, sans-serif`;
      context.fillText(metric.value, x, 170);
    });

    context.fillStyle = '#9cb3c4';
    context.font = '500 20px system-ui, sans-serif';
    context.fillText('PRODUÇÕES SIMULADAS / POR ETAPA', 42, 224);
    const peak = Math.max(1, ...summary.stages.map(item => item.count));
    summary.stages.forEach((item, index) => {
      const x = 70 + index * 158;
      const height = item.count / peak * 130;
      context.fillStyle = '#233b4d';
      context.fillRect(x, 259, 94, 140);
      context.fillStyle = index === 5 ? '#c3d7df' : '#6d9eba';
      context.fillRect(x, 399 - height, 94, height);
      context.fillStyle = '#e1eaf0';
      context.font = '600 22px system-ui, sans-serif';
      context.textAlign = 'center';
      context.fillText(String(item.count), x + 47, 389 - height);
      context.fillStyle = '#b6cbd7';
      context.font = '500 16px system-ui, sans-serif';
      context.fillText(stageLabels[index], x + 47, 432);
    });
    context.textAlign = 'left';
    context.fillStyle = '#8daec2';
    context.font = '500 20px system-ui, sans-serif';
    context.fillText('CLIQUE NA TELA PARA EXPLORAR  ↗', 42, 484);
    display.texture.needsUpdate = true;
  }, [display, summary]);

  useEffect(() => () => display.texture.dispose(), [display]);

  return <group
    position={[-8.94, 1.5, 11.65]}
    rotation={[0, Math.PI / 2, 0]}
    userData={{ studioMonitor: true }}
    onClick={event => { event.stopPropagation(); onOpen(); }}
    onPointerOver={event => { event.stopPropagation(); setHovered(true); }}
    onPointerOut={() => setHovered(false)}
  >
    <Block size={[3.6, 1.9, .1]} color={hovered ? '#a3b8c5' : '#263b4b'} rounded/>
    <mesh position={[0, 0, .058]}>
      <planeGeometry args={[3.4, 1.7]}/>
      <meshBasicMaterial map={display.texture} toneMapped={false}/>
    </mesh>
  </group>;
}
