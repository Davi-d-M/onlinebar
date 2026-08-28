'use client';

import { useState, useEffect } from 'react';
import { Wine, ShieldAlert, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function AgeVerification() {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const verified = localStorage.getItem('ob_age_verified');
        if (!verified) {
            setIsVisible(true);
        }
    }, []);

    const handleVerify = () => {
        localStorage.setItem('ob_age_verified', 'true');
        setIsVisible(false);
    };

    const handleReject = () => {
        window.location.href = 'https://www.google.com';
    };

    if (!isVisible) return null;

    return (
        <div className="fixed inset-0 z-[1000] bg-background/80 backdrop-blur-2xl flex items-center justify-center p-6 animate-in fade-in duration-700">
            <div className="max-w-md w-full bg-card rounded-[3rem] border border-border shadow-2xl p-12 text-center space-y-10 relative overflow-hidden">
                <div className="relative z-10 space-y-6">
                    <div className="mx-auto h-20 w-20 rounded-[2rem] bg-primary/10 flex items-center justify-center text-primary shadow-sm border border-primary/20">
                        <Wine className="h-10 w-10" />
                    </div>

                    <div className="space-y-2">
                        <h2 className="text-3xl font-black uppercase tracking-tighter text-foreground">Age Verification</h2>
                        <p className="text-[10px] font-black uppercase text-primary tracking-[0.4em]">Online Bar Protocol</p>
                    </div>

                    <p className="text-sm text-muted-foreground font-medium leading-relaxed italic">
                        &quot;You must be of legal drinking age in Kenya (18+) to enter this platform. We support responsible drinking.&quot;
                    </p>

                    <div className="flex flex-col gap-4 pt-4">
                        <Button
                            onClick={handleVerify}
                            className="h-16 rounded-2xl bg-primary text-white font-black uppercase tracking-widest text-xs shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all"
                        >
                            <Check className="mr-2 h-4 w-4" /> I am over 18
                        </Button>
                        <Button
                            variant="ghost"
                            onClick={handleReject}
                            className="h-12 rounded-xl text-slate-400 font-black uppercase text-[10px] tracking-widest hover:text-rose-500 hover:bg-rose-50 transition-all"
                        >
                            <X className="mr-2 h-3 w-3" /> Underage
                        </Button>
                    </div>
                </div>

                {/* Decorative Pattern */}
                <Wine className="absolute -bottom-10 -right-10 h-48 w-48 text-primary/5 rotate-12 -z-0" />
                <div className="absolute top-4 left-4">
                    <ShieldAlert className="h-4 w-4 text-slate-100" />
                </div>
            </div>
        </div>
    );
}
