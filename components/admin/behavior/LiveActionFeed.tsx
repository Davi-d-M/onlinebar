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
    Smartphone,
    Clock,
    LucideIcon
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface LiveEvent {
    id: string;
    session_id: string;
    action_type: string;
    page_url: string;
    customer_name?: string;
    timestamp: string;
    metadata: Record<string, unknown>;
}

const ACTION_MAP: Record<string, { icon: LucideIcon, color: string, label: string }> = {
    'PAGE_VIEW': { icon: Eye, color: 'text-indigo-500 bg-indigo-50', label: 'Screen View' },
    'UI_INTERACTION': { icon: MousePointer2, color: 'text-slate-400 bg-slate-50', label: 'Interaction' },
    'ADD_TO_CART': { icon: ShoppingCart, color: 'text-emerald-500 bg-emerald-50', label: 'Cart Signal' },
    'SEARCH': { icon: Search, color: 'text-primary bg-primary/10', label: 'Search Intent' },
    'CHECKOUT_START': { icon: ShieldCheck, color: 'text-indigo-600 bg-indigo-50', label: 'Checkout Start' },
    'RAGE_CLICK': { icon: AlertTriangle, color: 'text-rose-500 bg-rose-50', label: 'Rage Detection' },
    'DEAD_CLICK': { icon: AlertTriangle, color: 'text-rose-400 bg-rose-50/50', label: 'Dead Click' },
    'HEARTBEAT': { icon: Clock, color: 'text-slate-300 bg-slate-50', label: 'Heartbeat' }
};

export default function LiveActionFeed({ events }: { events: LiveEvent[] }) {
    return (
        <div className="space-y-4">
            {events.map((event, idx) => {
                const config = ACTION_MAP[event.action_type] || { icon: Zap, color: 'text-slate-400 bg-slate-50', label: event.action_type };
                const Icon = config.icon;

                return (
                    <div
                        key={`${event.id}-${idx}`}
                        className="p-5 rounded-[2rem] bg-white border border-slate-100 shadow-sm flex items-center justify-between group hover:shadow-xl hover:border-primary/20 transition-all animate-in slide-in-from-right-4 duration-500"
                    >
                        <div className="flex items-center gap-5 min-w-0">
                            <div className={cn("h-12 w-12 rounded-2xl flex items-center justify-center shrink-0 shadow-inner", config.color)}>
                                <Icon size={20} />
                            </div>
                            <div className="min-w-0">
                                <div className="flex items-center gap-3 mb-1">
                                    <span className="text-[9px] font-black uppercase text-primary tracking-widest">{event.customer_name || 'Anonymous Patron'}</span>
                                    <div className="h-1 w-1 rounded-full bg-slate-200" />
                                    <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">{event.session_id.substring(0,8)}</span>
                                </div>
                                <h4 className="text-sm font-black text-foreground uppercase tracking-tight truncate italic">
                                    {config.label}: <span className="text-slate-400 normal-case font-medium">{event.page_url}</span>
                                </h4>
                                {!!event.metadata?.text && (
                                    <p className="text-[10px] font-bold text-indigo-500 mt-1 uppercase tracking-tight">Clicked: &quot;{String(event.metadata.text)}&quot;</p>
                                )}
                                {!!event.metadata?.query && (
                                    <p className="text-[10px] font-bold text-primary mt-1 uppercase tracking-tight">Searching: &quot;{String(event.metadata.query)}&quot;</p>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center gap-4 shrink-0">
                            <span className="text-[10px] font-black text-slate-300 uppercase">{new Date(event.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                            <div className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-300 group-hover:text-primary transition-colors">
                                <Smartphone size={16} />
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
