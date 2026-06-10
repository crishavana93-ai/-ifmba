'use client'

/**
 * CinematicBall3D — a real 3D basketball (React-Three-Fiber).
 *
 * Renders a glossy gold sphere with navy seam rings that tumbles in true 3D
 * (seams move correctly across the surface — not a flat image spinning).
 * Transparent background, so it drops straight into the fixed ball container
 * in CinematicScroll. No external service / no credits — pure WebGL.
 *
 * Used only when NEXT_PUBLIC_CINEMATIC_3D === '1' (CinematicScroll lazy-loads
 * it with ssr:false). Falls back to the SVG ball otherwise.
 *
 * Deps: three, @react-three/fiber (already in the project — see Showroom3D).
 */
import { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'

function Ball() {
  const group = useRef<THREE.Group>(null)

  // continuous 3D tumble
  useFrame((_, dt) => {
    if (!group.current) return
    group.current.rotation.y += dt * 0.9
    group.current.rotation.x += dt * 0.28
  })

  const ballMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#FFCB05',
        roughness: 0.3,
        metalness: 0.18,
        emissive: new THREE.Color('#5a3f00'),
        emissiveIntensity: 0.08,
      }),
    [],
  )
  const seamMat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: '#0B1220', roughness: 0.5, metalness: 0.1 }),
    [],
  )

  // basketball seam "cage": equator + 3 vertical great circles (one tilted)
  const seamArgs: [number, number, number, number] = [1.002, 0.022, 16, 120]
  return (
    <group ref={group}>
      <mesh material={ballMat}>
        <sphereGeometry args={[1, 64, 64]} />
      </mesh>
      <mesh material={seamMat} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={seamArgs} />
      </mesh>
      <mesh material={seamMat}>
        <torusGeometry args={seamArgs} />
      </mesh>
      <mesh material={seamMat} rotation={[0, Math.PI / 2, 0]}>
        <torusGeometry args={seamArgs} />
      </mesh>
      <mesh material={seamMat} rotation={[0, Math.PI / 4, 0]}>
        <torusGeometry args={seamArgs} />
      </mesh>
    </group>
  )
}

export default function CinematicBall3D() {
  return (
    <Canvas
      camera={{ position: [0, 0, 3], fov: 38 }}
      gl={{ alpha: true, antialias: true }}
      dpr={[1, 2]}
      style={{ width: '100%', height: '100%', background: 'transparent' }}
    >
      <ambientLight intensity={0.75} />
      <directionalLight position={[3, 4, 5]} intensity={2.4} />
      <directionalLight position={[-3, -2, 2]} intensity={0.5} color="#fff3c4" />
      <Ball />
    </Canvas>
  )
}
