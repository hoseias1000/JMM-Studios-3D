import { Block, Orb, Tube, type Vec3 } from './primitives';
import { Bookshelf, Chair, FloorLamp, GlassPartition, Lounge, Plant } from './OfficeFurniture';
import { LowBookcase, WallBoard, WaterCooler } from './OfficeDetails';
import { amenityRooms, meetingSeats, stations } from './layout';

/** A physically separate front wing, connected to the original sectors by a clear hall. */
export function AmenityArchitecture() {
  return <>
    {amenityRooms.map(room => <group key={room.id}>
      <Block at={[room.x, .03, room.z]} size={[room.width, .055, room.depth]} color={room.floor}/>
      {Array.from({ length: 10 }, (_, i) => <Block key={i} at={[room.x, .062, room.z - 3.2 + i * .7]} size={[room.width - .1, .004, .012]} color={room.id === 'meeting' ? '#46515d' : '#817b6c'}/>)}
    </group>)}
    <Block at={[0, .075, 7.15]} size={[18.05, .04, 2.3]} color="#4e5e69"/>
    {[-.68, .68].map(x => <Block key={x} at={[x, .102, 5.0]} size={[.025, .009, 21.3]} color="#98a9ae"/>)}
    {[-3.3, 3.3].map(x => <Block key={x} at={[x, .1, 7.15]} size={[4.4, .01, .025]} color="#98a9ae"/>)}
    {[5.4, 9.15, 14.7].map(z => <group key={z} position={[0, .1, z]}>{[-1, 1].map(side => <Block key={side} at={[side * .11, 0, 0]} size={[.035, .01, .31]} rotation={[0, side * Math.PI / 4, 0]} color="#bdc8c7"/>)}</group>)}
    <GlassPartition at={[-2.95, 0, 8.725]} length={1.15} rotation={Math.PI / 2} height={2.45}/>
    <GlassPartition at={[-2.95, 0, 12.9375]} length={4.875} rotation={Math.PI / 2} height={2.45}/>
    <GlassPartition at={[2.95, 0, 9.475]} length={2.65} rotation={Math.PI / 2} height={2.45}/>
    <GlassPartition at={[2.95, 0, 13.7375]} length={3.275} rotation={Math.PI / 2} height={2.45}/>
    <GlassPartition at={[-6.825, 0, 8.15]} length={4.15} height={2.45}/>
    <GlassPartition at={[-3.275, 0, 8.15]} length={.55} height={2.45}/>
    <GlassPartition at={[4.175, 0, 8.15]} length={2.35} height={2.45}/>
    <GlassPartition at={[7.75, 0, 8.15]} length={2.3} height={2.45}/>
    <Block at={[-9.08, 1.25, 11.25]} size={[.16, 2.54, 9.4]} color="#9a9386" cast/>
    <Block at={[-9.08, 2.54, 11.25]} size={[.22, .08, 9.4]} color="#c0b8a7"/>
    <Block at={[9.1, .12, 11.25]} size={[.1, .23, 9.4]} color="#68747c"/>
    {[-5.5, 5.5].map(x => <Block key={x} at={[x, .12, 15.95]} size={[7.1, .23, .1]} color="#68747c"/>)}
    <GlassPartition at={[-1.98, 0, 15.95]} length={1.65} height={2.55}/>
    <GlassPartition at={[1.98, 0, 15.95]} length={1.65} height={2.55}/>
    <Block at={[0, 2.9, 15.95]} size={[3, .35, .2]} color="#415461"/>
    <Block at={[0, .075, 15.35]} size={[2.5, .04, .85]} color="#334553"/>
    <Block at={[0, -.47, 17.55]} size={[3.5, .2, .6]} color="#9ca7a9"/>
    <Block at={[0, -.29, 17.0]} size={[3.5, .2, .6]} color="#acb7b7"/>
    <Block at={[0, -.1, 16.45]} size={[3.5, .2, .6]} color="#bcc4bf"/>
  </>;
}
function MeetingRoom() {
  return <>
    <Block at={[-5.95, 1.04, 11.65]} size={[2.22, .14, 4.55]} color="#dddcd3" rounded cast/>
    {[10.25, 13.05].map(z => <Block key={z} at={[-5.95, .53, z]} size={[1.1, 1.01, .22]} color="#677e8a" rounded/>)}
    {meetingSeats.map((seat, i) => <Chair key={i} at={seat.position} rotation={seat.rotation} color="#28688d"/>)}
    {[10.05, 11.65, 13.25].map(z => <group key={z}>
      <Block at={[-6.55, 1.13, z]} size={[.32, .025, .45]} color="#e5e0d0"/>
      <Block at={[-5.32, 1.13, z]} size={[.32, .025, .45]} color="#e5e0d0"/>
      <Tube at={[-6.65, 1.22, z + .32]} size={[.065, .19, .065]} color="#8fa8ae"/>
      <Tube at={[-5.22, 1.22, z - .32]} size={[.065, .19, .065]} color="#c2ad8c"/>
    </group>)}
    <Block at={[-5.95, 1.15, 11.65]} size={[.55, .055, .95]} color="#536c82" rounded/>
    <Block at={[-5.95, 1.18, 11.65]} size={[.42, .015, .76]} color="#9bbac7"/>
    <Tube at={[-5.95, 1.2, 10.3]} size={[.16, .2, .16]} color="#4b606c"/>
    <WallBoard at={[-7.8, 1.5, 8.23]}/>
    <Plant at={[-8.25, 0, 14.75]} tall/><Plant at={[-3.65, 0, 14.75]}/>
  </>;
}
function Armchair({ at, rotation = 0 }: { at: Vec3; rotation?: number }) {
  return <group position={at} rotation={[0, rotation, 0]}>
    <Block at={[0, .44, 0]} size={[1.05, .4, .95]} color="#607e88" rounded cast/>
    <Block at={[0, .64, -.02]} size={[.84, .13, .75]} color="#8da5a8" rounded/>
    <Block at={[0, .99, .37]} size={[1.03, .87, .2]} color="#5a7783" rounded/>
    {[-.48, .48].map(x => <Block key={x} at={[x, .76, 0]} size={[.18, .4, .95]} color="#6c8791" rounded/>)}
    <Tube at={[0, .16, 0]} size={[.28, .25, .28]} color="#465967"/>
  </group>;
}
function BreakRoom({ simplified }: { simplified: boolean }) {
  return <>
    <Lounge at={[6, 0, 14.35]}/>
    <group position={[8, 0, 11]} rotation={[0, Math.PI / 2, 0]}><Lounge at={[0, 0, 0]}/></group>
    <Armchair at={[4.1, 0, 9.6]} rotation={-Math.PI / 2}/><Armchair at={[4.6, 0, 11.4]} rotation={-Math.PI / 2}/>
    <Block at={[7.55, .5, 8.75]} size={[1.4, 1, .65]} color="#c2b393" rounded cast/>
    <Block at={[7.55, 1.04, 8.75]} size={[1.55, .08, .73]} color="#dfd4bd"/>
    <Block at={[7.25, 1.34, 8.76]} size={[.58, .56, .42]} color="#465c6b" rounded/>
    <Block at={[7.25, 1.4, 8.99]} size={[.3, .24, .02]} color="#91aab5"/>
    {[7.75, 8.05].map(x => <Tube key={x} at={[x, 1.17, 8.8]} size={[.08, .2, .08]} color="#d4b58d"/>)}
    <WaterCooler at={[4, 0, 8.75]}/>
    <FloorLamp at={[8.15, 0, 14.8]}/><Plant at={[3.75, 0, 14.8]} tall/>
    {!simplified && <LowBookcase at={[3.5, 0, 13.2]} rotation={Math.PI / 2}/>}
  </>;
}
function Reception() {
  return <>
    <Block at={[-1.5, .65, 11.65]} size={[2.05, 1.25, 1.15]} color="#bac3bf" rounded cast/>
    <Block at={[-1.5, .7, 12.24]} size={[1.78, .65, .035]} color="#425c6b"/>
    <Block at={[-1.5, 1.31, 11.65]} size={[2.2, .1, 1.24]} color="#e0d7c3" rounded/>
    <Block at={[-1.5, 1.62, 11.52]} size={[.7, .42, .055]} color="#3d5365" rounded/>
    <Block at={[-1.5, 1.62, 11.487]} size={[.61, .33, .008]} color="#9cbac7"/>
    {[-.09, 0, .09].map(y => <Block key={y} at={[-1.5, 1.62 + y, 11.48]} size={[.46, .025, .006]} color="#57778d"/>)}
    <Block at={[-1.5, 1.42, 11.52]} size={[.04, .23, .05]} color="#6c818a"/>
    {/* Lower inner worktop aligns the receptionist's hands with the keyboard. */}
    <Block at={[-1.5, 1.12, 10.98]} size={[1.7, .1, .55]} color="#d4cbb9" rounded/>
    <Block at={[-1.5, 1.2, 10.99]} size={[.55, .025, .19]} color="#616d76" rounded/>
    <Orb at={[-1, 1.2, 11]} size={[.07, .025, .1]} color="#536575"/>
    <Block at={[-2.15, 1.2, 11.02]} size={[.19, .05, .29]} color="#536575" rounded/>
    <Block at={[-2.15, 1.24, 11.02]} size={[.1, .035, .25]} color="#353f4d" rounded/>
    <Block at={[-2.05, 1.4, 11.86]} size={[.28, .09, .25]} color="#c0ab83"/>
    <Chair at={stations.receptionist.position} rotation={stations.receptionist.rotation} color="#355d76"/>
    <Armchair at={[1.8, 0, 13.5]} rotation={Math.PI / 2}/>
    <Armchair at={[1.8, 0, 11.9]} rotation={Math.PI / 2}/>
    <Tube at={[1.8, .45, 12.7]} size={[.36, .09, .36]} color="#d4b998"/>
    <Tube at={[1.8, .23, 12.7]} size={[.05, .43, .05]} color="#5a707b"/>
    <Block at={[1.8, .51, 12.7]} size={[.33, .035, .25]} color="#a9b9c8"/>
    <Plant at={[-2.25, 0, 14.65]} tall/><Plant at={[2.2, 0, 9.05]} tall/>
    <Bookshelf at={[-2.5, 0, 13.25]} rotation={Math.PI / 2}/>
    <Orb at={[-1.5, .7, 12.27]} size={[.15, .15, .015]} color="#d6e0dc"/>
  </>;
}
export function AmenityFurniture({ simplified }: { simplified: boolean }) {
  return <><MeetingRoom/><BreakRoom simplified={simplified}/><Reception/></>;
}
