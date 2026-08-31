'use client';

import * as React from 'react';
import { Card } from '@/components/ui/card';
import { Users, ShoppingBag, CreditCard } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PulseData {
    live_now: number;
    shopping: number;
    checkout: number;
}

export default function LivePulseHUD() {
    const [pulse, setPulse] = React.useState<PulseData>({ live_now: 0, shopping: 0, checkout: 0 });
    const [loading, setLoading] = React.useState(true);

    const fetchPulse = React.useCallback(async () => {
        try {
            const res = await fetch('/api/admin/pulse');
            const data = await res.json();
            if (data) setPulse(data);
        } catch (err) {
            console.error("Pulse Link Failed:", err);
        } finally {
            setLoading(false);
        }
    }, []);

    React.useEffect(() => {
        fetchPulse();
        const interval = setInterval(fetchPulse, 15000); // 15s refresh
        return () => clearInterval(interval);
    }, [fetchPulse]);

    if (loading && pulse.live_now === 0) return <div className="h-24 bg-slate-50 rounded-[2rem] animate-pulse" />;

    const metrics = [
        { label: 'Visitors Live', val: pulse.live_now, icon: Users, color: 'primary' },
        { label: 'Shopping Now', val: pulse.shopping, icon: ShoppingBag, color: 'indigo' },
        { label: 'In Checkout', val: pulse.checkout, icon: CreditCard, color: 'emerald' },
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {metrics.map((m) => (
                <Card key={m.label} className="p-6 rounded-[2rem] bg-white border border-slate-100 shadow-sm flex items-center justify-between group overflow-hidden">
                    <div className="flex items-center gap-4">
                        <div className={cn(
                            "h-10 w-10 rounded-xl flex items-center justify-center transition-all group-hover:scale-110",
                            m.color === 'primary' ? "bg-primary/10 text-primary" :
                            m.color === 'indigo' ? "bg-indigo-50 text-indigo-500" :
                            "bg-emerald-50 text-emerald-500"
                        )}>
                            <m.icon size={20} className={cn(m.val > 0 && "animate-pulse")} />
                        </div>
                        <div className="text-left">
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">{m.label}</p>
                            <h3 className="text-xl font-black text-foreground mt-1 tabular-nums">{m.val.toLocaleString()}</h3>
                        </div>
                    </div>
                    {m.val > 0 && (
                        <div className="h-1.5 w-1.5 rounded-full bg-primary animate-ping" />
                    )}
                </Card>
            ))}
        </div>
    );
}
