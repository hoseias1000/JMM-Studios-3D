import { Block, Orb, Tube, type Vec3 } from './primitives';

export function LowBookcase({ at, rotation = 0 }: { at: Vec3; rotation?: number }) {
  return <group position={at} rotation={[0, rotation, 0]}>
    <Block at={[0, .56, 0]} size={[2, 1.1, .12]} color="#555f67"/>
    {[-.94, .94].map(x => <Block key={x} at={[x, .56, .2]} size={[.1, 1.1, .5]} color="#a08c65"/>)}
    {[.08, .56, 1.08].map(y => <Block key={y} at={[0, y, .2]} size={[2, .08, .55]} color="#b9a173"/>)}
    {[0, 1].map(row => [0, 1, 2, 3, 4, 5, 6, 7].map(i => <group key={`${row}-${i}`} position={[-.78 + i * .215, .31 + row * .5, .2]}>
      <Block size={[.13, .34 - i % 3 * .03, .3]} color={['#c3af69', '#558e9a', '#b16a51', '#9b9e87'][i % 4]}/>
      <Block at={[0, .07, .155]} size={[.08, .025, .007]} color="#e7dcca"/>
    </group>))}
    <Block at={[-.45, 1.16, .16]} size={[.58, .06, .36]} color="#e2e1cd"/>
    <Block at={[-.43, 1.21, .16]} size={[.52, .04, .33]} color="#677f99"/>
  </group>;
}
export function WaterCooler({ at }: { at: Vec3 }) {
  return <group position={at}>
    <Block at={[0, .59, 0]} size={[.62, 1.14, .56]} color="#c4cecc" rounded cast/>
    <Block at={[0, .72, .29]} size={[.42, .44, .025]} color="#536575" rounded/>
    <Block at={[0, .49, .33]} size={[.4, .04, .18]} color="#6b7f8b"/>
    {[-.1, .1].map(x => <Block key={x} at={[x, .83, .33]} size={[.06, .09, .06]} color={x < 0 ? '#568caa' : '#b66b65'}/>)}
    <Tube at={[0, 1.46, 0]} size={[.24, .58, .24]} color="#739cb5"/>
    <Orb at={[0, 1.75, 0]} size={[.24, .1, .24]} color="#739cb5"/>
    <Tube at={[0, 1.16, 0]} size={[.15, .12, .15]} color="#66879a"/>
  </group>;
}
export function Printer({ at }: { at: Vec3 }) {
  return <group position={at}>
    <Block at={[0, .19, 0]} size={[.87, .38, .57]} color="#cbd1ce" rounded/>
    <Block at={[0, .4, -.03]} size={[.85, .075, .5]} color="#586775" rounded/>
    <Block at={[0, .45, -.03]} size={[.7, .025, .43]} color="#b5c5c8"/>
    <Block at={[0, .2, .29]} size={[.6, .1, .015]} color="#343e48"/>
    <Block at={[.07, .2, .4]} size={[.4, .014, .27]} color="#f0ede0"/>
    <Block at={[-.27, .34, .291]} size={[.13, .06, .008]} color="#528fab"/>
  </group>;
}
export function WallBoard({ at }: { at: Vec3 }) {
  return <group position={at}>
    <Block size={[1.8, 1.15, .055]} color="#5a6670"/>
    <Block at={[0, 0, .035]} size={[1.66, 1.01, .02]} color="#e1e0cf"/>
    {[-.47, 0, .47].map((x, i) => <group key={x}>
      <Block at={[x, .26, .054]} size={[.33, .12, .008]} color={['#879ead', '#b9a06c', '#839b8a'][i]}/>
      <Block at={[x, .01, .054]} size={[.26, .2, .008]} color="#d0c29a"/>
      <Block at={[x, -.25, .054]} size={[.26, .2, .008]} color="#b5c7c6"/>
    </group>)}
    <Block at={[0, -.59, .06]} size={[1.8, .04, .12]} color="#788891"/>
  </group>;
}
export function Extinguisher({ at }: { at: Vec3 }) {
  return <group position={at}>
    <Tube at={[0, .4, 0]} size={[.11, .57, .11]} color="#ac493b"/>
    <Orb at={[0, .7, 0]} size={[.11, .12, .11]} color="#ac493b"/>
    <Block at={[0, .79, 0]} size={[.16, .05, .08]} color="#37424b"/>
    <Block at={[.11, .55, 0]} size={[.035, .4, .04]} color="#303b44"/>
    <Block at={[0, .41, .111]} size={[.11, .18, .008]} color="#e6dbc5"/>
  </group>;
}
