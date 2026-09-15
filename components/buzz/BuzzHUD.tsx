'use client';

import * as React from 'react';
import { Card } from '@/components/ui/card';
import { Flame, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabaseClient';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import PulseDetailModal from './PulseDetailModal';

interface BuzzArea {
    zone_name: string;
    buzz_score: number;
    buzz_status: 'BUZZING' | 'BUSY' | 'ACTIVE' | 'QUIET';
    active_visitors: number;
}

export default function BuzzHUD() {
    const [hotspots, setHotspots] = React.useState<BuzzArea[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [selectedArea, setSelectedArea] = React.useState<string | null>(null);

    const fetchBuzz = React.useCallback(async () => {
        if (!supabase) return;
        try {
            const { data } = await supabase.from('buzz_metrics').select('*').order('buzz_score', { ascending: false }).limit(4);
            if (data) setHotspots(data as BuzzArea[]);
        } catch (err) {
            console.error("Buzz Link Interference:", err);
        } finally {
            setLoading(false);
        }
    }, []);

    React.useEffect(() => {
        fetchBuzz();
        const interval = setInterval(fetchBuzz, 30000); // 30s pulse
        return () => clearInterval(interval);
    }, [fetchBuzz]);

    if (loading && hotspots.length === 0) return <div className="h-48 bg-slate-50 rounded-[3rem] animate-pulse" />;

    return (
        <>
        <Card className="p-8 rounded-[3rem] bg-white border border-slate-100 shadow-sm space-y-8 text-left">
            <header className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-rose-50 flex items-center justify-center text-rose-500 animate-pulse">
                        <Flame size={20} fill="currentColor" />
                    </div>
                    <div>
                        <h2 className="text-xl font-black uppercase tracking-tighter text-foreground leading-none">What&apos;s Buzzing?</h2>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Nairobi Live Pulse</p>
                    </div>
                </div>
                <Link href="/buzz">
                    <Button variant="ghost" size="sm" className="h-8 rounded-lg text-[8px] font-black uppercase text-primary hover:bg-primary/5">Explore The Buzz &rarr;</Button>
                </Link>
            </header>

            <div className="space-y-4">
                {hotspots.map((area) => (
                    <div
                        key={area.zone_name}
                        onClick={() => setSelectedArea(area.zone_name)}
                        className="space-y-2 group cursor-pointer"
                    >
                        <div className="flex justify-between items-end px-1">
                            <div className="flex items-center gap-2">
                                <span className={cn(
                                    "text-xs font-black uppercase tracking-tight transition-colors",
                                    area.buzz_status === 'BUZZING' ? "text-rose-500" : "text-foreground group-hover:text-primary"
                                )}>
                                    {area.zone_name}
                                </span>
                                {area.buzz_status === 'BUZZING' && <Flame size={12} className="text-rose-500 fill-current animate-bounce" />}
                            </div>
                            <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">{area.active_visitors} Active</span>
                        </div>
                        <div className="h-2 w-full bg-slate-50 rounded-full overflow-hidden border border-slate-100 p-0.5 relative">
                            <div
                                className={cn(
                                    "h-full rounded-full transition-all duration-1000 ease-out",
                                    area.buzz_status === 'BUZZING' ? "bg-rose-500 shadow-[0_0_10px_#f43f5e]" :
                                    area.buzz_status === 'BUSY' ? "bg-orange-400" : "bg-primary"
                                )}
                                style={{ width: `${area.buzz_score}%` }}
                            />
                        </div>
                    </div>
                ))}
            </div>

            <div className="pt-4 border-t border-slate-50 flex items-center justify-between text-[8px] font-black uppercase text-slate-400">
                <p className="flex items-center gap-1.5"><TrendingUp size={10} className="text-primary" /> Sector velocity stable</p>
                <p className="italic">GPRS Pulse Established</p>
            </div>
        </Card>

        {selectedArea && (
            <PulseDetailModal
                areaName={selectedArea}
                onClose={() => setSelectedArea(null)}
            />
        )}
        </>
    );
}
