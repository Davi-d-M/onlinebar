'use client';

import * as React from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Card } from '@/components/ui/card';
import { ShieldCheck, ShieldAlert, Database, Trash2, CheckCircle2, Info } from 'lucide-react';

export default function DataGovernance() {
    const [stats, setStats] = React.useState({
        consentHealth: 98,
        retentionCompliance: 'Active',
        alerts: [] as any[]
    });

    const fetchGovernance = React.useCallback(async () => {
        if (!supabase) return;
        const { data } = await supabase.from('data_quality_alerts').select('*').eq('status', 'OPEN');
        setStats(prev => ({ ...prev, alerts: data || [] }));
    }, []);

    React.useEffect(() => {
        fetchGovernance();
    }, [fetchGovernance]);

    return (
        <Card className="p-10 rounded-[3.5rem] bg-white border border-slate-100 shadow-sm space-y-10 text-left">
            <div className="flex justify-between items-center px-2">
                <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-sm">
                        <Database size={24} />
                    </div>
                    <div>
                        <h3 className="text-xl font-black uppercase tracking-tighter text-foreground">Governance Center</h3>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Privacy & Data Integrity Node</p>
                    </div>
                </div>
                <div className="flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[9px] font-black uppercase border border-emerald-100">
                    <CheckCircle2 size={12} /> Compliance: High
                </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
                <div className="p-6 rounded-[2rem] bg-slate-50 border border-slate-100 space-y-2">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Consent Health</p>
                    <div className="flex items-end gap-2">
                        <p className="text-2xl font-black text-foreground">{stats.consentHealth}%</p>
                        <span className="text-[8px] font-bold text-emerald-500 uppercase mb-1">Optimal</span>
                    </div>
                </div>
                <div className="p-6 rounded-[2rem] bg-slate-50 border border-slate-100 space-y-2">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Retention Policy</p>
                    <div className="flex items-end gap-2">
                        <p className="text-2xl font-black text-foreground">90D</p>
                        <span className="text-[8px] font-bold text-slate-400 uppercase mb-1">Behavioral</span>
                    </div>
                </div>
            </div>

            <div className="space-y-4">
                <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-2">Integrity Alerts</h4>
                {stats.alerts.length === 0 ? (
                    <div className="p-8 text-center bg-emerald-50/30 rounded-[2rem] border border-emerald-100/50 border-dashed">
                        <ShieldCheck size={32} className="mx-auto mb-3 text-emerald-200" />
                        <p className="text-[9px] font-black uppercase text-emerald-600 tracking-widest">Zero Data Orphans Detected</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {stats.alerts.map((alert, i) => (
                            <div key={i} className="p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-center justify-between group">
                                <div className="flex items-center gap-3">
                                    <ShieldAlert size={16} className="text-rose-500" />
                                    <div>
                                        <p className="text-[10px] font-black text-rose-700 uppercase">{alert.issue_type}</p>
                                        <p className="text-[8px] font-medium text-rose-500 italic">{alert.description}</p>
                                    </div>
                                </div>
                                <button className="opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={14} className="text-rose-300 hover:text-rose-500" /></button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="p-5 bg-indigo-50 border border-indigo-100 rounded-[2rem] flex items-start gap-4">
                <Info size={18} className="text-indigo-500 mt-0.5 shrink-0" />
                <p className="text-[10px] text-indigo-700 font-medium leading-relaxed italic">
                    &quot;Consent records are immutable. Data deletion requests (KDP) are processed within 48 hours to maintain local compliance.&quot;
                </p>
            </div>
        </Card>
    );
}
