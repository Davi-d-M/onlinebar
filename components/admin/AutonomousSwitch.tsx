'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Card } from '@/components/ui/card';
import { Bot, Zap, Lock, Unlock, ShieldAlert, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AutonomousState {
    engine_name: string;
    is_autonomous: boolean;
    updated_at: string;
}

export default function AutonomousSwitch() {
    const [states, setStates] = useState<AutonomousState[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchStates = async () => {
        if (!supabase) return;
        const { data } = await supabase.from('system_autonomous_state').select('*');
        if (data) setStates(data);
        setLoading(false);
    };

    useEffect(() => {
        fetchStates();
    }, []);

    const toggleState = async (engine: string, current: boolean) => {
        if (!supabase) return;
        const newState = !current;

        const { error } = await supabase
            .from('system_autonomous_state')
            .update({ is_autonomous: newState, updated_at: new Date().toISOString() })
            .eq('engine_name', engine);

        if (!error) {
            setStates(prev => prev.map(s => s.engine_name === engine ? { ...s, is_autonomous: newState } : s));
        }
    };

    if (loading) return <div className="h-32 bg-slate-50 rounded-3xl animate-pulse flex items-center justify-center"><Loader2 className="animate-spin text-slate-200" /></div>;

    return (
        <Card className="p-10 rounded-[3rem] bg-white border border-slate-100 shadow-sm space-y-8 text-left">
            <div className="flex justify-between items-center px-2">
                <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 shadow-sm">
                        <Bot size={24} />
                    </div>
                    <div>
                        <h3 className="text-xl font-black uppercase tracking-tighter text-foreground">Automation Grid</h3>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Global Autonomous Controllers</p>
                    </div>
                </div>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {states.map((s) => (
                    <button
                        key={s.engine_name}
                        onClick={() => toggleState(s.engine_name, s.is_autonomous)}
                        className={cn(
                            "p-6 rounded-[2rem] border-2 transition-all group flex flex-col gap-4 text-left relative overflow-hidden",
                            s.is_autonomous
                                ? "bg-emerald-50 border-emerald-500/10 hover:border-emerald-500/20"
                                : "bg-rose-50 border-rose-500/10 hover:border-rose-500/20"
                        )}
                    >
                        <div className="flex justify-between items-center relative z-10">
                            <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">{s.engine_name} Engine</span>
                            {s.is_autonomous ? <Unlock size={14} className="text-emerald-500" /> : <Lock size={14} className="text-rose-500" />}
                        </div>

                        <div className="space-y-1 relative z-10">
                            <p className={cn(
                                "text-lg font-black uppercase tracking-tight",
                                s.is_autonomous ? "text-emerald-600" : "text-rose-600"
                            )}>
                                {s.is_autonomous ? 'Full Auto' : 'Manual Lock'}
                            </p>
                            <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">
                                {s.is_autonomous ? 'System handles routine actions' : 'Admin approval required'}
                            </p>
                        </div>

                        {s.is_autonomous && <Zap className="absolute -bottom-4 -right-4 h-16 w-16 text-emerald-500/5 rotate-12" />}
                        {!s.is_autonomous && <ShieldAlert className="absolute -bottom-4 -right-4 h-16 w-16 text-rose-500/5 rotate-12" />}
                    </button>
                ))}
            </div>
        </Card>
    );
}
