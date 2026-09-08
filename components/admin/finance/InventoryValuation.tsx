'use client';

import * as React from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Card } from '@/components/ui/card';
import { Package, TrendingUp, AlertTriangle, ChevronRight } from 'lucide-react';
import { formatPrice } from '@/lib/utils';

export default function InventoryValuation() {
    const [stats, setStats] = React.useState({
        total_value: 0,
        sku_count: 0,
        shrinkage_variance: 0,
        low_stock_skus: 0
    });
    const [loading, setLoading] = React.useState(true);

    const fetchValuation = React.useCallback(async () => {
        if (!supabase) return;
        try {
            const { data } = await supabase
                .from('products')
                .select('stock, cost_price, status');

            let totalValue = 0;
            let lowStockCount = 0;

            data?.forEach(p => {
                totalValue += (p.stock || 0) * (p.cost_price || 0);
                if (p.stock <= 5) lowStockCount++;
            });

            setStats({
                total_value: totalValue,
                sku_count: data?.length || 0,
                shrinkage_variance: 0, // Difference between ledger and physical
                low_stock_skus: lowStockCount
            });
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }, []);

    React.useEffect(() => {
        fetchValuation();
    }, [fetchValuation]);

    if (loading) return <div className="h-64 bg-slate-50 rounded-[3rem] animate-pulse" />;

    return (
        <Card className="p-10 rounded-[3.5rem] bg-white border border-slate-100 shadow-sm space-y-10 text-left">
            <header className="flex justify-between items-center px-2">
                <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-500 shadow-sm">
                        <Package size={24} />
                    </div>
                    <div>
                        <h3 className="text-xl font-black uppercase tracking-tighter text-foreground">Shelve Wealth</h3>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Live Asset Valuation (WAC)</p>
                    </div>
                </div>
            </header>

            <div className="grid sm:grid-cols-2 gap-8">
                <div className="space-y-8">
                    <div>
                        <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Total Stock Value</p>
                        <h3 className="text-4xl font-black text-foreground tracking-tighter">{formatPrice(stats.total_value)}</h3>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <p className="text-[8px] font-black uppercase text-slate-400">Linked SKUs</p>
                            <p className="text-xl font-black text-foreground">{stats.sku_count}</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-[8px] font-black uppercase text-slate-400">Critical Low</p>
                            <p className="text-xl font-black text-rose-500">{stats.low_stock_skus}</p>
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="p-6 rounded-[2rem] bg-rose-50 border border-rose-100 flex items-center justify-between group cursor-help">
                        <div className="flex items-center gap-4">
                            <AlertTriangle className="text-rose-500" size={20} />
                            <div>
                                <p className="text-[9px] font-black uppercase text-rose-700">Stock Shrinkage</p>
                                <p className="text-sm font-black text-rose-600">{formatPrice(stats.shrinkage_variance)} Lost</p>
                            </div>
                        </div>
                        <ChevronRight className="text-rose-300 group-hover:translate-x-1 transition-transform" size={16} />
                    </div>

                    <div className="p-6 rounded-[2rem] bg-emerald-50 border border-emerald-100 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <TrendingUp className="text-emerald-500" size={20} />
                            <div>
                                <p className="text-[9px] font-black uppercase text-emerald-700">Margin Health</p>
                                <p className="text-sm font-black text-emerald-600">32.4% Average</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Card>
    );
}
