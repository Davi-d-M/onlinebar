'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Trophy, Star, Sparkles, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LevelBadge } from '@/components/ui/LevelBadge';

export default function LevelUpCelebration() {
    const [show, setShow] = useState(false);
    const [levelData, setLevelData] = useState<{ level: number, title: string } | null>(null);

    useEffect(() => {
        if (!supabase) return;

        // Listener for profile updates with unique channel name to avoid subscription race conditions
        const channelId = `level-up-${Math.random().toString(36).substring(7)}`;
        const channel = supabase
            .channel(channelId)
            .on('postgres_changes', {
                event: 'UPDATE',
                schema: 'public',
                table: 'profiles'
            }, (payload) => {
                const oldLevel = payload.old.level || 0;
                const newLevel = payload.new.level || 0;

                if (newLevel > oldLevel) {
                    setLevelData({ level: newLevel, title: payload.new.title });
                    setShow(true);

                    // Auto-hide after 10 seconds
                    setTimeout(() => setShow(false), 10000);
                }
            })
            .subscribe();

        return () => {
            if (supabase) {
                supabase.removeChannel(channel);
            }
        };
    }, []);

    if (!show || !levelData) return null;

    return (
        <div className="fixed inset-0 z-[2000] bg-slate-900/80 backdrop-blur-xl flex items-center justify-center p-6 animate-in fade-in duration-500">
            <div className="max-w-md w-full bg-white rounded-[3.5rem] p-12 text-center space-y-10 relative overflow-hidden shadow-2xl animate-in zoom-in-95 duration-700">

                <div className="relative z-10 space-y-8">
                    <div className="mx-auto h-24 w-24 rounded-[2.5rem] bg-primary flex items-center justify-center text-white shadow-2xl shadow-primary/40 animate-bounce">
                        <Trophy size={48} />
                    </div>

                    <div className="space-y-2">
                        <h2 className="text-4xl font-black uppercase tracking-tighter text-foreground">Level Up!</h2>
                        <p className="text-sm text-slate-500 font-medium italic italic leading-relaxed px-4">
                            &quot;You&apos;ve reached a new tier of mixology excellence. Your status has been updated across the bar grid.&quot;
                        </p>
                    </div>

                    <div className="flex flex-col items-center gap-4 py-4">
                        <span className="text-[10px] font-black uppercase text-slate-300 tracking-[0.4em]">New Rank</span>
                        <LevelBadge level={levelData.level} title={levelData.title} className="scale-150" />
                    </div>

                    <div className="pt-6">
                        <Button
                            onClick={() => setShow(false)}
                            className="w-full h-16 rounded-2xl bg-slate-900 text-white font-black uppercase text-xs tracking-widest hover:bg-primary transition-all shadow-xl active:scale-95"
                        >
                            Continue My Journey
                        </Button>
                    </div>
                </div>

                {/* Decorative Background Elements */}
                <Sparkles className="absolute top-10 left-10 h-10 w-10 text-primary/20 animate-pulse" />
                <Star className="absolute bottom-10 right-10 h-12 w-12 text-amber-500/10 rotate-12" />
                <Trophy className="absolute -bottom-10 -left-10 h-48 w-48 text-slate-50 rotate-12 -z-0" />

                <button
                    onClick={() => setShow(false)}
                    className="absolute top-6 right-6 h-10 w-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 hover:text-rose-500 transition-all border border-slate-100"
                >
                    <X size={18} />
                </button>
            </div>
        </div>
    );
}
