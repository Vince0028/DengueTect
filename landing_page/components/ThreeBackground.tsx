import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';

// Realistic DNA Double Helix
function DNADoubleHelix({ position, scale = 1, rotation }: { position: [number, number, number]; scale?: number; rotation?: [number, number, number] }) {
  const groupRef = useRef<THREE.Group>(null);
  const initialRotation = useMemo(() => rotation || [
    Math.random() * Math.PI * 2,
    Math.random() * Math.PI * 2,
    Math.random() * Math.PI * 2
  ], [rotation]);
  const rotationSpeed = useMemo(() => Math.random() * 0.3 + 0.1, []);
  const floatOffset = useMemo(() => Math.random() * Math.PI * 2, []);
  
  const helixData = useMemo(() => {
    const points = [];
    const basePairs = [];
    const turns = 3;
    const pointsPerTurn = 20;
    const totalPoints = turns * pointsPerTurn;
    const radius = 0.4;
    const height = 4;
    
    for (let i = 0; i < totalPoints; i++) {
      const t = i / totalPoints;
      const angle = t * Math.PI * 2 * turns;
      const y = (t - 0.5) * height;
      
      // Strand 1
      points.push({
        position: [Math.cos(angle) * radius, y, Math.sin(angle) * radius] as [number, number, number],
        strand: 1
      });
      
      // Strand 2 (opposite side)
      points.push({
        position: [Math.cos(angle + Math.PI) * radius, y, Math.sin(angle + Math.PI) * radius] as [number, number, number],
        strand: 2
      });
      
      // Base pairs (connecting rungs) - every few points
      if (i % 4 === 0) {
        basePairs.push({
          start: [Math.cos(angle) * radius, y, Math.sin(angle) * radius] as [number, number, number],
          end: [Math.cos(angle + Math.PI) * radius, y, Math.sin(angle + Math.PI) * radius] as [number, number, number],
          color: i % 8 === 0 ? '#22c55e' : '#4ade80'
        });
      }
    }
    
    return { points, basePairs };
  }, []);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.x = initialRotation[0] + state.clock.elapsedTime * rotationSpeed * 0.3;
      groupRef.current.rotation.y = initialRotation[1] + state.clock.elapsedTime * rotationSpeed;
      groupRef.current.rotation.z = initialRotation[2] + Math.sin(state.clock.elapsedTime * 0.3) * 0.2;
      groupRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 0.5 + floatOffset) * 0.3;
      groupRef.current.position.x = position[0] + Math.sin(state.clock.elapsedTime * 0.3 + floatOffset) * 0.2;
    }
  });

  return (
    <group ref={groupRef} position={position} scale={scale}>
      {/* Backbone strands */}
      {helixData.points.map((point, i) => (
        <mesh key={`strand-${i}`} position={point.position}>
          <sphereGeometry args={[0.06, 8, 8]} />
          <meshStandardMaterial
            color={point.strand === 1 ? '#22c55e' : '#16a34a'}
            transparent
            opacity={0.8}
            emissive={point.strand === 1 ? '#22c55e' : '#16a34a'}
            emissiveIntensity={0.3}
          />
        </mesh>
      ))}
      
      {/* Base pair connections */}
      {helixData.basePairs.map((pair, i) => {
        const midPoint: [number, number, number] = [
          (pair.start[0] + pair.end[0]) / 2,
          (pair.start[1] + pair.end[1]) / 2,
          (pair.start[2] + pair.end[2]) / 2
        ];
        const length = Math.sqrt(
          Math.pow(pair.end[0] - pair.start[0], 2) +
          Math.pow(pair.end[2] - pair.start[2], 2)
        );
        const angle = Math.atan2(pair.end[2] - pair.start[2], pair.end[0] - pair.start[0]);
        
        return (
          <mesh key={`pair-${i}`} position={midPoint} rotation={[0, -angle, Math.PI / 2]}>
            <cylinderGeometry args={[0.03, 0.03, length, 8]} />
            <meshStandardMaterial
              color={pair.color}
              transparent
              opacity={0.6}
              emissive={pair.color}
              emissiveIntensity={0.2}
            />
          </mesh>
        );
      })}
    </group>
  );
}

// Floating Bacteria - rod-shaped with flagella
function Bacteria({ position, scale = 1, color = '#22c55e' }: { position: [number, number, number]; scale?: number; color?: string }) {
  const groupRef = useRef<THREE.Group>(null);
  const initialRotation = useMemo(() => [
    Math.random() * Math.PI * 2,
    Math.random() * Math.PI * 2,
    Math.random() * Math.PI * 2
  ], []);
  const speed = useMemo(() => Math.random() * 0.3 + 0.2, []);
  const floatOffset = useMemo(() => Math.random() * Math.PI * 2, []);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.x = initialRotation[0] + state.clock.elapsedTime * speed * 0.5;
      groupRef.current.rotation.y = initialRotation[1] + state.clock.elapsedTime * speed;
      groupRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * speed + floatOffset) * 0.5;
      groupRef.current.position.x = position[0] + Math.sin(state.clock.elapsedTime * speed * 0.7 + floatOffset) * 0.3;
    }
  });

  return (
    <group ref={groupRef} position={position} scale={scale}>
      {/* Main body - capsule shape */}
      <mesh>
        <capsuleGeometry args={[0.15, 0.5, 8, 16]} />
        <MeshDistortMaterial
          color={color}
          distort={0.1}
          speed={2}
          roughness={0.3}
          metalness={0.2}
          transparent
          opacity={0.7}
          emissive={color}
          emissiveIntensity={0.2}
        />
      </mesh>
      
      {/* Flagella (tail-like structures) */}
      {[0, 1, 2].map((i) => {
        const angle = (i / 3) * Math.PI * 0.5 - Math.PI * 0.25;
        return (
          <mesh key={i} position={[-0.35, Math.sin(angle) * 0.1, Math.cos(angle) * 0.1]} rotation={[angle, 0, Math.PI / 2 + 0.3]}>
            <torusGeometry args={[0.15, 0.02, 8, 16, Math.PI]} />
            <meshStandardMaterial
              color={color}
              transparent
              opacity={0.5}
              emissive={color}
              emissiveIntensity={0.1}
            />
          </mesh>
        );
      })}
    </group>
  );
}

// Spherical Bacteria (Cocci)
function SphericalBacteria({ position, scale = 1, color = '#16a34a' }: { position: [number, number, number]; scale?: number; color?: string }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const speed = useMemo(() => Math.random() * 0.4 + 0.2, []);
  const floatOffset = useMemo(() => Math.random() * Math.PI * 2, []);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * speed + floatOffset) * 0.4;
      meshRef.current.position.x = position[0] + Math.cos(state.clock.elapsedTime * speed * 0.5 + floatOffset) * 0.3;
      meshRef.current.rotation.x = state.clock.elapsedTime * speed * 0.3;
      meshRef.current.rotation.z = state.clock.elapsedTime * speed * 0.2;
    }
  });

  return (
    <mesh ref={meshRef} position={position} scale={scale}>
      <sphereGeometry args={[0.2, 16, 16]} />
      <MeshDistortMaterial
        color={color}
        distort={0.2}
        speed={3}
        roughness={0.4}
        metalness={0.1}
        transparent
        opacity={0.6}
        emissive={color}
        emissiveIntensity={0.2}
      />
    </mesh>
  );
}

// Virus-like particle with spikes
function VirusParticle({ position, scale = 1, color = '#22c55e' }: { position: [number, number, number]; scale?: number; color?: string }) {
  const groupRef = useRef<THREE.Group>(null);
  const speed = useMemo(() => Math.random() * 0.3 + 0.15, []);
  const floatOffset = useMemo(() => Math.random() * Math.PI * 2, []);

  const spikes = useMemo(() => {
    const spikePositions = [];
    const numSpikes = 12;
    for (let i = 0; i < numSpikes; i++) {
      const phi = Math.acos(-1 + (2 * i) / numSpikes);
      const theta = Math.sqrt(numSpikes * Math.PI) * phi;
      spikePositions.push({
        position: [
          Math.cos(theta) * Math.sin(phi) * 0.25,
          Math.sin(theta) * Math.sin(phi) * 0.25,
          Math.cos(phi) * 0.25
        ] as [number, number, number],
        rotation: [phi, theta, 0] as [number, number, number]
      });
    }
    return spikePositions;
  }, []);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.x = state.clock.elapsedTime * speed;
      groupRef.current.rotation.y = state.clock.elapsedTime * speed * 0.7;
      groupRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * speed + floatOffset) * 0.5;
    }
  });

  return (
    <group ref={groupRef} position={position} scale={scale}>
      {/* Core */}
      <mesh>
        <icosahedronGeometry args={[0.2, 1]} />
        <MeshDistortMaterial
          color={color}
          distort={0.15}
          speed={2}
          roughness={0.3}
          metalness={0.3}
          transparent
          opacity={0.7}
          emissive={color}
          emissiveIntensity={0.3}
        />
      </mesh>
      
      {/* Spikes */}
      {spikes.map((spike, i) => (
        <mesh key={i} position={spike.position}>
          <coneGeometry args={[0.03, 0.12, 6]} />
          <meshStandardMaterial
            color={color}
            transparent
            opacity={0.6}
            emissive={color}
            emissiveIntensity={0.2}
          />
        </mesh>
      ))}
    </group>
  );
}

// Floating DNA-like helix representing virus/health (original, simplified)
function DNAHelix({ position, color }: { position: [number, number, number]; color: string }) {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.3;
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.2) * 0.1;
    }
  });

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
      <mesh ref={meshRef} position={position}>
        <torusKnotGeometry args={[0.8, 0.3, 100, 16]} />
        <MeshDistortMaterial
          color={color}
          attach="material"
          distort={0.3}
          speed={2}
          roughness={0.2}
          metalness={0.8}
          transparent
          opacity={0.6}
        />
      </mesh>
    </Float>
  );
}


function FloatingParticles() {
  const particlesRef = useRef<THREE.Group>(null);
  
  const particles = useMemo(() => {
    return Array.from({ length: 80 }, (_, i) => ({
      position: [
        (Math.random() - 0.5) * 60,
        (Math.random() - 0.5) * 50,
        (Math.random() - 0.5) * 20 - 5
      ] as [number, number, number],
      scale: Math.random() * 0.2 + 0.08,
      speed: Math.random() * 0.5 + 0.2
    }));
  }, []);

  useFrame((state) => {
    if (particlesRef.current) {
      particlesRef.current.rotation.y = state.clock.elapsedTime * 0.02;
      particlesRef.current.children.forEach((child, i) => {
        child.position.y += Math.sin(state.clock.elapsedTime * particles[i].speed + i) * 0.002;
      });
    }
  });

  return (
    <group ref={particlesRef}>
      {particles.map((particle, i) => (
        <mesh key={i} position={particle.position}>
          <sphereGeometry args={[particle.scale, 16, 16]} />
          <meshStandardMaterial
            color={i % 2 === 0 ? "#22c55e" : "#16a34a"}
            transparent
            opacity={0.4}
            emissive={i % 2 === 0 ? "#22c55e" : "#16a34a"}
            emissiveIntensity={0.3}
          />
        </mesh>
      ))}
    </group>
  );
}

// Glowing orb
function GlowingOrb({ position, color, size = 1 }: { position: [number, number, number]; color: string; size?: number }) {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.scale.setScalar(size + Math.sin(state.clock.elapsedTime * 2) * 0.1);
    }
  });

  return (
    <Float speed={1.5} rotationIntensity={0} floatIntensity={2}>
      <mesh ref={meshRef} position={position}>
        <sphereGeometry args={[1, 32, 32]} />
        <MeshDistortMaterial
          color={color}
          attach="material"
          distort={0.4}
          speed={3}
          roughness={0}
          metalness={0.1}
          transparent
          opacity={0.3}
        />
      </mesh>
    </Float>
  );
}

// Random elements generator
function RandomDNAHelixes({ count = 5 }: { count?: number }) {
  const colors = ['#22c55e', '#16a34a', '#4ade80'];
  
  const helixes = useMemo(() => {
    return Array.from({ length: count }, () => ({
      position: [
        (Math.random() - 0.5) * 50,
        (Math.random() - 0.5) * 40,
        (Math.random() * -15) - 5
      ] as [number, number, number],
      scale: Math.random() * 0.8 + 0.6,
      rotation: [
        Math.random() * Math.PI * 2,
        Math.random() * Math.PI * 2,
        Math.random() * Math.PI * 2
      ] as [number, number, number],
      color: colors[Math.floor(Math.random() * colors.length)]
    }));
  }, [count]);

  return (
    <>
      {helixes.map((helix, i) => (
        <DNADoubleHelix
          key={`dna-${i}`}
          position={helix.position}
          scale={helix.scale}
          rotation={helix.rotation}
        />
      ))}
    </>
  );
}

function RandomDNAKnots({ count = 3 }: { count?: number }) {
  const colors = ['#22c55e', '#16a34a', '#4ade80'];
  
  const knots = useMemo(() => {
    return Array.from({ length: count }, () => ({
      position: [
        (Math.random() - 0.5) * 50,
        (Math.random() - 0.5) * 40,
        (Math.random() * -12) - 3
      ] as [number, number, number],
      color: colors[Math.floor(Math.random() * colors.length)]
    }));
  }, [count]);

  return (
    <>
      {knots.map((knot, i) => (
        <DNAHelix key={`knot-${i}`} position={knot.position} color={knot.color} />
      ))}
    </>
  );
}

function RandomBacteria({ count = 8 }: { count?: number }) {
  const colors = ['#22c55e', '#16a34a', '#4ade80'];
  
  const bacteria = useMemo(() => {
    return Array.from({ length: count }, () => ({
      position: [
        (Math.random() - 0.5) * 50,
        (Math.random() - 0.5) * 40,
        (Math.random() * -15) - 3
      ] as [number, number, number],
      scale: Math.random() * 1.2 + 0.5,
      color: colors[Math.floor(Math.random() * colors.length)]
    }));
  }, [count]);

  return (
    <>
      {bacteria.map((b, i) => (
        <Bacteria key={`bac-${i}`} position={b.position} scale={b.scale} color={b.color} />
      ))}
    </>
  );
}

function RandomSphericalBacteria({ count = 6 }: { count?: number }) {
  const colors = ['#22c55e', '#16a34a', '#4ade80'];
  
  const bacteria = useMemo(() => {
    return Array.from({ length: count }, () => ({
      position: [
        (Math.random() - 0.5) * 50,
        (Math.random() - 0.5) * 40,
        (Math.random() * -12) - 2
      ] as [number, number, number],
      scale: Math.random() * 1.0 + 0.5,
      color: colors[Math.floor(Math.random() * colors.length)]
    }));
  }, [count]);

  return (
    <>
      {bacteria.map((b, i) => (
        <SphericalBacteria key={`sph-${i}`} position={b.position} scale={b.scale} color={b.color} />
      ))}
    </>
  );
}

function RandomVirusParticles({ count = 5 }: { count?: number }) {
  const colors = ['#22c55e', '#16a34a', '#4ade80'];
  
  const particles = useMemo(() => {
    return Array.from({ length: count }, () => ({
      position: [
        (Math.random() - 0.5) * 50,
        (Math.random() - 0.5) * 40,
        (Math.random() * -12) - 2
      ] as [number, number, number],
      scale: Math.random() * 0.9 + 0.5,
      color: colors[Math.floor(Math.random() * colors.length)]
    }));
  }, [count]);

  return (
    <>
      {particles.map((p, i) => (
        <VirusParticle key={`vir-${i}`} position={p.position} scale={p.scale} color={p.color} />
      ))}
    </>
  );
}

// Main 3D Background component
const ThreeBackground: React.FC = () => {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none">
      <Canvas
        camera={{ position: [0, 0, 15], fov: 75 }}
        style={{ background: 'transparent' }}
        gl={{ alpha: true, antialias: true }}
      >
        <ambientLight intensity={0.5} />
        <pointLight position={[20, 20, 10]} intensity={1} color="#22c55e" />
        <pointLight position={[-20, -20, -10]} intensity={0.5} color="#16a34a" />
        <pointLight position={[0, 0, 5]} intensity={0.3} color="#4ade80" />
        
        {/* Randomly positioned DNA Double Helixes */}
        <RandomDNAHelixes count={10} />
        
        {/* Randomly positioned DNA Knots */}
        <RandomDNAKnots count={6} />
        
        {/* Randomly positioned Bacteria */}
        <RandomBacteria count={15} />
        
        {/* Randomly positioned Spherical Bacteria */}
        <RandomSphericalBacteria count={12} />
        
        {/* Randomly positioned Virus Particles */}
        <RandomVirusParticles count={10} />
        
        <GlowingOrb position={[10, 8, -5]} color="#4ade80" size={1.2} />
        <GlowingOrb position={[-12, -8, -6]} color="#22c55e" size={1.5} />
        <GlowingOrb position={[8, -10, -4]} color="#16a34a" size={1.0} />
        <GlowingOrb position={[-8, 10, -5]} color="#4ade80" size={1.3} />
        
        <FloatingParticles />
      </Canvas>
    </div>
  );
};

export default ThreeBackground;
