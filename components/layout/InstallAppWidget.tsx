'use client';

import * as React from 'react';
import { Card } from '@/components/ui/card';
import {
    Download,
    X,
    Smartphone,
    Zap
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface BeforeInstallPromptEvent extends Event {
    readonly platforms: Array<string>;
    readonly userChoice: Promise<{
        outcome: 'accepted' | 'dismissed',
        platform: string
    }>;
    prompt(): Promise<void>;
}

export default function InstallAppWidget() {
    const [deferredPrompt, setDeferredPrompt] = React.useState<BeforeInstallPromptEvent | null>(null);
    const [isVisible, setIsVisible] = React.useState(false);
    const [isInstalled, setIsInstalled] = React.useState(false);

    React.useEffect(() => {
        // 1. Check if already installed
        if (typeof window !== 'undefined' && window.matchMedia('(display-mode: standalone)').matches) {
            setIsInstalled(true);
            return;
        }

        // 2. Listen for beforeinstallprompt
        const handler = (e: Event) => {
            e.preventDefault();
            setDeferredPrompt(e as BeforeInstallPromptEvent);

            // Check if user dismissed it recently
            const dismissed = localStorage.getItem('ob_install_prompt_dismissed');
            if (!dismissed) {
                setTimeout(() => setIsVisible(true), 10000); // Show after 10s
            }
        };

        window.addEventListener('beforeinstallprompt', handler);
        return () => window.removeEventListener('beforeinstallprompt', handler);
    }, []);

    const handleInstall = async () => {
        if (!deferredPrompt) return;
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
            setIsInstalled(true);
            setIsVisible(false);
        }
        setDeferredPrompt(null);
    };

    const handleInstallClick = () => {
        handleInstall();
    };

    const handleDismiss = () => {
        setIsVisible(false);
        localStorage.setItem('ob_install_prompt_dismissed', 'true');
    };

    if (isInstalled || !isVisible) return null;

    return (
        <div className="fixed bottom-24 left-6 right-6 lg:left-10 lg:right-auto lg:w-96 z-[150] animate-in slide-in-from-left-10 duration-700">
            <Card className="p-8 rounded-[2.5rem] bg-slate-900 text-white border-none shadow-2xl relative overflow-hidden group text-left">
                <div className="relative z-10 space-y-6">
                    <header className="flex justify-between items-start">
                        <div className="flex items-center gap-4">
                            <div className="h-12 w-12 rounded-2xl bg-primary/20 flex items-center justify-center text-primary shadow-inner">
                                <Smartphone size={24} />
                            </div>
                            <div>
                                <h3 className="text-xl font-black uppercase tracking-tighter text-white leading-none font-serif">Online Bar App</h3>
                                <p className="text-[9px] font-black text-primary/60 uppercase tracking-widest mt-1">Mobile Access Protocol</p>
                            </div>
                        </div>
                        <button onClick={handleDismiss} className="text-white/20 hover:text-white transition-colors">
                            <X size={20} />
                        </button>
                    </header>

                    <p className="text-sm font-medium italic text-white/60 leading-relaxed">
                        &quot;Install the Online Bar App to your home screen for instant access to the cellar and real-time social buzz.&quot;
                    </p>

                    <div className="flex flex-col gap-3">
                        <Button
                            onClick={handleInstallClick}
                            className="w-full h-14 rounded-2xl bg-primary text-white font-black uppercase text-[10px] tracking-widest shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3"
                        >
                            <Download size={16} /> Install Web App
                        </Button>
                        <div className="flex items-center justify-center gap-4 py-2 opacity-30">
                            <div className="h-px flex-1 bg-white/20" />
                            <span className="text-[7px] font-black uppercase tracking-widest">PWA Secure</span>
                            <div className="h-px flex-1 bg-white/20" />
                        </div>
                    </div>
                </div>

                {/* Background Decor */}
                <Zap className="absolute -bottom-6 -right-6 h-32 w-32 text-primary/5 rotate-12 -z-0" />
            </Card>
        </div>
    );
}
