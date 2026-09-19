'use client';

import * as React from 'react';
import {
    Activity,
    Clock,
    ArrowUpRight,
    Zap,
    Layout,
    MousePointer2
} from 'lucide-react';
import { Card } from '@/components/ui/card';

interface BehaviorPulseProps {
    stats: {
        liveUsers: number;
        eventsToday: number;
        avgEngagedTime: string;
        cartRate: number;
    }
}

export default function BehaviorPulse({ stats }: BehaviorPulseProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

            {/* LIVE PULSE */}
            <Card className="p-8 rounded-[3rem] bg-white border border-slate-100 shadow-sm relative overflow-hidden group">
                <div className="relative z-10 space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="h-10 w-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-500 shadow-inner group-hover:scale-110 transition-transform">
                            <Activity size={20} className="animate-pulse" />
                        </div>
                        <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">Live Radar</span>
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Active Patrons</p>
                        <h3 className="text-4xl font-black text-foreground uppercase tracking-tighter">{stats.liveUsers}</h3>
                    </div>
                </div>
                <Activity className="absolute -bottom-4 -right-4 h-24 w-24 text-emerald-500/5 rotate-12 -z-0" />
            </Card>

            {/* TRAFFIC VOLUME */}
            <Card className="p-8 rounded-[3rem] bg-white border border-slate-100 shadow-sm relative overflow-hidden group">
                <div className="relative z-10 space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="h-10 w-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-500 shadow-inner group-hover:scale-110 transition-transform">
                            <Zap size={20} />
                        </div>
                        <div className="flex items-center gap-1 text-emerald-500 text-[10px] font-black uppercase">
                            <ArrowUpRight size={12} /> 12%
                        </div>
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Events Today</p>
                        <h3 className="text-4xl font-black text-foreground uppercase tracking-tighter">{(stats.eventsToday / 1000).toFixed(1)}k</h3>
                    </div>
                </div>
                <Zap className="absolute -bottom-4 -right-4 h-24 w-24 text-indigo-500/5 rotate-12 -z-0" />
            </Card>

            {/* ENGAGEMENT CLOCK */}
            <Card className="p-8 rounded-[3rem] bg-white border border-slate-100 shadow-sm relative overflow-hidden group">
                <div className="relative z-10 space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="h-10 w-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-500 shadow-inner group-hover:scale-110 transition-transform">
                            <Clock size={20} />
                        </div>
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Engaged Time</p>
                        <h3 className="text-4xl font-black text-foreground uppercase tracking-tighter">{stats.avgEngagedTime}</h3>
                    </div>
                </div>
                <Clock className="absolute -bottom-4 -right-4 h-24 w-24 text-amber-500/5 rotate-12 -z-0" />
            </Card>

            {/* CONVERSION RATE */}
            <Card className="p-8 rounded-[3rem] bg-white border border-slate-100 shadow-sm relative overflow-hidden group">
                <div className="relative z-10 space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-sm group-hover:scale-110 transition-transform"><MousePointer2 size={20} /></div>
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Add to Bag Rate</p>
                        <h3 className="text-4xl font-black text-foreground uppercase tracking-tighter">{stats.cartRate}%</h3>
                    </div>
                </div>
                <Layout className="absolute -bottom-4 -right-4 h-24 w-24 text-slate-50 rotate-12 -z-0" />
            </Card>

        </div>
    );
}
