'use client';

import * as React from 'react';
import {
    Activity,
    RefreshCcw,
    ChevronRight,
    MousePointer2,
    ShieldCheck,
    Zap,
    Layout,
    Globe,
    Search,
    Flame,
    Users
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabaseClient';
import Link from 'next/link';

// Components
import BehaviorPulse from '@/components/admin/behavior/BehaviorPulse';

interface TopScreen {
    page_url: string;
    view_count: number;
    avg_time: number;
}

interface TopComponent {
    component_id: string;
    component_label: string;
    interaction_count: number;
}

export default function BehaviorOverview() {
    const [loading, setLoading] = React.useState(true);
    const [stats, setStats] = React.useState({
        liveUsers: 0,
        eventsToday: 0,
        avgEngagedTime: '00:00',
        cartRate: 0
    });
    const [topScreens, setTopScreens] = React.useState<TopScreen[]>([]);
    const [topComponents, setTopComponents] = React.useState<TopComponent[]>([]);

    const fetchData = React.useCallback(async () => {
        if (!supabase) return;
        setLoading(true);
        try {
            // 1. Live Users (Updated in last 5 mins)
            const { count: liveCount } = await supabase
                .from('customer_sessions')
                .select('*', { count: 'exact', head: true })
                .gt('updated_at', new Date(Date.now() - 300000).toISOString());

            // 2. Events Today
            const today = new Date();
            today.setHours(0,0,0,0);
            const { count: eventCount } = await supabase
                .from('analytics_events')
                .select('*', { count: 'exact', head: true })
                .gt('timestamp', today.toISOString());

            // 3. Conversion Stats
            const { data: funnelData } = await supabase.from('behavioral_funnel_stats').select('*').single();

            // 4. Top Screens (Simulated/Calculated)
            const { data: screens } = await supabase.rpc('get_top_pages', { limit_count: 5 });

            // 5. Component Interaction
            const { data: components } = await supabase.from('component_interaction_audit').select('*').limit(5);

            setStats({
                liveUsers: liveCount || 0,
                eventsToday: eventCount || 0,
                avgEngagedTime: '03:42', // Simulated
                cartRate: funnelData ? Math.round((funnelData.desire / funnelData.total_visitors) * 100) : 0
            });

            if (screens) setTopScreens(screens);
            if (components) setTopComponents(components);

        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, []);

    React.useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 30000);
        return () => clearInterval(interval);
    }, [fetchData]);

    return (
        <div className="p-8 space-y-10 bg-slate-50 min-h-screen text-left pb-40 selection:bg-primary/20">

            {/* BEHAVIOR HEADER */}
            <header className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 border-b border-slate-200 pb-10">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <Activity className="h-4 w-4 text-primary" />
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary italic text-left">Behavioral OS Terminal</span>
                    </div>
                    <h1 className="text-4xl lg:text-5xl font-black text-foreground uppercase tracking-tighter leading-none italic">
                        Apex Behavior <span className="text-primary">Intelligence.</span>
                    </h1>
                    <p className="text-muted-foreground text-sm font-medium mt-1 italic">Decrypting the first-party journey through high-fidelity forensics.</p>
                </div>
                <div className="flex gap-4">
                    <Button onClick={fetchData} variant="outline" className="rounded-xl h-14 px-6 border-slate-200 bg-white font-black uppercase text-[10px] tracking-widest hover:bg-slate-50 transition-all">
                        <RefreshCcw className={cn("h-4 w-4 mr-2", loading && "animate-spin")} /> Re-Sync Signals
                    </Button>
                </div>
            </header>

            <BehaviorPulse stats={stats} />

            <div className="grid xl:grid-cols-12 gap-10">

                {/* LEFT: WORKSPACE NODES */}
                <div className="xl:col-span-8 space-y-10">

                    {/* NAVIGATION MATRIX */}
                    <div className="grid sm:grid-cols-3 gap-6">
                        {[
                            { label: 'Live Radar', icon: Flame, href: '/admin/behavior/live', color: 'bg-primary' },
                            { label: 'Session Forensics', icon: ShieldCheck, href: '/admin/behavior/sessions', color: 'bg-indigo-600' },
                            { label: 'Conversion Funnels', icon: Zap, href: '/admin/behavior/funnels', color: 'bg-emerald-600' },
                        ].map(node => (
                            <Link key={node.label} href={node.href}>
                                <Card className="p-8 rounded-[3rem] bg-white border border-slate-100 shadow-sm hover:shadow-2xl transition-all group overflow-hidden relative">
                                    <div className="relative z-10 space-y-6">
                                        <div className={cn("h-12 w-12 rounded-2xl flex items-center justify-center text-white shadow-xl", node.color)}>
                                            <node.icon size={24} />
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <h3 className="text-xl font-black text-foreground uppercase tracking-tighter italic">{node.label}</h3>
                                            <ChevronRight className="h-5 w-5 text-slate-300 group-hover:text-primary transition-colors" />
                                        </div>
                                    </div>
                                    <node.icon className="absolute -bottom-4 -right-4 h-24 w-24 text-slate-50 rotate-12 -z-0" />
                                </Card>
                            </Link>
                        ))}
                    </div>

                    {/* TOP SCREENS */}
                    <Card className="p-10 rounded-[4rem] bg-white border border-slate-100 shadow-sm space-y-10">
                        <div className="flex items-center justify-between border-l-4 border-primary pl-6">
                            <div>
                                <h2 className="text-2xl font-black uppercase tracking-tight text-foreground leading-none">Screen Intelligence</h2>
                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-2">Active Content Reach</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            {topScreens.length === 0 ? (
                                <div className="py-20 text-center opacity-30 flex flex-col items-center gap-4">
                                    <Layout size={48} />
                                    <p className="text-[10px] font-black uppercase tracking-widest">Awaiting Navigational Signals...</p>
                                </div>
                            ) : topScreens.map((screen, idx) => (
                                <div key={idx} className="p-6 rounded-[2rem] bg-slate-50 border border-slate-100 flex items-center justify-between group hover:bg-white hover:shadow-xl transition-all">
                                    <div className="flex items-center gap-6 flex-1 min-w-0">
                                        <div className="h-12 w-12 rounded-2xl bg-white flex items-center justify-center text-slate-300 border border-slate-100 shrink-0">
                                            <Globe size={20} />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <h4 className="text-sm font-black text-foreground uppercase tracking-tight truncate italic">{screen.page_url}</h4>
                                            <div className="flex items-center gap-3 mt-1">
                                                <span className="text-[10px] font-black text-primary">{screen.view_count} Views</span>
                                                <div className="h-1 w-1 rounded-full bg-slate-200" />
                                                <span className="text-[10px] font-bold text-slate-400 uppercase">{screen.avg_time}s Avg Dwell</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="w-48 h-2 bg-slate-200 rounded-full overflow-hidden hidden sm:block">
                                        <div className="h-full bg-primary" style={{ width: `${(screen.view_count / topScreens[0].view_count) * 100}%` }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>

                </div>

                {/* RIGHT: COMPONENT AUDIT */}
                <div className="xl:col-span-4 space-y-10">

                    <Card className="p-10 rounded-[4rem] bg-white border border-slate-100 shadow-sm space-y-10 relative overflow-hidden">
                        <div className="relative z-10 space-y-8">
                             <div className="space-y-2">
                                <div className="flex items-center gap-3">
                                    <MousePointer2 className="h-4 w-4 text-primary" />
                                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary italic">Interaction Audit</span>
                                </div>
                                <h3 className="text-2xl font-black uppercase tracking-tight text-foreground leading-none italic">Top Components</h3>
                             </div>

                             <div className="space-y-4">
                                {topComponents.map((comp, idx) => (
                                    <div key={idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:bg-white transition-all">
                                        <div className="flex justify-between items-start mb-2">
                                            <p className="text-[9px] font-black uppercase text-primary tracking-widest">{comp.component_id}</p>
                                            <span className="text-[10px] font-black text-foreground">{comp.interaction_count} Clicks</span>
                                        </div>
                                        <p className="text-xs font-bold text-slate-500 truncate">&quot;{comp.component_label}&quot;</p>
                                    </div>
                                ))}
                                {topComponents.length === 0 && <p className="py-10 text-center text-[10px] font-black uppercase text-slate-500 tracking-widest">Awaiting Component Engagement...</p>}
                             </div>
                        </div>
                        <Users className="absolute -bottom-10 -left-10 h-64 w-64 text-slate-50 rotate-12 -z-0" />
                    </Card>

                    {/* FRICTION MONITOR */}
                    <Card className="p-10 rounded-[4rem] bg-white border border-slate-100 shadow-sm space-y-8 text-left">
                        <h3 className="text-xs font-black uppercase text-slate-400 tracking-[0.4em]">Friction Radar</h3>
                        <div className="space-y-6">
                            <div className="flex items-start gap-4 p-5 rounded-2xl bg-rose-50 border border-rose-100 text-rose-700">
                                <Flame size={20} className="shrink-0 mt-1" />
                                <div>
                                    <p className="text-[10px] font-black uppercase mb-1">Rage Click Alert</p>
                                    <p className="text-[9px] font-medium leading-relaxed uppercase tracking-tight">Detected 14 rage clicks on &quot;checkout.pay_now&quot; button in the last hour.</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4 p-5 rounded-2xl bg-amber-50 border border-amber-100 text-amber-700">
                                <Search size={20} className="shrink-0 mt-1" />
                                <div>
                                    <p className="text-[10px] font-black uppercase mb-1">Zero Results Surge</p>
                                    <p className="text-[9px] font-medium leading-relaxed uppercase tracking-tight">38 searches for &quot;ice&quot; returned zero results. Catalogue expansion recommended.</p>
                                </div>
                            </div>
                        </div>
                    </Card>

                </div>

            </div>

        </div>
    );
}
