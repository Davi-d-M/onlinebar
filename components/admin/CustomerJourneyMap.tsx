'use client';

import * as React from 'react';
import { Card } from '@/components/ui/card';
import {
    Users,
    Eye,
    Zap,
    CheckCircle2,
    ArrowDown,
    Loader2,
    RefreshCcw
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface FunnelStats {
    discovery: number;
    browse: number;
    cart: number;
    conversion: number;
}

export default function CustomerJourneyMap() {
    const [stats, setStats] = React.useState<FunnelStats | null>(null);
    const [loading, setLoading] = React.useState(true);

    const fetchFunnel = React.useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/intelligence/funnel');
            const data = await res.json();
            if (data) setStats(data as FunnelStats);
        } catch (e) {
            console.error("Funnel Link Failure:", e);
        } finally {
            setLoading(false);
        }
    }, []);

    React.useEffect(() => {
        fetchFunnel();
    }, [fetchFunnel]);

    if (loading) return <div className="h-[400px] sm:h-[600px] bg-slate-50 rounded-[2rem] sm:rounded-[3rem] animate-pulse flex items-center justify-center"><Loader2 className="animate-spin text-primary" /></div>;
    if (!stats) return null;

    const stages = [
        { label: 'Awareness', val: stats.discovery, icon: Users, desc: 'Grid Entrants', color: 'slate' },
        { label: 'Consideration', val: stats.browse, icon: Eye, desc: 'Bottle Detail Views', color: 'indigo' },
        { label: 'Intent', val: stats.cart, icon: Zap, desc: 'Checkout Initialized', color: 'amber' },
        { label: 'Conversion', val: stats.conversion, icon: CheckCircle2, desc: 'Orders Established', color: 'emerald' },
    ];

    return (
        <Card className="p-6 sm:p-10 rounded-[2.5rem] sm:rounded-[3.5rem] bg-white border border-slate-100 shadow-sm space-y-8 sm:space-y-12 text-left">
            <header className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tighter text-foreground leading-tight">Nairobi Bar Funnel</h2>
                    <div className="flex items-center gap-4 mt-2">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Acquisition &rarr; Conversion Architecture</p>
                        <button onClick={fetchFunnel} className="text-primary hover:rotate-180 transition-transform"><RefreshCcw size={14} /></button>
                    </div>
                </div>
                <div className="text-right">
                    <p className="text-2xl sm:text-[2rem] font-black text-primary leading-none tracking-tighter">
                        {((stats.conversion / (stats.discovery || 1)) * 100).toFixed(1)}%
                    </p>
                    <p className="text-[8px] font-black text-slate-300 uppercase tracking-widest">Global conversion rate</p>
                </div>
            </header>

            <div className="flex flex-col gap-4 sm:gap-6 relative">
                {stages.map((stage, i) => {
                    const dropoff = i > 0 ? Math.round((1 - (stage.val / (stages[i-1].val || 1))) * 100) : 0;

                    return (
                        <div key={stage.label} className="relative">
                            {i > 0 && (
                                <div className="absolute -top-5 sm:-top-7 left-10 sm:left-12 flex flex-col items-center gap-1 z-0">
                                    <div className="h-4 sm:h-6 w-px border-l border-dashed border-slate-200" />
                                    <span className="text-[6px] sm:text-[7px] font-black text-rose-500 uppercase tracking-widest bg-white px-1 shadow-sm rounded-sm">-{dropoff}% Loss</span>
                                </div>
                            )}

                            <div className={cn(
                                "p-4 sm:p-6 rounded-[1.5rem] sm:rounded-[2rem] flex items-center justify-between transition-all hover:scale-[1.01] group relative overflow-hidden",
                                stage.color === 'slate' ? "bg-slate-50 border border-slate-100" :
                                stage.color === 'indigo' ? "bg-indigo-50 border border-indigo-100" :
                                stage.color === 'primary' ? "bg-primary/5 border border-primary/20" :
                                stage.color === 'amber' ? "bg-amber-50 border border-amber-100" :
                                "bg-emerald-50 border border-emerald-100"
                            )}>
                                <div className="flex items-center gap-4 sm:gap-6 z-10">
                                    <div className={cn(
                                        "h-10 w-10 sm:h-12 sm:w-12 rounded-lg sm:rounded-xl flex items-center justify-center shadow-inner",
                                        stage.color === 'slate' ? "bg-white text-slate-400" :
                                        stage.color === 'indigo' ? "bg-white text-indigo-500" :
                                        stage.color === 'primary' ? "bg-white text-primary" :
                                        stage.color === 'amber' ? "bg-white text-amber-500" :
                                        "bg-white text-emerald-500"
                                    )}>
                                        <stage.icon size={20} className="sm:w-6 sm:h-6" />
                                    </div>
                                    <div className="space-y-0.5 sm:space-y-1">
                                        <h4 className="text-xs sm:text-sm font-black uppercase text-foreground leading-tight">{stage.label}</h4>
                                        <p className="text-[8px] sm:text-[9px] font-bold text-slate-400 uppercase tracking-widest">{stage.desc}</p>
                                    </div>
                                </div>
                                <div className="text-right z-10 space-y-0.5 sm:space-y-1">
                                    <p className="text-xl sm:text-2xl font-black text-foreground tabular-nums leading-none">{stage.val.toLocaleString()}</p>
                                    <p className="text-[8px] font-black text-slate-300 uppercase tracking-widest">Sessions</p>
                                </div>

                                {/* Funnel Visual Background */}
                                <div
                                    className={cn(
                                        "absolute inset-y-0 left-0 transition-all duration-1000",
                                        stage.color === 'slate' ? "bg-slate-100/50" :
                                        stage.color === 'indigo' ? "bg-indigo-100/50" :
                                        stage.color === 'primary' ? "bg-primary/10" :
                                        stage.color === 'amber' ? "bg-amber-100/50" :
                                        "bg-emerald-100/50"
                                    )}
                                    style={{ width: `${(stage.val / (stats.discovery || 1)) * 100}%` }}
                                />
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="p-8 bg-slate-50 rounded-[2.5rem] flex items-start gap-4">
                <ArrowDown className="h-6 w-6 text-primary shrink-0 mt-0.5 animate-bounce" />
                <div className="space-y-1">
                    <p className="text-xs font-black uppercase text-foreground">Actionable Bottleneck</p>
                    <p className="text-[10px] text-slate-500 font-medium leading-relaxed italic">
                        &quot;The largest drop-off is occurring between **Consideration** and **Intent**. Recommend activating &apos;Dynamic Pairing&apos; suggestions to increase cart intent.&quot;
                    </p>
                </div>
            </div>
        </Card>
    );
}
