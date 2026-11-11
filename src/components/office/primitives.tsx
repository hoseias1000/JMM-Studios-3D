import { useLayoutEffect, useRef, type ReactNode } from 'react';
import { BoxGeometry, SphereGeometry, CylinderGeometry, CapsuleGeometry, CircleGeometry, MeshStandardMaterial, MeshBasicMaterial, DoubleSide, Group, Mesh, Matrix4, type BufferGeometry } from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';

export type Vec3 = [number, number, number];
// Shared, low-segment geometry and materials. Never allocated inside the animation loop.
const geometry = {
  box: new BoxGeometry(1, 1, 1),
  soft: new RoundedBoxGeometry(1, 1, 1, 2, .14),
  sphere: new SphereGeometry(1, 12, 8),
  cylinder: new CylinderGeometry(1, 1, 1, 12),
  capsule: new CapsuleGeometry(1, 1, 3, 8),
  circle: new CircleGeometry(1, 24),
};
const materials = new Map<string, MeshStandardMaterial>();
export function surface(color: string, metalness = 0, roughness = .75) {
  const key = `${color}/${metalness}/${roughness}`;
  if (!materials.has(key)) materials.set(key, new MeshStandardMaterial({ color, metalness, roughness }));
  return materials.get(key)!;
}
const shadeMaterial = new MeshBasicMaterial({ color: '#161a25', transparent: true, opacity: .13, depthWrite: false, side: DoubleSide });
export const glassMaterial = new MeshStandardMaterial({ color: '#8faebc', transparent: true, opacity: .13, roughness: .25, metalness: .15, depthWrite: false });
interface ShapeProps { at?: Vec3; size?: Vec3; rotation?: Vec3; color: string; cast?: boolean; metal?: number; roughness?: number }
export function Block({ at = [0, 0, 0], size = [1, 1, 1], rotation, color, cast = false, metal = 0, roughness = .75, rounded = false }: ShapeProps & { rounded?: boolean }) {
  return <mesh geometry={rounded ? geometry.soft : geometry.box} material={surface(color, metal, roughness)} position={at} scale={size} rotation={rotation} castShadow={cast} receiveShadow dispose={null}/>;
}
export function Orb({ at = [0, 0, 0], size = [1, 1, 1], rotation, color, cast = false, roughness = .75 }: ShapeProps) {
  return <mesh geometry={geometry.sphere} material={surface(color, 0, roughness)} position={at} scale={size} rotation={rotation} castShadow={cast} dispose={null}/>;
}
export function Tube({ at = [0, 0, 0], size = [1, 1, 1], rotation, color, metal = 0 }: ShapeProps) {
  return <mesh geometry={geometry.cylinder} material={surface(color, metal)} position={at} scale={size} rotation={rotation} dispose={null}/>;
}
export function Limb({ length, radius, color }: { length: number; radius: number; color: string }) {
  return <mesh geometry={geometry.capsule} material={surface(color)} position={[0, -length / 2, 0]} scale={[radius, length / 3, radius]} dispose={null}/>;
}
export function GroundShade({ x = 0, z = 0, width = 1, depth = 1, y = .025 }: { x?: number; z?: number; width?: number; depth?: number; y?: number }) {
  return <mesh geometry={geometry.circle} material={shadeMaterial} position={[x, y, z]} rotation={[-Math.PI / 2, 0, 0]} scale={[width, depth, 1]} dispose={null}/>;
}

/** Static furniture is merged by material, leaving characters independent and selectable.
 * Shared source resources remain alive; only the temporary merged geometry is disposed.
 */
export function StaticBatch({ children }: { children: ReactNode }) {
  const root = useRef<Group>(null);
  useLayoutEffect(() => {
    const group = root.current;
    if (!group) return;
    group.updateWorldMatrix(true, true);
    const inverse = new Matrix4().copy(group.matrixWorld).invert();
    const batches = new Map<string, { sources: Mesh[]; geometries: BufferGeometry[] }>();
    group.traverse(object => {
      if (!(object instanceof Mesh) || Array.isArray(object.material) || object.material.transparent) return;
      const key = `${object.material.uuid}/${object.castShadow}/${object.receiveShadow}`;
      const batch = batches.get(key) ?? { sources: [], geometries: [] };
      const clone = object.geometry.clone().applyMatrix4(new Matrix4().multiplyMatrices(inverse, object.matrixWorld));
      const normalized = clone.index ? clone.toNonIndexed() : clone;
      if (normalized !== clone) clone.dispose();
      batch.sources.push(object); batch.geometries.push(normalized); batches.set(key, batch);
    });
    const merged: Mesh[] = [];
    const hidden: Mesh[] = [];
    for (const batch of batches.values()) {
      const combined = mergeGeometries(batch.geometries);
      batch.geometries.forEach(g => g.dispose());
      if (!combined) continue;
      const source = batch.sources[0];
      const mesh = new Mesh(combined, source.material);
      mesh.castShadow = source.castShadow; mesh.receiveShadow = source.receiveShadow;
      group.add(mesh); merged.push(mesh);
      batch.sources.forEach(m => { m.visible = false; hidden.push(m); });
    }
    return () => { merged.forEach(m => { group.remove(m); m.geometry.dispose(); }); hidden.forEach(m => { m.visible = true; }); };
  }, [children]);
  return <group ref={root} dispose={null}>{children}</group>;
}
