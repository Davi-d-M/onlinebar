'use client';

import React, { useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Home, ShoppingBag, ShoppingCart, CreditCard, CheckCircle2, ArrowDown } from 'lucide-react';

interface FunnelEvent {
    event_name: string;
}

export default function CustomerFunnel({ events }: { events: FunnelEvent[] }) {
    const funnel = useMemo(() => {
        const has = (name: string) => events.some(e => e.event_name === name);

        return [
            { id: 'HOME', label: 'Discovery', icon: Home, active: has('PAGE_VIEW'), color: 'bg-blue-50 text-blue-600' },
            { id: 'PRODUCT', label: 'Engagement', icon: ShoppingBag, active: has('PRODUCT_VIEW'), color: 'bg-indigo-50 text-indigo-600' },
            { id: 'CART', label: 'Commerce', icon: ShoppingCart, active: has('ADD_TO_CART') || has('CART_VIEWED'), color: 'bg-purple-50 text-purple-600' },
            { id: 'CHECKOUT', label: 'Checkout', icon: CreditCard, active: has('CHECKOUT_START'), color: 'bg-amber-50 text-amber-600' },
            { id: 'PURCHASE', label: 'Conversion', icon: CheckCircle2, active: has('PURCHASE_COMPLETED'), color: 'bg-emerald-50 text-emerald-600' },
        ];
    }, [events]);

    return (
        <div className="flex flex-col items-center gap-4 py-8">
            {funnel.map((step, i) => (
                <React.Fragment key={step.id}>
                    <Card className={cn(
                        "w-full max-w-sm p-6 rounded-[2rem] border transition-all flex items-center justify-between shadow-sm",
                        step.active ? "border-primary/20 bg-white" : "border-slate-100 bg-slate-50/50 opacity-40 grayscale"
                    )}>
                        <div className="flex items-center gap-6">
                            <div className={cn(
                                "h-12 w-12 rounded-2xl flex items-center justify-center",
                                step.active ? step.color : "bg-slate-200 text-slate-400"
                            )}>
                                <step.icon className="h-6 w-6" />
                            </div>
                            <div className="text-left">
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Step {i + 1}</p>
                                <h3 className="text-lg font-black text-foreground uppercase tracking-tighter leading-none">{step.label}</h3>
                            </div>
                        </div>
                        {step.active && (
                            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                <CheckCircle2 className="h-4 w-4" />
                            </div>
                        )}
                    </Card>
                    {i < funnel.length - 1 && (
                        <ArrowDown className={cn(
                            "h-5 w-5 transition-colors",
                            funnel[i+1].active ? "text-primary animate-bounce" : "text-slate-200"
                        )} />
                    )}
                </React.Fragment>
            ))}
        </div>
    );
}
