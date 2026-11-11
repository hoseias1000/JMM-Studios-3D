import { Html } from '@react-three/drei';
import { Block, Orb, Tube } from './primitives';
import { Bookshelf, Chair, FloorLamp, GlassPartition, Monitor, Plant } from './OfficeFurniture';
import { executiveRoom, stations } from './layout';
import BrandPlaque from './BrandPlaque';

const gold = '#bda474';
const walnut = '#604533';

/** Static geometry joins the office's material batches. */
export function ExecutiveArchitecture() {
  const room = executiveRoom;
  return <>
    <Block at={[room.x, -.3, room.z]} size={[room.width, .58, room.depth]} color="#313d48" cast/>
    <Block at={[room.x, -.055, room.z]} size={[room.width, .14, room.depth]} color="#a1947a"/>
    <Block at={[room.x, .035, room.z]} size={[room.width - .16, .055, room.depth - .16]} color="#917252"/>
    {Array.from({ length: 20 }, (_, i) => <Block key={i} at={[room.x, .066, -6.15 + i * .63]} size={[room.width - .22, .006, .017]} color="#70553f"/>)}
    <Block at={[15.3, .075, -3.15]} size={[6.6, .035, 5.75]} color="#303b41" rounded/>
    <Block at={[15.3, .096, -3.15]} size={[6.32, .007, 5.47]} color="#414d50" rounded/>
    <Block at={[room.x, 1.49, -6.5]} size={[room.width, 3, .18]} color={walnut} cast/>
    <Block at={[room.x, 3.03, -6.5]} size={[room.width, .09, .24]} color={gold}/>
    {Array.from({ length: 15 }, (_, i) => <Block key={i} at={[14 + i * .24, 1.48, -6.38]} size={[.055, 2.83, .05]} color="#99764f"/>)}
    <Block at={[11.65, 1.65, -6.35]} size={[3.65, 1.85, .08]} color={gold}/>
    <Block at={[11.65, 1.65, -6.29]} size={[3.47, 1.67, .03]} color="#72969e"/>
    {[10.5, 11.65, 12.8].map(x => <Block key={x} at={[x, 1.65, -6.25]} size={[.045, 1.72, .025]} color="#c4b48f"/>)}
    <Block at={[11.65, .72, -6.16]} size={[3.9, .1, .38]} color="#d5c6a7"/>
    <GlassPartition at={[9.25, 0, -3.475]} length={5.75} rotation={Math.PI / 2} height={2.65}/>
    <GlassPartition at={[9.25, 0, 3.25]} length={5.3} rotation={Math.PI / 2} height={2.65}/>
    <Block at={[19.6, .14, room.z]} size={[.12, .27, room.depth]} color={gold}/>
    <Block at={[room.x, .14, 6.1]} size={[room.width, .27, .12]} color={gold}/>
    <Block at={[10, .075, 0]} size={[2.15, .04, 1.75]} color="#c1b59d"/>
    <Block at={[10, .105, 0]} size={[1.75, .012, 1.4]} color="#7d7464"/>
  </>;
}

function ExecutiveDesk() {
  const station = stations.ceo;
  return <group position={station.position} rotation={[0, station.rotation, 0]}>
    <Chair color="#383b3e"/>
    <Block at={[0, 1.11, -.84]} size={[3.85, .19, 1.65]} color={walnut} rounded cast/>
    <Block at={[0, 1.22, -.84]} size={[3.91, .035, 1.7]} color="#c6bda7" rounded/>
    {[-1.58, 1.58].map(x => <group key={x}>
      <Block at={[x, .56, -.86]} size={[.48, 1.05, 1.26]} color={walnut} rounded/>
      <Block at={[x, .11, -.86]} size={[.5, .13, 1.3]} color={gold}/>
      {[.35, .64, .92].map(y => <Block key={y} at={[x, y, -.21]} size={[.21, .025, .025]} color={gold}/>)}
    </group>)}
    <Block at={[0, .72, -1.48]} size={[2.8, .64, .08]} color={walnut}/>
    <Block at={[0, 1.25, -.66]} size={[1.72, .015, .85]} color="#273b40" rounded/>
    <Monitor at={[0, 1.67, -1.12]}/>
    <Block at={[-.12, 1.28, -.5]} size={[.76, .035, .27]} color="#343d43" rounded/>
    <Orb at={[.55, 1.29, -.5]} size={[.085, .04, .12]} color="#b9bcb8"/>
    <Block at={[-1.3, 1.28, -.7]} size={[.34, .07, .48]} color="#313e45" rounded/>
    <Block at={[-1.3, 1.34, -.7]} size={[.18, .055, .4]} color="#1d2930" rounded/>
    <Block at={[1.24, 1.28, -.55]} size={[.47, .07, .59]} color="#b5935e" rounded/>
    <Block at={[1.24, 1.32, -.55]} size={[.4, .018, .53]} color="#eee5d0"/>
    <Tube at={[1.55, 1.4, -1.2]} size={[.07, .3, .07]} color={gold}/>
    <Tube at={[-.85, 1.37, -.49]} size={[.08, .24, .08]} color="#e2d9c5"/>
  </group>;
}

function ExecutiveSofa() {
  return <group position={[16.8, 0, 4.3]}>
    <Block at={[0, .38, 0]} size={[3.8, .5, 1.1]} color="#c3b396" rounded cast/>
    <Block at={[0, .9, .44]} size={[3.8, .95, .24]} color="#b6a384" rounded/>
    {[-1.8, 1.8].map(x => <Block key={x} at={[x, .78, 0]} size={[.25, .64, 1.15]} color="#b6a384" rounded/>)}
    {[-1.12, 0, 1.12].map(x => <Block key={x} at={[x, .68, -.05]} size={[1.05, .16, .84]} color="#dfd2b7" rounded/>)}
    {[-1.25, 1.25].map(x => <Block key={x} at={[x, 1, .22]} size={[.58, .53, .18]} rotation={[0, 0, x * .1]} color={x < 0 ? '#507477' : '#9c794e'} rounded/>)}
    <Block at={[0, .52, -1.7]} size={[2.4, .1, 1.1]} color="#e0d6bd" rounded/>
    {[-.85, .85].map(x => <Block key={x} at={[x, .26, -1.7]} size={[.055, .47, .7]} color={gold}/>)}
    <Block at={[-.4, .6, -1.7]} size={[.58, .06, .44]} color="#354d57"/>
    <Block at={[-.36, .65, -1.7]} size={[.52, .035, .4]} color="#b99c70"/>
    <Tube at={[.7, .7, -1.7]} size={[.13, .25, .13]} color="#647b71"/>
  </group>;
}

export function ExecutiveFurniture({ simplified }: { simplified: boolean }) {
  return <>
    <ExecutiveDesk/>
    <Block at={[16.5, .57, -5.96]} size={[3.8, 1.1, .6]} color={walnut} rounded/>
    <Block at={[16.5, 1.15, -5.96]} size={[3.9, .08, .7]} color="#c5b395"/>
    {[15.6, 16.5, 17.4].map((x, i) => <group key={x}>
      <Block at={[x, 1.23, -5.95]} size={[.3, .08, .25]} color="#263842"/>
      <Tube at={[x, 1.43, -5.95]} size={[.045, .35, .045]} color={gold}/>
      <Orb at={[x, 1.67 + i * .045, -5.95]} size={[.16, .18, .12]} color={i === 1 ? '#c8cdcb' : gold}/>
    </group>)}
    <Bookshelf at={[18.5, 0, -6.02]}/>
    <Block at={[11.7, .075, 3.4]} size={[3.8, .035, 4.3]} color="#536467" rounded/>
    <Tube at={[11.7, .62, 3.1]} size={[.22, 1.14, .22]} color={gold}/>
    <Tube at={[11.7, 1.22, 3.1]} size={[1.08, .12, 1.08]} color="#ddd1b8"/>
    <Chair at={[10.1, 0, 3.1]} rotation={-Math.PI / 2} color="#9c8d74"/>
    <Chair at={[13.3, 0, 3.1]} rotation={Math.PI / 2} color="#9c8d74"/>
    <Chair at={[11.7, 0, 4.7]} color="#9c8d74"/>
    <Block at={[11.7, 1.3, 3.1]} size={[.48, .035, .6]} color="#344b59" rounded/>
    <Block at={[16.8, .08, 3.3]} size={[5, .04, 4.8]} color="#455458" rounded/>
    <ExecutiveSofa/>
    <Plant at={[10, 0, -5.6]} tall/><Plant at={[19, 0, -5.55]} tall/>
    <Plant at={[19, 0, 5.35]} tall/>
    <FloorLamp at={[14.2, 0, 4.9]}/>
    {!simplified && <>
      <Block at={[15.3, 3.12, -2.8]} size={[4.4, .08, .5]} color={gold} rounded/>
      <Block at={[15.3, 3.07, -2.8]} size={[4.1, .025, .4]} color="#ffe6b4"/>
      {[-1.7, 1.7].map(dx => <Tube key={dx} at={[15.3 + dx, 3.39, -2.8]} size={[.012, .5, .012]} color={gold}/>)}
    </>}
  </>;
}

export function ExecutiveSigns() {
  return <>
    <BrandPlaque at={[16.1, 2.15, -6.27]} width={1.8}/>
    <Html position={[14.5, .15, 5.65]} center zIndexRange={[1, 0]}>
      <div className="sector-label" data-room="ceo" style={{ color: '#e5cf9e' }}>{executiveRoom.name}</div>
    </Html>
  </>;
}
