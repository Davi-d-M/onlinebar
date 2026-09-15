'use client';

import * as React from 'react';
import { Card } from '@/components/ui/card';
import {
    User,
    MapPin,
    Wine,
    MessageCircle,
    Check
} from 'lucide-react';
import { cn, formatPrice } from '@/lib/utils';

interface LifecycleEvent {
    id: string;
    type: 'DISCOVERY' | 'ENGAGEMENT' | 'CONVERSION' | 'LOYALTY';
    label: string;
    description: string;
    timestamp: string;
    metadata?: Record<string, unknown>;
}

export default function Customer360Widget() {
    const events: LifecycleEvent[] = [
        { id: '1', type: 'DISCOVERY', label: 'First Contact', description: 'Arrived via Google Search (Organic)', timestamp: '2026-09-01T14:20:00Z' },
        { id: '2', type: 'ENGAGEMENT', label: 'High Intent', description: 'Viewed 12 Vintages in 15 minutes', timestamp: '2026-09-01T14:35:00Z' },
        { id: '3', type: 'CONVERSION', label: 'Mission Established', description: 'Purchased Glenfiddich 18yr + 6 Tot Set', timestamp: '2026-09-01T15:10:00Z', metadata: { amount: 18500 } },
        { id: '4', type: 'LOYALTY', label: 'Black Tier Upgrade', description: 'Automated elevation based on LTV', timestamp: '2026-09-02T09:00:00Z' },
    ];

    return (
        <Card className="p-10 rounded-[3.5rem] bg-white border border-slate-100 shadow-sm space-y-12 text-left">
            <header className="flex justify-between items-start border-b border-slate-50 pb-8">
                <div className="flex items-center gap-6">
                    <div className="h-16 w-16 rounded-[2rem] bg-primary/10 flex items-center justify-center text-primary shadow-inner">
                        <User size={32} />
                    </div>
                    <div>
                        <h2 className="text-3xl font-black uppercase tracking-tighter text-foreground">Customer 360</h2>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1 italic">Identity Stitching Node Active</p>
                    </div>
                </div>
                <div className="text-right">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Lifetime Value</p>
                    <p className="text-2xl font-black text-emerald-600 tracking-tighter">{formatPrice(24800)}</p>
                </div>
            </header>

            <div className="relative pl-8 space-y-10 before:absolute before:left-3 before:top-4 before:bottom-4 before:w-0.5 before:bg-slate-100">
                {events.map((event) => (
                    <div key={event.id} className="relative group">
                        {/* Status Node */}
                        <div className={cn(
                            "absolute -left-10 top-0 h-4 w-4 rounded-full border-4 border-white shadow-md transition-transform group-hover:scale-125",
                            event.type === 'CONVERSION' ? "bg-primary" :
                            event.type === 'LOYALTY' ? "bg-emerald-500" :
                            event.type === 'ENGAGEMENT' ? "bg-indigo-500" : "bg-slate-300"
                        )} />

                        <div className="flex justify-between items-start gap-4">
                            <div>
                                <h4 className="text-sm font-black uppercase text-foreground tracking-tight">{event.label}</h4>
                                <p className="text-xs font-medium text-slate-500 mt-1 leading-relaxed italic">&quot;{event.description}&quot;</p>
                            </div>
                            <span className="text-[9px] font-black text-slate-300 uppercase tabular-nums">
                                {new Date(event.timestamp).toLocaleDateString()}
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="p-6 rounded-[2.5rem] bg-slate-50 border border-slate-100 space-y-4">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">Category Affinity</p>
                    <div className="flex items-center gap-3">
                        <Wine size={16} className="text-primary" />
                        <span className="text-xs font-black uppercase text-foreground">Whiskey &bull; 82%</span>
                    </div>
                </div>
                <div className="p-6 rounded-[2.5rem] bg-slate-50 border border-slate-100 space-y-4">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">Last Dispatch</p>
                    <div className="flex items-center gap-3">
                        <MapPin size={16} className="text-primary" />
                        <span className="text-xs font-black uppercase text-foreground truncate">Westlands Sector</span>
                    </div>
                </div>
            </div>

            <div className="pt-8 border-t border-slate-50 space-y-6">
                <h3 className="text-xs font-black uppercase text-slate-400 tracking-[0.3em] px-2">Message History</h3>
                <div className="grid gap-3">
                    {[
                        { label: 'Weekend Drop #12', type: 'WhatsApp', status: 'Opened', time: '2h ago' },
                        { label: 'Cart Recovery Node', type: 'In-App', status: 'Clicked', time: 'Yesterday' }
                    ].map((msg, i) => (
                        <div key={i} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex justify-between items-center group hover:bg-white hover:shadow-lg transition-all">
                            <div className="flex items-center gap-4">
                                <div className="h-10 w-10 rounded-xl bg-white flex items-center justify-center text-primary shadow-sm group-hover:scale-110 transition-transform">
                                    <MessageCircle size={18} />
                                </div>
                                <div>
                                    <p className="text-[11px] font-black uppercase text-foreground leading-none">{msg.label}</p>
                                    <p className="text-[8px] font-bold text-slate-400 uppercase mt-1.5 tracking-widest">{msg.type} Node &bull; {msg.time}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full border border-emerald-100">
                                <Check size={10} />
                                <span className="text-[8px] font-black uppercase">{msg.status}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </Card>
    );
}
