'use client';

import * as React from 'react';
import { Card } from '@/components/ui/card';
import { Bot, Sparkles, Zap, ShieldAlert, TrendingUp, Loader2 } from 'lucide-react';

export default function AICommanderBrief() {
    const [brief, setBrief] = React.useState<string>("");
    const [stats, setStats] = React.useState({ autoRate: '0', exceptionsCount: 0 });
    const [loading, setLoading] = React.useState(true);

    const generateBrief = React.useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/intelligence/commander-brief');
            const data = await res.json();
            if (data.brief) {
                setBrief(data.brief);
                setStats({ autoRate: data.autoRate, exceptionsCount: data.exceptionsCount });
            }
        } catch (err) {
            console.error("Brief generation failure:", err);
            setBrief("Intelligence Uplink Interrupted. Awaiting shift telemetry synchronization.");
        } finally {
            setLoading(false);
        }
    }, []);

    React.useEffect(() => {
        generateBrief();
    }, [generateBrief]);

    return (
        <Card className="p-10 rounded-[3.5rem] bg-white border border-slate-100 shadow-sm relative overflow-hidden group text-left">
            <div className="relative z-10 space-y-10">
                <div className="flex justify-between items-start">
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-sm">
                            <Bot size={28} />
                        </div>
                        <div>
                            <h3 className="text-xl font-black uppercase tracking-tighter text-foreground">Commander Brief</h3>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Autonomous Business Intelligence</p>
                        </div>
                    </div>
                    <button onClick={generateBrief} className="h-10 w-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center hover:bg-slate-100 transition-all">
                        <TrendingUp size={16} className="text-primary" />
                    </button>
                </div>

                {loading ? (
                    <div className="flex items-center gap-4 animate-pulse">
                        <Loader2 className="animate-spin text-primary" size={20} />
                        <p className="text-[11px] font-black uppercase tracking-widest text-slate-400">Synthesizing shift telemetry...</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        <p className="text-lg font-medium leading-relaxed italic text-slate-600">
                            &quot;{brief}&quot;
                        </p>
                        <div className="flex gap-4">
                            <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 text-emerald-500 rounded-full text-[9px] font-black uppercase border border-emerald-500/20">
                                <Zap size={10} fill="currentColor" /> Efficiency: {stats.autoRate}%
                            </div>
                            <div className="flex items-center gap-2 px-3 py-1.5 bg-rose-500/10 text-rose-500 rounded-full text-[9px] font-black uppercase border border-rose-500/20">
                                <ShieldAlert size={10} /> {stats.exceptionsCount} Exceptions
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Background Pattern */}
            <Sparkles className="absolute -bottom-10 -right-10 h-64 w-64 text-primary/5 rotate-12 -z-0" />
        </Card>
    );
}
