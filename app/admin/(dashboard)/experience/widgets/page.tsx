'use client';

import * as React from 'react';
import { supabase } from '@/lib/supabaseClient';
import {
    Layout,
    Plus,
    Trash2,
    MoreHorizontal,
    Eye,
    ShieldAlert,
    ChevronUp,
    ChevronDown,
    Settings2,
    CheckCircle2,
    Loader2,
    Zap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { useAdmin } from '@/context/AdminContext';
import { logAuditAction } from '@/lib/auditService';

interface Widget {
    id: string;
    widget_key: string;
    label: string;
    status: string;
    rank: number;
    page_route: string;
    config: Record<string, unknown>;
}

export default function WidgetManager() {
    const { email } = useAdmin();
    const [widgets, setWidgets] = React.useState<Widget[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [message, setMessage] = React.useState<{ type: 'success' | 'error', text: string } | null>(null);

    const fetchWidgets = React.useCallback(async () => {
        if (!supabase) return;
        setLoading(true);
        try {
            const { data } = await supabase.from('system_widgets').select('*').order('rank', { ascending: true });
            if (data) setWidgets(data as Widget[]);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, []);

    React.useEffect(() => {
        fetchWidgets();
    }, [fetchWidgets]);

    const toggleStatus = async (id: string, current: string) => {
        if (!supabase) return;
        const next = current === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
        try {
            const { error } = await supabase.from('system_widgets').update({ status: next }).eq('id', id);
            if (!error) {
                setWidgets(prev => prev.map(w => w.id === id ? { ...w, status: next } : w));
                await logAuditAction(email, 'TOGGLE_WIDGET_STATUS', { id, status: next });
            }
        } catch (err) { console.error(err); }
    };

    const handleDeleteWidget = async (id: string, label: string) => {
        if (!supabase || !confirm(`Permanently expel node "${label}"?`)) return;
        try {
            const { error } = await supabase.from('system_widgets').delete().eq('id', id);
            if (error) throw error;
            setWidgets(prev => prev.filter(w => w.id !== id));
            await logAuditAction(email, 'DELETE_WIDGET', { id, label });
            setMessage({ type: 'success', text: `Node "${label}" successfully expelled.` });
            setTimeout(() => setMessage(null), 3000);
        } catch (err) {
            console.error(err);
            setMessage({ type: 'error', text: "Expulsion Protocol Failed." });
        }
    };

    const updateRank = async (id: string, direction: 'UP' | 'DOWN') => {
        if (!supabase) return;
        const index = widgets.findIndex(w => w.id === id);
        if (direction === 'UP' && index === 0) return;
        if (direction === 'DOWN' && index === widgets.length - 1) return;

        const neighborIndex = direction === 'UP' ? index - 1 : index + 1;
        const neighbor = widgets[neighborIndex];
        const current = widgets[index];

        try {
            await Promise.all([
                supabase.from('system_widgets').update({ rank: neighbor.rank }).eq('id', current.id),
                supabase.from('system_widgets').update({ rank: current.rank }).eq('id', neighbor.id)
            ]);
            fetchWidgets();
        } catch (err) { console.error(err); }
    };

    return (
        <div className="p-8 space-y-10 bg-slate-50 min-h-screen text-left selection:bg-primary/20 pb-40">
            <header className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 border-b border-slate-200 pb-8">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <Layout className="h-4 w-4 text-primary" />
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Interface Orchestration</span>
                    </div>
                    <h1 className="text-4xl font-black text-foreground uppercase tracking-tighter leading-none">Widget Manager</h1>
                    <p className="text-muted-foreground text-sm font-medium mt-1">Configure, rank, and schedule dynamic UI nodes across the platform.</p>
                </div>
                <Button className="rounded-xl h-12 px-8 bg-primary text-white font-black uppercase text-[10px] tracking-widest shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all">
                    <Plus className="h-4 w-4 mr-2" /> Register New Node
                </Button>
            </header>

            {message && (
                <div className={cn(
                    "p-6 rounded-[2rem] border-2 flex items-center gap-4 animate-in slide-in-from-top-4",
                    message.type === 'success' ? "bg-emerald-50 border-emerald-100 text-emerald-600" : "bg-rose-50 border-rose-100 text-rose-600"
                )}>
                    <CheckCircle2 size={24} />
                    <p className="text-sm font-black uppercase tracking-widest">{message.text}</p>
                </div>
            )}

            <div className="grid lg:grid-cols-12 gap-10">
                <div className="lg:col-span-8 space-y-6">
                    <div className="flex items-center justify-between px-4">
                        <h2 className="text-xl font-black uppercase tracking-tighter text-foreground">Active Manifest</h2>
                        <span className="text-[10px] font-black uppercase text-slate-400 bg-white px-3 py-1 rounded-full border border-slate-100">{widgets.length} Nodes</span>
                    </div>

                    <div className="space-y-4">
                        {loading ? (
                            <div className="p-20 text-center bg-white rounded-[3rem] border border-slate-100 animate-pulse">
                                <Loader2 className="h-8 w-8 text-primary animate-spin mx-auto" />
                            </div>
                        ) : widgets.map((widget, i) => (
                            <Card key={widget.id} className={cn(
                                "p-6 rounded-[2.5rem] border transition-all hover:shadow-xl relative overflow-hidden group",
                                widget.status === 'ACTIVE' ? "bg-white border-slate-100" : "bg-slate-50 border-dashed border-slate-200 opacity-60"
                            )}>
                                <div className="flex items-center gap-6 relative z-10">
                                    <div className="flex flex-col gap-1">
                                        <button onClick={() => updateRank(widget.id, 'UP')} className="p-1 hover:text-primary transition-colors disabled:opacity-0" disabled={i === 0}><ChevronUp size={16} /></button>
                                        <button onClick={() => updateRank(widget.id, 'DOWN')} className="p-1 hover:text-primary transition-colors disabled:opacity-0" disabled={i === widgets.length - 1}><ChevronDown size={16} /></button>
                                    </div>

                                    <div className="h-12 w-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-primary shadow-inner shrink-0 group-hover:scale-110 transition-transform">
                                        <Settings2 size={24} />
                                    </div>

                                    <div className="flex-1 min-w-0 text-left">
                                        <div className="flex items-center gap-3 mb-1">
                                            <span className="text-[10px] font-black uppercase tracking-widest text-primary">{widget.page_route}</span>
                                            <div className="h-1 w-1 rounded-full bg-slate-200" />
                                            <span className="text-[8px] font-black uppercase text-slate-400">Rank: {widget.rank}</span>
                                        </div>
                                        <h3 className="text-xl font-black uppercase tracking-tight text-foreground">{widget.label}</h3>
                                        <p className="text-[10px] font-medium text-slate-400 uppercase tracking-widest mt-1 italic">{widget.widget_key}</p>
                                    </div>

                                    <div className="flex items-center gap-6">
                                        <button
                                            onClick={() => toggleStatus(widget.id, widget.status)}
                                            className={cn(
                                                "w-12 h-6 rounded-full transition-all relative p-1 flex items-center shadow-inner",
                                                widget.status === 'ACTIVE' ? "bg-emerald-500" : "bg-slate-200"
                                            )}
                                        >
                                            <div className={cn(
                                                "h-4 w-4 rounded-full bg-white shadow-sm transition-all",
                                                widget.status === 'ACTIVE' ? "translate-x-6" : "translate-x-0"
                                            )} />
                                        </button>
                                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-slate-50"><MoreHorizontal size={18} /></Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleDeleteWidget(widget.id, widget.label)}
                                                className="h-10 w-10 rounded-xl hover:bg-rose-50 hover:text-rose-500 text-slate-300 transition-all"
                                            >
                                                <Trash2 size={18} />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                </div>

                <div className="lg:col-span-4 space-y-8">
                    <Card className="p-10 rounded-[3rem] bg-slate-900 text-white space-y-8 relative overflow-hidden shadow-2xl">
                        <div className="relative z-10 space-y-6 text-left">
                            <ShieldAlert className="h-10 w-10 text-primary" />
                            <h3 className="text-2xl font-black uppercase tracking-tighter leading-none">Orchestration Safety</h3>
                            <p className="text-sm font-medium text-slate-400 italic leading-relaxed">
                                &quot;Disabling core commerce nodes (e.g. Hero, Trending) may result in acquisition drop-off. Ensure you have alternative discovery paths active before expelling a node.&quot;
                            </p>
                            <div className="pt-6 border-t border-white/10 flex justify-between items-center">
                                <span className="text-[9px] font-black uppercase tracking-widest text-primary">System Integrity</span>
                                <span className="text-xs font-black uppercase">Optimal</span>
                            </div>
                        </div>
                        <Zap className="absolute -bottom-10 -left-10 h-48 w-48 text-primary/10 rotate-12" />
                    </Card>

                    <div className="p-8 rounded-[3rem] bg-white border border-slate-100 shadow-sm space-y-4 text-left group">
                        <div className="h-10 w-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 shadow-sm transition-transform group-hover:rotate-6"><Eye size={20} /></div>
                        <h4 className="text-lg font-black uppercase text-foreground leading-none">Preview Mode</h4>
                        <p className="text-[10px] text-muted-foreground font-medium italic">
                            &quot;Experimental nodes can be restricted to Admin-only visibility for tactical verification before global deployment.&quot;
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
