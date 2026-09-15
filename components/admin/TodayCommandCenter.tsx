'use client';

import * as React from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Card } from '@/components/ui/card';
import { Truck, Wine, DollarSign, Users, Bot, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CommandStats {
    revenue: number;
    orders: number;
    users: number;
    riders: number;
    shops: number;
    automation: number;
    demand_hotspot?: string;
}

export default function OperatingBrainHUD() {
    const [stats, setStats] = React.useState<CommandStats>({
        revenue: 0,
        orders: 0,
        users: 0,
        riders: 0,
        shops: 0,
        automation: 0,
        demand_hotspot: 'Neutral'
    });

    React.useEffect(() => {
        async function fetchCommandData() {
            if (!supabase) return;
            try {
                const [ordersRes, usersRes, ridersRes, shopsRes, revenueRes] = await Promise.all([
                    supabase.from('orders').select('id', { count: 'exact' }),
                    supabase.from('profiles').select('id', { count: 'exact' }),
                    supabase.from('rider_status').select('id', { count: 'exact' }).eq('status', 'Online'),
                    supabase.from('suppliers').select('id', { count: 'exact' }).eq('is_active', true),
                    supabase.from('financial_ledger').select('amount').eq('entry_type', 'REVENUE')
                ]);

                const totalRev = revenueRes.data?.reduce((sum, e) => sum + Number(e.amount), 0) || 0;

                // 2. Fetch Automation Status
                const { data: autoStates } = await supabase.from('system_autonomous_state').select('is_autonomous');
                const autoRate = autoStates && autoStates.length > 0
                    ? (autoStates.filter(s => s.is_autonomous).length / autoStates.length) * 100
                    : 0;

                // Online Bar Brain: Determine Hotspot
                const { data: buzz } = await supabase.from('buzz_metrics').select('zone_name').order('buzz_score', { ascending: false }).limit(1).single();

                setStats(prev => ({
                    ...prev,
                    revenue: totalRev,
                    orders: ordersRes.count || 0,
                    users: usersRes.count || 0,
                    riders: ridersRes.count || 0,
                    shops: shopsRes.count || 0,
                    automation: Number(autoRate.toFixed(1)),
                    demand_hotspot: buzz?.zone_name || 'Neutral'
                }));
            } catch {
                console.error("Brain HUD Link unstable.");
            }
        }

        fetchCommandData();

        if (!supabase) return;

        const channelId = `command-hud-sync-${Math.random().toString(36).substring(7)}`;
        const channel = supabase.channel(channelId)
            .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, fetchCommandData)
            .on('postgres_changes', { event: '*', schema: 'public', table: 'financial_ledger' }, fetchCommandData)
            .on('postgres_changes', { event: '*', schema: 'public', table: 'rider_status' }, fetchCommandData)
            .subscribe();

        return () => {
            if (supabase) {
                supabase.removeChannel(channel);
            }
        };
    }, []);

    const nodes = [
        { label: 'Revenue', val: `KSh ${(stats.revenue / 1000).toFixed(1)}K`, icon: DollarSign, color: 'primary', href: '/admin/finance' },
        { label: 'Demand Radar', val: stats.demand_hotspot, icon: Zap, color: 'rose', href: '/admin/analytics' },
        { label: 'Patrons', val: stats.users, icon: Users, color: 'emerald', href: '/admin/customers' },
        { label: 'Runners', val: stats.riders, icon: Truck, color: 'amber', href: '/admin/dispatch' },
        { label: 'Active Shops', val: stats.shops, icon: Wine, color: 'rose', href: '/admin/operations/vendors' },
        { label: 'Automation', val: `${stats.automation}%`, icon: Bot, color: 'indigo', href: '/admin/marketing/automation' }
    ];

    return (
        <section className="space-y-6">
            <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-3 text-left">
                    <div className="h-3 w-3 rounded-full bg-primary animate-ping"></div>
                    <h2 className="text-xl font-black uppercase tracking-tighter text-foreground leading-none">Operating Brain HUD</h2>
                </div>
                <div className="flex items-center gap-2">
                    <Zap size={10} className="text-primary animate-pulse" />
                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground">Network Synchronized</span>
                </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 lg:gap-10">
                {nodes.map((node) => (
                    <Card
                        key={node.label}
                        onClick={() => window.location.href = node.href}
                        className="aspect-[4/5] rounded-[4rem] bg-white border border-slate-100 shadow-sm relative overflow-hidden group hover:shadow-xl transition-all flex flex-col items-center justify-center gap-4 text-center p-4 min-w-[140px] cursor-pointer"
                    >
                        <div className={cn(
                            "h-12 w-12 rounded-full flex items-center justify-center transition-transform group-hover:scale-110 shadow-inner",
                            node.color === 'primary' ? 'bg-primary/10 text-primary' :
                            node.color === 'indigo' ? 'bg-indigo-50 text-indigo-500' :
                            node.color === 'emerald' ? 'bg-emerald-50 text-emerald-500' :
                            node.color === 'amber' ? 'bg-amber-50 text-amber-500' :
                            'bg-rose-50 text-rose-500'
                        )}>
                            <node.icon size={22} />
                        </div>
                        <div className="space-y-1">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">{node.label}</p>
                            <h3 className="text-xl font-black text-foreground tracking-tighter uppercase leading-none">{node.val}</h3>
                        </div>
                    </Card>
                ))}
            </div>
        </section>
    );
}
