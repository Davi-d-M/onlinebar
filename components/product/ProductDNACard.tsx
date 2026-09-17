'use client';

import * as React from 'react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { SensoryDNA } from '@/lib/engines/productKnowledgeEngine';
import { ShieldCheck, Info, Zap } from 'lucide-react';
import {
    PolarGrid,
    PolarAngleAxis,
    Radar,
    RadarChart,
    ResponsiveContainer
} from 'recharts';

interface Props {
    dna: SensoryDNA;
    origin: string;
    style: string;
    abv: string;
    verification: Record<string, string>;
}

export default function ProductDNACard({ dna, origin, style, abv, verification }: Props) {
    const data = React.useMemo(() => [
        { subject: 'Body', A: dna.body, fullMark: 100 },
        { subject: 'Sweetness', A: dna.sweetness, fullMark: 100 },
        { subject: 'Oak', A: dna.oak, fullMark: 100 },
        { subject: 'Smoke', A: dna.smoke, fullMark: 100 },
        { subject: 'Intensity', A: dna.intensity, fullMark: 100 },
    ], [dna]);

    const isVerified = verification['sensory_dna'] === 'MANUFACTURER' || verification['sensory_dna'] === 'TECHNICAL';

    return (
        <Card className="p-8 rounded-[3rem] bg-white border border-slate-100 shadow-xl space-y-8 text-left relative overflow-hidden group">
            {/* Header */}
            <div className="flex justify-between items-start relative z-10">
                <div className="space-y-1">
                    <h3 className="text-xl font-black uppercase tracking-tighter text-foreground">Product DNA</h3>
                    <p className="text-[10px] font-black text-primary uppercase tracking-[0.4em]">Sensory Analytics Node</p>
                </div>
                <div className={cn(
                    "h-10 w-10 rounded-xl flex items-center justify-center shadow-sm border",
                    isVerified ? "bg-emerald-50 border-emerald-100 text-emerald-500" : "bg-slate-50 border-slate-100 text-slate-300"
                )}>
                    {isVerified ? <ShieldCheck size={20} /> : <Info size={20} />}
                </div>
            </div>

            {/* Radar Chart (Hexagon) */}
            <div className="h-64 w-full relative z-10 py-4">
                <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
                        <PolarGrid stroke="#f1f5f9" />
                        <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 900 }} />
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

            {/* Micro Stats */}
            <div className="grid grid-cols-2 gap-3 relative z-10">
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                    <span className="text-[8px] font-black uppercase text-slate-400">Complexity</span>
                    <span className="text-[9px] font-black text-foreground">High</span>
                </div>
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                    <span className="text-[8px] font-black uppercase text-slate-400">Finish</span>
                    <span className="text-[9px] font-black text-foreground">Long</span>
                </div>
            </div>

            {/* Metadata Footer */}
            <div className="pt-6 border-t border-slate-50 grid grid-cols-3 gap-4 relative z-10">
                <div className="space-y-1">
                    <p className="text-[8px] font-black uppercase text-slate-400">Origin</p>
                    <p className="text-[10px] font-black text-foreground uppercase truncate">{origin}</p>
                </div>
                <div className="space-y-1 text-center">
                    <p className="text-[8px] font-black uppercase text-slate-400">Style</p>
                    <p className="text-[10px] font-black text-foreground uppercase truncate">{style}</p>
                </div>
                <div className="space-y-1 text-right">
                    <p className="text-[8px] font-black uppercase text-slate-400">ABV</p>
                    <p className="text-[10px] font-black text-foreground uppercase">{abv}</p>
                </div>
            </div>

            {/* Background Pattern */}
            <Zap size={64} className="absolute -bottom-4 -left-4 text-primary/5 rotate-12 -z-0" />
        </Card>
    );
}
