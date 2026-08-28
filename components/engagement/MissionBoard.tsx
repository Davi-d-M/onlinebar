'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Card } from '@/components/ui/card';
import { Target, Zap, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Mission {
    type: string;
    label: string;
    description: string;
    xp: number;
    target: number;
    progress: number;
    is_completed: boolean;
}

export default function MissionBoard({ userId }: { userId: string }) {
    const [missions, setMissions] = useState<Mission[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadMissions() {
            if (!supabase || !userId) return;

            // In a real scenario, this would fetch from 'user_missions' table joined with mission definitions
            // For now, mocking with some real data structure
            const { data } = await supabase
                .from('user_missions')
                .select('*')
                .eq('user_id', userId);

            // Fallback definitions for the board
            const definitions = [
                { type: 'buy-mixers', label: 'Explore Mixers', xp: 250, target: 2 },
                { type: 'review-product', label: 'Patron Voice', xp: 100, target: 1 },
                { type: 'refer-friend', label: 'Spread the Word', xp: 500, target: 1 }
            ];

            const merged = definitions.map(def => {
                const userProgress = data?.find(m => m.mission_type === def.type);
                return {
                    ...def,
                    description: `Complete this to earn ${def.xp} XP`,
                    progress: userProgress?.progress || 0,
                    is_completed: userProgress?.is_completed || false
                };
            });

            setMissions(merged);
            setLoading(false);
        }
        loadMissions();
    }, [userId]);

    if (loading) return <div className="h-48 flex items-center justify-center bg-slate-50 rounded-3xl animate-pulse"><Loader2 className="animate-spin text-slate-200" /></div>;

    return (
        <section className="space-y-6">
            <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-3">
                    <Target className="h-6 w-6 text-primary" />
                    <h2 className="text-2xl font-black uppercase tracking-tighter text-foreground">Mission Board</h2>
                </div>
                <span className="text-[10px] font-black uppercase text-slate-400">Updates every 24h</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {missions.map((m) => (
                    <Card key={m.type} className={cn(
                        "p-8 rounded-[2.5rem] border transition-all relative overflow-hidden group",
                        m.is_completed ? "bg-emerald-50 border-emerald-100 opacity-80" : "bg-white border-slate-100 hover:shadow-xl hover:border-primary/20"
                    )}>
                        <div className="relative z-10 space-y-6">
                            <div className="flex justify-between items-start">
                                <div className={cn(
                                    "h-12 w-12 rounded-2xl flex items-center justify-center shadow-inner",
                                    m.is_completed ? "bg-emerald-500 text-white" : "bg-primary/10 text-primary"
                                )}>
                                    <Zap size={20} />
                                </div>
                                <span className={cn(
                                    "px-2 py-1 rounded-md text-[8px] font-black uppercase tracking-widest",
                                    m.is_completed ? "bg-emerald-100 text-emerald-600" : "bg-slate-100 text-slate-400"
                                )}>
                                    {m.is_completed ? 'Success' : 'In Progress'}
                                </span>
                            </div>

                            <div className="space-y-2 text-left">
                                <h3 className="text-xl font-black text-foreground uppercase tracking-tight leading-none">{m.label}</h3>
                                <p className="text-[10px] text-slate-400 font-medium italic">{m.description}</p>
                            </div>

                            <div className="space-y-3">
                                <div className="flex justify-between text-[8px] font-black uppercase text-slate-400">
                                    <span>Progress: {m.progress} / {m.target}</span>
                                    <span>+{m.xp} XP</span>
                                </div>
                                <div className="h-1.5 w-full bg-slate-50 rounded-full overflow-hidden border border-slate-100">
                                    <div
                                        className={cn(
                                            "h-full rounded-full transition-all duration-1000",
                                            m.is_completed ? "bg-emerald-500" : "bg-primary"
                                        )}
                                        style={{ width: `${(m.progress / m.target) * 100}%` }}
                                    />
                                </div>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>
        </section>
    );
}
