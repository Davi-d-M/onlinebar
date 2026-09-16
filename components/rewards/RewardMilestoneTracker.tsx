'use client';

import * as React from 'react';
import {
    Trophy,
    Crown,
    ShieldCheck,
    Sparkles
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { ApexLoyalty, TierInfo } from '@/lib/engines/loyaltyEngine';
import { supabase } from '@/lib/supabaseClient';

export default function RewardMilestoneTracker() {
    const [tier, setTier] = React.useState<TierInfo | null>(null);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        async function loadStanding() {
            if (!supabase) return;
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
                const info = await ApexLoyalty.getPatronStanding(session.user.id);
                setTier(info);
            }
            setLoading(false);
        }
        loadStanding();
    }, []);

    if (loading) return <div className="h-48 bg-slate-50 rounded-[3rem] animate-pulse" />;
    if (!tier) return null;

    return (
        <Card className="p-10 rounded-[3.5rem] bg-slate-50 border border-slate-100 text-foreground space-y-10 relative overflow-hidden shadow-sm">
            {/* Background Glow */}
            <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-br from-primary/5 via-transparent to-transparent pointer-events-none opacity-50" />

            <div className="relative z-10 space-y-10 text-left">
                <header className="flex justify-between items-start">
                    <div className="space-y-1 text-left">
                        <div className="flex items-center gap-3">
                            <Crown className="h-6 w-6 text-primary" />
                            <h3 className="text-3xl font-black uppercase tracking-tighter italic">The {tier.current}</h3>
                        </div>
                        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Elite Patron Rank</p>
                    </div>
                    <div className="h-14 w-14 rounded-2xl bg-white flex items-center justify-center border border-slate-100 shadow-sm">
                        <Trophy size={28} className="text-primary" />
                    </div>
                </header>

                <div className="space-y-6 text-left">
                    <div className="flex justify-between items-end px-2">
                        <p className="text-[11px] font-black uppercase tracking-widest text-slate-400">XP Progress</p>
                        <div className="text-right">
                            <span className="text-2xl font-black tracking-tighter text-foreground">{tier.xp.toLocaleString()}</span>
                            <span className="text-xs font-black text-slate-300 uppercase tracking-widest ml-2">/ {tier.requiredXp.toLocaleString()} XP</span>
                        </div>
                    </div>

                    <div className="h-3 w-full bg-slate-200 rounded-full overflow-hidden border border-slate-100 p-0.5">
                        <div
                            className="h-full bg-primary rounded-full transition-all duration-1000 ease-out shadow-[0_0_15px_rgba(245,160,0,0.4)]"
                            style={{ width: `${tier.progress}%` }}
                        />
                    </div>

                    {tier.next && (
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-center text-primary animate-pulse">
                            {Math.round(tier.requiredXp - tier.xp).toLocaleString()} XP to unlock {tier.next} status
                        </p>
                    )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                    {tier.perks.slice(0, 4).map((perk, i) => (
                        <div key={i} className="flex items-center gap-3 p-4 bg-white border border-slate-100 rounded-2xl group hover:border-primary/20 transition-all cursor-default">
                            <ShieldCheck size={14} className="text-primary shrink-0" />
                            <span className="text-[10px] font-black uppercase tracking-tight text-slate-600 group-hover:text-foreground transition-colors">{perk}</span>
                        </div>
                    ))}
                </div>
            </div>

            <Sparkles className="absolute -bottom-10 -left-10 h-64 w-64 text-slate-100/20 -rotate-12 pointer-events-none" />
        </Card>
    );
}
