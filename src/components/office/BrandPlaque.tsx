import { useTexture } from '@react-three/drei';
import { SRGBColorSpace } from 'three';
import { companyBrand } from '../../data/branding';
import { Block, type Vec3 } from './primitives';

/** A real textured sign. The source PNG is used intact, with its original aspect ratio. */
export default function BrandPlaque({ at, width, rotation = 0 }: { at: Vec3; width: number; rotation?: number }) {
  const texture = useTexture(companyBrand.logoUrl);
  texture.colorSpace = SRGBColorSpace;
  const image = texture.image as { width: number; height: number };
  const height = width * image.height / image.width;
  return <group position={at} rotation={[0, rotation, 0]} userData={{ companyLogo: true }}>
    <Block at={[0, 0, -.035]} size={[width + .08, height + .08, .06]} color="#141619" rounded/>
    <mesh position={[0, 0, .003]}>
      <planeGeometry args={[width, height]}/>
      <meshBasicMaterial map={texture} transparent toneMapped={false}/>
    </mesh>
  </group>;
}
