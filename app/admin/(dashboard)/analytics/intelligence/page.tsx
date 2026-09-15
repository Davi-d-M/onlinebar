'use client';

import * as React from 'react';
import { supabase } from '@/lib/supabaseClient';
import {
    Activity,
    Target,
    ArrowUpRight,
    ArrowDownRight,
    TrendingUp,
    ShoppingBag,
    MousePointer2,
    AlertCircle,
    ChevronRight,
    Loader2,
    PieChart,
    Smartphone,
    Globe
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn, formatPrice } from '@/lib/utils';


interface IntelStat {
    id: string;
    product_name: string;
    revenue: number;
    units: number;
    views: number;
    conversion: number;
    status: 'HIGH' | 'LOW' | 'TRENDING';
}

export default function IntelligenceHub() {
    const [loading, setLoading] = React.useState(true);
    const [intel, setIntel] = React.useState<IntelStat[]>([]);
    const [alerts, setAlerts] = React.useState<Array<{ id: string, type: string, message: string }>>([]);

    React.useEffect(() => {
        async function fetchIntel() {
            if (!supabase) return;
            try {
                const { data } = await supabase
                    .from('product_intelligence')
                    .select('*, products(name)')
                    .order('total_revenue', { ascending: false });

                if (data) {
                    setIntel((data as Array<{
                        product_id: string,
                        total_revenue: number,
                        units_sold: number,
                        view_count: number,
                        products: { name: string } | null
                    }>).map((d) => ({
                        id: d.product_id,
                        product_name: d.products?.name || 'Unknown Node',
                        revenue: d.total_revenue,
                        units: d.units_sold,
                        views: d.view_count,
                        conversion: d.view_count > 0 ? (d.units_sold / d.view_count) * 100 : 0,
                        status: d.total_revenue > 50000 ? 'HIGH' : 'TRENDING'
                    })));
                }

                // Fetch intelligence alerts
                const { data: alertData } = await supabase.from('intelligence_alerts').select('*').limit(3);
                setAlerts(alertData || []);

            } catch (err) {
                console.error("Intelligence node link failed:", err);
            } finally {
                setLoading(false);
            }
        }
        fetchIntel();
    }, []);

    if (loading) return (
        <div className="min-h-[60dvh] flex flex-col items-center justify-center gap-4">
            <Loader2 className="h-10 w-10 text-primary animate-spin" />
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-300">Synchronizing Intelligence Nodes...</p>
        </div>
    );

    return (
        <div className="space-y-12 animate-in fade-in duration-1000 text-left selection:bg-primary/20">

            {/* EXECUTIVE HEADER */}
            <header className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 border-b border-slate-200 pb-10">
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-slate-900 flex items-center justify-center text-primary shadow-xl shadow-primary/10"><Activity size={20} /></div>
                        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Online Bar OS Intelligence</span>
                    </div>
                    <h1 className="text-5xl lg:text-7xl font-black text-foreground uppercase tracking-tighter leading-[0.85]">
                        The Intelligence <br /><span className="text-primary italic">War Room.</span>
                    </h1>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" className="h-14 px-8 rounded-2xl border-slate-200 font-black uppercase text-[10px] tracking-widest hover:bg-white transition-all">Export Audit PDF</Button>
                </div>
            </header>

            {/* HIGH-INTENT ALERTS */}
            {alerts.length > 0 && (
                <div className="grid md:grid-cols-3 gap-6">
                    {alerts.map(alert => (
                        <Card key={alert.id} className="p-6 rounded-[2.5rem] bg-rose-50 border-rose-100 flex items-center gap-6 group hover:scale-[1.02] transition-all cursor-pointer">
                            <div className="h-12 w-12 rounded-2xl bg-rose-100 flex items-center justify-center text-rose-600 shadow-inner group-hover:rotate-12 transition-transform">
                                <AlertCircle size={24} />
                            </div>
                            <div>
                                <p className="text-[8px] font-black uppercase text-rose-400 tracking-widest mb-1">{alert.type}</p>
                                <h4 className="text-sm font-black uppercase text-rose-900 leading-tight">{alert.message}</h4>
                            </div>
                        </Card>
                    ))}
                </div>
            )}

            {/* MAIN METRIC GRID */}
            <div className="grid lg:grid-cols-12 gap-10">

                {/* 1. PRODUCT PERFORMANCE NODES */}
                <div className="lg:col-span-8 space-y-8">
                    <div className="flex items-center justify-between px-4">
                        <h2 className="text-2xl font-black uppercase tracking-tighter text-foreground">Product Performance Nodes</h2>
                        <div className="flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Live Synthesis Active</span>
                        </div>
                    </div>

                    <div className="grid gap-4">
                        {intel.map((item) => (
                            <Card key={item.id} className="p-8 rounded-[3rem] bg-white border border-slate-100 shadow-sm hover:shadow-2xl transition-all group overflow-hidden relative">
                                <div className="flex flex-col md:flex-row justify-between items-center gap-8 relative z-10">
                                    <div className="flex items-center gap-8 flex-1 min-w-0">
                                        <div className="h-20 w-20 rounded-[2rem] bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-300 group-hover:scale-105 transition-transform shrink-0">
                                            <ShoppingBag size={32} />
                                        </div>
                                        <div className="space-y-1 min-w-0">
                                            <h3 className="text-2xl font-black text-foreground uppercase tracking-tight truncate leading-none">{item.product_name}</h3>
                                            <div className="flex items-center gap-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">
                                                <span className="flex items-center gap-1.5"><MousePointer2 size={12} className="text-primary" /> {item.views.toLocaleString()} Views</span>
                                                <div className="h-1 w-1 rounded-full bg-slate-200" />
                                                <span className="flex items-center gap-1.5"><ShoppingBag size={12} className="text-primary" /> {item.units} Units</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-12 shrink-0">
                                        <div className="text-right">
                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Revenue Attributed</p>
                                            <p className="text-2xl font-black text-foreground tracking-tighter leading-none">{formatPrice(item.revenue)}</p>
                                        </div>
                                        <div className="text-right w-24">
                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Conversion</p>
                                            <div className="flex items-center justify-end gap-1.5">
                                                <span className={cn(
                                                    "text-xl font-black leading-none",
                                                    item.conversion > 3 ? "text-emerald-500" : "text-amber-500"
                                                )}>{item.conversion.toFixed(1)}%</span>
                                                {item.conversion > 3 ? <ArrowUpRight size={16} className="text-emerald-500" /> : <ArrowDownRight size={16} className="text-amber-500" />}
                                            </div>
                                        </div>
                                        <button className="h-12 w-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-300 hover:bg-primary hover:text-white transition-all group/btn">
                                            <ChevronRight size={24} className="group-hover/btn:translate-x-1 transition-transform" />
                                        </button>
                                    </div>
                                </div>

                                {/* Background HUD Graphics */}
                                <div className="absolute -bottom-10 -right-10 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity">
                                    <PieChart size={200} />
                                </div>
                            </Card>
                        ))}
                    </div>
                </div>

                {/* 2. SYSTEM CHANNEL INTELLIGENCE */}
                <div className="lg:col-span-4 space-y-8">
                    <Card className="p-10 rounded-[3.5rem] bg-slate-900 text-white space-y-10 relative overflow-hidden shadow-2xl">
                        <div className="relative z-10 space-y-8">
                            <div className="flex items-center gap-4">
                                <div className="h-12 w-12 rounded-2xl bg-white/10 flex items-center justify-center backdrop-blur-md border border-white/20"><Target size={24} className="text-primary" /></div>
                                <h3 className="text-2xl font-black uppercase tracking-tighter leading-none">Acquisition Audit</h3>
                            </div>

                            <div className="space-y-6">
                                {[
                                    { label: 'Instagram Nodes', val: 384000, rate: '+12.4%', color: 'rose' },
                                    { label: 'Google Organic', val: 302000, rate: '+8.1%', color: 'emerald' },
                                    { label: 'TikTok Video', val: 174000, rate: '+42.8%', color: 'indigo' },
                                    { label: 'Direct Traffic', val: 113000, rate: '-2.4%', color: 'slate' },
                                ].map((source) => (
                                    <div key={source.label} className="space-y-2">
                                        <div className="flex justify-between items-end">
                                            <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{source.label}</p>
                                            <div className="text-right">
                                                <p className="text-sm font-black tracking-tighter leading-none">{formatPrice(source.val)}</p>
                                                <p className={cn("text-[8px] font-bold mt-1 uppercase", source.rate.startsWith('+') ? 'text-emerald-400' : 'text-rose-400')}>{source.rate} Velocity</p>
                                            </div>
                                        </div>
                                        <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                            <div className={cn("h-full rounded-full transition-all duration-1000",
                                                source.color === 'rose' ? 'bg-rose-500' :
                                                source.color === 'emerald' ? 'bg-emerald-500' :
                                                source.color === 'indigo' ? 'bg-indigo-500' : 'bg-slate-500'
                                            )} style={{ width: `${(source.val / 1000000) * 100}%` }} />
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <Button className="w-full h-16 rounded-[2rem] bg-primary text-white font-black uppercase text-xs tracking-widest shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all">
                                Open Attribution Command
                            </Button>
                        </div>
                        <TrendingUp className="absolute -bottom-10 -left-10 h-64 w-64 text-white/5 -rotate-12" />
                    </Card>

                    <Card className="p-10 rounded-[3.5rem] bg-white border border-slate-100 shadow-sm space-y-8 text-left group">
                        <div className="h-12 w-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 shadow-inner group-hover:rotate-6 transition-transform">
                            <Smartphone size={24} />
                        </div>
                        <h3 className="text-2xl font-black uppercase tracking-tighter text-foreground leading-none">Device <br /><span className="text-primary italic">Conversion Gap.</span></h3>
                        <div className="space-y-4">
                            {[
                                { label: 'Android Mobile', val: '2.1%', icon: Smartphone, color: 'text-rose-500' },
                                { label: 'iOS Mobile', val: '4.8%', icon: Smartphone, color: 'text-emerald-500' },
                                { label: 'Desktop Terminal', val: '6.4%', icon: Globe, color: 'text-indigo-500' },
                            ].map((device) => (
                                <div key={device.label} className="flex justify-between items-center py-3 border-b border-slate-50 last:border-0">
                                    <div className="flex items-center gap-3">
                                        <device.icon size={14} className="text-slate-300" />
                                        <span className="text-[10px] font-black uppercase text-slate-500">{device.label}</span>
                                    </div>
                                    <span className={cn("text-sm font-black", device.color)}>{device.val}</span>
                                </div>
                            ))}
                        </div>
                        <p className="text-[9px] font-medium text-slate-400 italic leading-relaxed">
                            &quot;Large conversion gap detected on Android terminals. Recommended audit of mobile checkout node.&quot;
                        </p>
                    </Card>

                </div>
            </div>
        </div>
    );
}
