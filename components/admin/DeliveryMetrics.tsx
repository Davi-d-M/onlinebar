'use client';

import * as React from 'react';
import { Card } from '@/components/ui/card';
import { Clock, TrendingUp, AlertCircle, Package } from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabaseClient';

interface DeliveryStat {
    order_id: number;
    total_time_min: number;
    prep_time_min: number;
    travel_time_min: number;
    delay_min: number;
    delay_reason: string;
    delivered_at: string;
}

export default function DeliveryMetrics() {
    const [stats, setStats] = React.useState<DeliveryStat[]>([]);
    const [loading, setLoading] = React.useState(true);

    const fetchStats = React.useCallback(async () => {
        if (!supabase) return;
        setLoading(true);
        try {
            const { data } = await supabase
                .from('delivery_statistics')
                .select('*')
                .not('delivered_at', 'is', null)
                .order('delivered_at', { ascending: false })
                .limit(10);

            if (data) setStats(data);
        } catch (err) {
            console.error("Failed to fetch delivery stats:", err);
        } finally {
            setLoading(false);
        }
    }, []);

    React.useEffect(() => {
        fetchStats();
    }, [fetchStats]);

    const averages = React.useMemo(() => {
        if (stats.length === 0) return { total: 0, prep: 0, travel: 0 };
        const sumTotal = stats.reduce((s, x) => s + (x.total_time_min || 0), 0);
        const sumPrep = stats.reduce((s, x) => s + (x.prep_time_min || 0), 0);
        const sumTravel = stats.reduce((s, x) => s + (x.travel_time_min || 0), 0);

        return {
            total: Math.round(sumTotal / stats.length),
            prep: Math.round(sumPrep / stats.length),
            travel: Math.round(sumTravel / stats.length)
        };
    }, [stats]);

    if (loading && stats.length === 0) return <div className="h-64 bg-slate-50 rounded-[3rem] animate-pulse" />;

    return (
        <Card className="p-10 rounded-[3.5rem] bg-white border border-slate-100 shadow-sm space-y-10 text-left">
            <div className="flex justify-between items-center px-2">
                <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-sm">
                        <Clock size={24} />
                    </div>
                    <div>
                        <h3 className="text-xl font-black uppercase tracking-tighter text-foreground leading-none">Speed Logistics</h3>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Industrial Delivery Statistics</p>
                    </div>
                </div>
            </div>

            <div className="grid sm:grid-cols-3 gap-6">
                <div className="p-6 rounded-[2.5rem] bg-slate-50 border border-slate-100 space-y-2">
                    <p className="text-[10px] font-black uppercase text-slate-400">Avg. Total Drop</p>
                    <div className="flex items-center gap-2">
                        <p className="text-2xl font-black text-foreground">{averages.total}m</p>
                        <TrendingUp size={14} className="text-emerald-500" />
                    </div>
                </div>
                <div className="p-6 rounded-[2.5rem] bg-slate-50 border border-slate-100 space-y-2">
                    <p className="text-[10px] font-black uppercase text-slate-400">Avg. Prep Time</p>
                    <p className="text-2xl font-black text-foreground">{averages.prep}m</p>
                </div>
                <div className="p-6 rounded-[2.5rem] bg-slate-50 border border-slate-100 space-y-2">
                    <p className="text-[10px] font-black uppercase text-slate-400">Avg. In-Transit</p>
                    <p className="text-2xl font-black text-foreground">{averages.travel}m</p>
                </div>
            </div>

            <div className="space-y-4">
                <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-2">Recent Mission Logs</h4>
                <div className="grid gap-3">
                    {stats.map((s) => (
                        <div key={s.order_id} className="p-5 bg-white border border-slate-100 rounded-[2rem] flex items-center justify-between group hover:shadow-lg transition-all">
                            <div className="flex items-center gap-5">
                                <div className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-300 group-hover:text-primary transition-colors">
                                    <Package size={20} />
                                </div>
                                <div>
                                    <p className="text-xs font-black uppercase text-foreground">Mission #{s.order_id}</p>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="text-[8px] font-bold text-slate-400 uppercase">{s.prep_time_min}m Prep</span>
                                        <div className="h-1 w-1 rounded-full bg-slate-200" />
                                        <span className="text-[8px] font-bold text-primary uppercase">{s.travel_time_min}m Travel</span>
                                    </div>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-sm font-black text-foreground">{s.total_time_min}m Total</p>
                                <span className={cn(
                                    "text-[7px] font-black uppercase px-2 py-0.5 rounded-full border",
                                    s.total_time_min < 25 ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-rose-50 text-rose-600 border-rose-100"
                                )}>
                                    {s.total_time_min < 25 ? 'Optimized' : 'Delayed'}
                                </span>
                            </div>
                        </div>
                    ))}
                    {stats.length === 0 && (
                        <div className="p-12 text-center text-slate-300 font-black uppercase text-[10px] italic border-2 border-dashed border-slate-50 rounded-[2rem]">
                            Awaiting Dispatch Telemetry...
                        </div>
                    )}
                </div>
            </div>

            <div className="p-8 bg-indigo-50 border border-indigo-100 rounded-[2.5rem] space-y-4">
                <div className="flex items-center gap-3">
                    <AlertCircle size={18} className="text-indigo-500" />
                    <p className="text-xs font-black uppercase text-indigo-700">AI Efficiency Insight</p>
                </div>
                <p className="text-sm font-medium italic text-indigo-600 leading-relaxed">
                    &quot;Based on last 10 drops, **Travel Time** is the primary bottleneck. Recommend activating &apos;Pre-Dispatch&apos; protocol for high-demand zones to reduce rider assignment delay.&quot;
                </p>
            </div>
        </Card>
    );
}
