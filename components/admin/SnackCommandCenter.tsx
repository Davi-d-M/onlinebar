'use client';

import * as React from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Card } from '@/components/ui/card';
import { Utensils, TrendingUp, AlertTriangle, CheckCircle2, Loader2 } from 'lucide-react';
import { formatPrice } from '@/lib/utils';

export default function SnackCommandCenter() {
    const [stats, setStats] = React.useState({
        gmv: 0,
        orders: 0,
        lowStock: 0,
        activeMerchants: 0
    });
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        async function fetchSnackStats() {
            if (!supabase) return;
            try {
                const [ordersRes, merchantsRes, lowStockRes] = await Promise.all([
                    supabase.from('order_items').select('unit_price, quantity, products!inner(is_snack)').eq('products.is_snack', true),
                    supabase.from('suppliers').select('id', { count: 'exact', head: true }).eq('is_active', true),
                    supabase.from('products').select('id', { count: 'exact', head: true }).eq('is_snack', true).lte('stock', 5)
                ]);

                const gmv = ordersRes.data?.reduce((sum, item) => sum + (item.unit_price * item.quantity), 0) || 0;

                setStats({
                    gmv,
                    orders: ordersRes.data?.length || 0,
                    lowStock: lowStockRes.count || 0,
                    activeMerchants: merchantsRes.count || 0
                });
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        }
        fetchSnackStats();
    }, []);

    if (loading) return <div className="h-48 bg-slate-50 rounded-[3rem] animate-pulse flex items-center justify-center"><Loader2 className="animate-spin text-slate-200" /></div>;

    return (
        <Card className="p-10 rounded-[3.5rem] bg-white border border-slate-100 shadow-sm space-y-10 text-left relative overflow-hidden group">
            <div className="relative z-10 flex justify-between items-center px-2">
                <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-sm">
                        <Utensils size={24} />
                    </div>
                    <div>
                        <h3 className="text-xl font-black uppercase tracking-tighter text-foreground leading-none">Snack Sector</h3>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Mini-Commerce Intelligence</p>
                    </div>
                </div>
                <div className="flex items-center gap-2 px-3 py-1 bg-primary/5 text-primary rounded-full text-[9px] font-black uppercase border border-primary/10">
                    <TrendingUp size={12} /> Yield: High
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="p-6 rounded-[2rem] bg-slate-50 border border-slate-100 space-y-2">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Snack GMV</p>
                    <p className="text-2xl font-black text-foreground">{formatPrice(stats.gmv)}</p>
                </div>
                <div className="p-6 rounded-[2rem] bg-slate-50 border border-slate-100 space-y-2">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Active Nodes</p>
                    <p className="text-2xl font-black text-foreground">{stats.activeMerchants} Bars</p>
                </div>
            </div>

            <div className="space-y-4">
                <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-2">Operational Alerts</h4>
                {stats.lowStock > 0 ? (
                    <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-center justify-between group">
                        <div className="flex items-center gap-3">
                            <AlertTriangle size={16} className="text-rose-500" />
                            <p className="text-[10px] font-black text-rose-700 uppercase">{stats.lowStock} Items Low in Stock</p>
                        </div>
                        <button className="text-[9px] font-black text-rose-500 uppercase underline">Restock →</button>
                    </div>
                ) : (
                    <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center gap-3">
                        <CheckCircle2 size={16} className="text-emerald-500" />
                        <p className="text-[10px] font-black text-emerald-700 uppercase">All Snack Nodes Optimal</p>
                    </div>
                )}
            </div>

            <Utensils className="absolute -bottom-10 -right-10 h-64 w-64 text-primary/5 rotate-12 -z-0" />
        </Card>
    );
}
