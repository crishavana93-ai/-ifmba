'use client'
/**
 * Showroom3D — interactive 3D t-shirt viewer with texture swap.
 *
 * UX:
 *   - Drag the shirt to rotate 360°
 *   - Scroll / pinch to zoom (clamped so you can't fly into the mesh)
 *   - Below the canvas: a row of product thumbnails — click any to swap
 *     the active design on the shirt instantly (no reload)
 *
 * Implementation notes:
 *   - Uses @react-three/fiber + @react-three/drei (one-time install in ~/ifmba)
 *   - The whole module is dynamically imported in /butik so the three.js
 *     bundle (~900KB gzipped) only loads when the user actually scrolls
 *     into the showroom block — keeps the rest of the site fast.
 *   - The shirt mesh is built procedurally from a torus + plane for now.
 *     When we drop a real .glb model into /public/models/tshirt.glb, swap
 *     <ShirtMesh /> for <useGLTF /> from drei — same texture pipeline.
 *
 * Limitations honest disclosure for Cris:
 *   - Product photos from AliExpress are flat-lays (the shirt itself is IN
 *     the photo). When applied as a texture they look "printed-on-shirt"
 *     which is the right vibe but not photorealistic.
 *   - For pro photorealism, generate just-the-graphic extractions via
 *     remove.bg and re-upload. The viewer is then a true "design on shirt".
 */

import { Canvas, useFrame, useLoader } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { Suspense, useEffect, useMemo, useRef, useState } from 'react'
import * as THREE from 'three'

type Product = {
  _id: string
  name: string
  imageUrl?: string | null
  priceSek: number
  category?: string
}

function fmtSek(n?: number) {
  if (!n && n !== 0) return ''
  return new Intl.NumberFormat('sv-SE').format(n) + ' kr'
}

/**
 * Procedural t-shirt mesh — composed of a body (torso cylinder) + two
 * sleeves (smaller cylinders) + a neck cutout. The chest is a slightly
 * curved plane that catches the product texture.
 *
 * The geometry is intentionally simple so the texture reads clearly.
 * Total mesh: ~3K triangles.
 */
function ShirtMesh({ textureUrl, color = '#0B1220' }: { textureUrl?: string; color?: string }) {
  const ref = useRef<THREE.Group>(null)

  // Load texture imperatively so we can null-check + replace cleanly
  const [texture, setTexture] = useState<THREE.Texture | null>(null)
  useEffect(() => {
    if (!textureUrl) { setTexture(null); return }
    const loader = new THREE.TextureLoader()
    loader.setCrossOrigin('anonymous')
    loader.load(textureUrl, (tex) => {
      tex.colorSpace = THREE.SRGBColorSpace
      tex.anisotropy = 8
      setTexture(tex)
    })
  }, [textureUrl])

  // Subtle idle sway so the model feels alive even before user interaction
  useFrame((state) => {
    if (!ref.current) return
    const t = state.clock.getElapsedTime()
    ref.current.rotation.y = Math.sin(t * 0.3) * 0.04
  })

  return (
    <group ref={ref}>
      {/* Body — slightly elliptical cylinder for a t-shirt silhouette */}
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[1.05, 0.92, 2.3, 48, 1, true]} />
        <meshStandardMaterial color={color} side={THREE.DoubleSide} roughness={0.7} metalness={0.05} />
      </mesh>

      {/* Front chest panel — receives the product texture */}
      <mesh position={[0, 0.05, 1.02]}>
        <planeGeometry args={[1.55, 1.85, 1, 1]} />
        <meshStandardMaterial
          map={texture || null}
          color={texture ? '#ffffff' : color}
          roughness={0.65}
          metalness={0.05}
          transparent
        />
      </mesh>

      {/* Left sleeve */}
      <mesh position={[-1.1, 0.5, 0]} rotation={[0, 0, Math.PI / 2.3]}>
        <cylinderGeometry args={[0.42, 0.38, 0.95, 32]} />
        <meshStandardMaterial color={color} roughness={0.7} />
      </mesh>

      {/* Right sleeve */}
      <mesh position={[1.1, 0.5, 0]} rotation={[0, 0, -Math.PI / 2.3]}>
        <cylinderGeometry args={[0.42, 0.38, 0.95, 32]} />
        <meshStandardMaterial color={color} roughness={0.7} />
      </mesh>

      {/* Neck ring */}
      <mesh position={[0, 1.15, 0]}>
        <torusGeometry args={[0.32, 0.06, 16, 48]} />
        <meshStandardMaterial color={color} roughness={0.6} />
      </mesh>

      {/* Bottom hem ring (subtle definition) */}
      <mesh position={[0, -1.15, 0]}>
        <torusGeometry args={[0.92, 0.04, 12, 48]} />
        <meshStandardMaterial color={color} roughness={0.6} />
      </mesh>
    </group>
  )
}

export default function Showroom3D({
  products,
  num,
  numText,
  className,
}: {
  products: Product[]
  num?: string
  numText?: string
  className?: string
}) {
  // Only show products with imageUrl AND apparel-tee category (other items
  // don't have a flat design to map onto a shirt).
  const usable = useMemo(
    () => products.filter((p) => p.imageUrl && p.category === 'apparel-tee'),
    [products],
  )

  const [active, setActive] = useState<Product | null>(usable[0] || null)
  useEffect(() => {
    if (!active && usable.length > 0) setActive(usable[0])
  }, [usable, active])

  if (usable.length === 0) return null

  return (
    <section
      className={`showroom section ${className || ''}`.trim()}
      data-num={num}
      data-num-text={numText}
      id="showroom"
    >
      <div className="contain">
        <div className="label">3D Showroom</div>
        <h2 className="title">
          Bär <em>plagget</em> innan du köper
        </h2>
        <p className="showroom-body">
          Dra för att rotera. Klicka ett plagg nedan för att byta tröjan direkt.
        </p>

        <div className="showroom-stage">
          <div className="showroom-canvas">
            <Canvas
              camera={{ position: [0, 0.2, 4.2], fov: 38 }}
              dpr={[1, 2]}
              gl={{ antialias: true, alpha: true }}
            >
              {/* Lighting setup — three-point lighting for the shirt */}
              <ambientLight intensity={0.55} />
              <directionalLight position={[3, 4, 5]} intensity={1.1} castShadow />
              <directionalLight position={[-3, 2, -2]} intensity={0.45} color="#FFCB05" />
              <hemisphereLight args={['#ffffff', '#0B1220', 0.4]} />

              <Suspense fallback={null}>
                <ShirtMesh textureUrl={active?.imageUrl || undefined} />
              </Suspense>

              <OrbitControls
                enablePan={false}
                minDistance={2.8}
                maxDistance={6}
                minPolarAngle={Math.PI / 3}
                maxPolarAngle={Math.PI / 1.6}
                autoRotate={false}
                rotateSpeed={0.8}
              />
            </Canvas>
            <div className="showroom-hint" aria-hidden="true">↻ Dra för att rotera</div>
          </div>

          {active && (
            <div className="showroom-info">
              <div className="showroom-info-name">{active.name}</div>
              <div className="showroom-info-price">{fmtSek(active.priceSek)}</div>
              <a className="showroom-info-cta" href="#fan-drop">
                Se detaljer ↓
              </a>
            </div>
          )}
        </div>

        <div className="showroom-thumbs">
          {usable.map((p) => {
            const isActive = active?._id === p._id
            return (
              <button
                key={p._id}
                type="button"
                className={`showroom-thumb${isActive ? ' is-active' : ''}`}
                onClick={() => setActive(p)}
                aria-label={`Visa ${p.name}`}
                aria-pressed={isActive}
              >
                <img src={p.imageUrl!} alt="" loading="lazy" />
                <span className="showroom-thumb-name">{p.name}</span>
              </button>
            )
          })}
        </div>
      </div>
    </section>
  )
}
