'use client';

import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stage, Environment, ContactShadows, PerspectiveCamera } from '@react-three/drei';

function BottlePlaceholder() {
    return (
        <mesh position={[0, 0, 0]}>
            <cylinderGeometry args={[0.3, 0.3, 1.2, 32]} />
            <meshStandardMaterial color="#F5A000" roughness={0.1} metalness={0.8} />
        </mesh>
    );
}

export default function BottleViewer3D({ }: { _modelUrl?: string }) {
    // modelUrl will be used for GLTFLoader in future phases
    return (
        <div className="w-full h-[400px] bg-slate-50/50 rounded-[3rem] border border-slate-100 relative group overflow-hidden">
            <div className="absolute top-6 left-1/2 -translate-x-1/2 z-10">
                <span className="px-3 py-1 bg-white/80 backdrop-blur-md rounded-full border border-slate-200 text-[8px] font-black uppercase tracking-widest text-slate-400">
                    360° Interactive Bottle
                </span>
            </div>

            <Canvas dpr={[1, 2]} shadows>
                <PerspectiveCamera makeDefault position={[0, 0, 3]} />
                <Suspense fallback={null}>
                    <Stage environment="city" intensity={0.6}>
                        <BottlePlaceholder />
                    </Stage>
                </Suspense>
                <OrbitControls
                    enableZoom={true}
                    enablePan={false}
                    autoRotate={true}
                    autoRotateSpeed={1}
                    maxPolarAngle={Math.PI / 2}
                    minPolarAngle={Math.PI / 3}
                />
                <Environment preset="city" />
                <ContactShadows position={[0, -0.6, 0]} opacity={0.4} scale={3} blur={2.4} far={0.8} />
            </Canvas>

            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                <p className="text-[7px] font-black uppercase text-slate-300 tracking-[0.3em]">Drag to rotate • Scroll to zoom</p>
            </div>
        </div>
    );
}
