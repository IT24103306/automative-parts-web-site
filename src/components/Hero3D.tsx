import { useRef, useEffect, useState, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, Float, ContactShadows, useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import React from 'react';

// This is the architecture ready for the real automotive car GLB
// The client will upload the file to /assets/3d/automotive/exploded-car.glb
const CarModelInner = () => {
  const { scene } = useGLTF('/assets/3d/automotive/exploded-car.glb');
  return <primitive object={scene} scale={1.2} position={[0, -1, 0]} />;
};

class CarErrorBoundary extends React.Component<{children: React.ReactNode}, {hasError: boolean}> {
  constructor(props: {children: React.ReactNode}) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  render() {
    if (this.state.hasError) {
      return (
        <mesh>
          <boxGeometry args={[0,0,0]} />
          <meshBasicMaterial color="black" />
        </mesh>
      );
    }
    return this.props.children;
  }
}

const CarModel = () => {
  const group = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (group.current) {
      group.current.rotation.y = t * 0.05;
    }
  });

  return (
    <group ref={group}>
      <CarErrorBoundary>
        <Suspense fallback={null}>
          <CarModelInner />
        </Suspense>
      </CarErrorBoundary>
    </group>
  );
};

const CameraRig = ({ scrollProgress }: { scrollProgress: number }) => {
  useFrame((state) => {
    const pointerX = state.pointer.x * 2;
    const pointerY = state.pointer.y * 2;
    
    // Zoom out slightly as we scroll
    const targetZ = 12 + scrollProgress * 5;
    const targetY = pointerY + scrollProgress * 3;
    const targetX = pointerX;

    state.camera.position.x += (targetX - state.camera.position.x) * 0.05;
    state.camera.position.y += (targetY - state.camera.position.y) * 0.05;
    state.camera.position.z += (targetZ - state.camera.position.z) * 0.05;
    state.camera.lookAt(0, 0, 0);
  });
  return null;
};

export default function Automotive3DHero() {
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY;
      const vh = window.innerHeight;
      const progress = Math.min(Math.max(scrolled / vh, 0), 1);
      setScrollProgress(progress);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="absolute inset-0 w-full h-full z-10 pointer-events-auto bg-[url('https://images.unsplash.com/photo-1558981806-ec527fa84c39?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center mix-blend-luminosity opacity-40">
      <Canvas shadows dpr={[1, 2]} gl={{ antialias: true, alpha: true }} camera={{ position: [0, 0, 12], fov: 45 }}>
        <Suspense fallback={null}>
          <CameraRig scrollProgress={scrollProgress} />
          
          <ambientLight intensity={0.4} />
          <directionalLight position={[10, 10, 10]} intensity={3.5} color="#ffffff" castShadow />
          <directionalLight position={[-10, 0, -10]} intensity={2.0} color="#ff0a0a" />
          <spotLight position={[0, -5, 10]} intensity={1.5} angle={0.8} penumbra={1} color="#ff0000" />
          <spotLight position={[0, 10, 0]} intensity={2.5} angle={0.5} penumbra={1} color="#e0e0e0" />
          
          <Float speed={1.5} rotationIntensity={0.1} floatIntensity={0.3}>
            <CarModel />
          </Float>

          <Environment preset="studio" />
          <ContactShadows position={[0, -4, 0]} opacity={0.8} scale={25} blur={2.5} far={4.5} color="#000000" />
        </Suspense>
      </Canvas>
    </div>
  );
}
