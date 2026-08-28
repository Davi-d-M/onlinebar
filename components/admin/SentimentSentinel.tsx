'use client';

import * as React from 'react';
import { supabase } from '@/lib/supabaseClient';
import {
    AlertCircle,
    TrendingDown,
    ChevronRight,
    ArrowRight
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function SentimentSentinel() {
    const [hotIssues, setHotIssues] = React.useState<{ id: number; type: string; body: string }[]>([]);

    React.useEffect(() => {
        async function checkSentiment() {
            if (!supabase) return;
            // Scan for Negative sentiment in Open items
            const { data: tickets } = await supabase.from('support_tickets').select('*').eq('status', 'Open');
            const { data: reviews } = await supabase.from('reviews').select('*').is('admin_response', null).lte('rating', 2);

            const negative = [
                ...(tickets || []).map((t: { id: number; description: string }) => ({ id: t.id, type: 'Support', body: t.description })),
                ...(reviews || []).map((r: { id: number; comment: string }) => ({ id: r.id, type: 'Review', body: r.comment }))
            ].filter(item => {
                const lower = item.body.toLowerCase();
                return lower.includes('bad') || lower.includes('delay') || lower.includes('angry') || lower.includes('worst');
            });

            setHotIssues(negative.slice(0, 2));
        }
        checkSentiment();
        const interval = setInterval(checkSentiment, 60000);
        return () => clearInterval(interval);
    }, []);

    if (hotIssues.length === 0) return null;

    return (
        <Card className="p-8 rounded-[3rem] bg-rose-50 text-rose-600 border border-rose-100 shadow-xl shadow-rose-500/10 animate-in zoom-in-95 duration-500 relative overflow-hidden group">
            <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8 text-left">
                <div className="flex items-center gap-6 text-left">
                    <div className="h-16 w-16 rounded-[1.8rem] bg-white border border-rose-200 flex items-center justify-center shadow-sm">
                        <TrendingDown className="h-8 w-8 text-rose-600 animate-bounce" />
                    </div>
                    <div>
                        <h3 className="text-xl font-black uppercase tracking-tighter leading-none">Sentinel: Vibe Check</h3>
                        <p className="text-[10px] font-medium text-rose-400 italic mt-2">&quot;Negative customer sentiment detected in the dispatch grid.&quot;</p>
                    </div>
                </div>

                <div className="flex flex-col gap-3 flex-1 w-full max-w-md">
                    {hotIssues.map((issue, i) => (
                        <div key={i} className="p-4 rounded-2xl bg-white border border-rose-100 flex justify-between items-center group/issue hover:shadow-lg transition-all">
                            <div className="flex items-center gap-3">
                                <AlertCircle size={14} className="text-rose-500" />
                                <p className="text-[10px] font-black uppercase text-rose-700 truncate max-w-[200px]">{issue.type}: &quot;{issue.body}&quot;</p>
                            </div>
                            <Link href="/admin/support/vip-relay">
                                <ChevronRight size={14} className="text-rose-300 group-hover/issue:translate-x-1 transition-transform" />
                            </Link>
                        </div>
                    ))}
                </div>

                <Link href="/admin/support/vip-relay">
                    <Button className="h-14 px-8 rounded-2xl bg-rose-600 text-white font-black uppercase text-[10px] tracking-widest shadow-xl hover:bg-rose-700 active:scale-95 transition-all">
                        VIP Relay <ArrowRight size={14} className="ml-2" />
                    </Button>
                </Link>
            </div>
            <div className="absolute -top-10 -right-10 h-64 w-64 bg-white/50 rounded-full blur-3xl" />
        </Card>
    );
}
