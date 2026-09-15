'use client';

import * as React from 'react';
import { supabase } from '@/lib/supabaseClient';
import {
    Calendar as CalendarIcon,
    ChevronLeft,
    ChevronRight,
    Clock,
    Loader2,
    Zap,
    Filter,
    Camera as Instagram,
    MessageCircle,
    Music,
    Plus,
    Bot
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export default function GrowthCalendar() {
    const [loading, setLoading] = React.useState(true);
    const [view, setView] = React.useState<'grid' | 'list'>('grid');
    const [scheduledItems, setScheduledItems] = React.useState<Array<{ id: string, title: string, time: string, day: number, platform: string, status: string }>>([]);
    const [syncing, setSyncing] = React.useState(false);

    const fetchCalendar = React.useCallback(async () => {
        if (!supabase) return;
        setLoading(true);
        try {
            const { data } = await supabase
                .from('publishing_queue')
                .select(`
                    *,
                    content_master!inner(title)
                `)
                .order('scheduled_at', { ascending: true });

            if (data) {
                const formatted = data.map(item => ({
                    id: item.id,
                    title: item.content_master.title,
                    time: new Date(item.scheduled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    day: new Date(item.scheduled_at).getDate(),
                    platform: item.platform || 'Social',
                    status: item.status
                }));
                setScheduledItems(formatted);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, []);

    const handleManualPublish = async (id: string) => {
        if (!supabase) return;
        setLoading(true);
        try {
            const { error } = await supabase.from('publishing_queue').update({ status: 'SCHEDULED', scheduled_at: new Date().toISOString() }).eq('id', id);
            if (!error) {
                alert("Publication override initiated.");
                fetchCalendar();
            }
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    React.useEffect(() => {
        fetchCalendar();
    }, [fetchCalendar]);

    const days = Array.from({ length: 30 }, (_, i) => i + 1);

    return (
        <div className="p-8 space-y-10 bg-slate-50 min-h-screen text-left selection:bg-primary/20 pb-40">
            <header className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 border-b border-slate-200 pb-8">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <CalendarIcon className="h-4 w-4 text-primary" />
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Strategic Timeline</span>
                    </div>
                    <h1 className="text-4xl font-black text-foreground uppercase tracking-tighter leading-none">Content Calendar</h1>
                    <p className="text-muted-foreground text-sm font-medium mt-1">Global visualization of scheduled brand deployments.</p>
                </div>
                <div className="flex gap-4">
                    <Button
                        onClick={async () => {
                            setSyncing(true);
                            // Simulated server call to Autopilot.generateUpcomingDrafts()
                            setTimeout(() => {
                                setSyncing(false);
                                alert("Neural Autopilot finished slot generation. Check timeline.");
                                fetchCalendar();
                            }, 2000);
                        }}
                        variant="outline"
                        className="h-10 px-4 rounded-xl border-primary/20 bg-primary/5 text-primary font-black uppercase text-[8px] tracking-widest"
                    >
                        {syncing ? <Loader2 className="animate-spin" /> : <><Bot size={14} className="mr-2" /> Run Autopilot</>}
                    </Button>
                    <div className="flex gap-2 p-1 bg-white rounded-xl border border-slate-100 shadow-sm">
                        <button onClick={() => setView('grid')} className={cn("px-4 py-2 rounded-lg text-[9px] font-black uppercase transition-all", view === 'grid' ? "bg-primary text-white" : "text-slate-400 hover:text-slate-600")}>Grid View</button>
                        <button onClick={() => setView('list')} className={cn("px-4 py-2 rounded-lg text-[9px] font-black uppercase transition-all", view === 'list' ? "bg-primary text-white" : "text-slate-400 hover:text-slate-600")}>List Flow</button>
                    </div>
                </div>
            </header>

            <div className="grid lg:grid-cols-12 gap-10">

                <div className="lg:col-span-9 space-y-8">
                    {loading && scheduledItems.length === 0 ? (
                        <div className="h-[600px] flex flex-col items-center justify-center gap-4 bg-white rounded-[3rem] border border-slate-100 shadow-sm animate-pulse">
                            <Loader2 className="h-10 w-10 text-primary animate-spin" />
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-300">Synchronizing Timeline...</p>
                        </div>
                    ) : (
                        <div className="bg-white rounded-[3rem] border border-slate-100 p-10 shadow-sm space-y-10">
                            <div className="flex justify-between items-center px-4">
                                <h2 className="text-2xl font-black uppercase tracking-tighter">September 2026</h2>
                                <div className="flex items-center gap-2">
                                    <button className="h-10 w-10 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center hover:bg-white transition-all shadow-sm"><ChevronLeft size={18} /></button>
                                    <button className="h-10 w-10 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center hover:bg-white transition-all shadow-sm"><ChevronRight size={18} /></button>
                                </div>
                            </div>

                            <div className="grid grid-cols-7 gap-4">
                                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => (
                                    <div key={d} className="text-center py-4 border-b border-slate-50">
                                        <span className="text-[9px] font-black uppercase text-slate-300 tracking-widest">{d}</span>
                                    </div>
                                ))}
                                {days.map(d => {
                                    const items = scheduledItems.filter(i => i.day === d);
                                    return (
                                        <div key={d} className={cn(
                                            "min-h-[120px] p-4 rounded-3xl border transition-all flex flex-col gap-2 relative group",
                                            items.length > 0 ? "bg-white border-slate-100 shadow-sm" : "bg-slate-50/50 border-transparent hover:border-slate-100"
                                        )}>
                                            <span className="text-[10px] font-black text-slate-400">{d}</span>
                                            <div className="space-y-1.5 overflow-y-auto max-h-[80px] no-scrollbar">
                                                {items.map(i => (
                                                    <div
                                                        key={i.id}
                                                        onClick={() => handleManualPublish(i.id)}
                                                        className={cn(
                                                            "px-2 py-1.5 rounded-lg text-[7px] font-black uppercase truncate border cursor-pointer hover:scale-105 transition-transform",
                                                            i.status === 'SCHEDULED' ? "bg-primary/5 text-primary border-primary/20" :
                                                            i.status === 'PENDING_REVIEW' ? "bg-amber-50 text-amber-600 border-amber-200" :
                                                            i.status === 'SUCCESS' ? "bg-emerald-50 text-emerald-600 border-emerald-200" :
                                                            "bg-rose-50 text-rose-600 border-rose-200"
                                                        )}
                                                    >
                                                        {i.title}
                                                    </div>
                                                ))}
                                            </div>
                                            <button className="absolute bottom-2 right-2 h-6 w-6 rounded-lg bg-slate-100 text-slate-400 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center hover:bg-primary hover:text-white">
                                                <Plus size={14} />
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>

                <div className="lg:col-span-3 space-y-8">
                    <Card className="p-8 rounded-[3rem] bg-white border border-slate-100 shadow-sm space-y-8 relative overflow-hidden group hover:border-primary/20 transition-all">
                        <div className="relative z-10 space-y-6 text-left">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">Queue Performance</h3>
                            <div className="space-y-6">
                                {[
                                    { label: 'Pending Review', val: scheduledItems.filter(i => i.status === 'PENDING_REVIEW').length, icon: Clock, color: 'text-amber-500' },
                                    { label: 'Scheduled', val: scheduledItems.filter(i => i.status === 'SCHEDULED').length, icon: CalendarIcon, color: 'text-primary' },
                                    { label: 'Deployed', val: scheduledItems.filter(i => i.status === 'SUCCESS').length, icon: Zap, color: 'text-emerald-500' },
                                ].map(s => (
                                    <div key={s.label} className="flex justify-between items-center">
                                        <div className="flex items-center gap-3">
                                            <s.icon size={14} className={s.color} />
                                            <span className="text-[10px] font-black uppercase text-slate-400">{s.label}</span>
                                        </div>
                                        <span className="text-xl font-black text-foreground">{s.val}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <Zap className="absolute -bottom-10 -left-10 h-48 w-48 text-primary/5 rotate-12" />
                    </Card>

                    <div className="p-8 rounded-[3rem] bg-white border border-slate-100 shadow-sm space-y-6 text-left">
                        <div className="flex items-center gap-3 text-indigo-600">
                            <Filter size={18} />
                            <h4 className="text-lg font-black uppercase tracking-tighter">Channel Filter</h4>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {[
                                { id: 'ig', label: 'Instagram', icon: Instagram },
                                { id: 'wa', label: 'WhatsApp', icon: MessageCircle },
                                { id: 'tt', label: 'TikTok', icon: Music },
                            ].map(ch => (
                                <button key={ch.id} className="px-4 py-2 rounded-xl bg-slate-50 border border-slate-100 text-[8px] font-black uppercase tracking-widest text-slate-400 hover:border-primary hover:text-primary transition-all flex items-center gap-2">
                                    <ch.icon size={12} /> {ch.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
