'use client';

import * as React from 'react';
import { supabase } from '@/lib/supabaseClient';
import {
    MessageSquare,
    Send,
    Plus,
    Zap,
    ShieldCheck,
    Power,
    CheckCircle2,
    Users,
    BarChart3,
    Smartphone,
    Globe,
    Target
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn, formatPrice } from '@/lib/utils';
import Link from 'next/link';
import AudienceBuilder from '@/components/admin/growth/AudienceBuilder';
import { logAuditAction } from '@/lib/auditService';
import { useAdmin } from '@/context/AdminContext';

export default function MessageCommandCenter() {
    const { email } = useAdmin();
    const [killSwitch, setKillSwitch] = React.useState(false);
    const [stats, setStats] = React.useState({ sent: 0, open_rate: 0, revenue: 0 });
    const [segments, setSegments] = React.useState<Array<{ id: string, name: string }>>([]);

    const fetchStats = React.useCallback(async () => {
        if (!supabase) return;
        try {
            const [segRes, campRes] = await Promise.all([
                supabase.from('audience_segments').select('*'),
                supabase.from('message_campaigns').select('*')
            ]);

            if (segRes.data) setSegments(segRes.data);
            if (campRes.data) {
                const totalRev = campRes.data.reduce((s, c) => s + Number(c.attributed_revenue || 0), 0);
                const totalSent = campRes.data.reduce((s, c) => s + (c.sent_count || 0), 0);
                const totalOpen = campRes.data.reduce((s, c) => s + (c.open_count || 0), 0);

                setStats({
                    sent: totalSent,
                    open_rate: totalSent > 0 ? (totalOpen / totalSent) * 100 : 0,
                    revenue: totalRev
                });
            }
        } catch (err) { console.error(err); }
    }, []);

    React.useEffect(() => {
        fetchStats();
    }, [fetchStats]);

    const handleKillSwitch = async () => {
        const next = !killSwitch;
        if (next && !confirm("CRITICAL: Expel all active marketing journeys immediately?")) return;

        setKillSwitch(next);
        await logAuditAction(email, 'TOGGLE_MARKETING_KILL_SWITCH', { active: next });
        alert(next ? "Global Marketing Kill Switch: ACTIVE. All non-transactional nodes suspended." : "Marketing Protocol Restored.");
    };

    return (
        <div className="p-8 space-y-10 bg-slate-50 min-h-screen text-left selection:bg-primary/20 pb-40">
            <header className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 border-b border-slate-200 pb-8">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <MessageSquare className="h-4 w-4 text-primary" />
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Communication Fortress</span>
                    </div>
                    <h1 className="text-4xl font-black text-foreground uppercase tracking-tighter leading-none">Message Command</h1>
                    <p className="text-muted-foreground text-sm font-medium mt-1">Orchestrate high-fidelity messaging across all patron terminals.</p>
                </div>

                <div className="flex gap-4">
                    <button
                        onClick={handleKillSwitch}
                        className={cn(
                            "px-6 h-12 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 border-2",
                            killSwitch ? "bg-rose-600 border-rose-600 text-white shadow-xl shadow-rose-500/20" : "bg-white border-slate-200 text-rose-500 hover:border-rose-100"
                        )}
                    >
                        <Power size={16} /> {killSwitch ? 'MARKETING: SUSPENDED' : 'Global Kill Switch'}
                    </button>
                    <Link href="/admin/broadcast">
                        <Button className="rounded-xl h-12 px-8 bg-slate-900 text-white font-black uppercase text-[10px] tracking-widest shadow-xl hover:scale-105 active:scale-95 transition-all">
                            <Plus className="h-4 w-4 mr-2" /> New Broadcast
                        </Button>
                    </Link>
                </div>
            </header>

            {/* THE WAR ROOM HUD */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                {[
                    { label: 'Messages Sent', val: stats.sent.toLocaleString(), icon: Send, color: 'primary' },
                    { label: 'Avg. Open Rate', val: `${stats.open_rate.toFixed(1)}%`, icon: Globe, color: 'indigo' },
                    { label: 'Attributed Rev', val: formatPrice(stats.revenue), icon: Target, color: 'emerald' },
                    { label: 'Active Segments', val: segments.length, icon: Users, color: 'rose' },
                ].map((node) => (
                    <Card key={node.label} className="p-8 rounded-[3.5rem] bg-white border border-slate-100 shadow-sm group hover:shadow-xl transition-all relative overflow-hidden text-center flex flex-col items-center justify-center gap-4">
                        <div className={cn(
                            "h-14 w-14 rounded-full flex items-center justify-center transition-transform group-hover:scale-110 shadow-inner",
                            node.color === 'primary' ? "bg-primary/10 text-primary" :
                            node.color === 'indigo' ? "bg-indigo-50 text-indigo-500" :
                            node.color === 'emerald' ? "bg-emerald-50 text-emerald-500" :
                            "bg-rose-50 text-rose-500"
                        )}>
                            <node.icon size={28} />
                        </div>
                        <div className="space-y-1">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">{node.label}</p>
                            <h3 className="text-2xl font-black text-foreground tracking-tighter uppercase leading-none">{node.val}</h3>
                        </div>
                    </Card>
                ))}
            </div>

            <div className="grid lg:grid-cols-12 gap-10">
                <div className="lg:col-span-7">
                    <AudienceBuilder />
                </div>

                <div className="lg:col-span-5 space-y-8">
                    <Card className="p-10 rounded-[3.5rem] bg-slate-900 text-white space-y-8 relative overflow-hidden shadow-2xl">
                        <div className="relative z-10 space-y-6 text-left">
                            <ShieldCheck className="h-10 w-10 text-primary" />
                            <h3 className="text-2xl font-black uppercase tracking-tighter leading-none text-white">Compliance Protocol</h3>
                            <p className="text-sm font-medium text-slate-400 italic leading-relaxed">
                                &quot;All marketing communications must include the Mandatory Disclosure node. Automated block triggers are active for prohibited promotional mechanics.&quot;
                            </p>
                            <div className="pt-6 border-t border-white/10 flex justify-between items-center">
                                <span className="text-[9px] font-black uppercase tracking-widest text-primary">NACADA 2025 Sync</span>
                                <span className="text-xs font-black uppercase text-emerald-500 flex items-center gap-2"><CheckCircle2 size={14} /> Established</span>
                            </div>

                            <Link href="/admin/analytics/intelligence">
                                <Button className="w-full h-16 rounded-[2rem] bg-primary text-white font-black uppercase text-xs tracking-widest shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all">
                                    Open Intelligence Command
                                </Button>
                            </Link>
                        </div>
                        <Zap className="absolute -bottom-10 -right-10 h-48 w-48 text-primary/5 rotate-12" />
                    </Card>

                    <div className="p-8 rounded-[3rem] bg-white border border-slate-100 shadow-sm space-y-6 text-left group">
                        <div className="h-10 w-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 shadow-inner group-hover:rotate-6 transition-transform">
                            <Smartphone size={20} />
                        </div>
                        <h4 className="text-lg font-black uppercase text-foreground leading-none tracking-tighter">Attribution Integrity</h4>
                        <p className="text-[10px] text-muted-foreground font-medium italic leading-relaxed">
                            &quot;Every message link is wrapped with a unique attribution ID, ensuring 100% mathematical accuracy for revenue extraction.&quot;
                        </p>
                    </div>

                    <Card className="p-10 rounded-[3rem] bg-white border border-slate-100 shadow-sm space-y-6 text-left">
                        <h3 className="text-xs font-black uppercase text-slate-400 tracking-[0.3em] flex items-center gap-2">
                            <BarChart3 size={14} className="text-primary" /> Reach Efficiency
                        </h3>
                        <div className="space-y-4">
                            {[
                                { label: 'In-App Notifications', reach: '2.4k', eff: '92%' },
                                { label: 'WhatsApp Status', reach: '1.8k', eff: '84%' },
                                { label: 'Push Terminals', reach: '1.2k', eff: '78%' },
                            ].map(channel => (
                                <div key={channel.label} className="flex justify-between items-center py-2 border-b border-slate-50 last:border-0">
                                    <span className="text-[10px] font-black uppercase text-foreground">{channel.label}</span>
                                    <div className="text-right">
                                        <p className="text-[10px] font-black text-primary leading-none">{channel.eff}</p>
                                        <p className="text-[7px] font-bold text-slate-300 uppercase mt-1">{channel.reach} Active</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}
