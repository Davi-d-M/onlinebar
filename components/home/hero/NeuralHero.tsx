'use client';

import * as React from 'react';
import { supabase } from '@/lib/supabaseClient';
import {
    Zap,
    ArrowRight,
    Sparkles,
    Wine,
    Heart,
    ShoppingBag,
    Trophy
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface NeuralPersona {
    interest?: string;
    vibe?: string;
    tier?: string;
}

export default function NeuralHero() {
    const [persona, setPersona] = React.useState<NeuralPersona | null>(null);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        async function detectPersona() {
            if (!supabase) return;
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
                const { data: prof } = await supabase.from('profiles').select('interests, preferred_vibe, membership_tier').eq('id', session.user.id).single();
                if (prof) {
                    setPersona({
                        interest: prof.interests?.[0],
                        vibe: prof.preferred_vibe,
                        tier: prof.membership_tier
                    });
                }
            }
            setLoading(false);
        }
        detectPersona();
    }, []);

    const config = React.useMemo(() => {
        if (!persona) return {
            badge: 'Premium Bar Protocol',
            title: 'Nairobi\'s Elite. Cellar.',
            subtitle: 'Experience authentic spirits and chilled pairings delivered to your terminal.',
            cta: 'Explore Menu',
            href: '/shop',
            icon: Wine
        };

        if (persona.interest === 'whiskey') return {
            badge: 'The Whiskey Legend',
            title: 'Cask Strength. Excellence.',
            subtitle: 'Curated for the refined palate. Discover the latest limited drops.',
            cta: 'Secure Bottle',
            href: '/shop/category/whiskey',
            icon: Trophy
        };

        if (persona.interest === 'wine') return {
            badge: 'The Vintages Club',
            title: 'Estate Bottled. Premium.',
            subtitle: 'Discover Nairobi\'s most exquisite private cellar collection.',
            cta: 'Browse Vintages',
            href: '/shop/category/wine',
            icon: Heart
        };

        return {
            badge: `${persona.tier || 'Elite'} Discovery`,
            title: 'Your Grid. Your Way.',
            subtitle: 'Ready for your tonight? We\'ve synchronized the cellar to your vibe.',
            cta: 'Continue Journey',
            href: '/shop',
            icon: Sparkles
        };
    }, [persona]);

    if (loading) return <div className="h-[70vh] bg-slate-50 animate-pulse rounded-[4rem] m-6" />;

    return (
        <section className={cn(
            "relative min-h-[85vh] flex items-center overflow-hidden px-6 sm:px-12 lg:px-20 py-20 transition-colors duration-1000",
            persona?.vibe === 'ELITE' ? "bg-slate-900 text-white" : "bg-white text-foreground"
        )}>
            {/* Neural Background Noise */}
            <div className="absolute inset-0 bg-[url('/grid-noise.png')] opacity-[0.03] pointer-events-none" />
            <div className={cn(
                "absolute top-0 right-0 w-2/3 h-full rounded-l-[20rem] blur-3xl -z-10 animate-pulse opacity-40",
                persona?.vibe === 'LIVELY' ? "bg-rose-500/20" : "bg-primary/10"
            )} />

            <div className="max-w-7xl mx-auto w-full grid lg:grid-cols-2 gap-20 items-center relative z-10">

                <div className="space-y-10 animate-in fade-in slide-in-from-left-10 duration-1000">
                    <div className={cn(
                        "inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full border shadow-2xl",
                        persona?.vibe === 'ELITE' ? "bg-white/5 text-primary border-white/10" : "bg-slate-900 text-primary border-white/5"
                    )}>
                        <Zap className="h-4 w-4 fill-current animate-bounce" />
                        <span className="text-[10px] font-black uppercase tracking-[0.3em]">{config.badge}</span>
                    </div>

                    <h1 className={cn(
                        "text-6xl lg:text-8xl font-black tracking-tighter uppercase leading-[0.85] text-balance",
                        persona?.vibe === 'ELITE' ? "text-white" : "text-foreground"
                    )}>
                        {config.title.split('.').map((part, i) => (
                            <span key={i} className={cn(i === 1 && "text-primary italic block")}>
                                {part}{i === 0 && '.'}
                            </span>
                        ))}
                    </h1>

                    <p className={cn(
                        "text-xl font-medium max-w-lg leading-relaxed italic",
                        persona?.vibe === 'ELITE' ? "text-slate-400" : "text-slate-500"
                    )}>
                        &quot;{config.subtitle}&quot;
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4">
                        <Link href={config.href}>
                            <Button className="h-20 px-12 rounded-[2rem] bg-primary text-white font-black uppercase tracking-[0.2em] text-xs shadow-2xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all group">
                                {config.cta} <ArrowRight className="ml-3 h-5 w-5 group-hover:translate-x-2 transition-transform" />
                            </Button>
                        </Link>
                        <Link href="/gifting">
                            <Button variant="outline" className={cn(
                                "h-20 px-10 rounded-[2rem] border-2 font-black uppercase tracking-widest text-[10px] transition-all active:scale-95",
                                persona?.vibe === 'ELITE' ? "border-white/10 bg-white/5 text-white hover:bg-white/10" : "border-slate-100 bg-white text-slate-400 hover:bg-slate-50"
                            )}>
                                <ShoppingBag className="mr-2 h-4 w-4" /> Send as Gift
                            </Button>
                        </Link>
                    </div>
                </div>

                <div className="relative animate-in zoom-in-95 duration-1000 delay-300">
                    <div className={cn(
                        "aspect-square rounded-[5rem] border flex items-center justify-center p-16 shadow-inner relative group overflow-hidden",
                        persona?.vibe === 'ELITE' ? "bg-white/5 border-white/5" : "bg-slate-50 border-slate-100"
                    )}>
                        <div className="relative z-10 w-full h-full flex items-center justify-center opacity-10">
                             <config.icon size={200} className="text-primary animate-pulse" />
                        </div>

                        {/* Floating Interaction Node */}
                        <Card className={cn(
                            "absolute bottom-12 right-12 p-8 rounded-[2.5rem] shadow-2xl border-none animate-in slide-in-from-bottom-4 duration-700 delay-1000",
                            persona?.vibe === 'ELITE' ? "bg-slate-800 text-white" : "bg-white text-foreground"
                        )}>
                            <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1 text-left">Sector Status</p>
                            <h4 className="text-xl font-black text-foreground uppercase tracking-tight text-left">Trending Tonight</h4>
                            <div className="mt-4 flex items-center gap-3">
                                <div className="h-1.5 w-32 bg-slate-100/10 rounded-full overflow-hidden">
                                    <div className="h-full bg-primary w-[84%] animate-in slide-in-from-left duration-1000" />
                                </div>
                                <span className="text-[10px] font-black text-primary">84%</span>
                            </div>
                        </Card>
                    </div>
                </div>

            </div>
        </section>
    );
}
