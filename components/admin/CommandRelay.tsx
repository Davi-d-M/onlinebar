'use client';

import * as React from 'react';
import { Card } from '@/components/ui/card';
import {
    Bell,
    X,
    ShoppingBag,
    ShieldAlert,
    Package,
    Zap,
    ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

export interface RelayNotification {
    id: string;
    type: 'ORDER' | 'SECURITY' | 'STOCK' | 'SYSTEM';
    title: string;
    message: string;
    timestamp: Date;
    href?: string;
}

export default function CommandRelay() {
    const [notifications, setNotifications] = React.useState<RelayNotification[]>([]);
    const [isVisible, setIsVisible] = React.useState(false);

    // Global listener for the Command Relay
    React.useEffect(() => {
        const handleNewNotification = (event: Event) => {
            const detail = (event as CustomEvent).detail as RelayNotification;
            setNotifications(prev => [detail, ...prev].slice(0, 5));
            setIsVisible(true);

            // Auto-hide after 10 seconds if it's just one
            const timer = setTimeout(() => {
                if (notifications.length <= 1) setIsVisible(false);
            }, 10000);
            return () => clearTimeout(timer);
        };

        window.addEventListener('ob-command-relay', handleNewNotification);
        return () => window.removeEventListener('ob-command-relay', handleNewNotification);
    }, [notifications.length]);

    if (notifications.length === 0) return null;

    const latest = notifications[0];

    return (
        <div className={cn(
            "fixed top-24 right-8 z-[1000] w-80 transition-all duration-500 transform",
            isVisible ? "translate-x-0 opacity-100" : "translate-x-12 opacity-0 pointer-events-none"
        )}>
            <Card className="p-6 rounded-[2.5rem] bg-white/90 backdrop-blur-xl border border-primary/20 shadow-[0_30px_60px_-15px_rgba(245,160,0,0.3)] relative overflow-hidden">
                <div className="relative z-10 space-y-4">
                    <div className="flex justify-between items-start">
                        <div className={cn(
                            "h-10 w-10 rounded-xl flex items-center justify-center shadow-sm",
                            latest.type === 'ORDER' ? "bg-primary/10 text-primary" :
                            latest.type === 'SECURITY' ? "bg-rose-50 text-rose-500" :
                            latest.type === 'STOCK' ? "bg-amber-50 text-amber-500" :
                            "bg-indigo-50 text-indigo-500"
                        )}>
                            {latest.type === 'ORDER' ? <ShoppingBag size={20} /> :
                             latest.type === 'SECURITY' ? <ShieldAlert size={20} /> :
                             latest.type === 'STOCK' ? <Package size={20} /> :
                             <Zap size={20} />}
                        </div>
                        <button onClick={() => setIsVisible(false)} className="text-slate-300 hover:text-foreground transition-colors">
                            <X size={18} />
                        </button>
                    </div>

                    <div className="text-left">
                        <p className="text-[10px] font-black uppercase text-primary tracking-[0.3em] mb-1">{latest.type} RELAY</p>
                        <h4 className="font-black text-foreground uppercase text-sm leading-tight">{latest.title}</h4>
                        <p className="text-[10px] text-slate-500 font-medium mt-2 leading-relaxed italic">&quot;{latest.message}&quot;</p>
                    </div>

                    {latest.href && (
                        <Link href={latest.href} onClick={() => setIsVisible(false)}>
                            <button className="w-full h-10 mt-2 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center gap-2 text-[8px] font-black uppercase tracking-widest text-slate-400 hover:text-primary hover:border-primary/20 transition-all group">
                                Open Console <ChevronRight size={12} className="group-hover:translate-x-1 transition-transform" />
                            </button>
                        </Link>
                    )}
                </div>

                {/* Counter for multiple notifications */}
                {notifications.length > 1 && (
                    <div className="absolute bottom-4 right-6 text-[8px] font-black text-slate-300 uppercase">
                        +{notifications.length - 1} more
                    </div>
                )}

                <div className="absolute -bottom-4 -right-4 h-24 w-24 text-primary/5 rotate-12">
                    <Bell size={80} />
                </div>
            </Card>
        </div>
    );
}
