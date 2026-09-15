'use client';

import * as React from 'react';
import { Card } from '@/components/ui/card';
import { Wine, Info, Sparkles, Droplets, Zap } from 'lucide-react';
import {
    PolarGrid,
    PolarAngleAxis,
    Radar,
    RadarChart,
    ResponsiveContainer
} from 'recharts';

interface DNAData {
    body: number;
    sweetness: number;
    oak: number;
    smoke: number;
    intensity: number;
}

export default function ProductDNAWidget({ dna }: { dna?: DNAData }) {
    const defaultDNA: DNAData = {
        body: 80,
        sweetness: 40,
        oak: 60,
        smoke: 70,
        intensity: 85
    };

    const activeDNA = dna || defaultDNA;

    const data = React.useMemo(() => [
        { subject: 'Body', A: activeDNA.body, fullMark: 100 },
        { subject: 'Sweetness', A: activeDNA.sweetness, fullMark: 100 },
        { subject: 'Oak', A: activeDNA.oak, fullMark: 100 },
        { subject: 'Smoke', A: activeDNA.smoke, fullMark: 100 },
        { subject: 'Intensity', A: activeDNA.intensity, fullMark: 100 },
    ], [activeDNA]);

    return (
        <Card className="p-10 rounded-[3.5rem] bg-white border border-slate-100 shadow-sm space-y-10 relative overflow-hidden group text-left">
            <div className="relative z-10 space-y-8">
                <div className="flex justify-between items-center px-2">
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-inner group-hover:scale-110 transition-transform duration-500">
                            <Wine size={24} />
                        </div>
                        <div>
                            <h3 className="text-xl font-black uppercase tracking-tighter text-foreground leading-none font-serif">Product DNA</h3>
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">Sensory Profile Node</p>
                        </div>
                    </div>
                    <div className="h-10 w-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-300">
                        <Info size={16} />
                    </div>
                </div>

                <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
                            <PolarGrid stroke="#f1f5f9" />
                            <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 9, fontWeight: 900 }} />
                            <Radar
                                name="Profile"
                                dataKey="A"
                                stroke="#ff6b00"
                                fill="#ff6b00"
                                fillOpacity={0.6}
                                animationDuration={1500}
                            />
                        </RadarChart>
                    </ResponsiveContainer>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    {[
                        { label: 'Complexity', val: 'Elite', icon: Sparkles },
                        { label: 'Viscosity', val: 'Medium-Heavy', icon: Droplets }
                    ].map(node => (
                        <div key={node.label} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center gap-3">
                            <node.icon size={14} className="text-primary" />
                            <div>
                                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">{node.label}</p>
                                <p className="text-[10px] font-black text-foreground uppercase">{node.val}</p>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="p-6 bg-slate-50 border border-slate-100 rounded-3xl relative overflow-hidden">
                    <div className="relative z-10 space-y-2">
                        <p className="text-[9px] font-black uppercase tracking-[0.3em] text-primary">Master Blender Note</p>
                        <p className="text-xs font-medium italic text-slate-500 leading-relaxed">
                            &quot;A sophisticated profile with a heavy body and lingering smoke finish. Recommend neat or with a single clear ice block.&quot;
                        </p>
                    </div>
                    <Zap size={48} className="absolute -bottom-4 -right-4 text-primary/5 rotate-12" />
                </div>
            </div>
            {/* Subtle background glow */}
            <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-primary/5 rounded-full blur-[80px] -z-0"></div>
        </Card>
    );
}
