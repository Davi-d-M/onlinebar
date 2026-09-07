'use client';

import * as React from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Card } from '@/components/ui/card';
import {
    History,
    MousePointer2,
    Clock,
    Smartphone,
    Globe,
    ShieldCheck,
    AlertCircle,
    Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ForensicAction {
    id: number;
    action_type: string;
    page_url: string;
    metadata: Record<string, unknown>;
    timestamp: string;
}

interface SessionDetail {
    id: string;
    user_id: string;
    source_channel: string;
    device_info: {
        ua: string;
    };
    entry_page: string;
    total_dwell_time_sec: number;
    created_at: string;
    actions: ForensicAction[];
}

export default function SessionForensics({ sessionId }: { sessionId: string }) {
    const [session, setSession] = React.useState<SessionDetail | null>(null);
    const [loading, setLoading] = React.useState(true);

    const fetchForensics = React.useCallback(async () => {
        if (!supabase || !sessionId) return;
        setLoading(true);
        try {
            const { data: sData } = await supabase.from('customer_sessions').select('*').eq('id', sessionId).single();
            const { data: aData } = await supabase.from('session_forensics').select('*').eq('session_id', sessionId).order('timestamp', { ascending: true });

            if (sData) {
                setSession({
                    ...sData,
                    actions: aData || []
                });
            }
        } catch (err: unknown) {
            const errorMsg = err instanceof Error ? err.message : String(err);
            console.error("Forensic Retrieval Failure:", errorMsg);
        } finally {
            setLoading(false);
        }
    }, [sessionId]);

    React.useEffect(() => {
        fetchForensics();
    }, [fetchForensics]);

    if (loading) return <div className="h-96 bg-slate-50 rounded-[3rem] animate-pulse flex items-center justify-center"><Loader2 className="animate-spin text-primary" /></div>;
    if (!session) return <div className="p-10 text-center text-slate-300 font-black uppercase tracking-widest italic">Signal Lost. No session data found.</div>;

    return (
        <Card className="p-10 rounded-[3.5rem] bg-white border border-slate-100 shadow-sm space-y-10 text-left">
            <header className="flex justify-between items-start">
                <div className="space-y-2">
                    <div className="flex items-center gap-3">
                        <History className="h-5 w-5 text-primary" />
                        <span className="text-[10px] font-black uppercase text-primary tracking-[0.4em]">Forensic Audit Active</span>
                    </div>
                    <h2 className="text-3xl font-black uppercase tracking-tighter text-foreground">Session Log #{session.id.substring(0, 6)}</h2>
                    <div className="flex items-center gap-4 pt-2">
                        <div className="flex items-center gap-2 px-3 py-1 bg-slate-50 rounded-lg border border-slate-100">
                            <Globe className="h-3 w-3 text-slate-400" />
                            <span className="text-[9px] font-black uppercase text-slate-500">{session.source_channel} Channel</span>
                        </div>
                        <div className="flex items-center gap-2 px-3 py-1 bg-slate-50 rounded-lg border border-slate-100">
                            <Clock className="h-3 w-3 text-slate-400" />
                            <span className="text-[9px] font-black uppercase text-slate-500">{session.total_dwell_time_sec}s Active</span>
                        </div>
                    </div>
                </div>
                <div className="text-right">
                    <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Entry Protocol</p>
                    <p className="text-sm font-black text-foreground uppercase truncate max-w-[150px]">{session.entry_page}</p>
                </div>
            </header>

            <div className="space-y-6">
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 ml-2">Event Timeline</h3>
                <div className="relative pl-10 space-y-8 before:absolute before:left-[1.2rem] before:top-2 before:bottom-2 before:w-1 before:bg-slate-50 before:rounded-full">
                    {session.actions.map((action, i) => (
                        <div key={action.id} className="relative group animate-in slide-in-from-left-4 duration-500" style={{ animationDelay: `${i * 50}ms` }}>
                            <div className={cn(
                                "absolute -left-10 top-0 h-6 w-6 rounded-full border-4 border-white flex items-center justify-center shadow-lg transition-transform group-hover:scale-125",
                                action.action_type === 'PAGE_VIEW' ? "bg-slate-200" :
                                action.action_type === 'ADD_TO_CART' ? "bg-primary" :
                                action.action_type === 'CHECKOUT_START' ? "bg-indigo-500" :
                                action.action_type === 'PAYMENT_FAIL' ? "bg-rose-500" : "bg-emerald-500"
                            )}>
                                <MousePointer2 className="h-2.5 w-2.5 text-white" />
                            </div>
                            <div className="flex justify-between items-start">
                                <div className="text-left">
                                    <p className="text-xs font-black text-foreground uppercase leading-none">{(action.action_type || '').replace(/_/g, ' ')}</p>
                                    <p className="text-[9px] font-bold text-slate-400 uppercase mt-1.5">{action.page_url}</p>
                                </div>
                                <span className="text-[9px] font-black text-slate-300 uppercase tabular-nums">
                                    {new Date(action.timestamp).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                                </span>
                            </div>
                        </div>
                    ))}
                    {session.actions.length === 0 && (
                        <div className="py-20 text-center opacity-30 italic">
                            <AlertCircle className="h-8 w-8 mx-auto mb-2" />
                            <p className="text-[10px] font-black uppercase">No deep forensics captured for this session.</p>
                        </div>
                    )}
                </div>
            </div>

            <div className="p-8 bg-slate-50 rounded-[2.5rem] flex items-center justify-between group overflow-hidden relative">
                <div className="relative z-10 flex items-center gap-6">
                    <div className="h-12 w-12 rounded-2xl bg-white flex items-center justify-center text-primary shadow-sm border border-slate-100 group-hover:scale-110 transition-transform">
                        <Smartphone size={24} />
                    </div>
                    <div>
                        <p className="text-[8px] font-black uppercase text-slate-400 tracking-widest mb-1">Terminal Registry</p>
                        <p className="text-xs font-bold text-foreground truncate max-w-[250px]">{session.device_info?.ua || 'Unknown Node'}</p>
                    </div>
                </div>
                <ShieldCheck size={48} className="absolute -bottom-2 -right-2 text-primary/5 -rotate-12" />
            </div>
        </Card>
    );
}
