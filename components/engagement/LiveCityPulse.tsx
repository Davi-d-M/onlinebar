'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Card } from '@/components/ui/card';
import { MapPin, Zap, Flame, Star, Activity } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Trend {
    zone_name: string;
    active_visitors: number;
    active_orders: number;
    status: string;
}

export default function LiveCityPulse() {
    const [trends, setTrends] = useState<Trend[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchTrends() {
            if (!supabase) return;
            const { data } = await supabase
                .from('neighborhood_trends')
                .select('*')
                .order('active_visitors', { ascending: false });

            if (data) setTrends(data);
            setLoading(false);
        }
        fetchTrends();

        // Optional: Subscribe to real-time updates
        const channel = supabase
            ?.channel('city-pulse')
            .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'neighborhood_trends' }, fetchTrends)
            .subscribe();

        return () => {
            if (supabase && channel) supabase.removeChannel(channel);
        };
    }, []);

    if (loading) return null;

    return (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-24">
            <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-12 text-left">
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-[10px] font-black uppercase text-emerald-600 tracking-[0.3em]">Nairobi Pulse Active</span>
                    </div>
                    <h2 className="text-5xl font-black text-foreground uppercase tracking-tighter leading-none">Nairobi <br /><span className="text-primary">Right Now</span></h2>
                    <p className="text-slate-500 font-medium text-lg max-w-xl italic">
                        Real-time activity hotspots and trending beverage zones across the city.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {trends.map((zone) => (
                    <Card key={zone.zone_name} className="p-8 rounded-[2.5rem] bg-white border border-slate-100 shadow-sm group hover:border-primary/20 hover:shadow-xl transition-all relative overflow-hidden">
                        <div className="relative z-10 space-y-6">
                            <div className="flex justify-between items-start">
                                <div className="h-10 w-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 group-hover:text-primary transition-colors">
                                    <MapPin size={20} />
                                </div>
                                <span className={cn(
                                    "px-2 py-0.5 rounded-md text-[7px] font-black uppercase tracking-widest",
                                    zone.status === 'Trending' ? "bg-rose-500 text-white animate-pulse" :
                                    zone.status === 'Busy' ? "bg-amber-500 text-white" :
                                    "bg-emerald-500 text-white"
                                )}>
                                    {zone.status}
                                </span>
                            </div>

                            <div className="space-y-1 text-left">
                                <h3 className="text-lg font-black text-foreground uppercase tracking-tighter">{zone.zone_name}</h3>
                                <div className="flex items-center gap-1 text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                                    <Activity size={10} className="text-emerald-500" /> {zone.active_visitors} Live Patrons
                                </div>
                            </div>
                        </div>

                        {/* Status Icon Background */}
                        {zone.status === 'Trending' && <Flame className="absolute -bottom-6 -right-6 h-24 w-24 text-rose-500/5 rotate-12" />}
                        {zone.status === 'Busy' && <Zap className="absolute -bottom-6 -right-6 h-24 w-24 text-amber-500/5 rotate-12" />}
                        {zone.status === 'Elite Choice' && <Star className="absolute -bottom-6 -right-6 h-24 w-24 text-primary/5 rotate-12" />}
                    </Card>
                ))}
            </div>
        </section>
    );
}
