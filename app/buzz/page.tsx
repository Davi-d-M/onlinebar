'use client';

import * as React from 'react';
import { supabase } from '@/lib/supabaseClient';
import {
    Flame,
    TrendingUp,
    Users,
    Zap,
    Wine,
    ChevronRight,
    MapPin,
    Smartphone,
    Globe
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import dynamic from 'next/dynamic';
import PulseDetailModal from '@/components/buzz/PulseDetailModal';

const LiveBuzzMap = dynamic(() => import('@/components/admin/dispatch/LiveDispatchMap'), {
    ssr: false,
    loading: () => <div className="h-full w-full bg-slate-100 animate-pulse rounded-[3.5rem]" />
});

interface BuzzArea {
    zone_name: string;
    buzz_score: number;
    buzz_status: 'BUZZING' | 'BUSY' | 'ACTIVE' | 'QUIET';
    active_visitors: number;
    active_orders: number;
}

export default function CityBuzzPage() {
    const [hotspots, setHotspots] = React.useState<BuzzArea[]>([]);
    const [selectedArea, setSelectedArea] = React.useState<BuzzArea | null>(null);
    const [isDetailOpen, setIsDetailOpen] = React.useState(false);

    const fetchBuzz = React.useCallback(async () => {
        if (!supabase) return;
        try {
            const { data } = await supabase.from('buzz_metrics').select('*').order('buzz_score', { ascending: false });
            if (data) {
                setHotspots(data as BuzzArea[]);
                if (!selectedArea) setSelectedArea(data[0]);
            }
        } catch (err) {
            console.error(err);
        }
    }, [selectedArea]);

    React.useEffect(() => {
        fetchBuzz();
    }, [fetchBuzz]);

    return (
        <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 text-left selection:bg-primary/20 pb-40">
            <div className="max-w-7xl mx-auto space-y-12">

                <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-slate-200 pb-10">
                    <div>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="h-10 w-10 rounded-xl bg-rose-50 flex items-center justify-center text-rose-500 animate-pulse shadow-sm border border-rose-100"><Flame size={20} fill="currentColor" /></div>
                            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-rose-500">City Pulse Engine</span>
                        </div>
                        <h1 className="text-4xl lg:text-6xl font-black text-foreground uppercase tracking-tighter leading-none">The <br /> <span className="text-primary italic">Buzz.</span></h1>
                        <p className="text-slate-500 text-lg font-medium mt-4 italic max-w-2xl leading-relaxed">
                            Nairobi is alive. Discover activity hotspots, trending selections, and what&apos;s popping in your sector right now.
                        </p>
                    </div>
                    <div className="bg-white p-5 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-6">
                        <div className="text-right">
                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Global Status</p>
                            <p className="text-xl font-black text-emerald-600 uppercase italic">Active</p>
                        </div>
                        <div className="h-10 w-px bg-slate-100" />
                        <div className="flex items-center gap-3">
                            <Users className="h-5 w-5 text-primary" />
                            <span className="text-lg font-black text-foreground">{hotspots.reduce((s, a) => s + a.active_visitors, 0)} Patrons Online</span>
                        </div>
                    </div>
                </header>

                <div className="grid lg:grid-cols-12 gap-10">

                    {/* LEFT: THE PULSE MAP */}
                    <div className="lg:col-span-8 space-y-8">
                        <Card className="h-[600px] rounded-[4rem] bg-white border border-slate-100 shadow-2xl relative overflow-hidden group">
                            <LiveBuzzMap riders={[]} />
                            <div className="absolute top-8 left-8 right-8 z-10 flex justify-between items-start pointer-events-none">
                                <div className="p-6 rounded-[2.5rem] bg-white/80 backdrop-blur-xl border border-white/20 shadow-2xl pointer-events-auto animate-in slide-in-from-top-4 duration-700">
                                    <h3 className="text-xs font-black uppercase tracking-[0.3em] text-primary mb-4 flex items-center gap-2">
                                        <div className="h-1.5 w-1.5 rounded-full bg-primary animate-ping" /> Live Heatmap
                                    </h3>
                                    <div className="space-y-3">
                                        {hotspots.slice(0, 3).map(area => (
                                            <div key={area.zone_name} className="flex items-center gap-4">
                                                <div className={cn(
                                                    "h-2 w-2 rounded-full",
                                                    area.buzz_status === 'BUZZING' ? "bg-rose-500 animate-pulse" : "bg-primary"
                                                )} />
                                                <span className="text-[10px] font-black uppercase text-foreground">{area.zone_name}</span>
                                                <span className="text-[9px] font-bold text-slate-400 ml-auto">{area.buzz_score}%</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="bg-slate-900 text-white px-6 py-3 rounded-full text-[9px] font-black uppercase tracking-widest shadow-2xl pointer-events-auto">
                                    Nairobi Central Hub
                                </div>
                            </div>

                            {/* Privacy Shield Disclaimer */}
                            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 w-full max-w-sm">
                                <div className="bg-white/80 backdrop-blur-md p-4 rounded-2xl border border-white/20 text-center shadow-xl">
                                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-relaxed">
                                        🛡️ Privacy Safe: Locations are aggregated and anonymized. Individual patron telemetry is never exposed.
                                    </p>
                                </div>
                            </div>
                        </Card>

                        <div className="grid sm:grid-cols-2 gap-6">
                             <Card className="p-10 rounded-[3rem] bg-white border border-slate-100 shadow-sm space-y-6 text-left group hover:border-primary/20 transition-all">
                                <div className="flex items-center gap-4">
                                    <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-inner transition-transform group-hover:scale-110"><Smartphone size={24} /></div>
                                    <h3 className="text-xl font-black uppercase text-foreground">Mobile Velocity</h3>
                                </div>
                                <p className="text-[10px] text-slate-500 font-medium italic leading-relaxed">
                                    &quot;Real-time mobile density detection active. Monitoring mission volume across all sectors.&quot;
                                </p>
                             </Card>
                             <Card className="p-10 rounded-[3rem] bg-white border border-slate-100 shadow-sm space-y-6 text-left group hover:border-indigo-100 transition-all">
                                <div className="flex items-center gap-4">
                                    <div className="h-12 w-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 shadow-sm transition-transform group-hover:scale-110"><TrendingUp size={24} /></div>
                                    <h3 className="text-xl font-black uppercase text-foreground">Trending Selections</h3>
                                </div>
                                <div className="space-y-3">
                                    {['Awaiting Data', 'Scanning Grid', 'Calibrating...'].map(cat => (
                                        <div key={cat} className="flex justify-between items-center text-[9px] font-black uppercase text-slate-400">
                                            <span>{cat}</span>
                                            <span className="text-indigo-600">--%</span>
                                        </div>
                                    ))}
                                </div>
                             </Card>
                        </div>
                    </div>

                    {/* RIGHT: SECTOR INTELLIGENCE */}
                    <div className="lg:col-span-4 space-y-8">
                        <section className="space-y-6">
                            <h2 className="text-xl font-black uppercase tracking-tighter text-foreground px-4">Sectors Active</h2>
                            <div className="space-y-4">
                                {hotspots.map(area => (
                                    <Card
                                        key={area.zone_name}
                                        onClick={() => setSelectedArea(area)}
                                        className={cn(
                                            "p-8 rounded-[3rem] border-2 cursor-pointer transition-all relative overflow-hidden group",
                                            selectedArea?.zone_name === area.zone_name ? "bg-white border-primary shadow-2xl" : "bg-slate-50 border-transparent hover:border-slate-200"
                                        )}
                                    >
                                        <div className="relative z-10 flex justify-between items-center">
                                            <div className="space-y-1">
                                                <h4 className="text-lg font-black uppercase tracking-tighter text-foreground">{area.zone_name}</h4>
                                                <p className={cn(
                                                    "text-[9px] font-black uppercase tracking-widest",
                                                    area.buzz_status === 'BUZZING' ? "text-rose-500" : "text-slate-400"
                                                )}>{area.buzz_status}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-2xl font-black text-foreground tabular-nums">{area.buzz_score}</p>
                                                <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">BUZZ_SCORE™</p>
                                            </div>
                                        </div>
                                        <div className="mt-6 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                                            <div
                                                className={cn(
                                                    "h-full transition-all duration-1000",
                                                    area.buzz_status === 'BUZZING' ? "bg-rose-500" : "bg-primary"
                                                )}
                                                style={{ width: `${area.buzz_score}%` }}
                                            />
                                        </div>
                                        {selectedArea?.zone_name === area.zone_name && (
                                            <Zap className="absolute -bottom-4 -right-4 h-24 w-24 text-primary/5 rotate-12" />
                                        )}
                                    </Card>
                                ))}
                            </div>
                        </section>

                        {/* SECTOR DEEP-DIVE */}
                        {selectedArea && (
                            <Card className="p-10 rounded-[3.5rem] bg-slate-900 text-white space-y-10 relative overflow-hidden shadow-2xl animate-in zoom-in-95 duration-500">
                                <div className="relative z-10 space-y-8 text-left">
                                    <div className="flex items-center gap-4">
                                        <div className="h-12 w-12 rounded-2xl bg-white/10 flex items-center justify-center backdrop-blur-md border border-white/20"><MapPin size={24} className="text-primary" /></div>
                                        <div>
                                            <h3 className="text-2xl font-black uppercase tracking-tighter">{selectedArea.zone_name} Insights</h3>
                                            <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Sector Intelligence Log</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="space-y-1">
                                            <p className="text-[8px] font-black uppercase text-slate-500">Active Patrons</p>
                                            <p className="text-2xl font-black">{selectedArea.active_visitors}+</p>
                                        </div>
                                        <div className="space-y-1 text-right">
                                            <p className="text-[8px] font-black uppercase text-slate-500">Orders Dispatched</p>
                                            <p className="text-2xl font-black">{selectedArea.active_orders}</p>
                                        </div>
                                    </div>

                                    <div className="p-6 bg-white/5 rounded-3xl border border-white/10 space-y-4 text-left">
                                        <p className="text-[10px] font-black uppercase text-primary tracking-widest">Sector Top Selection</p>
                                        <div className="flex items-center gap-4 text-left opacity-30">
                                            <div className="h-12 w-12 rounded-xl bg-white flex items-center justify-center text-slate-900"><Wine size={24} /></div>
                                            <div className="min-w-0 flex-1 text-left">
                                                <p className="text-xs font-black uppercase truncate italic">Awaiting Sector Sales</p>
                                                <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-1">{selectedArea.active_visitors} active sessions in sector</p>
                                            </div>
                                        </div>
                                    </div>

                                    <Button
                                        onClick={() => setIsDetailOpen(true)}
                                        className="w-full h-16 rounded-2xl bg-primary text-white font-black uppercase text-xs tracking-widest shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all"
                                    >
                                        Explore Sector Insights <ChevronRight className="ml-2 h-4 w-4" />
                                    </Button>
                                </div>
                                <Globe className="absolute -bottom-20 -right-20 h-96 w-96 text-white/5 rotate-12" />
                            </Card>
                        )}
                    </div>
                </div>

            </div>

            {isDetailOpen && selectedArea && (
                <PulseDetailModal
                    areaName={selectedArea.zone_name}
                    onClose={() => setIsDetailOpen(false)}
                />
            )}
        </div>
    );
}
