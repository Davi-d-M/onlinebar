'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Card } from '@/components/ui/card';
import { LevelBadge } from '@/components/ui/LevelBadge';
import { LevelProgressBar } from './LevelProgressBar';
import { Flame, Target, Trophy, ChevronRight, Zap, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

import MissionBoard from './MissionBoard';

export default function EngagementDashboard() {
    const [user, setUser] = useState<any>(null);
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadProfile() {
            if (!supabase) return;
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
                setUser(session.user);
                const { data } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', session.user.id)
                    .single();
                setProfile(data);
            }
            setLoading(false);
        }
        loadProfile();
    }, []);

    if (loading) return (
        <div className="h-48 w-full bg-slate-50 rounded-[3rem] animate-pulse flex items-center justify-center">
            <Loader2 className="animate-spin text-slate-200" />
        </div>
    );

    if (!user || !profile) return null;

    const firstName = profile.full_name?.split(' ')[0] || 'Patron';
    const hour = new Date().getHours();
    const greeting = hour < 12 ? 'Good Morning' : hour < 18 ? 'Good Afternoon' : 'Good Evening';

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16 animate-in fade-in slide-in-from-top-4 duration-700">
            <div className="grid lg:grid-cols-12 gap-8 items-stretch">

                {/* 1. Greeting & Level */}
                <Card className="lg:col-span-5 p-10 rounded-[3.5rem] bg-white border border-slate-100 shadow-sm space-y-8 relative overflow-hidden group">
                    <div className="relative z-10 space-y-6">
                        <div className="space-y-2">
                            <p className="text-[10px] font-black uppercase text-slate-400 tracking-[0.4em]">{greeting},</p>
                            <h2 className="text-5xl font-black text-foreground uppercase tracking-tighter leading-none">
                                {firstName} <span className="text-primary animate-pulse">👋</span>
                            </h2>
                        </div>

                        <div className="flex items-center gap-4">
                            <LevelBadge level={profile.level} title={profile.title} className="scale-125 origin-left" />
                            <div className="h-6 w-px bg-slate-100 mx-2" />
                            <div className="flex items-center gap-2 text-rose-500">
                                <Flame size={18} strokeWidth={3} />
                                <span className="text-lg font-black">{profile.current_streak || 0}D Streak</span>
                            </div>
                        </div>

                        <LevelProgressBar xp={profile.xp} level={profile.level} className="pt-4" />
                    </div>
                    <Zap className="absolute -bottom-10 -right-10 h-64 w-64 text-primary/5 rotate-12 -z-0" />
                </Card>

                {/* 2. Today's Missions */}
                <Card className="lg:col-span-4 p-10 rounded-[3.5rem] bg-white border border-slate-100 shadow-sm relative overflow-hidden group">
                    <div className="relative z-10 h-full flex flex-col justify-between space-y-10">
                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <Target className="h-5 w-5 text-primary" />
                                <h3 className="text-sm font-black uppercase tracking-widest text-foreground">Active Missions</h3>
                            </div>
                            <span className="text-[9px] font-black uppercase text-slate-400">Reset in 4h</span>
                        </div>

                        <div className="space-y-6">
                            {[
                                { label: 'Explore Westlands', xp: 250, progress: 0, target: 1 },
                                { label: 'Review Last Order', xp: 100, progress: 1, target: 1, done: true },
                                { label: 'Share with Crew', xp: 50, progress: 0, target: 1 }
                            ].map((m, i) => (
                                <div key={i} className={cn(
                                    "flex items-center justify-between p-4 rounded-2xl border transition-all",
                                    m.done ? "bg-emerald-50 border-emerald-100 opacity-50" : "bg-slate-50 border-slate-100 hover:bg-white hover:border-primary/20"
                                )}>
                                    <div className="flex items-center gap-4">
                                        <div className={cn(
                                            "h-8 w-8 rounded-lg flex items-center justify-center",
                                            m.done ? "bg-emerald-500 text-white" : "bg-primary/10 text-primary"
                                        )}>
                                            <Zap size={14} />
                                        </div>
                                        <div>
                                            <p className="text-[11px] font-black uppercase tracking-tight text-foreground">{m.label}</p>
                                            <p className="text-[8px] font-bold text-slate-400 uppercase">+{m.xp} XP Reward</p>
                                        </div>
                                    </div>
                                    <ChevronRight size={14} className="text-slate-300" />
                                </div>
                            ))}
                        </div>
                    </div>
                </Card>

                {/* 3. Small Quick Links */}
                <div className="lg:col-span-3 grid grid-cols-2 lg:grid-cols-1 gap-4 items-stretch">
                    <Link href="/profile/achievements" className="group">
                        <Card className="p-8 rounded-[2.5rem] bg-white border border-slate-100 shadow-sm flex flex-col justify-center items-center text-center gap-4 group-hover:border-primary/20 transition-all h-full">
                            <div className="h-12 w-12 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-500 group-hover:scale-110 transition-transform">
                                <Trophy size={24} />
                            </div>
                            <div className="space-y-1">
                                <p className="text-xl font-black text-foreground uppercase tracking-tighter">23</p>
                                <p className="text-[8px] font-black uppercase text-slate-400 tracking-widest">Badges</p>
                            </div>
                        </Card>
                    </Link>

                    <Link href="/rewards" className="group">
                        <Card className="p-8 rounded-[2.5rem] bg-white border border-slate-100 shadow-sm flex flex-col justify-center items-center text-center gap-4 group-hover:border-primary/20 transition-all h-full">
                            <div className="h-12 w-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-500 group-hover:scale-110 transition-transform">
                                <Zap size={24} />
                            </div>
                            <div className="space-y-1">
                                <p className="text-xl font-black text-foreground uppercase tracking-tighter">{profile.loyalty_points || 0}</p>
                                <p className="text-[8px] font-black uppercase text-slate-400 tracking-widest">Bar Points</p>
                            </div>
                        </Card>
                    </Link>
                </div>

            </div>

            <div className="mt-8">
                <MissionBoard userId={profile.id} />
            </div>
        </div>
    );
}
