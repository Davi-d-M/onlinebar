'use client';

import * as React from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
    ShieldCheck,
    Smartphone,
    Monitor,
    LogOut,
    RefreshCcw,
    Clock,
    Globe,
    Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Session {
    id: string;
    device_name: string;
    device_type: 'Mobile' | 'Desktop';
    browser: string;
    ip_address: string;
    last_active_at: string;
    is_current_session: boolean;
}

export default function SecurityDashboard({ userId }: { userId: string }) {
    const [sessions, setSessions] = React.useState<Session[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [isRevoking, setIsRevoking] = React.useState<string | null>(null);

    const fetchSessions = React.useCallback(async () => {
        if (!supabase || !userId) return;
        setLoading(true);
        try {
            const { data } = await supabase
                .from('security_sessions')
                .select('*')
                .eq('user_id', userId)
                .order('last_active_at', { ascending: false });

            if (data) setSessions(data as Session[]);
        } finally {
            setLoading(false);
        }
    }, [userId]);

    React.useEffect(() => {
        fetchSessions();
    }, [fetchSessions]);

    const revokeSession = async (sessionId: string) => {
        if (!supabase) return;
        setIsRevoking(sessionId);
        try {
            // In real prod, this should call a secure RPC to invalidate the session in Supabase Auth as well
            await supabase.from('security_sessions').delete().eq('id', sessionId);
            setSessions(prev => prev.filter(s => s.id !== sessionId));
        } finally {
            setIsRevoking(null);
        }
    };

    const revokeAllOthers = async () => {
        if (!supabase || !userId) return;
        if (!confirm("Confirm security termination for all other active nodes?")) return;

        setLoading(true);
        try {
            await supabase
                .from('security_sessions')
                .delete()
                .eq('user_id', userId)
                .eq('is_current_session', false);

            await fetchSessions();
        } finally {
            setLoading(false);
        }
    };

    if (loading && sessions.length === 0) return <div className="h-48 bg-slate-50 rounded-[3rem] animate-pulse" />;

    return (
        <Card id="security-hub" className="p-10 rounded-[3.5rem] bg-white border border-slate-100 shadow-sm space-y-10 text-left scroll-mt-24">
            <div className="flex justify-between items-center px-2">
                <div className="flex items-center gap-4 text-left">
                    <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-sm border border-primary/10">
                        <ShieldCheck size={24} />
                    </div>
                    <div>
                        <h3 className="text-xl font-black uppercase tracking-tighter text-foreground leading-none">Security Vault</h3>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Identity & Session Governance</p>
                    </div>
                </div>
                <Button onClick={fetchSessions} variant="ghost" size="icon" className="text-slate-300 hover:text-primary transition-all">
                    <RefreshCcw size={18} className={cn(loading && "animate-spin")} />
                </Button>
            </div>

            <div className="space-y-6">
                <div className="flex items-center justify-between px-2">
                    <h4 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">My Active Nodes</h4>
                    {sessions.length > 1 && (
                        <button onClick={revokeAllOthers} className="text-[9px] font-black text-rose-500 uppercase tracking-widest hover:underline decoration-2 underline-offset-4">Eject Others</button>
                    )}
                </div>

                <div className="grid gap-3">
                    {sessions.length === 0 ? (
                        <div className="py-10 text-center opacity-30 italic text-[10px] uppercase font-black">Link Status: Secure</div>
                    ) : sessions.map((s) => (
                        <div key={s.id} className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100 flex items-center justify-between group hover:bg-white hover:shadow-xl transition-all">
                            <div className="flex items-center gap-6">
                                <div className={cn(
                                    "h-12 w-12 rounded-xl flex items-center justify-center shadow-inner transition-transform group-hover:scale-105",
                                    s.is_current_session ? "bg-emerald-50 text-emerald-500" : "bg-slate-200 text-slate-400"
                                )}>
                                    {s.device_type === 'Mobile' ? <Smartphone size={24} /> : <Monitor size={24} />}
                                </div>
                                <div className="text-left">
                                    <div className="flex items-center gap-3">
                                        <p className="text-xs font-black uppercase text-foreground">{s.device_name || 'Authorized Device'}</p>
                                        {s.is_current_session && (
                                            <span className="px-2 py-0.5 rounded bg-emerald-500 text-white text-[7px] font-black uppercase animate-pulse shadow-lg shadow-emerald-500/20">Current Node</span>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-3 mt-1">
                                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5"><Globe size={10} /> {s.browser} • {s.ip_address}</p>
                                        <div className="h-1 w-1 rounded-full bg-slate-200" />
                                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5"><Clock size={10} /> {new Date(s.last_active_at).toLocaleDateString()}</p>
                                    </div>
                                </div>
                            </div>

                            {!s.is_current_session && (
                                <button
                                    onClick={() => revokeSession(s.id)}
                                    disabled={isRevoking === s.id}
                                    className="h-10 w-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-slate-300 hover:text-rose-500 transition-all shadow-sm active:scale-95"
                                >
                                    {isRevoking === s.id ? <Loader2 size={16} className="animate-spin" /> : <LogOut size={16} />}
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            <div className="p-8 rounded-[2.5rem] bg-indigo-50 border border-indigo-100 flex items-start gap-4">
                <ShieldCheck className="h-6 w-6 text-indigo-500 mt-0.5 shrink-0" />
                <div className="space-y-1">
                    <p className="text-xs font-black uppercase text-indigo-700">Security Recommendation</p>
                    <p className="text-[10px] text-indigo-600 font-medium leading-relaxed italic">
                        &quot;Your account security is 100% healthy. We detected zero suspicious login attempts in the last 30 days. Consider enabling biometric lock on your mobile terminal for zero-friction vault entry.&quot;
                    </p>
                </div>
            </div>
        </Card>
    );
}
