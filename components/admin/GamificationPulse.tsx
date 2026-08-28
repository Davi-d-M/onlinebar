'use client';

import React from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Card } from '@/components/ui/card';
import { Trophy, Star, Flame, Loader2 } from 'lucide-react';
import { LevelBadge } from '@/components/ui/LevelBadge';

export default function GamificationPulse() {
    const [stats, setStats] = React.useState({
        topPatron: { name: '---', level: 1, title: 'Newcomer' },
        highestStreak: 0,
        activeSeasons: 0,
        totalXP: 0
    });
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        async function fetchPulse() {
            if (!supabase) return;
            try {
                const [topRes, streakRes, seasonRes, xpRes] = await Promise.all([
                    supabase.from('profiles').select('full_name, level, title').order('xp', { ascending: false }).limit(1).maybeSingle(),
                    supabase.from('profiles').select('current_streak').order('current_streak', { ascending: false }).limit(1).maybeSingle(),
                    supabase.from('seasons').select('id', { count: 'exact', head: true }).eq('is_active', true),
                    supabase.from('profiles').select('xp')
                ]);

                setStats(prev => ({
                    topPatron: topRes.data ? { name: topRes.data.full_name || 'Anonymous', level: topRes.data.level, title: topRes.data.title } : prev.topPatron,
                    highestStreak: streakRes.data?.current_streak || 0,
                    activeSeasons: seasonRes.count || 0,
                    totalXP: xpRes.data?.reduce((sum, p) => sum + (p.xp || 0), 0) || 0
                }));
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        }
        fetchPulse();
    }, []);

    if (loading) return <div className="h-48 flex items-center justify-center bg-white rounded-[3rem] border border-slate-100"><Loader2 className="animate-spin text-primary" /></div>;

    return (
        <Card className="p-10 rounded-[3rem] bg-white border border-slate-100 shadow-sm relative overflow-hidden group hover:shadow-xl transition-all h-full">
            <div className="relative z-10 space-y-8">
                <div className="flex justify-between items-start text-left">
                    <div className="h-12 w-12 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-500">
                        <Trophy className="h-6 w-6" />
                    </div>
                    <div className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-500 text-[8px] font-black uppercase tracking-widest flex items-center gap-1">
                        <div className="h-1 w-1 rounded-full bg-emerald-500 animate-pulse" /> Engine Online
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-6 text-left">
                    <div className="space-y-1">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Top Patron</p>
                        <p className="text-sm font-black text-foreground uppercase truncate">{stats.topPatron.name}</p>
                        <LevelBadge level={stats.topPatron.level} title={stats.topPatron.title} className="mt-1" />
                    </div>
                    <div className="space-y-1 text-right">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Peak Streak</p>
                        <div className="flex items-center justify-end gap-1.5 text-rose-500">
                            <Flame size={14} strokeWidth={3} />
                            <span className="text-xl font-black">{stats.highestStreak}D</span>
                        </div>
                    </div>
                </div>

                <div className="pt-6 border-t border-slate-50 flex justify-between items-end text-left">
                    <div className="space-y-1">
                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Active Seasons</p>
                        <p className="text-lg font-black text-foreground">{stats.activeSeasons}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Network XP</p>
                        <p className="text-lg font-black text-primary">{(stats.totalXP / 1000).toFixed(1)}K</p>
                    </div>
                </div>
            </div>
            <Star className="absolute -bottom-6 -right-6 h-32 w-32 text-amber-500/5 rotate-12 -z-0" />
        </Card>
    );
}
