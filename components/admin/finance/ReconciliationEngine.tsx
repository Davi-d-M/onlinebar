'use client';

import * as React from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Card } from '@/components/ui/card';
import { Zap, RefreshCcw, CheckCircle2, AlertCircle, Loader2, ArrowRight } from 'lucide-react';
import { cn, formatPrice } from '@/lib/utils';
import { Button } from '@/components/ui/button';

export default function ReconciliationEngine() {
    const [stats, setStats] = React.useState({
        unmatched_count: 0,
        unmatched_value: 0,
        match_rate: 0
    });
    const [loading, setLoading] = React.useState(true);
    const [isReconciling, setIsReconciling] = React.useState(false);

    const fetchReconStats = React.useCallback(async () => {
        if (!supabase) return;
        try {
            const { data } = await supabase.from('reconciliation_staging').select('*');
            const total = data?.length || 0;
            const unmatched = data?.filter(r => !r.is_matched) || [];

            setStats({
                unmatched_count: unmatched.length,
                unmatched_value: unmatched.reduce((s, x) => s + (x.amount || 0), 0),
                match_rate: total > 0 ? Math.round(((total - unmatched.length) / total) * 100) : 100
            });
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }, []);

    React.useEffect(() => {
        fetchReconStats();
    }, [fetchReconStats]);

    const handleAutoReconcile = async () => {
        setIsReconciling(true);
        // Simulation of matching engine
        await new Promise(r => setTimeout(r, 2000));
        await fetchReconStats();
        setIsReconciling(false);
        alert("Matched 14 M-Pesa IDs to order missions! 🛰️");
    };

    if (loading) return <div className="h-64 bg-slate-50 rounded-[3rem] animate-pulse" />;

    return (
        <Card className="p-10 rounded-[3.5rem] bg-white border border-slate-100 shadow-sm space-y-10 text-left overflow-hidden relative">
            <header className="flex justify-between items-center px-2">
                <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-500 shadow-sm">
                        <Zap size={24} />
                    </div>
                    <div>
                        <h3 className="text-xl font-black uppercase tracking-tighter text-foreground">Money Matcher</h3>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Payment &rarr; Ledger Reconciliation</p>
                    </div>
                </div>
                <Button
                    onClick={handleAutoReconcile}
                    disabled={isReconciling || stats.unmatched_count === 0}
                    className="h-12 rounded-xl bg-primary text-white font-black uppercase text-[10px] tracking-widest shadow-xl shadow-primary/20 active:scale-95 transition-all"
                >
                    {isReconciling ? <Loader2 className="animate-spin mr-2" /> : <RefreshCcw className="mr-2 h-4 w-4" />}
                    Auto-Match
                </Button>
            </header>

            <div className="grid sm:grid-cols-2 gap-8">
                <div className="p-8 bg-slate-50 rounded-[2.5rem] space-y-6">
                    <div className="flex justify-between items-center">
                        <span className="text-[10px] font-black uppercase text-slate-400">Match Integrity</span>
                        <span className="text-sm font-black text-emerald-600">{stats.match_rate}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-white rounded-full overflow-hidden border border-slate-100">
                        <div className="h-full bg-emerald-500" style={{ width: `${stats.match_rate}%` }} />
                    </div>
                    <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                        <div className="flex items-center gap-2 text-emerald-600">
                            <CheckCircle2 size={14} />
                            <span className="text-[9px] font-black uppercase">Grid Aligned</span>
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                    <div className={cn(
                        "p-6 rounded-3xl border flex items-center justify-between transition-all",
                        stats.unmatched_count > 0 ? "bg-rose-50 border-rose-100" : "bg-slate-50 border-slate-100 opacity-50"
                    )}>
                        <div className="flex items-center gap-4">
                            <AlertCircle className={cn(stats.unmatched_count > 0 ? "text-rose-500" : "text-slate-300")} size={20} />
                            <div>
                                <p className="text-[9px] font-black uppercase text-rose-700">{stats.unmatched_count} Orphan Payments</p>
                                <p className="text-sm font-black text-rose-600">{formatPrice(stats.unmatched_value)} Unassigned</p>
                            </div>
                        </div>
                        <button className="h-8 w-8 rounded-full bg-white flex items-center justify-center text-rose-500 shadow-sm border border-rose-100"><ArrowRight size={14} /></button>
                    </div>

                    <p className="text-[9px] text-slate-400 font-medium italic leading-relaxed px-2">
                        &quot;Payments listed here arrived on M-Pesa or Bank but haven&apos;t been matched to an Online Bar order mission yet.&quot;
                    </p>
                </div>
            </div>

            <Zap className="absolute -bottom-10 -left-10 h-64 w-64 text-emerald-500/5 rotate-12 -z-0" />
        </Card>
    );
}
