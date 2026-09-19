'use client';

import * as React from 'react';
import {
    Zap,
    MousePointer2,
    Eye,
    ShoppingCart,
    Search,
    ShieldCheck,
    AlertTriangle,
    Clock,
    ChevronDown,
    ChevronUp,
    LucideIcon
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';

interface ForensicEvent {
    id: number;
    action_type: string;
    page_url: string;
    metadata: Record<string, unknown>;
    timestamp: string;
}

const ACTION_MAP: Record<string, { icon: LucideIcon, color: string, label: string }> = {
    'PAGE_VIEW': { icon: Eye, color: 'bg-indigo-500', label: 'Viewed Page' },
    'UI_INTERACTION': { icon: MousePointer2, color: 'bg-slate-400', label: 'Interacted' },
    'ADD_TO_CART': { icon: ShoppingCart, color: 'bg-emerald-500', label: 'Added to Cart' },
    'SEARCH': { icon: Search, color: 'bg-primary', label: 'Searched' },
    'CHECKOUT_START': { icon: ShieldCheck, color: 'bg-indigo-600', label: 'Started Checkout' },
    'RAGE_CLICK': { icon: AlertTriangle, color: 'bg-rose-500', label: 'Rage Interaction' },
    'DEAD_CLICK': { icon: AlertTriangle, color: 'bg-rose-400', label: 'Dead Click' },
    'HEARTBEAT': { icon: Clock, color: 'bg-slate-200', label: 'Heartbeat' }
};

export default function ForensicTimeline({ events }: { events: ForensicEvent[] }) {
    const [expanded, setExpanded] = React.useState<number | null>(null);

    return (
        <div className="relative pl-10 space-y-12 before:absolute before:left-4 before:top-4 before:bottom-4 before:w-0.5 before:bg-slate-100 before:dashed">
            {events.map((event, idx) => {
                const config = ACTION_MAP[event.action_type] || { icon: Zap, color: 'bg-slate-300', label: event.action_type };
                const Icon = config.icon;
                const isExpanded = expanded === idx;

                return (
                    <div key={event.id} className="relative group">
                        {/* TIMELINE DOT */}
                        <div className={cn(
                            "absolute -left-[34px] top-1 h-8 w-8 rounded-full border-4 border-white flex items-center justify-center text-white shadow-sm z-10 transition-transform group-hover:scale-110",
                            config.color
                        )}>
                            <Icon size={14} />
                        </div>

                        {/* CONTENT CARD */}
                        <Card className={cn(
                            "p-6 rounded-[2.5rem] bg-white border border-slate-100 shadow-sm group-hover:shadow-xl transition-all cursor-pointer",
                            isExpanded && "ring-2 ring-primary/20 border-primary/20"
                        )} onClick={() => setExpanded(isExpanded ? null : idx)}>
                            <div className="flex justify-between items-start gap-4">
                                <div className="space-y-1 text-left">
                                    <div className="flex items-center gap-3">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{new Date(event.timestamp).toLocaleTimeString()}</span>
                                        <div className="h-1 w-1 rounded-full bg-slate-200" />
                                        <span className="text-[10px] font-black uppercase tracking-widest text-primary italic">{config.label}</span>
                                    </div>
                                    <h4 className="text-sm font-black text-foreground uppercase tracking-tight italic">
                                        {event.page_url}
                                    </h4>
                                </div>
                                <div className="text-slate-200 group-hover:text-primary transition-colors">
                                    {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                                </div>
                            </div>

                            {isExpanded && (
                                <div className="mt-6 pt-6 border-t border-slate-50 animate-in slide-in-from-top-2 duration-300">
                                    <div className="bg-slate-50 rounded-2xl p-6 text-left overflow-x-auto border border-slate-100">
                                        <p className="text-[8px] font-black uppercase text-primary mb-4 tracking-widest italic">Payload Encryption Node</p>
                                        <pre className="text-[10px] text-slate-500 font-mono leading-relaxed">
                                            {JSON.stringify(event.metadata, null, 2)}
                                        </pre>
                                    </div>
                                </div>
                            )}
                        </Card>
                    </div>
                );
            })}

            {events.length === 0 && (
                <div className="py-20 text-center opacity-20">
                    <p className="text-[10px] font-black uppercase tracking-widest">No Interaction Signal Detected.</p>
                </div>
            )}
        </div>
    );
}
