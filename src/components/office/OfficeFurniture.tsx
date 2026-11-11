import { Block, GroundShade, Orb, Tube, glassMaterial, type Vec3 } from './primitives';
import type { Agent } from '../../types';

export function Plant({ at, tall = false }: { at: Vec3; tall?: boolean }) {
  return <group position={at}>
    <GroundShade width={.45} depth={.36}/>
    <Tube at={[0, .27, 0]} size={[.28, .54, .28]} color="#d4bfaa"/>
    <Tube at={[0, .55, 0]} size={[.24, .03, .24]} color="#66513c"/>
    <Tube at={[0, tall ? .98 : .7, 0]} size={[.025, tall ? 1 : .5, .025]} color="#6a7b44"/>
    {Array.from({ length: tall ? 9 : 6 }, (_, i) => {
      const angle = i * 2.4;
      const h = .68 + i * (tall ? .1 : .045);
      return <Orb key={i} at={[Math.sin(angle) * .22, h, Math.cos(angle) * .22]} rotation={[.5 * Math.sin(angle), angle, -.45]} size={[.18, tall ? .4 : .26, .07]} color={i % 2 ? '#6f9b67' : '#3f7558'}/>;
    })}
  </group>;
}
export function Chair({ at = [0, 0, 0], rotation = 0, color = '#176f9d' }: { at?: Vec3; rotation?: number; color?: string }) {
  return <group position={at} rotation={[0, rotation, 0]}>
    <GroundShade width={.49} depth={.46}/>
    <Tube at={[0, .37, .03]} size={[.055, .5, .055]} color="#7c8790" metal={.6}/>
    {[0, 1, 2, 3, 4].map(i => <group key={i} rotation={[0, i * Math.PI * .4, 0]}><Block at={[0, .13, .21]} size={[.07, .06, .49]} color="#4b535e" rounded/><Orb at={[0, .08, .43]} size={[.075, .075, .06]} color="#242b35"/></group>)}
    <Block at={[0, .72, .01]} size={[.76, .16, .7]} color={color} rounded cast/>
    <Block at={[0, 1.08, .31]} size={[.67, .73, .13]} color={color} rotation={[-.09, 0, 0]} rounded/>
    <Block at={[0, 1.43, .34]} size={[.43, .18, .12]} color={color} rounded/>
    <Block at={[0, 1.12, .385]} size={[.43, .43, .025]} color="#285f7a" rounded/>
    {[-.43, .43].map(x => <group key={x}><Block at={[x, .86, .13]} size={[.045, .35, .045]} color="#414956"/><Block at={[x, 1.03, .03]} size={[.11, .07, .47]} color="#303b49" rounded/></group>)}
  </group>;
}
export function Monitor({ at }: { at: Vec3 }) {
  return <group position={at}>
    <Block at={[0, -.27, 0]} size={[.065, .42, .065]} color="#5f6a75" metal={.5}/>
    <Block at={[0, -.46, .05]} size={[.43, .04, .28]} color="#3d4651" rounded/>
    <Block size={[1.13, .72, .08]} color="#252e3c" rounded cast/>
    <Block at={[0, .015, .047]} size={[1.02, .6, .008]} color="#17263c"/>
    <Orb at={[0, -.31, .052]} size={[.018, .009, .005]} color="#a7d9ef"/>
  </group>;
}
export function Workstation({ agent, at, rotation }: { agent: Agent; at: Vec3; rotation: number }) {
  const editing = agent.sector === 'Edição';
  return <group position={at} rotation={[0, rotation, 0]}>
    <GroundShade z={-.65} width={1.48} depth={1.13}/>
    <Chair color={agent.id === 'ceo' ? '#225e89' : editing ? '#1177ad' : '#277d9f'}/>
    <Block at={[0, 1.12, -.84]} size={[2.58, .11, 1.35]} color="#d9dedc" cast/>
    <Block at={[0, 1.18, -.84]} size={[2.54, .018, 1.32]} color="#eeeee7"/>
    {[-1.07, 1.07].map(x => <group key={x}><Block at={[x, .56, -.87]} size={[.07, 1.05, .07]} color="#c5ced1" metal={.4}/><Block at={[x, .07, -.87]} size={[.13, .08, 1.05]} color="#b8c4c9" rounded/></group>)}
    <Block at={[0, .8, -1.36]} size={[2.08, .06, .06]} color="#556371"/>
    <Block at={[-.12, 1.2, -.62]} size={[1.56, .018, .6]} color="#373e47" rounded/>
    <Monitor at={[editing ? -.3 : 0, 1.67, -1.12]}/>
    {editing && <group position={[.78, 1.65, -1.08]} rotation={[0, -.18, 0]} scale={[.55, .9, 1]}><Monitor at={[0, 0, 0]}/></group>}
    <Block at={[-.12, 1.23, -.52]} size={[.76, .045, .27]} color="#424b56" rounded/>
    {[0, 1, 2].map(i => <Block key={i} at={[-.12, 1.255, -.6 + i * .075]} size={[.65, .005, .018]} color="#84919d"/>)}
    <Orb at={[.55, 1.24, -.5]} size={[.085, .042, .12]} color="#d7dddd"/>
    <Tube at={[-.98, 1.32, -.64]} size={[.09, .24, .09]} color={agent.id === 'ceo' ? '#e7dcc8' : '#78999b'}/>
    <Tube at={[-.98, 1.445, -.64]} size={[.074, .008, .074]} color="#65503d"/>
    <Block at={[.93, 1.24, -.4]} size={[.29, .07, .36]} color="#d4ad83" rounded/>
    <Block at={[.93, 1.285, -.4]} size={[.25, .015, .33]} color="#eee6d4"/>
    <Block at={[.93, 1.303, -.4]} size={[.02, .02, .28]} rotation={[0, .4, 0]} color="#495765"/>
    <Block at={[-.88, .57, -1.01]} size={[.46, 1, .67]} color="#cbd2d1" rounded/>
    {[.37, .69, .98].map(y => <Block key={y} at={[-.88, y, -.665]} size={[.19, .025, .024]} color="#526874"/>)}
    <Block at={[1.03, .33, -.56]} size={[.28, .53, .5]} color="#333e50" rounded/>
    <Block at={[1.03, .36, -.3]} size={[.18, .025, .01]} color={agent.color}/>
    <Block at={[-.84, 1.23, -.35]} size={[.34, .025, .23]} rotation={[0, -.14, 0]} color="#f2ecdc"/>
    <Block at={[-.8, 1.252, -.33]} size={[.22, .008, .013]} rotation={[0, -.14, 0]} color="#7c8f9a"/>
    <Block at={[.92, 1.31, -.99]} size={[.26, .25, .2]} color="#354654"/>
    <Tube at={[.9, 1.54, -.99]} size={[.012, .27, .012]} rotation={[0, 0, .1]} color="#cfa254"/>
    <Tube at={[.97, 1.51, -.97]} size={[.012, .23, .012]} rotation={[0, 0, -.1]} color="#ac614c"/>
    {editing && <><Block at={[-1.06, 1.4, -1.18]} size={[.16, .4, .2]} color="#303b46" rounded/><Orb at={[-1.06, 1.42, -1.07]} size={[.052, .1, .018]} color="#738394"/></>}
  </group>;
}
export function GlassPartition({ at, length, rotation = 0, height = 2.65 }: { at: Vec3; length: number; rotation?: number; height?: number }) {
  return <group position={at} rotation={[0, rotation, 0]}>
    <Block at={[0, .08, 0]} size={[length, .16, .13]} color="#53616b"/>
    <mesh position={[0, height / 2, 0]} material={glassMaterial} receiveShadow={false} dispose={null}><boxGeometry args={[length, height - .18, .035]}/></mesh>
    <Block at={[0, height, 0]} size={[length, .075, .09]} color="#394b58" metal={.5}/>
    {Array.from({ length: Math.ceil(length / 2) + 1 }, (_, i) => -length / 2 + length * i / Math.ceil(length / 2)).map(x => <Block key={x} at={[x, height / 2, 0]} size={[.065, height, .09]} color="#435661" metal={.5}/>)}
    <Block at={[0, 1.05, .025]} size={[length, .04, .006]} color="#94a8ae"/>
  </group>;
}
export function GlassDoor({ at, rotation = 0, opening = Math.PI / 3 }: { at: Vec3; rotation?: number; opening?: number }) {
  return <group position={at} rotation={[0, rotation, 0]}>
    <Block at={[.6, 2.68, 0]} size={[1.3, .12, .14]} color="#b1bdc0"/>
    {[0, 1.2].map(x => <Block key={x} at={[x, 1.34, 0]} size={[.09, 2.68, .14]} color="#a4b2b8"/>)}
    <Block at={[.6, .04, 0]} size={[1.25, .035, .2]} color="#9faeb2"/>
    <group rotation={[0, -opening, 0]}>
      <mesh position={[.55, 1.32, 0]} material={glassMaterial} dispose={null}><boxGeometry args={[1.1, 2.57, .035]}/></mesh>
      {[0, 1.1].map(x => <Block key={x} at={[x, 1.32, 0]} size={[.045, 2.62, .06]} color="#74838a"/>)}
      <Block at={[.55, 2.63, 0]} size={[1.14, .04, .06]} color="#74838a"/>
      <Block at={[.55, .035, 0]} size={[1.14, .04, .06]} color="#74838a"/>
      <Block at={[.98, 1.18, .055]} size={[.04, .35, .04]} color="#d1d5ce" metal={.6}/>
      <Block at={[.55, 1.02, .023]} size={[.96, .06, .01]} color="#c1ced0"/>
    </group>
  </group>;
}
export function Bookshelf({ at, rotation = 0 }: { at: Vec3; rotation?: number }) {
  const colors = ['#7189a6', '#c9987c', '#8e9f8c', '#b9a0ba', '#d5ba81', '#dbd6c6'];
  return <group position={at} rotation={[0, rotation, 0]}>
    <Block at={[0, 1.04, -.17]} size={[1.8, 2.08, .13]} color="#46596b"/>
    {[-.85, .85].map(x => <Block key={x} at={[x, 1.04, .03]} size={[.08, 2.1, .46]} color="#bba185" cast/>)}
    {[.12, .76, 1.4, 2.04].map(y => <Block key={y} at={[0, y, .03]} size={[1.8, .09, .5]} color="#c7af91"/>)}
    {[0, 1, 2].map(row => [0, 1, 2, 3, 4].map(i => <Block key={`${row}-${i}`} at={[-.63 + i * .19, .39 + row * .64, .06]} size={[.13, .43 - (i % 2) * .09, .3]} rotation={[0, 0, i === 3 ? -.14 : 0]} color={colors[(i + row) % colors.length]} rounded/>))}
  </group>;
}
export function FloorLamp({ at }: { at: Vec3 }) {
  return <group position={at}><Tube at={[0, .04, 0]} size={[.3, .08, .3]} color="#546678"/><Tube at={[0, 1.2, 0]} size={[.025, 2.3, .025]} color="#667a89" metal={.5}/><mesh position={[0, 2.28, 0]}><coneGeometry args={[.44, .44, 12, 1, true]}/><meshStandardMaterial color="#f4ddae" side={2}/></mesh><Orb at={[0, 2.15, 0]} size={[.14, .08, .14]} color="#fff1c9"/></group>;
}
export function Lounge({ at }: { at: Vec3 }) {
  return <group position={at}>
    <GroundShade width={1.9} depth={1.1}/>
    <Block at={[0, .31, 0]} size={[2.9, .4, .9]} color="#537d82" rounded cast/>
    <Block at={[0, .81, .35]} size={[2.9, .93, .22]} color="#426a72" rounded/>
    {[-1.37, 1.37].map(x => <Block key={x} at={[x, .65, 0]} size={[.22, .6, .98]} color="#4d737b" rounded/>)}
    {[-.69, .69].map(x => <Block key={x} at={[x, .57, -.03]} size={[1.2, .17, .75]} color="#729997" rounded/>)}
    <Block at={[-.84, .91, .17]} size={[.52, .47, .17]} color="#dfb283" rotation={[0, 0, -.15]} rounded/>
    <Block at={[.72, .91, .17]} size={[.52, .47, .17]} color="#c6a4ab" rotation={[0, 0, .13]} rounded/>
    <Tube at={[0, .45, -1.36]} size={[.67, .1, .55]} color="#cfb799"/>
    <Tube at={[0, .23, -1.36]} size={[.07, .44, .07]} color="#536270"/>
    <Block at={[.1, .52, -1.38]} size={[.4, .04, .3]} color="#b4b9ca" rounded/>
  </group>;
}
