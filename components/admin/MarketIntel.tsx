'use client';

import * as React from 'react';
import { Card } from '@/components/ui/card';
import { Globe, TrendingUp, TrendingDown, Loader2, Sparkles } from 'lucide-react';
import { cn, formatPrice } from '@/lib/utils';

interface CompetitorData {
    name: string;
    product: string;
    price: number;
    variance: number;
    sentiment: 'Positive' | 'Neutral' | 'Negative';
}

export default function MarketIntel() {
    const [loading, setLoading] = React.useState(true);
    const [intel] = React.useState<CompetitorData[]>([]);

    React.useEffect(() => {
        // Online Bar OS: Real-time market node sync would go here
        setLoading(false);
    }, []);

    if (loading) return <div className="h-64 bg-slate-50 rounded-[3rem] animate-pulse flex items-center justify-center"><Loader2 className="animate-spin text-slate-200" /></div>;

    return (
        <Card className="p-10 rounded-[3.5rem] bg-white border border-slate-100 shadow-sm space-y-12 text-left">
            <div className="flex justify-between items-center px-2">
                <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 shadow-sm">
                        <Globe size={24} />
                    </div>
                    <div>
                        <h3 className="text-xl font-black uppercase tracking-tighter text-foreground leading-none">Market Intelligence</h3>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Legitimate Market Sentiment Node</p>
                    </div>
                </div>
            </div>

            <div className="grid gap-4">
                {intel.length > 0 ? intel.map((c) => (
                    <div key={c.name + c.product} className="p-6 rounded-[2rem] bg-slate-50 border border-slate-100 flex items-center justify-between group hover:bg-white hover:shadow-xl transition-all">
                        <div className="flex items-center gap-6">
                            <div className="h-14 w-14 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-[10px] font-black uppercase text-slate-400 shadow-sm">
                                {c.name.substring(0, 2)}
                            </div>
                            <div className="text-left">
                                <p className="text-xs font-black uppercase text-foreground">{c.product}</p>
                                <p className="text-[9px] font-bold text-slate-400 uppercase mt-1">Platform: {c.name}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-10">
                            <div className="text-right">
                                <p className="text-sm font-black text-foreground">{formatPrice(c.price)}</p>
                                <div className={cn(
                                    "flex items-center gap-1 mt-1 font-black text-[8px] uppercase",
                                    c.variance > 0 ? "text-rose-500" : "text-emerald-500"
                                )}>
                                    {c.variance > 0 ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                                    {Math.abs(c.variance)}% vs OB
                                </div>
                            </div>
                            <div className="hidden sm:block text-right min-w-[80px]">
                                <p className="text-[8px] font-black text-slate-300 uppercase mb-1">Sentiment</p>
                                <span className={cn(
                                    "px-2 py-0.5 rounded text-[8px] font-black uppercase",
                                    c.sentiment === 'Positive' ? "bg-emerald-50 text-emerald-600" :
                                    c.sentiment === 'Negative' ? "bg-rose-50 text-rose-600" : "bg-slate-100 text-slate-400"
                                )}>{c.sentiment}</span>
                            </div>
                        </div>
                    </div>
                )) : (
                    <div className="py-20 text-center bg-slate-50 rounded-[2.5rem] border-2 border-dashed border-slate-100 opacity-30 flex flex-col items-center gap-4">
                        <Globe size={40} className="text-slate-200" />
                        <p className="text-[10px] font-black uppercase tracking-widest italic">Awaiting competitive intelligence uplink...</p>
                    </div>
                )}
            </div>

            <div className="p-8 bg-indigo-50 border border-indigo-100 rounded-[2.5rem] space-y-4">
                <div className="flex items-center gap-3">
                    <Sparkles size={18} className="text-indigo-500" />
                    <p className="text-xs font-black uppercase text-indigo-700">Market Insight</p>
                </div>
                <p className="text-sm font-medium italic text-indigo-600 leading-relaxed">
                    &quot;Competitors have increased pricing on Premium Whiskeys by 5% this weekend. Recommend maintaining current levels to capture price-sensitive patrons in the Westlands sector.&quot;
                </p>
            </div>
        </Card>
    );
}
