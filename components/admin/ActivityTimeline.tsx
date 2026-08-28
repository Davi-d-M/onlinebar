'use client';

import * as React from 'react';
import { Card } from '@/components/ui/card';
import { History } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TimelineEvent {
    time: string;
    label: string;
    actor: string;
    status: 'SUCCESS' | 'WARNING' | 'ERROR';
    icon: React.ElementType;
}

export default function ActivityTimeline({ events }: { events: TimelineEvent[] }) {
    return (
        <Card className="p-10 rounded-[3.5rem] bg-white border border-slate-100 shadow-sm space-y-10 text-left relative overflow-hidden group">
            <div className="flex items-center gap-4 px-2">
                <div className="h-12 w-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-500 shadow-sm group-hover:scale-110 transition-transform">
                    <History size={24} />
                </div>
                <div>
                    <h3 className="text-xl font-black uppercase tracking-tighter text-foreground leading-none">Mission Timeline</h3>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Surgical Activity Reconstruction</p>
                </div>
            </div>

            <div className="relative pl-10 space-y-8">
                {/* Vertical Line */}
                <div className="absolute left-[2.2rem] top-2 bottom-4 w-1 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full w-full bg-gradient-to-b from-indigo-500 to-primary/20 opacity-50" />
                </div>

                {events.map((ev, i) => (
                    <div key={i} className="relative group/ev transition-all animate-in slide-in-from-left-4 fade-in duration-500" style={{ animationDelay: `${i * 100}ms` }}>
                        {/* Bullet */}
                        <div className={cn(
                            "absolute -left-12 h-10 w-10 rounded-xl flex items-center justify-center border-4 border-white shadow-lg z-10 transition-all group-hover/ev:scale-125",
                            ev.status === 'SUCCESS' ? "bg-emerald-500 text-white" :
                            ev.status === 'WARNING' ? "bg-amber-500 text-white" :
                            "bg-rose-500 text-white"
                        )}>
                            <ev.icon size={16} />
                        </div>

                        <div className="space-y-1">
                            <div className="flex justify-between items-center pr-2">
                                <h4 className="text-xs font-black text-foreground uppercase tracking-tight">{ev.label}</h4>
                                <span className="text-[9px] font-black text-slate-400 uppercase bg-slate-50 px-2 py-0.5 rounded-md">{ev.time}</span>
                            </div>
                            <p className="text-[10px] font-medium text-slate-500 italic">
                                Actor: <span className="text-foreground font-black uppercase tracking-widest">{ev.actor}</span>
                            </p>
                        </div>
                    </div>
                ))}

                {events.length === 0 && (
                    <div className="py-20 text-center pr-10 opacity-30">
                        <History size={48} className="mx-auto mb-4" />
                        <p className="text-[10px] font-black uppercase tracking-widest">No activity recorded for this node.</p>
                    </div>
                )}
            </div>
        </Card>
    );
}
