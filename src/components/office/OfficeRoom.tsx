import { memo } from 'react';
import { Html } from '@react-three/drei';
import { agents } from '../../data/demo';
import { Block, Orb, Tube, StaticBatch } from './primitives';
import { Bookshelf, FloorLamp, GlassDoor, GlassPartition, Plant, Workstation } from './OfficeFurniture';
import { Extinguisher, LowBookcase, Printer, WallBoard, WaterCooler } from './OfficeDetails';
import { amenityRooms, roomDoors, sectors, stations } from './layout';
import { AmenityArchitecture, AmenityFurniture } from './AmenityWing';
import BrandPlaque from './BrandPlaque';
import AgentWorkScreens from './AgentWorkScreens';
import { ExecutiveArchitecture, ExecutiveFurniture, ExecutiveSigns } from './ExecutiveSuite';

function Architecture() {
  return <>
    <Block at={[0, -.3, 4.65]} size={[18.5, .58, 22.9]} color="#313d48" cast/>
    <Block at={[0, -.055, 4.65]} size={[18.24, .14, 22.7]} color="#555a60"/>
    {sectors.map(s => <group key={s.name}>
      <Block at={[s.x, .03, s.z]} size={[7.5, .055, 5]} color={s.floor}/>
      {Array.from({ length: 7 }, (_, i) => <Block key={i} at={[s.x, .061, s.z - 2.2 + i * .72]} size={[7.4, .004, .012]} color="#3c424a"/>)}
    </group>)}
    <Block at={[0, .07, 4.5]} size={[1.7, .035, 21.6]} color="#4e5e69"/>
    <Block at={[0, .073, 0]} size={[17.95, .035, 1.8]} color="#4e5e69"/>
    <Block at={[0, 1.49, -6.5]} size={[18.2, 3, .18]} color="#9c9384" cast/>
    <Block at={[-9.08, 1.25, 0]} size={[.16, 2.54, 13.1]} color="#9a9386" cast/>
    <Block at={[0, 3.03, -6.5]} size={[18.3, .09, .24]} color="#c7bda9"/>
    <Block at={[-9.08, 2.54, 0]} size={[.22, .08, 13.1]} color="#c0b8a7"/>
    <Block at={[0, .15, -6.37]} size={[18.1, .28, .06]} color="#57616a"/>
    <Block at={[-8.97, .15, 0]} size={[.06, .28, 12.9]} color="#57616a"/>
    {[-3.575, 3.575].map(z => <Block key={z} at={[9.1, .12, z]} size={[.1, .23, 5.95]} color="#68747c"/>)}
    {[-5.4, 4.7].map(x => <group key={x} position={[x, 1.6, -6.37]}>
      <Block size={[4.65, 1.45, .07]} color="#3e4f5a"/>
      <Block at={[0, 0, .045]} size={[4.48, 1.28, .035]} color="#7b969f"/>
      <Block at={[0, -.45, .07]} size={[4.48, .34, .015]} color="#526c7c"/>
      {[-1.48, 0, 1.48].map(dx => <Block key={dx} at={[dx, 0, .08]} size={[.055, 1.35, .04]} color="#465b66"/>)}
      <Block at={[0, -.73, .13]} size={[4.85, .09, .32]} color="#b1ab98"/>
    </group>)}
    {[-.9, .9].map(x => <group key={x}>
      <GlassPartition at={[x, 0, -3.725]} length={5.25} rotation={Math.PI / 2}/>
      <GlassPartition at={[x, 0, 2.9]} length={3.6} rotation={Math.PI / 2}/>
    </group>)}
    {[-.9, .9].map(z => <group key={z}>
      <GlassPartition at={[-4.85, 0, z]} length={7.85} height={2.35}/>
      <GlassPartition at={[4.85, 0, z]} length={7.85} height={2.35}/>
    </group>)}
    {roomDoors.map(door => <group key={door.id} userData={{ doorId: door.id, room: door.room }}><GlassDoor at={door.position} rotation={door.rotation} opening={door.opening ?? (door.id.endsWith('-spine') ? .42 : Math.PI / 3)}/></group>)}
    <AmenityArchitecture/>
    <ExecutiveArchitecture/>
    {[-5.1, 4.6].map(x => <group key={x} position={[x, 3.05, -3.25]}>
      <Block size={[3.6, .08, .32]} color="#495d6a" rounded/>
      <Block at={[0, -.045, 0]} size={[3.4, .025, .24]} color="#fff1c8"/>
      {[-1.4, 1.4].map(dx => <Tube key={dx} at={[dx, .25, 0]} size={[.012, .45, .012]} color="#657782"/>)}
    </group>)}
  </>;
}
function Decorations({ simplified }: { simplified: boolean }) {
  return <>
    <Bookshelf at={[-8.7, 0, -3.95]} rotation={Math.PI / 2}/>
    <Bookshelf at={[-8.7, 0, 2.6]} rotation={Math.PI / 2}/>
    <Bookshelf at={[7.3, 0, -6.02]}/>
    <Plant at={[-8.1, 0, -5.6]} tall/><Plant at={[8.1, 0, -5.6]} tall/>
    <Plant at={[-8.1, 0, 5.45]} tall/><Plant at={[8.1, 0, 5.45]} tall/>
    <Plant at={[1.45, 0, -5.8]}/><Plant at={[2.5, 0, 5.7]}/>
    <FloorLamp at={[-7.8, 0, -1.25]}/><FloorLamp at={[7.6, 0, 2.8]}/>
    <Block at={[-5, .53, 5.4]} size={[4.4, 1.03, .6]} color="#c7b79e" rounded cast/>
    {[-6.45, -5, -3.55].map(x => <Block key={x} at={[x, .52, 5.72]} size={[1.35, .89, .025]} color="#baaa93" rounded/>)}
    <Block at={[-5, 1.08, 5.4]} size={[4.56, .09, .7]} color="#e0d5c1" rounded/>
    <Block at={[-6.4, 1.42, 5.38]} size={[.6, .62, .4]} color="#465b6a" rounded/>
    <Block at={[-6.4, 1.45, 5.6]} size={[.31, .28, .015]} color="#9db6bc" rounded/>
    <Tube at={[-5.6, 1.22, 5.4]} size={[.09, .21, .09]} color="#d9c4a1"/>
    <Tube at={[-5.25, 1.22, 5.4]} size={[.09, .21, .09]} color="#8ca6a2"/>
    <Block at={[-3.6, 1.2, 5.4]} size={[.5, .16, .4]} color="#a39cba" rounded/>
    <Block at={[-3.6, 1.31, 5.4]} size={[.45, .06, .36]} color="#d6be98" rounded/>
    <Block at={[8.7, .6, -2.1]} size={[.6, 1.2, 1.6]} color="#c4baaa" rounded/>
    <Plant at={[8.7, 1.2, -2.1]}/>
    <WaterCooler at={[8.1, 0, 1.1]}/>
    {/* This wall bay and height keep the board clear of the partition in the main views. */}
    <group position={[-2.3, 2.4, -6.27]} scale={.75}>
      <WallBoard at={[0, 0, 0]}/>
    </group>
    <Extinguisher at={[-1.2, 0, -.2]}/>
    {!simplified && <>
      <Printer at={[-4.3, 1.13, 5.4]}/>
      <LowBookcase at={[-7.25, 0, 4.3]} rotation={Math.PI / 2}/>
      <LowBookcase at={[6.65, 0, -5.25]}/>
      <group position={[-8.92, 1.35, 1.1]} rotation={[0, Math.PI / 2, 0]}>
        <Block size={[1.65, 1.02, .045]} color="#f1e4d1" rounded/>
        <Block at={[0, 0, .03]} size={[1.42, .78, .02]} color="#b0bdca"/>
        <Orb at={[-.3, .12, .05]} size={[.24, .24, .02]} color="#d7ac83"/>
        <Block at={[.2, -.2, .05]} size={[.7, .3, .02]} color="#687e94" rounded/>
      </group>
      <Block at={[7.15, 1.7, -6.24]} size={[1.3, .55, .04]} color="#7d8fa0" rounded/>
      <Block at={[7.15, 1.7, -6.2]} size={[1.18, .43, .02]} color="#e1c5a1"/>
      {[0, 1, 2, 3].map(i => <Block key={i} at={[6.8 + i * .22, 1.67, -6.17]} size={[.1, .07 + i * .05, .02]} color="#627b86" rounded/>)}
    </>}
  </>;
}
const OfficeRoom = memo(function OfficeRoom({ simplified }: { simplified: boolean }) {
  return <>
    <StaticBatch><Architecture/>{agents.filter(agent => agent.id !== 'receptionist' && agent.id !== 'ceo').map(agent => <Workstation key={agent.id} agent={agent} at={stations[agent.id].position} rotation={stations[agent.id].rotation}/>)}<Decorations simplified={simplified}/><AmenityFurniture simplified={simplified}/><ExecutiveFurniture simplified={simplified}/></StaticBatch>
    <ExecutiveSigns/>
    <AgentWorkScreens/>
    {sectors.map(s => <Html key={s.name} position={[s.x + .2, .1, s.z + 2.1]} center zIndexRange={[1, 0]}><div className="sector-label" style={{ color: s.color }}><span>{s.number}</span>{s.name}</div></Html>)}
    <BrandPlaque at={[0, 1.9, -6.27]} width={1.05}/>
    <BrandPlaque at={[0, 3.25, 16.08]} width={1.25}/>
    <BrandPlaque at={[-1.5, .72, 12.3]} width={.75}/>
    {amenityRooms.map(room => <Html key={room.id} position={[room.x, .12, 15.25]} center zIndexRange={[1, 0]}><div className="sector-label" data-room={room.id} style={{ color: room.color }}><span>{room.number}</span>{room.name}</div></Html>)}
    <Html position={[0, .12, 7.15]} center zIndexRange={[1, 0]}><div className="sector-label corridor-sign">CORREDOR CENTRAL</div></Html>
    <Html position={[0, 2.35, 16.07]} center zIndexRange={[2, 0]}><div className="entrance-sign">ENTRADA</div></Html>
  </>;
});
export default OfficeRoom;
