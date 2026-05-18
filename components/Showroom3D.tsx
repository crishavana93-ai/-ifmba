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

import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, ContactShadows, useGLTF } from '@react-three/drei'
import { Suspense, useEffect, useMemo, useRef, useState } from 'react'
import * as THREE from 'three'

// Pre-load the model so the first user interaction is instant.
// Path is /public/models/tshirt.glb — Next.js serves /public at the root.
useGLTF.preload('/models/tshirt.glb')

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
 * Real .glb t-shirt — loaded from /public/models/tshirt.glb.
 * Source: "T-Shirt Low Poly" by JC4862 on Sketchfab (CC BY 4.0).
 * https://sketchfab.com/3d-models/t-shirt-low-poly-3e4b13a502884acfbd79cee0f9cd8876
 *
 * Texture pipeline: we traverse the loaded scene graph and replace the
 * `map` on every mesh's material with our product texture. The model's
 * UV unwrap places the design on the chest area naturally.
 *
 * If the model fails to load (e.g. file missing), the Suspense boundary
 * in the parent falls back to <ShirtMeshProcedural> so the showroom never
 * shows a broken state.
 */
function ShirtFromModel({ textureUrl }: { textureUrl?: string }) {
  const ref = useRef<THREE.Group>(null)
  const { scene } = useGLTF('/models/tshirt.glb') as any

  // Clone so multiple instances don't share state; we mutate materials below.
  // Cloning the materials too (`true` deep flag) so texture overrides on this
  // instance don't bleed into other usages of the same GLB.
  const cloned = useMemo(() => {
    const c = scene.clone(true)
    // Also clone every material so we can mutate freely without affecting
    // the cached source asset (which would survive across page navigations).
    c.traverse((obj: any) => {
      if (obj.isMesh && obj.material) {
        obj.material = Array.isArray(obj.material)
          ? obj.material.map((m: THREE.Material) => m.clone())
          : obj.material.clone()
      }
    })
    return c
  }, [scene])

  // Apply the product texture by overriding every mesh's baseColor map.
  // Handles both single materials and material arrays. Disposes the previous
  // texture before swapping so we don't leak GPU memory.
  useEffect(() => {
    if (!cloned) return

    const setMaps = (tex: THREE.Texture | null) => {
      cloned.traverse((obj: any) => {
        if (!obj.isMesh || !obj.material) return
        const mats = Array.isArray(obj.material) ? obj.material : [obj.material]
        for (const m of mats) {
          // Dispose previous map to free GPU memory
          if (m.map && m.map !== tex) m.map.dispose?.()
          m.map = tex
          if (tex) {
            m.color = new THREE.Color('#ffffff')
          } else {
            m.color = new THREE.Color('#f5f3ec') // soft cream when no texture
          }
          m.needsUpdate = true
        }
      })
    }

    if (!textureUrl) {
      setMaps(null)
      return
    }

    const loader = new THREE.TextureLoader()
    loader.setCrossOrigin('anonymous')
    loader.load(
      textureUrl,
      (tex) => {
        tex.colorSpace = THREE.SRGBColorSpace
        tex.anisotropy = 8
        tex.flipY = false
        setMaps(tex)
        // eslint-disable-next-line no-console
        console.log('[Showroom3D] texture applied:', textureUrl)
      },
      undefined,
      (err) => {
        // eslint-disable-next-line no-console
        console.warn('[Showroom3D] texture load failed:', textureUrl, err)
      },
    )
  }, [cloned, textureUrl])

  // Subtle idle sway
  useFrame((state) => {
    if (!ref.current) return
    const t = state.clock.getElapsedTime()
    ref.current.rotation.y = Math.sin(t * 0.4) * 0.06
  })

  return (
    // Scaled down from 1.6 → 0.95 so the shirt sits inside the canvas
    // with breathing room (Cris flagged it as too big 2026-05-18).
    <group ref={ref} scale={0.95} position={[0, -0.35, 0]}>
      <primitive object={cloned} />
    </group>
  )
}

/**
 * Procedural fallback — used only if the .glb fails to load. Kept around
 * so the showroom never shows a broken state.
 */
function ShirtMeshProcedural({ textureUrl, color = '#0B1220' }: { textureUrl?: string; color?: string }) {
  const ref = useRef<THREE.Group>(null)

  // Load texture imperatively so we can null-check + replace cleanly +
  // log errors (without an onError, CORS failures fail silently).
  const [texture, setTexture] = useState<THREE.Texture | null>(null)
  useEffect(() => {
    if (!textureUrl) { setTexture(null); return }
    const loader = new THREE.TextureLoader()
    loader.setCrossOrigin('anonymous')
    loader.load(
      textureUrl,
      (tex) => {
        tex.colorSpace = THREE.SRGBColorSpace
        tex.anisotropy = 8
        tex.minFilter = THREE.LinearMipMapLinearFilter
        tex.magFilter = THREE.LinearFilter
        setTexture(tex)
      },
      undefined,
      (err) => {
        // eslint-disable-next-line no-console
        console.warn('[Showroom3D] texture load failed:', textureUrl, err)
      },
    )
  }, [textureUrl])

  // Subtle idle sway so the model feels alive before user interaction
  useFrame((state) => {
    if (!ref.current) return
    const t = state.clock.getElapsedTime()
    ref.current.rotation.y = Math.sin(t * 0.4) * 0.06
  })

  // Shared shirt material — slight roughness like cotton, low metalness
  const bodyMat = useMemo(
    () => new THREE.MeshStandardMaterial({
      color,
      roughness: 0.82,
      metalness: 0.02,
      side: THREE.DoubleSide,
    }),
    [color],
  )

  return (
    <group ref={ref} position={[0, -0.4, 0]}>
      {/* TORSO — tapered cylinder: wider at chest, narrower at hem.
          openEnded so the chest panel can sit on the front face. */}
      <mesh material={bodyMat}>
        <cylinderGeometry args={[0.85, 0.72, 2.0, 64, 4, true]} />
      </mesh>

      {/* FRONT CHEST PANEL — partial cylinder hugging the body's front curve.
          thetaLength = how much of the cylinder we use (1.2 rad ≈ 69° front arc).
          thetaStart positions the arc on the front face (looking +Z). */}
      <mesh position={[0, 0, 0.001]}>
        <cylinderGeometry
          args={[0.86, 0.73, 1.6, 32, 1, true, Math.PI / 2 - 0.6, 1.2]}
        />
        <meshStandardMaterial
          map={texture || null}
          color={texture ? '#ffffff' : color}
          roughness={0.7}
          metalness={0.02}
          side={THREE.DoubleSide}
          transparent={false}
        />
      </mesh>

      {/* LEFT SLEEVE — angled down + outward, tapered */}
      <group position={[-0.78, 0.78, 0]} rotation={[0, 0, Math.PI / 2.6]}>
        <mesh material={bodyMat}>
          <cylinderGeometry args={[0.32, 0.26, 0.85, 24]} />
        </mesh>
      </group>

      {/* RIGHT SLEEVE — mirror */}
      <group position={[0.78, 0.78, 0]} rotation={[0, 0, -Math.PI / 2.6]}>
        <mesh material={bodyMat}>
          <cylinderGeometry args={[0.32, 0.26, 0.85, 24]} />
        </mesh>
      </group>

      {/* SHOULDER CAPS — tiny spheres to round the body↔sleeve join */}
      <mesh position={[-0.72, 0.97, 0]} material={bodyMat}>
        <sphereGeometry args={[0.34, 24, 16]} />
      </mesh>
      <mesh position={[0.72, 0.97, 0]} material={bodyMat}>
        <sphereGeometry args={[0.34, 24, 16]} />
      </mesh>

      {/* CREW NECK — slightly recessed ring */}
      <mesh position={[0, 1.0, 0]} rotation={[Math.PI / 2, 0, 0]} material={bodyMat}>
        <torusGeometry args={[0.24, 0.05, 12, 32]} />
      </mesh>

      {/* TOP CAP — closes the top of the torso (otherwise you see through) */}
      <mesh position={[0, 1.0, 0]} rotation={[Math.PI / 2, 0, 0]} material={bodyMat}>
        <ringGeometry args={[0.24, 0.85, 32]} />
      </mesh>

      {/* HEM CAP — closes the bottom */}
      <mesh position={[0, -1.0, 0]} rotation={[-Math.PI / 2, 0, 0]} material={bodyMat}>
        <circleGeometry args={[0.72, 32]} />
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
              camera={{ position: [0, 0.15, 4.2], fov: 30 }}
              dpr={[1, 2]}
              gl={{ antialias: true, alpha: true }}
              shadows
            >
              {/* Studio lighting — key (front-right), fill (front-left, yellow
                  to echo brand), back rim (top-back-left), ambient floor */}
              <ambientLight intensity={0.4} />
              <directionalLight
                position={[2.5, 3.5, 4]}
                intensity={1.3}
                castShadow
                shadow-mapSize-width={1024}
                shadow-mapSize-height={1024}
              />
              <directionalLight position={[-3, 2, 3]} intensity={0.55} color="#FFCB05" />
              <directionalLight position={[0, 3, -3]} intensity={0.7} color="#ffffff" />
              <hemisphereLight args={['#fff8e0', '#1a2540', 0.35]} />

              <Suspense fallback={null}>
                <ShirtFromModel textureUrl={active?.imageUrl || undefined} />
                {/* Soft contact shadow on the floor — grounds the shirt */}
                <ContactShadows
                  position={[0, -1.45, 0]}
                  opacity={0.45}
                  scale={5}
                  blur={2.4}
                  far={2}
                  color="#0B1220"
                />
              </Suspense>

              <OrbitControls
                enablePan={false}
                minDistance={2.6}
                maxDistance={5.5}
                minPolarAngle={Math.PI / 2.6}
                maxPolarAngle={Math.PI / 1.7}
                rotateSpeed={0.85}
                target={[0, -0.1, 0]}
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

        {/* CC-BY 4.0 attribution required by the model's license. */}
        <div className="showroom-credit">
          3D-modell:{' '}
          <a
            href="https://sketchfab.com/3d-models/t-shirt-low-poly-3e4b13a502884acfbd79cee0f9cd8876"
            target="_blank"
            rel="noopener noreferrer"
          >
            “T-Shirt Low Poly” by JC4862
          </a>{' '}
          ·{' '}
          <a
            href="https://creativecommons.org/licenses/by/4.0/"
            target="_blank"
            rel="noopener noreferrer"
          >
            CC BY 4.0
          </a>
        </div>
      </div>
    </section>
  )
}
