import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import { Group, MathUtils } from 'three';
import { BarChart3, CheckCheck, Clapperboard, FileText, Footprints, Headset, List, MessagesSquare, Monitor, Pause } from 'lucide-react';
import { agents } from '../../data/demo';
import { agentStatus, currentAgentTask, taskProgress, useStudio } from '../../store';
import type { Agent } from '../../types';
import { Block, GroundShade, Limb, Orb, Tube } from './primitives';
import { breakSeats, meetingSeats, stations } from './layout';
const styles = [
  { skin: '#d4a081', hair: '#493333', shirt: '#2c3341', trousers: '#2b3240', shoes: '#171b22', long: true },
  { skin: '#b88060', hair: '#342b2b', shirt: '#417c9b', trousers: '#3a495d', shoes: '#45454c', long: false },
  { skin: '#e4b294', hair: '#6c422e', shirt: '#619eae', trousers: '#54697a', shoes: '#eee4cf', long: true },
  { skin: '#98634e', hair: '#252933', shirt: '#287aa3', trousers: '#33425c', shoes: '#ddd8c8', long: false },
  { skin: '#d4a582', hair: '#765137', shirt: '#547b9f', trousers: '#484e65', shoes: '#e0dfd4', long: false },
  { skin: '#bd8b6e', hair: '#35303c', shirt: '#3e6589', trousers: '#46546a', shoes: '#ece1d4', long: true },
  { skin: '#c58f70', hair: '#30252d', shirt: '#726884', trousers: '#343b51', shoes: '#282b38', long: true },
];
function Arm({ color, skin, side, shoulderRef, elbowRef, formal = false }: { color: string; skin: string; side: number; shoulderRef: React.RefObject<Group>; elbowRef: React.RefObject<Group>; formal?: boolean }) {
  return <group position={[side * .255, .47, 0]} rotation={[1.1, 0, 0]} ref={shoulderRef}>
    <Orb size={[.105, .11, .11]} color={color}/>
    <Limb length={.32} radius={.088} color={color}/>
    <group position={[0, -.32, 0]} rotation={[.5, 0, 0]} ref={elbowRef}>
      <Orb size={[.073, .073, .073]} color={formal ? color : skin}/>
      <Limb length={.3} radius={formal ? .078 : .064} color={formal ? color : skin}/>
      {formal && <Block at={[0, -.275, 0]} size={[.15, .055, .12]} color="#ece9df" rounded/>}
      <Orb at={[0, -.32, -.015]} size={[.07, .085, .045]} color={skin}/>
    </group>
  </group>;
}
function Leg({ side, trousers, shoes, thighRef, kneeRef, formal = false }: { side: number; trousers: string; shoes: string; thighRef: React.RefObject<Group>; kneeRef: React.RefObject<Group>; formal?: boolean }) {
  return <group ref={thighRef} position={[side * .125, 0, 0]} rotation={[1.1, 0, 0]}>
    <Limb length={.43} radius={.105} color={trousers}/>
    <group ref={kneeRef} position={[0, -.43, 0]} rotation={[-1.1, 0, 0]}>
      <Orb size={[.095, .095, .095]} color={trousers}/>
      <Limb length={.5} radius={.08} color={trousers}/>
      <Block at={[0, -.48, -.07]} size={[.19, .14, .34]} color={shoes} roughness={formal ? .35 : .75} rounded/>
      <Block at={[0, -.535, -.08]} size={[.19, .035, .34]} color={formal ? '#343945' : '#a4a8ab'} rounded/>
      {formal && <Block at={[0, -.44, -.16]} size={[.15, .012, .015]} color="#464b56" rounded/>}
    </group>
  </group>;
}

function ExecutiveSuit() {
  return <>
    <Block at={[0, .39, -.165]} size={[.17, .4, .03]} color="#eeeae0" rounded/>
    {[-1, 1].map(side => <group key={side}>
      <Block at={[side * .105, .44, -.176]} size={[.095, .31, .035]} rotation={[0, 0, side * -.25]} color="#454e60" rounded/>
      <Block at={[side * .05, .565, -.18]} size={[.065, .105, .025]} rotation={[0, 0, side * -.4]} color="#fcf8ed" rounded/>
    </group>)}
    <Block at={[0, .51, -.202]} size={[.052, .06, .025]} rotation={[0, 0, Math.PI / 4]} color="#713844" rounded/>
    <Block at={[0, .345, -.198]} size={[.046, .27, .022]} color="#713844" rounded/>
    <Block at={[.145, .39, -.145]} size={[.08, .016, .025]} color="#e6e1d6" rounded/>
    {[.19, .095].map(y => <Orb key={y} at={[.055, y, -.17]} size={[.014, .014, .012]} color="#a8adb5"/>)}
    <Block at={[0, .34, .163]} size={[.009, .31, .008]} color="#424a5a"/>
  </>;
}

function ReceptionUniform() {
  return <>
    <Block at={[0, .4, -.165]} size={[.17, .34, .03]} color="#eee8de" rounded/>
    {[-1, 1].map(side => <Block key={side} at={[side * .11, .44, -.17]} size={[.09, .29, .03]} rotation={[0, 0, side * -.23]} color="#90839e" rounded/>)}
    <Block at={[0, .54, -.19]} size={[.12, .07, .025]} rotation={[0, 0, -.22]} color="#c6a2b4" rounded/>
    <Block at={[-.13, .37, -.174]} size={[.09, .075, .018]} color="#eee8de" rounded/>
    <Block at={[-.13, .38, -.186]} size={[.055, .012, .006]} color="#626e82"/>
  </>;
}

/** Original procedural characters: no external meshes, textures, rigs or licensing downloads. */
export default function OfficeCharacter({ agent }: { agent: Agent }) {
  const index = agents.findIndex(a => a.id === agent.id);
  const appearance = styles[index];
  const formal = agent.id === 'ceo';
  const receptionist = agent.id === 'receptionist';
  const tailored = formal || receptionist;
  const station = stations[agent.id];
  const root = useRef<Group>(null);
  const hips = useRef<Group>(null);
  const head = useRef<Group>(null);
  const label = useRef<Group>(null);
  const shoulderA = useRef<Group>(null), shoulderB = useRef<Group>(null);
  const elbowA = useRef<Group>(null), elbowB = useRef<Group>(null);
  const thighA = useRef<Group>(null), thighB = useRef<Group>(null);
  const kneeA = useRef<Group>(null), kneeB = useRef<Group>(null);
  const [hovered, setHovered] = useState(false);
  const tasks = useStudio(s => s.tasks), statuses = useStudio(s => s.statuses);
  const currentTaskIds = useStudio(s => s.currentTaskIds);
  const selected = useStudio(s => s.selectedId === agent.id);
  const selectAgent = useStudio(s => s.selectAgent);
  const animate = useStudio(s => s.preferences.animate);
  const status = agentStatus(agent.id, tasks, statuses);
  const walking = status === 'Em deslocamento';
  const meeting = status === 'Em reunião';
  const resting = status === 'Em pausa';
  const seated = !walking;
  const working = status === 'Trabalhando';
  const currentTask = currentAgentTask(agent.id, tasks, currentTaskIds);
  const progress = currentTask ? taskProgress(currentTask.stage) : 0;
  const RoleIcon = receptionist ? Headset : agent.id === 'writer' ? FileText : agent.id === 'reviewer' ? CheckCheck : agent.sector === 'Edição' ? Clapperboard : BarChart3;
  const StateIcon = meeting ? MessagesSquare : walking ? Footprints : status === 'Em pausa' ? Pause : Monitor;
  const target = meeting ? meetingSeats[index] : resting ? breakSeats[index] : station;
  useFrame(({ clock }, delta) => {
    if (!root.current || !hips.current) return;
    const t = clock.elapsedTime + index * 1.4;
    const weight = 1 - Math.exp(-delta * 10);
    const stride = animate && walking ? Math.sin(t * 5) : 0;
    const x = walking ? (animate ? Math.sin(t * .46) * .2 : 0) : target.position[0];
    const z = walking ? 3.8 + (animate ? Math.sin(t * .23) * 8.4 : index * .4) : target.position[2];
    root.current.position.set(x, 0, z);
    // Face the tangent of the walking route, instead of sliding sideways.
    const walkHeading = Math.atan2(-.092 * Math.cos(t * .46), -1.932 * Math.cos(t * .23));
    root.current.rotation.y = walking ? animate ? walkHeading : Math.PI : target.rotation + (!working && !meeting && animate ? Math.sin(t * .5) * .11 : 0);
    hips.current.position.y = MathUtils.lerp(hips.current.position.y, resting ? .74 : seated ? .84 : 1.02 + Math.abs(stride) * .025, weight);
    hips.current.rotation.x = working ? .075 + (animate ? Math.sin(t * 2) * .012 : 0) : -.035;
    if (head.current) { head.current.rotation.y = animate ? Math.sin(t * (meeting ? 1.3 : .6)) * (meeting ? .2 : .06) : 0; head.current.rotation.x = working ? .12 : -.03; }
    const typing = animate && working ? Math.sin(t * 10) * .045 : 0;
    const gesture = animate && meeting ? Math.sin(t * 2.5) * .24 : 0;
    for (let i = 0; i < 2; i++) {
      const sign = i === 0 ? 1 : -1;
      const shoulder = (i === 0 ? shoulderA : shoulderB).current;
      const elbow = (i === 0 ? elbowA : elbowB).current;
      const thigh = (i === 0 ? thighA : thighB).current;
      const knee = (i === 0 ? kneeA : kneeB).current;
      if (shoulder) {
        const angle = working ? 1.1 + typing * sign : meeting ? .55 + gesture * sign : walking ? stride * .55 * sign : .35;
        shoulder.rotation.x = MathUtils.lerp(shoulder.rotation.x, angle, weight);
        shoulder.rotation.z = sign * (meeting ? .16 : .04);
      }
      if (elbow) elbow.rotation.x = MathUtils.lerp(elbow.rotation.x, working ? .5 - typing : meeting ? .8 + gesture : walking ? .12 : .8, weight);
      if (thigh) thigh.rotation.x = MathUtils.lerp(thigh.rotation.x, resting ? 1.26 : seated ? 1.1 : stride * .55 * sign, weight);
      if (knee) knee.rotation.x = MathUtils.lerp(knee.rotation.x, resting ? -1.26 : seated ? -1.1 : -Math.max(0, -stride * sign) * .55, weight);
    }
    if (label.current) label.current.position.set(x, 2.9, z);
  });
  return <>
    <group ref={root} position={target.position} onClick={e => { e.stopPropagation(); selectAgent(agent.id); }} onPointerOver={e => { e.stopPropagation(); setHovered(true); }} onPointerOut={() => setHovered(false)} userData={{ agentId: agent.id, status }}>
      <GroundShade width={.52} depth={.45}/>
      {(selected || hovered) && <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, .035, 0]}><ringGeometry args={[.47, .51, 32]}/><meshBasicMaterial color="#ffffff" transparent opacity={.8}/></mesh>}
      <group ref={hips} position={[0, .84, 0]}>
        <Orb at={[0, .02, .01]} size={[.235, .15, .165]} color={appearance.trousers}/>
        <Orb at={[0, .32, 0]} size={[.24, .37, .16]} color={appearance.shirt} cast/>
        <Block at={[0, .12, -.146]} size={[.3, .23, .045]} color={appearance.shirt} rounded/>
        <Tube at={[0, .65, 0]} size={[.075, .17, .075]} color={appearance.skin}/>
        <Block at={[0, .56, -.155]} size={[.13, .1, .024]} color="#eee7db" rounded/>
        {formal && <ExecutiveSuit/>}
        {receptionist && <ReceptionUniform/>}
        {agent.id === 'producer' && <Block at={[.1, .42, -.17]} size={[.065, .1, .01]} color="#f0ddbb"/>}
        <group ref={head} position={[0, .85, -.018]} scale={[.88, .92, .9]}>
          <Orb size={[.192, .245, .183]} color={appearance.skin} cast/>
          <Orb at={[-.195, -.02, 0]} size={[.045, .07, .038]} color={appearance.skin}/><Orb at={[.195, -.02, 0]} size={[.045, .07, .038]} color={appearance.skin}/>
          <Orb at={[0, -.03, -.185]} size={[.04, .055, .045]} color={appearance.skin}/>
          {[-.073, .073].map(x => <group key={x}><Orb at={[x, .035, -.166]} size={[.022, .026, .012]} color="#343238"/><Block at={[x, .087, -.166]} size={[.054, .013, .012]} color={appearance.hair} rounded/></group>)}
          <Block at={[0, -.115, -.163]} size={[.065, .012, .01]} color="#9f6858" rounded/>
          <Orb at={[0, .13, .025]} size={[.205, .16, .19]} color={appearance.hair}/>
          <Orb at={[-.105, .16, -.09]} size={[.12, .09, .12]} color={appearance.hair}/>
          {appearance.long ? <><Orb at={[0, -.035, .12]} size={[.21, .23, .11]} color={appearance.hair}/><Orb at={[.16, .02, .085]} size={[.09, .19, .1]} color={appearance.hair}/>{agent.id === 'ceo' && <Orb at={[0, .11, .21]} size={[.11, .11, .1]} color={appearance.hair}/>}</> : <Orb at={[.09, .21, -.025]} size={[.12, .08, .12]} color={appearance.hair}/>}
          {agent.id === 'editor' && <><Block at={[0, .045, -.183]} size={[.33, .035, .018]} color="#3b475c" rounded/>{[-.075, .075].map(x => <Block key={x} at={[x, .015, -.186]} size={[.12, .075, .018]} color="#53647b" rounded/>)}</>}
          {agent.id === 'visual' && <><Block at={[0, .19, .015]} size={[.37, .045, .12]} color="#343a50" rounded/>{[-.208, .208].map(x => <Orb key={x} at={[x, -.015, .015]} size={[.06, .09, .07]} color="#333c50"/>)}</>}
          {receptionist && <>
            <Orb at={[0, -.14, .235]} size={[.09, .25, .08]} color={appearance.hair}/>
            <Block at={[0, .24, .015]} size={[.38, .035, .07]} color="#414657" rounded/>
            {[-.22, .22].map(x => <Orb key={x} at={[x, -.005, .015]} size={[.045, .075, .065]} color="#414657"/>)}
            <Block at={[-.205, -.075, -.13]} size={[.025, .025, .23]} color="#414657" rounded/>
            <Orb at={[-.16, -.075, -.235]} size={[.055, .025, .025]} color="#323747"/>
          </>}
        </group>
        <Arm side={-1} color={appearance.shirt} skin={appearance.skin} shoulderRef={shoulderA} elbowRef={elbowA} formal={tailored}/>
        <Arm side={1} color={appearance.shirt} skin={appearance.skin} shoulderRef={shoulderB} elbowRef={elbowB} formal={tailored}/>
        <Leg side={-1} trousers={appearance.trousers} shoes={appearance.shoes} thighRef={thighA} kneeRef={kneeA} formal={tailored}/>
        <Leg side={1} trousers={appearance.trousers} shoes={appearance.shoes} thighRef={thighB} kneeRef={kneeB} formal={tailored}/>
      </group>
    </group>
    <group ref={label} position={[target.position[0], 2.9, target.position[2]]}>
      <Html center zIndexRange={[8, 1]}><button className={`character-label ${selected ? 'selected' : ''}`} data-state={status} onClick={e => { e.stopPropagation(); selectAgent(agent.id); }} aria-label={`Selecionar ${agent.name}, ${status}`} title={`${agent.role} · ${status} · simulação`}><strong>{agent.name}</strong><small className="label-role">{agent.role.replace('Diretora Geral / CEO', 'Direção · CEO').replace('Gestor de Produção', 'Produção').replace('Editor de Vídeo', 'Editor')}</small><span className="label-indicators" aria-hidden="true"><List size={12}/><RoleIcon size={12}/><StateIcon size={12}/></span><span className="label-progress" aria-hidden="true"><span style={{ width: `${progress}%` }}/></span></button></Html>
    </group>
  </>;
}
