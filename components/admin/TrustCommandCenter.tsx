'use client';

import * as React from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Card } from '@/components/ui/card';
import {
    ShieldCheck,
    ShieldAlert,
    Activity,
    AlertTriangle,
    Eye,
    XCircle,
    CheckCircle2,
    MapPin,
    Search
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

export default function TrustCommandCenter() {
    const [stats, setStats] = React.useState({
        totalVerified: 0,
        suspicious: 0,
        invalid: 0,
        reports: 0
    });
    const [alerts, setAlerts] = React.useState<{ id: number, bottle_id: string, severity: string, description: string, created_at: string }[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [searchQuery, setSearchQuery] = React.useState('');

    const fetchTrustIntel = React.useCallback(async () => {
        if (!supabase) return;
        setLoading(true);
        try {
            const [scansRes, alertsRes] = await Promise.all([
                supabase.from('verification_scans').select('*', { count: 'exact' }),
                supabase.from('trust_alerts').select('*, bottle_passports(id, current_status)').eq('status', 'OPEN').order('created_at', { ascending: false })
            ]);

            const scans = (scansRes.data || []) as { is_anomaly: boolean }[];
            const suspiciousCount = scans.filter(s => s.is_anomaly).length;

            setStats({
                totalVerified: scansRes.count || 0,
                suspicious: suspiciousCount,
                invalid: 0, // In real prod, this comes from a failed_attempts table
                reports: 0
            });

            setAlerts(alertsRes.data || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, []);

    React.useEffect(() => {
        fetchTrustIntel();
    }, [fetchTrustIntel]);

    if (loading && alerts.length === 0) return <div className="h-64 bg-slate-50 rounded-[3rem] animate-pulse" />;

    return (
        <div className="space-y-10 text-left selection:bg-primary/20 animate-in fade-in duration-1000">

            {/* 1. EXECUTIVE METRICS */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: 'Total Verifications', val: stats.totalVerified, icon: ShieldCheck, color: 'primary' },
                    { label: 'Suspicious Activity', val: stats.suspicious, icon: AlertTriangle, color: 'amber' },
                    { label: 'Invalid Codes', val: stats.invalid, icon: XCircle, color: 'rose' },
                    { label: 'Citizen Reports', val: stats.reports, icon: Eye, color: 'indigo' },
                ].map((item) => (
                    <Card key={item.label} className="p-8 rounded-[2.5rem] bg-white border border-slate-100 shadow-sm flex items-center gap-6 group hover:shadow-xl transition-all h-full">
                        <div className={cn(
                            "h-14 w-14 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 shadow-inner",
                            item.color === 'primary' ? "bg-primary/10 text-primary" :
                            item.color === 'amber' ? "bg-amber-50 text-amber-500" :
                            item.color === 'rose' ? "bg-rose-50 text-rose-500" :
                            "bg-indigo-50 text-indigo-500"
                        )}>
                            <item.icon size={28} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">{item.label}</p>
                            <h3 className="text-2xl font-black text-foreground mt-1 tracking-tighter uppercase">{item.val}</h3>
                        </div>
                    </Card>
                ))}
            </div>

            {/* 2. THREAT WAR ROOM */}
            <div className="grid lg:grid-cols-12 gap-10">

                <div className="lg:col-span-8 space-y-8 text-left">
                    <div className="flex items-center justify-between px-2">
                        <div className="flex items-center gap-4">
                            <div className="h-10 w-10 rounded-xl bg-rose-50 flex items-center justify-center text-rose-500 shadow-sm animate-pulse border border-rose-100">
                                <ShieldAlert size={20} />
                            </div>
                            <div>
                                <h2 className="text-2xl font-black uppercase tracking-tighter text-foreground leading-none">Threat War Room</h2>
                                <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest mt-1">Real-time Anomaly Investigation</p>
                            </div>
                        </div>
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                            <Input
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                placeholder="Search Bottle ID..."
                                className="h-12 rounded-2xl bg-white border-slate-100 pl-12 text-[10px] font-black uppercase tracking-widest w-72 shadow-sm focus:ring-4 focus:ring-primary/5"
                            />
                        </div>
                    </div>

                    <div className="grid gap-4">
                        {alerts.length === 0 ? (
                            <div className="p-32 text-center bg-white rounded-[3.5rem] border-2 border-dashed border-slate-100 opacity-40 flex flex-col items-center gap-6">
                                <ShieldCheck size={64} className="text-emerald-200" />
                                <div className="space-y-2">
                                    <p className="text-xl font-black text-slate-300 uppercase tracking-tight italic">Zero High-Risk Anomalies.</p>
                                    <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Sentinel Node: Secure</p>
                                </div>
                            </div>
                        ) : alerts.map(alert => (
                            <Card key={alert.id} className="p-8 rounded-[3rem] bg-white border border-slate-100 shadow-sm flex flex-col md:flex-row justify-between items-center gap-8 group hover:shadow-2xl transition-all relative overflow-hidden">
                                {alert.severity === 'Critical' && <div className="absolute top-0 left-0 h-full w-2 bg-rose-500 animate-pulse"></div>}
                                <div className="flex items-center gap-6 flex-1 text-left">
                                    <div className={cn(
                                        "h-16 w-16 rounded-[1.8rem] flex items-center justify-center shadow-inner shrink-0 group-hover:scale-105 transition-transform",
                                        alert.severity === 'Critical' ? "bg-rose-50 text-rose-500" : "bg-amber-50 text-amber-500"
                                    )}>
                                        <AlertTriangle size={32} />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-3 mb-2">
                                            <span className={cn(
                                                "px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest border",
                                                alert.severity === 'Critical' ? "bg-rose-600 text-white border-rose-500" : "bg-amber-100 text-amber-600 border-amber-200"
                                            )}>{alert.severity}</span>
                                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Bottle ID: {alert.bottle_id}</p>
                                        </div>
                                        <h3 className="text-sm font-black text-foreground uppercase tracking-tight leading-relaxed">&quot;{alert.description}&quot;</h3>
                                        <div className="flex items-center gap-3 mt-3">
                                            <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-50 rounded-full border border-slate-100">
                                                <MapPin className="h-3 w-3 text-slate-300" />
                                                <span className="text-[9px] font-black text-slate-400 uppercase">Multiple Locations Identified</span>
                                            </div>
                                            <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">{new Date(alert.created_at).toLocaleTimeString()}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <Button className="h-14 px-8 rounded-2xl bg-rose-600 text-white font-black uppercase text-[10px] tracking-widest shadow-xl shadow-rose-100 active:scale-95 transition-all">Flag Batch</Button>
                                    <Button variant="outline" className="h-14 px-8 rounded-2xl border-slate-100 text-slate-400 font-black uppercase text-[10px] tracking-widest hover:bg-slate-50 transition-all">Investigate</Button>
                                </div>
                            </Card>
                        ))}
                    </div>
                </div>

                <div className="lg:col-span-4 space-y-8 text-left">
                    <Card className="p-10 rounded-[3rem] bg-indigo-600 text-white border-none shadow-2xl relative overflow-hidden group">
                        <div className="relative z-10 space-y-10">
                            <div className="flex items-center gap-4">
                                <div className="h-12 w-12 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-md border border-white/20"><Activity size={24} /></div>
                                <h3 className="text-xl font-black uppercase tracking-tighter">Sentinel Status</h3>
                            </div>
                            <div className="space-y-6">
                                <div>
                                    <p className="text-[9px] font-black text-white/50 uppercase mb-2 tracking-[0.2em]">Verification Health</p>
                                    <p className="text-4xl font-black text-white tracking-tighter leading-none">99.4%</p>
                                    <div className="flex items-center gap-2 mt-2 text-emerald-400">
                                        <CheckCircle2 size={12} />
                                        <span className="text-[9px] font-black uppercase tracking-widest">Trust Index: High</span>
                                    </div>
                                </div>
                                <div className="pt-6 border-t border-white/10 space-y-4">
                                    <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-white/60">
                                        <span>Scan Confidence</span>
                                        <span className="text-white font-mono">92/100</span>
                                    </div>
                                    <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                                        <div className="h-full bg-white transition-all duration-1000" style={{ width: '92%' }}></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <ShieldCheck className="absolute -bottom-10 -right-10 h-48 w-48 text-white/5 rotate-12 -z-0" />
                    </Card>

                    <div className="p-8 rounded-[3rem] bg-white border border-slate-100 shadow-sm space-y-6 text-left relative overflow-hidden">
                        <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-sm group-hover:scale-105 transition-transform"><Activity size={20} /></div>
                        <h4 className="text-lg font-black uppercase text-foreground leading-none tracking-tighter">Batch Integrity</h4>
                        <p className="text-[10px] text-muted-foreground font-medium leading-relaxed italic">
                            &quot;Batch **B2026-08-A** has reached 84% customer verification rate with zero compromising signals. Recommend promoting as &apos;Guardian Verified&apos;.&quot;
                        </p>
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                    </div>
                </div>

            </div>
        </div>
    );
}
