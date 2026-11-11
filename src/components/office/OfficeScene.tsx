import { Component, Suspense, useCallback, useEffect, useLayoutEffect, useMemo, useState, type ReactNode } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { Monitor } from 'lucide-react';
import { OrbitControls } from '@react-three/drei';
import { OrthographicCamera } from 'three';
import { agents } from '../../data/demo';
import { useStudio } from '../../store';
import { useCodexUsage } from '../../hooks/useCodexUsage';
import { addCounts, emptyCounts, filterPeriod } from '../../services/codex-usage';
import { stages } from '../../types';
import StudioMonitorDialog from '../ui/StudioMonitorDialog';
import OfficeCharacter from './OfficeCharacter';
import OfficeRoom from './OfficeRoom';
import StudioWallMonitor, { type StudioMonitorSummary } from './StudioWallMonitor';
import { Block, GroundShade } from './primitives';
import { officeView } from './layout';
import './office-overlays.css';

class SceneBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() {
    return this.state.failed ? <div className="scene-fallback"><h3>Não foi possível iniciar o 3D</h3><p>Ative a aceleração gráfica no navegador e recarregue. Agentes e Produção continuam disponíveis nas abas.</p><button className="button subtle" onClick={() => location.reload()}>Recarregar</button></div> : this.props.children;
  }
}
export default function OfficeScene({ resetKey, onNavigate }: { resetKey: number; onNavigate: (page: 'Produção' | 'Tokens Codex') => void }) {
  const lowQuality = useStudio(s => s.preferences.lowQuality);
  const tasks = useStudio(s => s.tasks);
  const usage = useCodexUsage();
  const [monitorOpen, setMonitorOpen] = useState(false);
  const openMonitor = useCallback(() => setMonitorOpen(true), []);
  const closeMonitor = useCallback(() => setMonitorOpen(false), []);
  const monitor = useMemo<StudioMonitorSummary>(() => ({
    tokensToday: usage.data?.available ? filterPeriod(usage.data.records, '1').reduce(addCounts, emptyCounts()).total : null,
    busy: usage.busy,
    production: tasks.filter(task => task.stage !== 'Ideia' && task.stage !== 'Concluído').length,
    completed: tasks.filter(task => task.stage === 'Concluído').length,
    stages: stages.map(stage => ({ stage, count: tasks.filter(task => task.stage === stage).length })),
  }), [tasks, usage.data, usage.busy]);
  const [mobile, setMobile] = useState(() => window.innerWidth < 768);
  useEffect(() => {
    const query = matchMedia('(max-width: 767px)');
    const update = () => setMobile(query.matches);
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);
  const simplified = mobile || lowQuality;
  return <><SceneBoundary><Canvas orthographic shadows={!simplified} camera={{ position: officeView.position, zoom: 28, near: .1, far: 140 }} dpr={simplified ? 1 : [1, 1.5]} gl={{ antialias: !simplified, powerPreference: 'high-performance' }} fallback={<div className="scene-fallback">WebGL indisponível. Use as abas Agentes e Produção.</div>}>
    <color attach="background" args={['#333e49']}/>
    <ambientLight intensity={.6}/>
    <hemisphereLight args={['#dce6f2', '#807465', .8]}/>
    <directionalLight position={[-10, 22, 12]} intensity={2.2} color="#ffe9cc" castShadow={!simplified} shadow-mapSize={[1024, 1024]} shadow-camera-left={-21} shadow-camera-right={21} shadow-camera-top={24} shadow-camera-bottom={-24} shadow-camera-near={1} shadow-camera-far={80} shadow-bias={-.001} shadow-normalBias={.05} shadow-radius={3}/>
    <directionalLight position={[9, 7, -8]} intensity={.65} color="#b1c9f2"/>
    <Suspense fallback={null}><SceneContents resetKey={resetKey} simplified={simplified} monitor={monitor} onOpenMonitor={openMonitor}/></Suspense>
    <Block at={[0, -.68, 0]} size={[200, .14, 200]} color="#333e49"/>
    <GroundShade x={5.25} z={4.65} y={-.59} width={17} depth={13.2}/>
  </Canvas></SceneBoundary>
    <button className="studio-monitor-launch" onClick={openMonitor} aria-label="Abrir painel do estúdio"><Monitor size={15}/>Painel do estúdio</button>
    {monitorOpen && <StudioMonitorDialog data={usage.data} busy={usage.busy} error={usage.error} onRefresh={usage.refresh} onClose={closeMonitor} onNavigate={onNavigate}/>}
  </>;
}
function SceneContents({ resetKey, simplified, monitor, onOpenMonitor }: { resetKey: number; simplified: boolean; monitor: StudioMonitorSummary; onOpenMonitor: () => void }) {
  const { width, height } = useThree(s => s.size);
  const camera = useThree(s => s.camera);
  // Fit the complete cutaway office at every viewport size, including expanded mode.
  const zoom = Math.max(6, Math.min((width - 38) / officeView.projectedWidth, (height - 76) / officeView.projectedHeight, 66));
  useLayoutEffect(() => {
    camera.position.set(...officeView.position);
    camera.lookAt(...officeView.target);
    if (camera instanceof OrthographicCamera) camera.zoom = zoom;
    camera.updateProjectionMatrix();
  }, [camera, zoom, resetKey]);
  return <>
    <OfficeRoom simplified={simplified}/>
    <StudioWallMonitor summary={monitor} onOpen={onOpenMonitor}/>
    {agents.map(agent => <OfficeCharacter key={agent.id} agent={agent}/>)}
    <OrbitControls key={`orbit-${resetKey}-${width}`} makeDefault target={officeView.target} enablePan screenSpacePanning={false} minZoom={zoom * .65} maxZoom={zoom * 3.4} minPolarAngle={.38} maxPolarAngle={1.13} minAzimuthAngle={-.85} maxAzimuthAngle={1.45} enableDamping dampingFactor={.09}/>
  </>;
}
