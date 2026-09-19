'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Target, Zap, ImageIcon, Info, DollarSign, Smartphone, Search } from 'lucide-react';

interface ReadinessGaugeProps {
    scores: {
        visuals: number;
        content: number;
        pricing: number;
        inventory: number;
        mobile: number;
        seo: number;
    }
}

export default function ReadinessGauge({ scores }: ReadinessGaugeProps) {
    const totalScore = Math.round(
        (scores.visuals + scores.content + scores.pricing + scores.inventory + scores.mobile + scores.seo) / 6
    );

    const metrics = [
        { label: 'Visuals', val: scores.visuals, icon: ImageIcon },
        { label: 'Content', val: scores.content, icon: Info },
        { label: 'Pricing', val: scores.pricing, icon: DollarSign },
        { label: 'Mobile', val: scores.mobile, icon: Smartphone },
        { label: 'SEO', val: scores.seo, icon: Search },
    ];

    return (
        <div className="space-y-10 text-left">
            <div className="flex flex-col items-center justify-center p-12 bg-white rounded-[4rem] border border-slate-100 shadow-sm relative overflow-hidden group">
                <div className="relative z-10 text-center space-y-4">
                    <div className="flex items-center justify-center gap-3">
                        <Zap size={14} className="text-primary animate-pulse" />
                        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Forge Readiness Score</span>
                    </div>

                    <div className={cn(
                        "text-8xl font-black tracking-tighter leading-none italic transition-colors duration-700",
                        totalScore >= 90 ? "text-emerald-500" : totalScore >= 75 ? "text-primary" : "text-rose-500"
                    )}>
                        {totalScore}
                    </div>

                    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-300">Publication Threshold: 85+</p>
                </div>

                {/* ANIMATED BACKGROUND RING */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.03]">
                    <div className="h-96 w-96 rounded-full border-[40px] border-primary animate-ping" />
                </div>
                <Target className="absolute -bottom-10 -right-10 h-64 w-64 text-slate-50 rotate-12 -z-0" />
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                {metrics.map(m => (
                    <div key={m.label} className="p-6 rounded-3xl bg-white border border-slate-100 shadow-sm group hover:border-primary/20 transition-all">
                        <div className="flex items-center justify-between mb-4">
                            <m.icon size={16} className="text-slate-300 group-hover:text-primary transition-colors" />
                            <span className="text-[10px] font-black text-foreground">{m.val}%</span>
                        </div>
                        <p className="text-[8px] font-black uppercase text-slate-400 tracking-widest">{m.label}</p>
                        <div className="h-1 w-full bg-slate-50 rounded-full mt-4 overflow-hidden">
                            <div
                                className="h-full bg-primary transition-all duration-1000 ease-out"
                                style={{ width: `${m.val}%` }}
                            />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
