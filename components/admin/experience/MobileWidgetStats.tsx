'use client';

import * as React from 'react';
import { supabase } from '@/lib/supabaseClient';
import {
    TrendingUp,
    Smartphone,
    MousePointer2
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { formatPrice } from '@/lib/utils';

interface WidgetStat {
    title: string;
    impressions: number;
    clicks: number;
    ctr: number;
    revenue: number;
}

export default function MobileWidgetStats() {
    const [stats, setStats] = React.useState<WidgetStat[]>([]);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        async function fetchStats() {
            if (!supabase) return;
            try {
                // In a real system, this would be an aggregation query or a RPC
                const { data } = await supabase.from('mobile_app_widgets').select('id, title');

                if (data) {
                    const mockStats = data.map(w => ({
                        title: w.title,
                        impressions: Math.floor(Math.random() * 5000) + 1000,
                        clicks: Math.floor(Math.random() * 500) + 50,
                        ctr: 0,
                        revenue: Math.floor(Math.random() * 50000) + 5000
                    })).map(s => ({ ...s, ctr: (s.clicks / s.impressions) * 100 }));

                    setStats(mockStats);
                }
            } catch (err) { console.error(err); }
            finally { setLoading(false); }
        }
        fetchStats();
    }, []);

    if (loading) return <div className="h-64 bg-slate-50 rounded-[3rem] animate-pulse" />;

    return (
        <Card className="p-8 rounded-[3rem] bg-white border border-slate-100 shadow-sm space-y-8 text-left">
            <header className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                        <Smartphone size={20} />
                    </div>
                    <div>
                        <h2 className="text-xl font-black uppercase tracking-tighter text-foreground leading-none">Widget ROI</h2>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Home Screen Performance</p>
                    </div>
                </div>
                <div className="flex items-center gap-2 px-3 py-1 bg-emerald-50 rounded-full border border-emerald-100 text-emerald-600">
                    <TrendingUp size={12} />
                    <span className="text-[9px] font-black uppercase tracking-widest">+14.2%</span>
                </div>
            </header>

            <div className="space-y-6">
                {stats.map((s) => (
                    <div key={s.title} className="space-y-3 group cursor-default">
                        <div className="flex justify-between items-end px-1">
                            <div className="min-w-0">
                                <p className="text-xs font-black uppercase tracking-tight text-foreground truncate">{s.title}</p>
                                <p className="text-[8px] font-bold text-slate-400 uppercase mt-0.5 tracking-widest">{s.impressions.toLocaleString()} Impressions</p>
                            </div>
                            <div className="text-right">
                                <p className="text-sm font-black text-primary leading-none">{s.ctr.toFixed(1)}% CTR</p>
                                <p className="text-[9px] font-bold text-emerald-600 uppercase mt-1">{formatPrice(s.revenue)}</p>
                            </div>
                        </div>
                        <div className="h-1.5 w-full bg-slate-50 rounded-full overflow-hidden border border-slate-100 p-0.5 relative">
                            <div
                                className="h-full bg-indigo-500 rounded-full transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(99,102,241,0.3)]"
                                style={{ width: `${Math.min(100, s.ctr * 10)}%` }}
                            />
                        </div>
                    </div>
                ))}
            </div>

            <div className="pt-6 border-t border-slate-50 flex items-center justify-between text-[8px] font-black uppercase text-slate-400">
                <p className="flex items-center gap-1.5"><MousePointer2 size={10} className="text-primary" /> Tracking {stats.length} active nodes</p>
                <button className="text-primary hover:underline underline-offset-4">Full Audit Log &rarr;</button>
            </div>
        </Card>
    );
}
