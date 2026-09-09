'use client';

import * as React from 'react';
import { Card } from '@/components/ui/card';
import { Wine, Info, Sparkles } from 'lucide-react';
import {
    PolarGrid,
    PolarAngleAxis,
    Radar,
    RadarChart,
    ResponsiveContainer
} from 'recharts';

interface TasteDNAProps {
    dna: Record<string, number>;
}

export default function TasteDNA({ dna }: TasteDNAProps) {
    const data = React.useMemo(() => [
        { subject: 'Whiskey', A: dna.whiskey || 0, fullMark: 100 },
        { subject: 'Wine', A: dna.wine || 0, fullMark: 100 },
        { subject: 'Gin', A: dna.gin || 0, fullMark: 100 },
        { subject: 'Beer', A: dna.beer || 0, fullMark: 100 },
        { subject: 'Vodka', A: dna.vodka || 0, fullMark: 100 },
        { subject: 'Tequila', A: dna.tequila || 0, fullMark: 100 },
    ], [dna]);

    const dominantTrait = React.useMemo(() => {
        return [...data].sort((a,b) => b.A - a.A)[0];
    }, [data]);

    return (
        <Card className="p-10 rounded-[3.5rem] bg-white border border-slate-100 shadow-sm space-y-10 relative overflow-hidden group text-left">
            <div className="relative z-10 space-y-8">
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-inner transition-transform group-hover:scale-110 duration-500">
                            <Wine size={24} />
                        </div>
                        <div>
                            <h3 className="text-xl font-black uppercase tracking-tighter text-foreground leading-none">Taste DNA</h3>
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">Behavioral Flavor Profile</p>
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
                                name="Taste"
                                dataKey="A"
                                stroke="#F5A000"
                                fill="#F5A000"
                                fillOpacity={0.6}
                                animationDuration={1500}
                            />
                        </RadarChart>
                    </ResponsiveContainer>
                </div>

                <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 space-y-4">
                    <div className="flex items-center gap-3">
                        <Sparkles size={16} className="text-primary animate-pulse" />
                        <p className="text-[10px] font-black uppercase tracking-widest text-foreground">Discovery Intelligence</p>
                    </div>
                    <p className="text-xs font-bold text-slate-600 leading-relaxed italic">
                        &quot;Your affinity for <span className="text-primary uppercase">{dominantTrait.subject}</span> has reached {dominantTrait.A}%. Our cellar master recommends exploring our new vintage reserves.&quot;
                    </p>
                </div>
            </div>
            {/* Subtle background glow */}
            <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-primary/5 rounded-full blur-[80px] -z-0"></div>
        </Card>
    );
}
