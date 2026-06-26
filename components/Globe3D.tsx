'use client';

import { useRef, useMemo, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Stars, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import type { NewsArticle } from '@/types';

/* ─────────────────────────── Shaders ─────────────────────────── */

const EARTH_VERT = /* glsl */ `
  varying vec2 vUv;
  varying vec3 vNormal;
  void main() {
    vUv     = uv;
    vNormal = normalize(normalMatrix * normal);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const EARTH_FRAG = /* glsl */ `
  varying vec2 vUv;
  varying vec3 vNormal;

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
  }
  float sn(vec2 p) {
    vec2 i = floor(p), f = fract(p);
    f = f*f*(3.0-2.0*f);
    return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),
               mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);
  }
  float fbm(vec2 p) {
    float v=0.0, a=0.5;
    for(int i=0;i<6;i++){ v+=a*sn(p); p=p*2.1+vec2(1.7,9.2); a*=0.5; }
    return v;
  }

  void main() {
    float elev = fbm(vUv * 3.8) * 1.6 - 0.75;
    elev += sn(vUv * 14.0) * 0.12;

    // Polar caps
    float lat  = abs(vUv.y - 0.5) * 2.0;
    float ice  = smoothstep(0.72, 0.92, lat);

    vec3 deepSea    = vec3(0.01, 0.07, 0.28);
    vec3 midSea     = vec3(0.02, 0.17, 0.52);
    vec3 shallowSea = vec3(0.04, 0.34, 0.58);
    vec3 lowland    = vec3(0.10, 0.34, 0.07);
    vec3 forest     = vec3(0.04, 0.22, 0.04);
    vec3 highland   = vec3(0.33, 0.26, 0.13);
    vec3 mountain   = vec3(0.48, 0.44, 0.36);
    vec3 snow       = vec3(0.87, 0.92, 0.97);
    vec3 iceColor   = vec3(0.79, 0.88, 0.95);

    vec3 col;
    if      (elev < -0.4)  col = deepSea;
    else if (elev < -0.15) col = mix(deepSea,    midSea,    (elev+0.4)/0.25);
    else if (elev < 0.0)   col = mix(midSea,     shallowSea,(elev+0.15)/0.15);
    else if (elev < 0.08)  col = mix(lowland,    forest,     elev/0.08);
    else if (elev < 0.28)  col = mix(forest,     highland,  (elev-0.08)/0.2);
    else if (elev < 0.52)  col = mix(highland,   mountain,  (elev-0.28)/0.24);
    else                   col = mix(mountain,   snow,      (elev-0.52)/0.48);

    col = mix(col, iceColor, ice);

    vec3  L    = normalize(vec3(2.2, 1.4, 1.6));
    float diff = max(dot(vNormal, L), 0.0);
    float spec = 0.0;
    if (elev < 0.0) spec = pow(diff, 48.0) * 0.35;

    float ambient = 0.22;
    col = col * (ambient + diff * 0.78) + vec3(spec);

    // subtle night glow
    float night = 1.0 - max(dot(vNormal, L), 0.0);
    col = mix(col, vec3(0.01,0.04,0.14), night * 0.28);

    gl_FragColor = vec4(col, 1.0);
  }
`;

const ATMO_VERT = /* glsl */ `
  varying vec3 vNormal;
  void main() {
    vNormal = normalize(normalMatrix * normal);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const ATMO_FRAG = /* glsl */ `
  varying vec3 vNormal;
  void main() {
    float intensity = pow(0.65 - dot(vNormal, vec3(0,0,1)), 4.0);
    gl_FragColor = vec4(0.08, 0.38, 1.0, 1.0) * intensity * 1.4;
  }
`;

/* ─────────────────────── Earth mesh ─────────────────────── */

function EarthGlobe() {
  const globeRef = useRef<THREE.Mesh>(null);
  const atmoRef  = useRef<THREE.Mesh>(null);

  const earthMat = useMemo(
    () => new THREE.ShaderMaterial({ vertexShader: EARTH_VERT, fragmentShader: EARTH_FRAG }),
    [],
  );
  const atmoMat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: ATMO_VERT,
        fragmentShader: ATMO_FRAG,
        blending: THREE.AdditiveBlending,
        side: THREE.BackSide,
        transparent: true,
        depthWrite: false,
      }),
    [],
  );

  useEffect(() => () => { earthMat.dispose(); atmoMat.dispose(); }, [earthMat, atmoMat]);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime() * 0.055;
    if (globeRef.current) globeRef.current.rotation.y = t;
    if (atmoRef.current)  atmoRef.current.rotation.y  = t;
  });

  return (
    <group>
      {/* Atmosphere */}
      <mesh ref={atmoRef}>
        <sphereGeometry args={[1.18, 64, 64]} />
        <primitive object={atmoMat} attach="material" />
      </mesh>

      {/* Globe */}
      <mesh ref={globeRef}>
        <sphereGeometry args={[1, 96, 96]} />
        <primitive object={earthMat} attach="material" />
      </mesh>
    </group>
  );
}

/* ───────────────────── Marker ───────────────────── */

const COUNTRY_HUE: Record<string, string> = {
  US: '#00d4ff', GB: '#a78bfa', JP: '#fb7185',
  HK: '#fbbf24', BR: '#34d399', DE: '#fb923c',
  FR: '#60a5fa', default: '#ffffff',
};

function latLngToVec3(lat: number, lng: number, r: number): THREE.Vector3 {
  const phi   = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);
  return new THREE.Vector3(
    -r * Math.sin(phi) * Math.cos(theta),
     r * Math.cos(phi),
     r * Math.sin(phi) * Math.sin(theta),
  );
}

function NewsMarker({ lat, lng, color }: { lat: number; lng: number; color: string }) {
  const dotRef  = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Mesh>(null);

  const pos = useMemo(() => latLngToVec3(lat, lng, 1.015), [lat, lng]);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (ringRef.current) {
      const s = 1 + 0.6 * Math.abs(Math.sin(t * 1.8));
      ringRef.current.scale.setScalar(s);
      (ringRef.current.material as THREE.MeshBasicMaterial).opacity =
        0.9 - 0.7 * Math.abs(Math.sin(t * 1.8));
    }
    if (dotRef.current) {
      (dotRef.current.material as THREE.MeshBasicMaterial).color.setStyle(
        `hsl(${(parseInt(color.slice(1), 16) % 360)}, 100%, ${55 + 10 * Math.sin(t * 2)}%)`,
      );
    }
  });

  return (
    <group position={pos}>
      <mesh ref={dotRef}>
        <sphereGeometry args={[0.013, 8, 8]} />
        <meshBasicMaterial color={color} />
      </mesh>
      <mesh ref={ringRef} rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.016, 0.028, 20]} />
        <meshBasicMaterial color={color} transparent opacity={0.5} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

/* ───────────────────── Scene ───────────────────── */

function Scene({ articles }: { articles: NewsArticle[] }) {
  const markers = useMemo(() => {
    const seen = new Set<string>();
    return articles
      .filter((a) => {
        const k = a.source.coordinates.join(',');
        if (seen.has(k)) return false;
        seen.add(k);
        return a.source.coordinates[0] !== 0 || a.source.coordinates[1] !== 0;
      })
      .slice(0, 24);
  }, [articles]);

  return (
    <>
      <ambientLight intensity={0.25} />
      <directionalLight position={[5, 3, 5]} intensity={1.3} color="#fff8f0" />
      <pointLight position={[-6, -4, -6]} intensity={0.12} color="#4466ff" />
      <Stars radius={110} depth={55} count={6000} factor={4} saturation={0} fade speed={0.8} />
      <EarthGlobe />
      {markers.map((a) => (
        <NewsMarker
          key={a.id}
          lat={a.source.coordinates[0]}
          lng={a.source.coordinates[1]}
          color={COUNTRY_HUE[a.source.country] ?? COUNTRY_HUE.default}
        />
      ))}
      <OrbitControls
        enableZoom
        enablePan={false}
        minDistance={1.6}
        maxDistance={5.5}
        rotateSpeed={0.45}
        zoomSpeed={0.7}
      />
    </>
  );
}

/* ───────────────────── Public component ───────────────────── */

interface Globe3DProps {
  articles?: NewsArticle[];
}

export function Globe3D({ articles = [] }: Globe3DProps) {
  return (
    <div className="w-full h-full">
      <Canvas
        camera={{ position: [0, 0, 2.9], fov: 44 }}
        gl={{ antialias: true, alpha: true }}
        dpr={[1, 2]}
      >
        <Scene articles={articles} />
      </Canvas>
    </div>
  );
}
