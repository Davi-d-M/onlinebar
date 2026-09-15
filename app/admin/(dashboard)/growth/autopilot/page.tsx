'use client';

import * as React from 'react';
import { supabase } from '@/lib/supabaseClient';
import {
    Bot,
    Plus,
    Trash2,
    Clock,
    Zap,
    Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { useAdmin } from '@/context/AdminContext';
import { logAuditAction } from '@/lib/auditService';

interface AutopilotRule {
    id: string;
    slot_day_of_week: number;
    slot_time: string;
    platform: string;
    content_source: string;
    is_active: boolean;
}

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function AutopilotManagement() {
    const { email } = useAdmin();
    const [rules, setRules] = React.useState<AutopilotRule[]>([]);
    const [loading, setLoading] = React.useState(true);

    const fetchRules = React.useCallback(async () => {
        if (!supabase) return;
        setLoading(true);
        try {
            const { data } = await supabase.from('growth_autopilot_rules').select('*').order('slot_day_of_week', { ascending: true });
            if (data) setRules(data as AutopilotRule[]);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    }, []);

    React.useEffect(() => {
        fetchRules();
    }, [fetchRules]);

    const toggleRule = async (id: string, current: boolean) => {
        if (!supabase) return;
        try {
            const { error } = await supabase.from('growth_autopilot_rules').update({ is_active: !current }).eq('id', id);
            if (!error) {
                setRules(prev => prev.map(r => r.id === id ? { ...r, is_active: !current } : r));
                await logAuditAction(email, 'TOGGLE_AUTOPILOT_RULE', { id, active: !current });
            }
        } catch (err) { console.error(err); }
    };

    const deleteRule = async (id: string) => {
        if (!supabase || !confirm("Expel this autopilot slot?")) return;
        try {
            const { error } = await supabase.from('growth_autopilot_rules').delete().eq('id', id);
            if (!error) {
                setRules(prev => prev.filter(r => r.id !== id));
                await logAuditAction(email, 'DELETE_AUTOPILOT_RULE', { id });
            }
        } catch (err) { console.error(err); }
    };

    return (
        <div className="p-8 space-y-10 bg-slate-50 min-h-screen text-left selection:bg-primary/20 pb-40">
            <header className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 border-b border-slate-200 pb-8">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <Bot className="h-4 w-4 text-primary" />
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Neural Orchestration</span>
                    </div>
                    <h1 className="text-4xl font-black text-foreground uppercase tracking-tighter leading-none">Smart Autopilot</h1>
                    <p className="text-muted-foreground text-sm font-medium mt-1">Define recurring slots. The engine will pick trending inventory and schedule drafts.</p>
                </div>
                <Button className="rounded-xl h-12 px-8 bg-primary text-white font-black uppercase text-[10px] tracking-widest shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all">
                    <Plus className="h-4 w-4 mr-2" /> Program New Slot
                </Button>
            </header>

            <div className="grid lg:grid-cols-12 gap-10">
                <div className="lg:col-span-8 space-y-6">
                    <div className="flex items-center justify-between px-4">
                        <h2 className="text-xl font-black uppercase tracking-tighter text-foreground">Rule Registry</h2>
                        <span className="text-[10px] font-black uppercase text-slate-400 bg-white px-3 py-1 rounded-full border border-slate-100">{rules.length} Slots Active</span>
                    </div>

                    <div className="grid gap-4">
                        {loading && rules.length === 0 ? (
                            <div className="p-20 text-center bg-white rounded-[3rem] border border-slate-100 animate-pulse flex flex-col items-center gap-4">
                                <Loader2 className="h-8 w-8 text-primary animate-spin" />
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-300">Synchronizing Neural Slots...</p>
                            </div>
                        ) : rules.map(rule => (
                            <Card key={rule.id} className={cn(
                                "p-8 rounded-[3rem] border transition-all hover:shadow-xl relative overflow-hidden group",
                                rule.is_active ? "bg-white border-slate-100" : "bg-slate-50 border-dashed border-slate-200 opacity-60 grayscale"
                            )}>
                                <div className="flex items-center justify-between relative z-10">
                                    <div className="flex items-center gap-8">
                                        <div className="flex flex-col items-center justify-center h-20 w-20 rounded-[2rem] bg-slate-50 border border-slate-100 shadow-inner group-hover:scale-105 transition-transform">
                                            <span className="text-[9px] font-black uppercase text-slate-400">{DAYS[rule.slot_day_of_week].substring(0, 3)}</span>
                                            <span className="text-xl font-black text-foreground">{rule.slot_time.substring(0, 5)}</span>
                                        </div>
                                        <div className="text-left space-y-1">
                                            <div className="flex items-center gap-3">
                                                <span className="text-[10px] font-black uppercase text-primary tracking-widest">{rule.platform}</span>
                                                <div className="h-1 w-1 rounded-full bg-slate-200" />
                                                <span className="text-[9px] font-black uppercase text-slate-400">{rule.content_source} Strategy</span>
                                            </div>
                                            <h3 className="text-xl font-black uppercase tracking-tight text-foreground">Recurring Deployment Node</h3>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-6">
                                        <button
                                            onClick={() => toggleRule(rule.id, rule.is_active)}
                                            className={cn(
                                                "w-12 h-6 rounded-full transition-all relative p-1 flex items-center shadow-inner",
                                                rule.is_active ? "bg-emerald-500" : "bg-slate-200"
                                            )}
                                        >
                                            <div className={cn(
                                                "h-4 w-4 rounded-full bg-white shadow-sm transition-all",
                                                rule.is_active ? "translate-x-6" : "translate-x-0"
                                            )} />
                                        </button>
                                        <Button variant="ghost" size="icon" onClick={() => deleteRule(rule.id)} className="h-10 w-10 rounded-xl hover:bg-rose-50 hover:text-rose-500 text-slate-300 transition-all opacity-0 group-hover:opacity-100"><Trash2 size={18} /></Button>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                </div>

                <div className="lg:col-span-4 space-y-8">
                    <Card className="p-10 rounded-[3rem] bg-slate-900 text-white space-y-8 relative overflow-hidden shadow-2xl">
                        <div className="relative z-10 space-y-6 text-left">
                            <Zap className="h-10 w-10 text-primary animate-pulse" />
                            <h3 className="text-2xl font-black uppercase tracking-tighter leading-none">Autopilot Status</h3>
                            <p className="text-sm font-medium text-slate-400 italic leading-relaxed">
                                &quot;The engine automatically populates the Growth Calendar with drafts every Sunday night. All drafts must be approved by an Admin before final deployment.&quot;
                            </p>
                            <div className="pt-6 border-t border-white/10 flex justify-between items-center">
                                <span className="text-[9px] font-black uppercase tracking-widest text-primary">Neural Health</span>
                                <span className="text-xs font-black uppercase text-emerald-500">Optimal</span>
                            </div>
                        </div>
                    </Card>

                    <div className="p-8 rounded-[3rem] bg-white border border-slate-100 shadow-sm space-y-6 text-left group">
                        <div className="h-12 w-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 shadow-inner group-hover:rotate-6 transition-transform">
                            <Clock size={24} />
                        </div>
                        <h4 className="text-lg font-black uppercase text-foreground leading-none tracking-tighter">Content Pipeline</h4>
                        <div className="space-y-3">
                            {[
                                { label: 'Trending', val: 'High', color: 'emerald' },
                                { label: 'Low Stock', val: 'Low', color: 'rose' },
                                { label: 'Editorial', val: 'Medium', color: 'indigo' },
                            ].map(s => (
                                <div key={s.label} className="flex justify-between items-center">
                                    <span className="text-[10px] font-black uppercase text-slate-400">{s.label}</span>
                                    <span className={cn("text-[10px] font-black uppercase", `text-${s.color}-500`)}>{s.val} Priority</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
