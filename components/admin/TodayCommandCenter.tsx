'use client';

import * as React from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Card } from '@/components/ui/card';
import { ShoppingBag, Truck, Wine, DollarSign, Users, Bot, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CommandStats {
    revenue: number;
    orders: number;
    users: number;
    riders: number;
    shops: number;
    automation: number;
}

export default function TodayCommandCenter() {
    const [stats, setStats] = React.useState<CommandStats>({
        revenue: 0,
        orders: 0,
        users: 0,
        riders: 0,
        shops: 0,
        automation: 94.7
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

                setStats(prev => ({
                    ...prev,
                    revenue: totalRev,
                    orders: ordersRes.count || 0,
                    users: usersRes.count || 0,
                    riders: ridersRes.count || 0,
                    shops: shopsRes.count || 0
                }));
            } catch {
                console.error("Command HUD Link unstable.");
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
        { label: 'Revenue', val: `KSh ${(stats.revenue / 1000).toFixed(1)}K`, icon: DollarSign, color: 'primary' },
        { label: 'Orders', val: stats.orders, icon: ShoppingBag, color: 'indigo' },
        { label: 'Patrons', val: stats.users, icon: Users, color: 'emerald' },
        { label: 'Runners', val: stats.riders, icon: Truck, color: 'amber' },
        { label: 'Active Shops', val: stats.shops, icon: Wine, color: 'rose' },
        { label: 'Automation', val: `${stats.automation}%`, icon: Bot, color: 'indigo' }
    ];

    return (
        <section className="space-y-6">
            <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-3 text-left">
                    <div className="h-2 w-2 rounded-full bg-primary animate-pulse"></div>
                    <h2 className="text-xl font-black uppercase tracking-tighter text-foreground leading-none">Command Center HUD</h2>
                </div>
                <div className="flex items-center gap-2">
                    <Zap size={10} className="text-primary animate-pulse" />
                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground">Network Synchronized</span>
                </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {nodes.map((node) => (
                    <Card key={node.label} className="p-6 rounded-[2.5rem] bg-white border border-slate-100 shadow-sm relative overflow-hidden group hover:shadow-xl transition-all">
                        <div className="relative z-10 flex flex-col gap-4 text-left">
                            <div className={cn(
                                "h-10 w-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110",
                                node.color === 'primary' ? 'bg-primary/10 text-primary' :
                                node.color === 'indigo' ? 'bg-indigo-50 text-indigo-500' :
                                node.color === 'emerald' ? 'bg-emerald-50 text-emerald-500' :
                                node.color === 'amber' ? 'bg-amber-50 text-amber-500' :
                                'bg-rose-50 text-rose-500'
                            )}>
                                <node.icon size={20} />
                            </div>
                            <div className="space-y-0.5">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{node.label}</p>
                                <h3 className="text-2xl font-black text-foreground tracking-tighter uppercase leading-none">{node.val}</h3>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>
        </section>
    );
}
