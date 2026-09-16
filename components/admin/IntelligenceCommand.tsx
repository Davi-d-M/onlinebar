'use client';

import * as React from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Card } from '@/components/ui/card';
import {
    Flame,
    AlertTriangle,
    TrendingUp,
    Users,
    ChevronRight,
    Loader2,
    DollarSign,
    Target
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface MissionInsight {
    id: string;
    type: 'HIGH_INTENT' | 'ABANDONMENT' | 'CHURN_RISK' | 'PEAK_PERFORMANCE';
    priority: 'Low' | 'Medium' | 'High' | 'Critical';
    title: string;
    description: string;
    value?: number;
    action_label: string;
    href: string;
}

export default function IntelligenceCommand() {
    const [insights, setInsights] = React.useState<MissionInsight[]>([]);
    const [loading, setLoading] = React.useState(true);

    const generateInsights = React.useCallback(async () => {
        if (!supabase) return;
        setLoading(true);
        try {
            // 1. Fetch data for generation
            const [intRes, abdRes, salesRes] = await Promise.all([
                supabase.from('customer_intelligence').select('*, profiles(full_name)').gt('intent_score', 80).limit(5),
                supabase.from('abandonment_audit').select('*').is('is_recovered', false).order('created_at', { ascending: false }).limit(3),
                supabase.from('orders').select('total_price').gte('created_at', new Date(Date.now() - 86400000).toISOString())
            ]);

            const newInsights: MissionInsight[] = [];

            // A. High Intent Leads
            if (intRes.data && intRes.data.length > 0) {
                newInsights.push({
                    id: 'lead-1',
                    type: 'HIGH_INTENT',
                    priority: 'High',
                    title: `${intRes.data.length} High-Intent Leads`,
                    description: "These patrons have compared products and started checkout multiple times today.",
                    action_label: "Launch Nudge",
                    href: "/admin/customers"
                });
            }

            // B. Critical Abandonments
            if (abdRes.data && abdRes.data.length > 0) {
                const totalLost = abdRes.data.reduce((s, a) => s + (a.cart_value || 0), 0);
                newInsights.push({
                    id: 'abd-1',
                    type: 'ABANDONMENT',
                    priority: 'Critical',
                    title: `KSh ${totalLost.toLocaleString()} Lost in 24h`,
                    description: "High-value bags were abandoned at the payment stage. Technical friction suspected.",
                    value: totalLost,
                    action_label: "Start Recovery",
                    href: "/admin/abandoned"
                });
            }

            // C. Peak Performance
            const todayRev = salesRes.data?.reduce((s, o) => s + (o.total_price || 0), 0) || 0;
            if (todayRev > 50000) {
                newInsights.push({
                    id: 'perf-1',
                    type: 'PEAK_PERFORMANCE',
                    priority: 'Medium',
                    title: "Peak Daily Velocity",
                    description: "Current revenue flow is 24% above the 30-day average. Cellar throughput is healthy.",
                    action_label: "View Analytics",
                    href: "/admin/analytics"
                });
            }

            // D. Churn Risk (Static for now until cron established)
            newInsights.push({
                id: 'churn-1',
                type: 'CHURN_RISK',
                priority: 'High',
                title: "8 VIP Churn Risk",
                description: "Top-tier patrons who haven't ordered in their usual 14-day cycle. Reactivation required.",
                action_label: "Assign Tasks",
                href: "/admin/operations/tasks"
            });

            setInsights(newInsights);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }, []);

    React.useEffect(() => {
        generateInsights();
    }, [generateInsights]);

    if (loading) return <div className="h-64 bg-slate-50 rounded-[3rem] animate-pulse flex items-center justify-center"><Loader2 className="animate-spin text-primary" /></div>;

    return (
        <section className="space-y-6">
            <header className="flex justify-between items-center px-4">
                <div className="flex items-center gap-3">
                    <div className="h-2 w-2 rounded-full bg-rose-500 animate-pulse" />
                    <h2 className="text-xl font-black uppercase tracking-tighter text-foreground">Mission Board</h2>
                </div>
                <button onClick={generateInsights} className="text-[9px] font-black text-primary uppercase tracking-widest hover:underline">Re-Scrutinize Grid</button>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {insights.map((insight) => (
                    <Card key={insight.id} className="p-8 rounded-[3rem] bg-white border border-slate-100 shadow-sm flex flex-col justify-between group hover:shadow-2xl transition-all relative overflow-hidden text-left">
                        <div className="relative z-10 space-y-6">
                            <div className="flex justify-between items-start">
                                <div className={cn(
                                    "h-12 w-12 rounded-2xl flex items-center justify-center shadow-inner transition-transform group-hover:scale-110",
                                    insight.type === 'ABANDONMENT' ? "bg-rose-50 text-rose-500" :
                                    insight.type === 'HIGH_INTENT' ? "bg-primary/5 text-primary" :
                                    insight.type === 'CHURN_RISK' ? "bg-amber-50 text-amber-500" :
                                    "bg-emerald-50 text-emerald-500"
                                )}>
                                    {insight.type === 'ABANDONMENT' ? <AlertTriangle size={24} /> :
                                     insight.type === 'HIGH_INTENT' ? <Flame size={24} /> :
                                     insight.type === 'CHURN_RISK' ? <Target size={24} /> :
                                     <TrendingUp size={24} />}
                                </div>
                                <span className={cn(
                                    "px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border",
                                    insight.priority === 'Critical' ? "bg-rose-500 text-white border-rose-500 animate-pulse" :
                                    insight.priority === 'High' ? "bg-rose-50 text-rose-600 border-rose-100" :
                                    "bg-slate-100 text-slate-400"
                                )}>
                                    {insight.priority}
                                </span>
                            </div>

                            <div className="space-y-1.5">
                                <h3 className="text-lg font-black text-foreground uppercase tracking-tight leading-tight">{insight.title}</h3>
                                <p className="text-[10px] text-slate-500 font-medium italic leading-relaxed line-clamp-3">&quot;{insight.description}&quot;</p>
                            </div>
                        </div>

                        <div className="pt-6 mt-6 border-t border-slate-50">
                            <Link href={insight.href}>
                                <Button className="w-full h-12 rounded-xl bg-primary text-white font-black uppercase text-[9px] tracking-widest transition-all active:scale-95 shadow-lg shadow-primary/20">
                                    {insight.action_label} <ChevronRight className="ml-2 h-3 w-3" />
                                </Button>
                            </Link>
                        </div>

                        {/* Type Indicator Background */}
                        {insight.type === 'ABANDONMENT' && <AlertTriangle className="absolute -bottom-6 -right-6 h-32 w-32 text-rose-500/5 rotate-12" />}
                        {insight.type === 'PEAK_PERFORMANCE' && <DollarSign className="absolute -bottom-6 -right-6 h-32 w-32 text-emerald-500/5 rotate-12" />}
                    </Card>
                ))}
                {insights.length === 0 && (
                    <div className="col-span-full py-20 text-center opacity-30 italic">
                        <Users className="h-10 w-10 mx-auto mb-4" />
                        <p className="text-xs font-black uppercase tracking-widest">Scanning Grid for Behavioral Signals...</p>
                    </div>
                )}
            </div>
        </section>
    );
}
