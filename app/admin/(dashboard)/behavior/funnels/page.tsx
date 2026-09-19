'use client';

import * as React from 'react';
import {
    Zap,
    RefreshCcw,
    ChevronLeft,
    Loader2,
    Calendar,
    Target,
    Activity,
    MousePointer2,
    BarChart4,
    ShieldCheck
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

// Components
import FunnelStep from '@/components/admin/behavior/FunnelStep';

interface FunnelStepData {
    step_name: string;
    volume: number;
    drop_off_rate: number;
}

export default function ConversionFunnelsPage() {
    const router = useRouter();
    const [loading, setLoading] = React.useState(true);
    const [funnelData, setFunnelData] = React.useState<FunnelStepData[]>([]);

    const fetchData = React.useCallback(async () => {
        if (!supabase) return;
        setLoading(true);
        try {
            const { data } = await supabase.from('conversion_funnel_intelligence').select('*');
            if (data) setFunnelData(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, []);

    React.useEffect(() => {
        fetchData();
    }, [fetchData]);

    const totalVolume = funnelData[0]?.volume || 1;

    return (
        <div className="p-8 space-y-10 bg-slate-50 min-h-screen text-left pb-40 selection:bg-primary/20">

            {/* FUNNEL HEADER */}
            <header className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 border-b border-slate-200 pb-10">
                <div className="flex items-center gap-6">
                    <button onClick={() => router.back()} className="h-12 w-12 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-slate-300 hover:text-primary transition-all shadow-sm">
                        <ChevronLeft size={24} />
                    </button>
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <Zap className="h-4 w-4 text-emerald-600" />
                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-600 italic text-left">Conversion Logic Engine</span>
                        </div>
                        <h1 className="text-4xl lg:text-5xl font-black text-foreground uppercase tracking-tighter leading-none italic">
                            Behavioral <span className="text-emerald-600">Funnels.</span>
                        </h1>
                    </div>
                </div>
                <div className="flex gap-4">
                    <div className="bg-white px-6 py-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
                        <Calendar size={16} className="text-slate-300" />
                        <span className="text-xs font-black text-foreground uppercase tracking-widest">Last 30 Days</span>
                    </div>
                    <Button onClick={fetchData} variant="outline" className="rounded-xl h-14 w-14 p-0 border-slate-200 bg-white font-black uppercase hover:bg-slate-50 transition-all">
                        <RefreshCcw className={cn("h-4 w-4", loading && "animate-spin")} />
                    </Button>
                </div>
            </header>

            <div className="grid xl:grid-cols-12 gap-10">

                {/* LEFT: FUNNEL VISUALIZATION */}
                <div className="xl:col-span-8 space-y-10">
                    <Card className="p-16 rounded-[4rem] bg-white border border-slate-100 shadow-sm relative overflow-hidden">
                        <div className="relative z-10 space-y-4">
                            {loading ? (
                                <div className="py-40 flex flex-col items-center gap-6">
                                    <Loader2 size={48} className="animate-spin text-emerald-500" />
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-300">Synchronizing Conversion Nodes...</p>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {funnelData.map((step, idx) => (
                                        <FunnelStep
                                            key={step.step_name}
                                            name={step.step_name}
                                            volume={step.volume}
                                            dropOff={step.drop_off_rate}
                                            totalVolume={totalVolume}
                                            color={idx === 4 ? "bg-emerald-500" : idx === 0 ? "bg-indigo-600" : "bg-primary"}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                        <Target className="absolute -bottom-10 -right-10 h-64 w-64 text-emerald-500/5 rotate-12 -z-0" />
                    </Card>

                    {/* CHANNEL EFFICIENCY */}
                    <div className="grid sm:grid-cols-2 gap-6 text-left">
                        <Card className="p-10 rounded-[3rem] bg-white border border-slate-100 shadow-sm relative overflow-hidden">
                            <div className="relative z-10 space-y-6">
                                <h3 className="text-xl font-black uppercase tracking-tight italic text-primary">Highest Impact Step</h3>
                                <div className="flex items-center gap-4">
                                    <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary"><Activity size={24} /></div>
                                    <div>
                                        <p className="text-2xl font-black uppercase tracking-tighter text-foreground">Product View</p>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Crucial Consideration Node</p>
                                    </div>
                                </div>
                                <p className="text-xs font-medium text-slate-500 leading-relaxed italic">
                                    &quot;Optimizing the 3D Stage on product pages could reduce the current 12% drop-off at this node.&quot;
                                </p>
                            </div>
                        </Card>
                        <Card className="p-10 rounded-[3rem] bg-white border border-slate-100 shadow-sm relative overflow-hidden">
                            <div className="relative z-10 space-y-6">
                                <h3 className="text-xl font-black uppercase tracking-tight italic">Uplink Confidence</h3>
                                <div className="flex items-center gap-6">
                                     <div className="h-16 w-16 rounded-full border-4 border-emerald-500 flex items-center justify-center text-emerald-500 bg-emerald-50 shadow-inner">
                                        <span className="text-xl font-black">94%</span>
                                     </div>
                                     <div className="space-y-1">
                                        <p className="text-[10px] font-black uppercase text-slate-400">Signal Clarity</p>
                                        <p className="text-xs font-bold text-foreground uppercase tracking-widest">High Integrity Node</p>
                                     </div>
                                </div>
                                <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-50 border border-slate-100 w-fit">
                                    <ShieldCheck size={14} className="text-emerald-500" />
                                    <span className="text-[8px] font-black uppercase text-slate-400 tracking-widest">Verified behavioral stream</span>
                                </div>
                            </div>
                        </Card>
                    </div>
                </div>

                {/* RIGHT: FUNNEL COMMANDS */}
                <div className="xl:col-span-4 space-y-10">

                    <Card className="p-10 rounded-[4rem] bg-white border border-slate-100 shadow-sm space-y-10 text-left">
                        <div className="space-y-2">
                             <div className="flex items-center gap-3">
                                <BarChart4 className="h-4 w-4 text-primary" />
                                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 italic">Analysis Protocol</span>
                             </div>
                             <h3 className="text-2xl font-black uppercase tracking-tight leading-none italic">Drop-off Insights</h3>
                        </div>

                        <div className="space-y-6">
                             <div className="p-5 rounded-2xl bg-rose-50 border border-rose-100 space-y-2">
                                <div className="flex items-center justify-between">
                                    <p className="text-[9px] font-black uppercase text-rose-600 tracking-widest">Critical Leak</p>
                                    <span className="text-[10px] font-black text-rose-500">64% Drop</span>
                                </div>
                                <h4 className="text-sm font-black text-rose-700 uppercase tracking-tight italic">Cart → Checkout</h4>
                                <p className="text-[8px] font-bold text-rose-400 uppercase tracking-tighter">Recommended: Review Shipping Logic</p>
                             </div>

                             <div className="p-5 rounded-2xl bg-indigo-50 border border-indigo-100 space-y-2">
                                <div className="flex items-center justify-between">
                                    <p className="text-[9px] font-black uppercase text-indigo-600 tracking-widest">Health Node</p>
                                    <span className="text-[10px] font-black text-indigo-500">81% Conv</span>
                                </div>
                                <h4 className="text-sm font-black text-indigo-700 uppercase tracking-tight italic">Checkout → Payment</h4>
                                <p className="text-[8px] font-bold text-indigo-400 uppercase tracking-tighter">Payment nodes are operating optimally.</p>
                             </div>
                        </div>
                    </Card>

                    <Card className="p-8 rounded-[3rem] bg-indigo-600 text-white space-y-6 relative overflow-hidden shadow-2xl text-left">
                        <div className="relative z-10 space-y-4">
                             <div className="flex items-center gap-4">
                                <div className="h-10 w-10 rounded-xl bg-white/10 flex items-center justify-center"><MousePointer2 size={20} /></div>
                                <h3 className="text-lg font-black uppercase tracking-tighter">Tactical Drill-down</h3>
                             </div>
                             <p className="text-[10px] font-medium opacity-80 leading-relaxed italic">
                                &quot;Inspect the sessions of users who abandoned during the &apos;Checkout&apos; step to identify UI friction nodes.&quot;
                             </p>
                             <Link href="/admin/behavior/sessions">
                                <Button variant="ghost" className="w-full h-12 bg-white/5 border border-white/10 text-white font-black uppercase text-[10px] tracking-widest hover:bg-white/10">
                                    View Abandoned Sessions
                                </Button>
                             </Link>
                        </div>
                        <Activity className="absolute -bottom-10 -right-10 h-48 w-48 text-white/5 rotate-12 -z-0" />
                    </Card>

                </div>

            </div>

        </div>
    );
}
