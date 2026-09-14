'use client';

import { Suspense, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  Environment,
  Html,
  OrbitControls,
  useGLTF,
} from "@react-three/drei";
import * as THREE from "three";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import { X, RotateCcw, Play, Pause, Zap, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

type BottleProps = {
  modelUrl: string;
  autoRotate: boolean;
  rotationSpeed: number;
  scale: number;
};

function Bottle({
  modelUrl,
  autoRotate,
  rotationSpeed,
  scale,
}: BottleProps) {
  const bottleRef = useRef<THREE.Group>(null);
  const { scene } = useGLTF(modelUrl);

  useFrame((_, delta) => {
    if (autoRotate && bottleRef.current) {
      bottleRef.current.rotation.y += delta * rotationSpeed;
    }
  });

  return (
    <group
      ref={bottleRef}
      scale={scale}
      position={[0, -1, 0]}
    >
      <primitive object={scene} />
    </group>
  );
}

function LoadingBottle() {
  return (
    <Html center>
      <div className="flex flex-col items-center gap-3 whitespace-nowrap rounded-full border border-primary/30 bg-black/80 px-6 py-3 text-[10px] font-black uppercase tracking-widest text-primary backdrop-blur-xl shadow-2xl">
        <Loader2 className="h-4 w-4 animate-spin" />
        Syncing 3D Model...
      </div>
    </Html>
  );
}

type Product3DViewerProps = {
  modelUrl: string;
  productName: string;
  onClose?: () => void;
};

export default function Product3DViewer({
  modelUrl,
  productName,
  onClose,
}: Product3DViewerProps) {
  const [autoRotate, setAutoRotate] = useState(true);
  const controlsRef = useRef<OrbitControlsImpl>(null);

  const handleReset = () => {
    if (controlsRef.current) {
        controlsRef.current.reset();
    }
  };

  return (
    <div className="relative h-[600px] w-full overflow-hidden rounded-[3rem] border border-primary/20 bg-[#080808] shadow-2xl group selection:bg-primary/20">

      {/* 🌑 CINEMATIC AMBIENT GLOW */}
      <div className="pointer-events-none absolute inset-0 z-0">
        <div className="absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/5 blur-[120px]" />
      </div>

      {/* HEADER NODES */}
      <div className="absolute left-10 top-10 z-20 flex justify-between items-start w-[calc(100%-80px)]">
        <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-black/60 px-4 py-1.5 text-[9px] font-black uppercase tracking-[0.3em] text-primary backdrop-blur-xl">
                <Zap size={10} fill="currentColor" /> High-Fidelity 3D
            </div>
            <h2 className="text-3xl font-black text-white uppercase tracking-tighter leading-none">
            {productName}
            </h2>
        </div>
        {onClose && (
            <button onClick={onClose} className="h-12 w-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-white hover:text-black transition-all">
                <X size={24} />
            </button>
        )}
      </div>

      {/* TACTICAL INSTRUCTIONS */}
      <div className="absolute bottom-10 left-10 z-20 hidden md:block">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 italic">
          ← Drag to explore • Pinch to zoom →
        </p>
      </div>

      {/* COMMAND CONTROLS */}
      <div className="absolute bottom-10 right-10 z-20 flex gap-3">
        <Button
          onClick={() => setAutoRotate((v) => !v)}
          variant="outline"
          className="rounded-2xl border-white/10 bg-black/70 px-6 h-14 text-[10px] font-black uppercase tracking-widest text-white backdrop-blur-xl hover:bg-primary hover:text-black transition-all active:scale-95"
        >
          {autoRotate ? <><Pause size={14} className="mr-2" /> Pause</> : <><Play size={14} className="mr-2" /> Auto Spin</>}
        </Button>

        <Button
          onClick={handleReset}
          variant="outline"
          className="h-14 w-14 rounded-2xl border-white/10 bg-black/70 flex items-center justify-center text-white backdrop-blur-xl hover:bg-white hover:text-black transition-all active:scale-95"
          title="Reset View"
        >
          <RotateCcw size={18} />
        </Button>
      </div>

      <Canvas
        camera={{
          position: [0, 0, 6],
          fov: 35,
        }}
        dpr={[1, 2]}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: "high-performance",
        }}
      >
        <ambientLight intensity={1.5} />
        <directionalLight position={[5, 8, 5]} intensity={4} />
        <directionalLight position={[-5, 3, 2]} intensity={2} />
        <pointLight position={[0, -2, 4]} intensity={2} />

        <Suspense fallback={<LoadingBottle />}>
          <Bottle
            modelUrl={modelUrl}
            autoRotate={autoRotate}
            rotationSpeed={0.7}
            scale={1}
          />
          <Environment preset="studio" />
        </Suspense>

        <OrbitControls
          ref={controlsRef}
          enablePan={false}
          enableRotate={true}
          enableZoom={true}
          rotateSpeed={0.8}
          zoomSpeed={0.8}
          minDistance={2.5}
          maxDistance={8}
          minPolarAngle={0}
          maxPolarAngle={Math.PI}
          enableDamping={true}
          dampingFactor={0.06}
        />
      </Canvas>

      {/* Bottom Gradient Overlays */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black via-black/40 to-transparent" />
    </div>
  );
}
