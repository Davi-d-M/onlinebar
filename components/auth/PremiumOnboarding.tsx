'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { OB_OS } from '@/lib/onlineBarOS';
import {
    Wine,
    ChevronRight,
    ArrowRight,
    Zap,
    Sparkles,
    CheckCircle2,
    Heart,
    GlassWater,
    Beer,
    Star,
    X,
    Loader2,
    Music,
    Martini,
    Crown,
    ShoppingBag
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import AuthForm from './AuthForm';

type OnboardingStep = 'INTRO' | 'AUTH' | 'PERSONALIZE' | 'CONSENT' | 'COMPLETE';

export default function PremiumOnboarding() {
    const router = useRouter();
    const [step, setStep] = React.useState<OnboardingStep>('INTRO');
    const [authMode, setAuthMode] = React.useState<'signin' | 'signup'>('signup');
    const [interests, setInterests] = React.useState<string[]>([]);
    const [preferredVibe, setPreferredVibe] = React.useState<string | null>(null);
    const [loading, setLoading] = React.useState(false);
    const [userId, setUserId] = React.useState<string | null>(null);

    const anonId = React.useMemo(() => typeof window !== 'undefined' ? localStorage.getItem('ob_anonymous_id') : null, []);

    // 🛡️ [IDENTITY_SYNC] Session Monitor
    // If a session is established (even via background trigger), advance the onboarding.
    React.useEffect(() => {
        if (!supabase) return;

        const checkSession = async () => {
            if (!supabase) return;
            try {
                const { data: { session } } = await supabase.auth.getSession();
                if (session?.user && (step === 'INTRO' || step === 'AUTH')) {
                    console.log("[OB_OS] Active session detected. Synchronizing profile node...");
                    setUserId(session.user.id);
                    setStep('PERSONALIZE');
                }
            } catch (e) {
                console.warn("[OB_OS] Session Check Error:", e);
            }
        };

        checkSession();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            if (session?.user && (step === 'INTRO' || step === 'AUTH')) {
                setUserId(session.user.id);
                setStep('PERSONALIZE');
            }
        });

        return () => subscription.unsubscribe();
    }, [step]);

    React.useEffect(() => {
        OB_OS.track('ONBOARDING_STARTED', { anonymousId: anonId || undefined });
    }, [anonId]);

    const handleAuthSuccess = (uId: string) => {
        setUserId(uId);
        setStep('PERSONALIZE');
        OB_OS.track('ONBOARDING_STEP_COMPLETED', { userId: uId, anonymousId: anonId || undefined, details: { step: 'ACCOUNT' } });
    };

    const toggleInterest = (id: string) => {
        setInterests(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
    };

    const savePreferences = async () => {
        if (!supabase || !userId) return;
        setLoading(true);
        try {
            await supabase.from('profiles').update({
                interests,
                preferred_vibe: preferredVibe,
                onboarding_step: 'COMPLETE'
            }).eq('id', userId);

            await OB_OS.track('PREFERENCES_UPDATED', { userId, details: { interests, preferredVibe } });
            setStep('COMPLETE');
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // 1. BRAND INTRO
    if (step === 'INTRO') {
        return (
            <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4 sm:p-6 text-center animate-in fade-in duration-1000">
                <div className="w-full max-w-md space-y-10 sm:space-y-14">
                    <div className="space-y-6">
                        <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-[1.5rem] sm:rounded-[2rem] bg-slate-50 border border-slate-100 mx-auto flex items-center justify-center text-primary shadow-sm animate-pulse">
                            <Wine size={32} className="sm:w-10 sm:h-10" />
                        </div>
                        <div className="space-y-2">
                            <h1 className="text-4xl sm:text-5xl font-black text-foreground tracking-tighter uppercase leading-none">
                                Online <br /> <span className="text-primary italic">Bar OS</span>
                            </h1>
                            <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.5em]">Establish Identity</p>
                        </div>
                    </div>

                    <div className="aspect-[4/5] bg-slate-50 rounded-[2.5rem] sm:rounded-[3rem] border border-slate-100 relative overflow-hidden group">
                        <div className="absolute inset-0 bg-[url('/bg-pattern.png')] opacity-10" />
                        <div className="absolute inset-0 flex flex-col items-center justify-center p-8 sm:p-12 space-y-6">
                            <Zap className="h-12 w-12 sm:h-16 sm:w-16 text-primary" fill="currentColor" />
                            <h2 className="text-xl sm:text-2xl font-black text-foreground uppercase tracking-tight leading-tight">Your Drinks. <br />Your Way.</h2>
                            <p className="text-slate-500 text-sm font-medium italic leading-relaxed px-2">
                                &quot;Nairobi&apos;s premium cellar, synchronized to your terminal. Chilled, genuine, and absolute.&quot;
                            </p>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <Button
                            onClick={() => { setStep('AUTH'); setAuthMode('signup'); }}
                            className="w-full h-16 sm:h-20 rounded-[1.5rem] sm:rounded-[1.8rem] bg-primary text-white font-black uppercase text-xs tracking-widest shadow-xl shadow-primary/20 btn-premium"
                        >
                            Get Started <ChevronRight className="ml-2 h-5 w-5" />
                        </Button>
                        <button
                            onClick={() => { setStep('AUTH'); setAuthMode('signin'); }}
                            className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-primary transition-colors"
                        >
                            Already have an account? Sign In
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // 2. AUTHENTICATION
    if (step === 'AUTH') {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 sm:p-6 animate-in slide-in-from-bottom-8 duration-700">
                <button onClick={() => setStep('INTRO')} className="mb-6 sm:mb-8 text-slate-400 hover:text-primary transition-colors flex items-center gap-2">
                    <X size={20} /> <span className="text-[10px] font-black uppercase tracking-widest">Abort Initialization</span>
                </button>
                <div className="w-full max-w-md">
                    <AuthForm
                        initialMode={authMode}
                        onSuccess={handleAuthSuccess}
                    />
                </div>
            </div>
        );
    }

    // 3. PERSONALIZE
    if (step === 'PERSONALIZE') {
        const categories = [
            { id: 'whiskey', label: 'Whiskey', icon: Heart },
            { id: 'wine', label: 'Wine', icon: Wine },
            { id: 'gin', label: 'Gin', icon: GlassWater },
            { id: 'beer', label: 'Beer', icon: Beer },
            { id: 'snacks', label: 'Gifts', icon: ShoppingBag },
            { id: 'new', label: 'New Arrivals', icon: Sparkles }
        ];

        return (
            <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4 sm:p-6 text-center animate-in zoom-in-95 duration-700">
                <div className="w-full max-w-md space-y-10 sm:space-y-12">
                    <header className="space-y-4 text-left px-2">
                        <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-sm"><Star size={20} fill="currentColor" /></div>
                        <div className="space-y-1">
                            <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tighter text-foreground leading-none">Personalize Your Cellar</h2>
                            <p className="text-slate-500 font-medium italic text-xs sm:text-sm">Select the vibes you enjoy. We&apos;ll curate your discovery grid accordingly.</p>
                        </div>
                    </header>

                    <div className="grid grid-cols-2 gap-4 sm:gap-5">
                        {categories.map((c) => (
                            <button
                                key={c.id}
                                onClick={() => {
                                    toggleInterest(c.id);
                                    OB_OS.trackPerformance('RENDER_TIME', 0); // Heartbeat signal
                                }}
                                className={cn(
                                    "p-5 sm:p-7 rounded-[2rem] border-2 transition-all flex flex-col items-center gap-4 group btn-premium",
                                    interests.includes(c.id) ? "border-primary bg-primary/5 shadow-xl shadow-primary/5" : "border-slate-50 bg-slate-50/50 hover:border-slate-100"
                                )}
                            >
                                <div className={cn(
                                    "h-12 w-12 sm:h-14 sm:w-14 rounded-2xl flex items-center justify-center shadow-sm transition-transform group-hover:scale-110",
                                    interests.includes(c.id) ? "bg-primary text-white" : "bg-white text-slate-300"
                                )}>
                                    <c.icon size={24} className="sm:w-7 sm:h-7" />
                                </div>
                                <span className="text-[10px] font-black uppercase tracking-[0.1em]">{c.label}</span>
                            </button>
                        ))}
                    </div>

                    <div className="space-y-6 pt-4 px-2">
                        <header className="space-y-2 text-left">
                            <p className="text-[9px] font-black uppercase text-primary tracking-[0.3em]">Select Your Atmosphere</p>
                            <h3 className="text-xl font-black uppercase text-foreground">What&apos;s the vibe?</h3>
                        </header>
                        <div className="grid grid-cols-3 gap-3">
                            {[
                                { id: 'CHILL', label: 'Chill', icon: Music },
                                { id: 'LIVELY', label: 'Lively', icon: Martini },
                                { id: 'ELITE', label: 'Elite', icon: Crown }
                            ].map(v => (
                                <button
                                    key={v.id}
                                    onClick={() => setPreferredVibe(v.id)}
                                    className={cn(
                                        "py-4 rounded-2xl border-2 font-black uppercase text-[8px] tracking-[0.15em] transition-all btn-premium",
                                        preferredVibe === v.id ? "bg-primary text-white border-primary shadow-lg shadow-primary/10" : "bg-white border-slate-100 text-slate-400"
                                    )}
                                >
                                    {v.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="px-2 pt-4">
                        <Button
                            onClick={savePreferences}
                            disabled={interests.length === 0 || !preferredVibe || loading}
                            className="w-full h-16 sm:h-20 rounded-[1.5rem] sm:rounded-2xl bg-primary text-white font-black uppercase text-xs tracking-widest shadow-xl shadow-primary/20 btn-premium"
                        >
                            {loading ? <Loader2 className="animate-spin" /> : <>Finalize Discovery <ArrowRight className="ml-2 h-5 w-5" /></>}
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    // 4. COMPLETE
    if (step === 'COMPLETE') {
        return (
            <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4 sm:p-6 text-center animate-in fade-in zoom-in-95 duration-1000 overflow-hidden">
                <div className="w-full max-w-md space-y-10 sm:space-y-12 relative z-10">
                    <div className="h-24 w-24 sm:h-28 sm:w-28 rounded-[2.5rem] sm:rounded-[3.5rem] bg-emerald-50 border border-emerald-100 mx-auto flex items-center justify-center text-emerald-500 shadow-xl shadow-emerald-500/10 animate-bounce">
                        <CheckCircle2 size={48} className="sm:w-16 sm:h-16" />
                    </div>
                    <div className="space-y-4">
                        <h2 className="text-4xl sm:text-5xl font-black text-foreground uppercase tracking-tighter leading-none">Identity <br /> Established.</h2>
                        <p className="text-slate-500 font-medium italic text-lg leading-relaxed px-4">
                            &quot;The cellar is now open for your tactical discovery. Welcome to the elite grid.&quot;
                        </p>
                    </div>
                    <div className="px-2">
                        <Button
                            onClick={() => router.push('/')}
                            className="w-full h-20 rounded-[1.8rem] bg-primary text-white font-black uppercase text-xs tracking-widest shadow-xl shadow-primary/20 btn-premium"
                        >
                            Enter The Bar
                        </Button>
                    </div>
                </div>
                <Zap size={250} className="absolute -bottom-20 -right-20 text-slate-50 rotate-12 z-0 opacity-50 sm:opacity-100" />
            </div>
        );
    }

    return null;
}
