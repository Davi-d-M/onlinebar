'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { ArrowDown } from 'lucide-react';

interface FunnelStepProps {
    name: string;
    volume: number;
    dropOff: number;
    totalVolume: number;
    color?: string;
}

export default function FunnelStep({ name, volume, dropOff, totalVolume, color = "bg-primary" }: FunnelStepProps) {
    const widthPercent = (volume / totalVolume) * 100;

    return (
        <div className="flex flex-col items-center group w-full">
            <div className="w-full flex items-center justify-center gap-10">

                {/* METRICS LEFT */}
                <div className="w-40 text-right space-y-1">
                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{name}</p>
                    <h4 className="text-xl font-black text-foreground tracking-tighter">{volume.toLocaleString()}</h4>
                </div>

                {/* VISUAL BAR */}
                <div className="flex-1 max-w-md h-16 bg-slate-50 rounded-2xl relative overflow-hidden border border-slate-100/50">
                    <div
                        className={cn("h-full transition-all duration-1000 ease-out opacity-80 group-hover:opacity-100 shadow-inner", color)}
                        style={{ width: `${widthPercent}%`, margin: '0 auto' }}
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                         <span className="text-[10px] font-black text-foreground uppercase tracking-widest mix-blend-difference">{Math.round(widthPercent)}% Reach</span>
                    </div>
                </div>

                {/* DROP-OFF RIGHT */}
                <div className="w-40 text-left">
                    {dropOff > 0 ? (
                        <div className="space-y-1">
                            <p className="text-[8px] font-black uppercase text-rose-400 tracking-widest">Drop-off</p>
                            <h4 className="text-xl font-black text-rose-500 tracking-tighter italic">-{dropOff}%</h4>
                        </div>
                    ) : (
                        <div className="space-y-1">
                            <p className="text-[8px] font-black uppercase text-emerald-500 tracking-widest">Entry</p>
                            <h4 className="text-xl font-black text-emerald-500 tracking-tighter italic">100%</h4>
                        </div>
                    )}
                </div>

            </div>

            {/* TRANSITION ARROW */}
            <div className="h-10 flex items-center justify-center text-slate-200">
                <ArrowDown size={16} />
            </div>
        </div>
    );
}
