'use client';

import * as React from 'react';
import {
    Activity,
    RefreshCcw,
    ChevronLeft,
    Flame,
    Users,
    Monitor,
    Smartphone
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';

// Components
import LiveActionFeed from '@/components/admin/behavior/LiveActionFeed';

interface LiveUserRadar {
    session_id: string;
    customer_name?: string;
    total_active_time_sec: number;
    current_url: string;
    last_action: string;
    last_signal_at: string;
    user_agent: string;
}

interface LiveForensicEvent {
    id: string;
    session_id: string;
    action_type: string;
    page_url: string;
    timestamp: string;
    metadata: Record<string, unknown>;
    customer_name?: string;
}

export default function LiveRadarPage() {
    const router = useRouter();
    const [loading, setLoading] = React.useState(true);
    const [liveUsers, setLiveUsers] = React.useState<LiveUserRadar[]>([]);
    const [liveEvents, setLiveEvents] = React.useState<LiveForensicEvent[]>([]);

    const fetchData = React.useCallback(async () => {
        if (!supabase) return;
        setLoading(true);
        try {
            // 1. Fetch current active sessions
            const { data: users } = await supabase.from('live_behavior_radar').select('*').limit(20);

            // 2. Fetch last 50 events for the live feed
            const { data: events } = await supabase
                .from('session_forensics')
                .select(`
                    id,
                    session_id,
                    action_type,
                    page_url,
                    timestamp,
                    metadata,
                    customer_sessions(user_id, profiles(full_name))
                `)
                .order('timestamp', { ascending: false })
                .limit(30);

            if (users) setLiveUsers(users);
            if (events) {
                setLiveEvents(events.map(e => ({
                    id: e.id,
                    session_id: e.session_id,
                    action_type: e.action_type,
                    page_url: e.page_url,
                    timestamp: e.timestamp,
                    metadata: e.metadata as Record<string, unknown>,
                    customer_name: (e as unknown as { customer_sessions: { profiles: { full_name: string } } }).customer_sessions?.profiles?.full_name
                })));
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, []);

    React.useEffect(() => {
        fetchData();
        // Subscribe to real-time forensics
        const channel = supabase?.channel('live_forensics')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'session_forensics' }, () => {
                // Fetch the customer info for the new event
                fetchData();
            })
            .subscribe();

        return () => {
            if (channel) supabase?.removeChannel(channel);
        };
    }, [fetchData]);

    return (
        <div className="p-8 space-y-10 bg-slate-50 min-h-screen text-left pb-40 selection:bg-primary/20">

            {/* LIVE HEADER */}
            <header className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 border-b border-slate-200 pb-10">
                <div className="flex items-center gap-6">
                    <button onClick={() => router.back()} className="h-12 w-12 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-slate-300 hover:text-primary transition-all shadow-sm">
                        <ChevronLeft size={24} />
                    </button>
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <Flame className="h-4 w-4 text-primary animate-pulse" />
                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary italic text-left">Real-Time Interaction Radar</span>
                        </div>
                        <h1 className="text-4xl lg:text-5xl font-black text-foreground uppercase tracking-tighter leading-none italic">
                            Live <span className="text-primary">Activity.</span>
                        </h1>
                    </div>
                </div>
                <div className="flex gap-4">
                    <div className="bg-white px-6 py-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
                        <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-xs font-black text-foreground uppercase tracking-widest">{liveUsers.length} Active Patrons</span>
                    </div>
                    <Button onClick={fetchData} variant="outline" className="rounded-xl h-14 w-14 p-0 border-slate-200 bg-white font-black uppercase hover:bg-slate-50 transition-all">
                        <RefreshCcw className={cn("h-4 w-4", loading && "animate-spin")} />
                    </Button>
                </div>
            </header>

            <div className="grid xl:grid-cols-12 gap-10">

                {/* LEFT: LIVE FEED */}
                <div className="xl:col-span-7 space-y-8">
                    <div className="flex items-center justify-between px-4">
                        <h2 className="text-2xl font-black uppercase tracking-tighter italic">Interaction Stream</h2>
                        <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest italic">Live Signal Uplink</span>
                    </div>

                    <div className="space-y-4">
                        <LiveActionFeed events={liveEvents} />
                    </div>
                </div>

                {/* RIGHT: ACTIVE PATRON LIST */}
                <div className="xl:col-span-5 space-y-8">
                     <div className="flex items-center justify-between px-4">
                        <h2 className="text-2xl font-black uppercase tracking-tighter italic">Active Terminals</h2>
                    </div>

                    <Card className="rounded-[3.5rem] bg-white border border-slate-100 shadow-sm overflow-hidden flex flex-col h-[700px] sticky top-8">
                        <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50 text-foreground">
                            <div>
                                <h2 className="text-xl font-black uppercase tracking-tighter leading-none">Session Radar</h2>
                                <p className="text-[9px] font-black text-primary uppercase tracking-widest mt-2">Pillar 8: High Fidelity Forensics</p>
                            </div>
                            <Users size={20} className="text-primary animate-pulse" />
                        </div>
                        <div className="flex-1 overflow-y-auto divide-y divide-slate-50 no-scrollbar">
                            {liveUsers.map(user => {
                                const isMobile = user.user_agent?.toLowerCase().includes('mobile');
                                return (
                                    <div key={user.session_id} className="p-6 flex items-center justify-between hover:bg-slate-50 transition-all group cursor-pointer">
                                        <div className="flex items-center gap-5 min-w-0">
                                            <div className="h-12 w-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-300 border border-slate-100 shrink-0 group-hover:text-primary transition-colors">
                                                {isMobile ? <Smartphone size={20} /> : <Monitor size={20} />}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-xs font-black uppercase text-foreground truncate">{user.customer_name || 'Anonymous'}</p>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className="text-[8px] font-black text-primary uppercase">{user.total_active_time_sec}s Active</span>
                                                    <div className="h-1 w-1 rounded-full bg-slate-200" />
                                                    <span className="text-[8px] font-bold text-slate-400 uppercase truncate max-w-[120px]">{user.current_url}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                             <div className="px-2 py-1 rounded bg-indigo-50 text-indigo-600 text-[8px] font-black uppercase border border-indigo-100 mb-1">
                                                {user.last_action || 'IDLE'}
                                             </div>
                                             <p className="text-[7px] font-black text-slate-300 uppercase italic">Signal: {new Date(user.last_signal_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                        </div>
                                    </div>
                                );
                            })}
                            {liveUsers.length === 0 && (
                                <div className="py-40 text-center opacity-20 flex flex-col items-center gap-4">
                                    <Activity size={48} className="animate-pulse" />
                                    <p className="text-[10px] font-black uppercase tracking-widest">Awaiting Active Nodes...</p>
                                </div>
                            )}
                        </div>
                    </Card>
                </div>

            </div>

        </div>
    );
}
