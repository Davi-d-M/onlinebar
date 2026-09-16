'use client';

import * as React from 'react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { SensoryDNA } from '@/lib/engines/productKnowledgeEngine';
import { ShieldCheck, Info } from 'lucide-react';

interface Props {
    dna: SensoryDNA;
    origin: string;
    style: string;
    abv: string;
    verification: Record<string, string>;
}

export default function ProductDNACard({ dna, origin, style, abv, verification }: Props) {
    const metrics = [
        { label: 'Sweetness', val: dna.sweetness },
        { label: 'Body', val: dna.body },
        { label: 'Oak', val: dna.oak },
        { label: 'Smoke', val: dna.smoke },
        { label: 'Intensity', val: dna.intensity },
    ];

    const isVerified = verification['sensory_dna'] === 'MANUFACTURER' || verification['sensory_dna'] === 'TECHNICAL';

    return (
        <Card className="p-8 rounded-[3rem] bg-white border border-slate-100 shadow-xl space-y-10 text-left relative overflow-hidden group">
            {/* Header */}
            <div className="flex justify-between items-start">
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

            {/* Sensory Bars */}
            <div className="space-y-6">
                {metrics.map((m) => (
                    <div key={m.label} className="space-y-3">
                        <div className="flex justify-between items-center px-1">
                            <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest">{m.label}</span>
                            <span className="text-[10px] font-black text-foreground">{m.val}%</span>
                        </div>
                        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden border border-white/50 p-0.5">
                            <div
                                className="h-full bg-primary rounded-full transition-all duration-1000 ease-out shadow-sm"
                                style={{ width: `${m.val}%` }}
                            />
                        </div>
                    </div>
                ))}
            </div>

            {/* Metadata Footer */}
            <div className="pt-8 border-t border-slate-50 grid grid-cols-3 gap-4">
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

            {/* Disclaimer */}
            <p className="text-[7px] font-medium text-slate-300 uppercase italic text-center leading-relaxed">
                * Sensory profiles are Online Bar assessments based on tasting frameworks.
            </p>
        </Card>
    );
}
