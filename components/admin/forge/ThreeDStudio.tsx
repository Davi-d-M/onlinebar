'use client';

import * as React from 'react';
import { Canvas, useFrame } from "@react-three/fiber";
import {
  Html,
  OrbitControls,
  useGLTF,
  Stage,
  PerspectiveCamera,
} from "@react-three/drei";
import * as THREE from "three";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import {
    RotateCcw,
    Play,
    Pause,
    Zap,
    Loader2,
    Settings2,
    Maximize2,
    Box
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type Preset = 'rembrandt' | 'portrait' | 'upfront' | 'soft';
type EnvironmentPreset = 'city' | 'studio' | 'apartment' | 'lobby' | 'night' | 'warehouse' | 'forest';

function Model({ url, rotationSpeed, autoRotate }: { url: string; rotationSpeed: number, autoRotate: boolean }) {
  const { scene } = useGLTF(url);
  const group = React.useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (autoRotate && group.current) {
        group.current.rotation.y += delta * rotationSpeed;
    }
  });

  return (
    <group ref={group}>
      <primitive object={scene} />
    </group>
  );
}

export default function ThreeDStudio({ modelUrl, productName }: { modelUrl?: string; productName: string }) {
  const [autoRotate, setAutoRotate] = React.useState(true);
  const [intensity, setIntensity] = React.useState(1.5);
  const [environment, setEnvironment] = React.useState<EnvironmentPreset>('studio');
  const [preset, setPreset] = React.useState<Preset>('rembrandt');
  const controlsRef = React.useRef<OrbitControlsImpl>(null);

  if (!modelUrl) {
    return (
        <Card className="h-[600px] w-full rounded-[3.5rem] bg-slate-50 border border-slate-100 flex flex-col items-center justify-center gap-6 opacity-40 grayscale group hover:grayscale-0 transition-all duration-700">
            <Box size={64} className="text-slate-300 group-hover:text-primary transition-colors" />
            <div className="text-center space-y-2">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">3D Asset Missing</p>
                <p className="text-[8px] font-bold text-slate-300 uppercase max-w-[200px]">Upload a .GLB or .GLTF file to initialize the Product Stage.</p>
            </div>
            <Button variant="outline" className="rounded-xl border-slate-200 bg-white font-black uppercase text-[8px] tracking-widest mt-4">
                Initialize Studio
            </Button>
        </Card>
    );
  }

  return (
    <div className="relative h-[650px] w-full overflow-hidden rounded-[3.5rem] border border-slate-100 bg-slate-50 shadow-2xl group selection:bg-primary/20">

      {/* HUD OVERLAY: LEFT */}
      <div className="absolute left-10 top-10 z-20 space-y-4">
        <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-white/80 px-4 py-1.5 text-[9px] font-black uppercase tracking-[0.3em] text-primary backdrop-blur-xl shadow-sm">
                <Zap size={10} fill="currentColor" /> Forge Stage 2.0
            </div>
            <h2 className="text-4xl font-black text-foreground uppercase tracking-tighter leading-none italic">
                {productName}
            </h2>
        </div>

        {/* CAMERA PRESETS */}
        <div className="flex gap-2 pt-4">
            {['Front', 'Side', 'Top', 'Detail'].map(v => (
                <button key={v} className="h-10 px-4 rounded-xl bg-white/70 border border-slate-100 text-[8px] font-black uppercase tracking-widest hover:bg-primary hover:text-white transition-all backdrop-blur-md">
                    {v}
                </button>
            ))}
        </div>
      </div>

      {/* HUD OVERLAY: RIGHT (CONTROLS) */}
      <Card className="absolute right-10 top-10 z-20 p-6 rounded-[2.5rem] bg-white/80 backdrop-blur-xl border border-white/50 shadow-2xl w-64 space-y-6">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
            <Settings2 size={16} className="text-primary" />
            <span className="text-[10px] font-black uppercase tracking-widest text-foreground">Studio Controls</span>
        </div>

        <div className="space-y-4">
            <div className="space-y-3">
                <div className="flex justify-between items-center">
                    <label className="text-[8px] font-black uppercase text-slate-400">Lighting Intensity</label>
                    <span className="text-[8px] font-black text-primary">{intensity}x</span>
                </div>
                <input
                    type="range" min="0.1" max="4" step="0.1"
                    value={intensity} onChange={e => setIntensity(parseFloat(e.target.value))}
                    className="w-full h-1 bg-slate-100 rounded-full appearance-none accent-primary"
                />
            </div>

            <div className="space-y-3">
                <label className="text-[8px] font-black uppercase text-slate-400">Environment Preset</label>
                <select
                    value={environment} onChange={e => setEnvironment(e.target.value as EnvironmentPreset)}
                    className="w-full h-10 px-4 rounded-xl bg-slate-50 border-slate-100 text-[9px] font-black uppercase outline-none focus:ring-2 focus:ring-primary"
                >
                    <option value="studio">Clean Studio</option>
                    <option value="city">Urban Lifestyle</option>
                    <option value="night">Night Mode</option>
                    <option value="apartment">Interior</option>
                    <option value="warehouse">Industrial</option>
                </select>
            </div>

            <div className="space-y-3">
                <label className="text-[8px] font-black uppercase text-slate-400">Stage Preset</label>
                <div className="grid grid-cols-2 gap-2">
                    {(['rembrandt', 'portrait', 'upfront', 'soft'] as Preset[]).map(p => (
                        <button
                            key={p}
                            onClick={() => setPreset(p)}
                            className={cn(
                                "h-8 rounded-lg text-[7px] font-black uppercase border transition-all",
                                preset === p ? "bg-primary text-white border-primary shadow-lg shadow-primary/20" : "bg-white text-slate-400 border-slate-100"
                            )}
                        >
                            {p}
                        </button>
                    ))}
                </div>
            </div>
        </div>

        <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <button
                onClick={() => setAutoRotate(!autoRotate)}
                className={cn(
                    "h-10 w-10 rounded-xl flex items-center justify-center transition-all",
                    autoRotate ? "bg-indigo-50 text-indigo-600 shadow-inner" : "bg-slate-50 text-slate-300"
                )}
            >
                {autoRotate ? <Pause size={16} /> : <Play size={16} />}
            </button>
            <button
                onClick={() => controlsRef.current?.reset()}
                className="h-10 w-10 rounded-xl bg-slate-50 text-slate-300 hover:text-primary transition-all flex items-center justify-center"
            >
                <RotateCcw size={16} />
            </button>
            <button className="h-10 w-10 rounded-xl bg-slate-50 text-slate-300 hover:text-primary transition-all flex items-center justify-center">
                <Maximize2 size={16} />
            </button>
        </div>
      </Card>

      <Canvas shadows dpr={[1, 2]}>
        <PerspectiveCamera makeDefault position={[0, 0, 5]} fov={40} />
        <React.Suspense fallback={<Html center><Loader2 className="animate-spin text-primary" /></Html>}>
          <Stage
            intensity={intensity}
            environment={environment}
            preset={preset}
            adjustCamera={1.2}
            shadows="contact"
          >
            <Model
                url={modelUrl}
                rotationSpeed={0.5}
                autoRotate={autoRotate}
            />
          </Stage>
        </React.Suspense>
        <OrbitControls
            ref={controlsRef}
            enablePan={false}
            minDistance={2}
            maxDistance={8}
            makeDefault
            enableDamping
            dampingFactor={0.05}
        />
      </Canvas>

      {/* TACTICAL OVERLAY */}
      <div className="absolute bottom-10 left-10 pointer-events-none opacity-40">
        <p className="text-[9px] font-black uppercase tracking-[0.4em] text-slate-400">Drag to Inspect • Scroll to Zoom</p>
      </div>
    </div>
  );
}
