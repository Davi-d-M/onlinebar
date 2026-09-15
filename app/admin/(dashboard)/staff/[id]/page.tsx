'use client';

import * as React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import {
  ShieldCheck,
  Lock,
  Clock,
  History,
  Activity,
  ArrowLeft,
  Loader2,
  ShieldAlert,
  Database,
  Globe,
  Smartphone,
  DollarSign,
  TrendingUp,
  Package
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn, formatPrice } from '@/lib/utils';

interface StaffProfile {
    id: string;
    email: string;
    role: string;
    status: string;
    last_activity_at: string;
    completed_tasks: number;
    overdue_tasks: number;
    sla_rating: number;
    created_at: string;
}

interface AuditLog {
    id: string;
    action: string;
    ip_address: string;
    device_info: string;
    created_at: string;
    details: Record<string, unknown>;
}

interface StaffOrder {
    id: number;
    total_price: number;
    created_at: string;
    status: string;
}

export default function StaffProfilePage() {
    const { id } = useParams();
    const router = useRouter();
    const [staff, setStaff] = React.useState<StaffProfile | null>(null);
    const [logs, setLogs] = React.useState<AuditLog[]>([]);
    const [orders, setOrders] = React.useState<StaffOrder[]>([]);
    const [loading, setLoading] = React.useState(true);

    const fetchData = React.useCallback(async () => {
        if (!supabase || !id) return;
        setLoading(true);
        try {
            const { data: staffData, error: staffError } = await supabase
                .from('staff')
                .select('*')
                .eq('id', id)
                .single();

            if (staffError) throw staffError;

            const [logsRes, ordersRes] = await Promise.all([
                supabase.from('audit_logs').select('*').eq('actor_id', id).order('created_at', { ascending: false }).limit(20),
                supabase.from('orders').select('id, total_price, created_at, status').eq('captured_by', staffData.email).order('created_at', { ascending: false })
            ]);

            setStaff(staffData as StaffProfile);
            setLogs(logsRes.data || []);
            setOrders(ordersRes.data || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [id]);

    React.useEffect(() => {
        fetchData();
    }, [fetchData]);

    const totalSales = React.useMemo(() => {
        return orders.filter(o => o.status === 'Delivered' || o.status === 'Completed').reduce((sum, o) => sum + (o.total_price || 0), 0);
    }, [orders]);

    if (loading) return (
        <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-white">
            <Loader2 className="animate-spin text-primary" />
            <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Opening Personnel File...</p>
        </div>
    );

    if (!staff) return (
        <div className="min-h-screen flex flex-col items-center justify-center p-8 text-center bg-white">
            <ShieldAlert className="h-12 w-12 text-rose-500 mb-4" />
            <h1 className="text-2xl font-black uppercase text-foreground">Staff Node Not Found</h1>
            <Button onClick={() => router.back()} variant="ghost" className="mt-4">Return to Directory</Button>
        </div>
    );

    return (
        <div className="p-8 space-y-10 bg-slate-50 min-h-screen text-left selection:bg-primary/20">
            <header className="flex items-center gap-6 border-b border-slate-200 pb-8">
                <Button onClick={() => router.back()} variant="outline" size="icon" className="h-12 w-12 rounded-xl bg-white border-slate-200">
                    <ArrowLeft size={20} />
                </Button>
                <div>
                    <div className="flex items-center gap-3 mb-1 text-left">
                        <span className={cn(
                            "px-2 py-0.5 rounded-md text-[7px] font-black uppercase tracking-widest",
                            staff.status === 'Online' ? "bg-emerald-500 text-white animate-pulse" : "bg-slate-200 text-slate-400"
                        )}>{staff.status}</span>
                        <p className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">{staff.role.replace('_', ' ')} Node</p>
                    </div>
                    <h1 className="text-4xl font-black text-foreground uppercase tracking-tighter leading-none">{staff.email.split('@')[0]}</h1>
                </div>
            </header>

            <div className="grid lg:grid-cols-12 gap-10">

                {/* LEFT: ACCOUNTABILITY */}
                <div className="lg:col-span-4 space-y-8">
                    <Card className="p-10 rounded-[3.5rem] bg-white border border-slate-100 shadow-sm space-y-10 text-left">
                        <div className="flex justify-between items-start">
                            <div className="h-16 w-16 rounded-[2rem] bg-primary flex items-center justify-center text-white font-black text-2xl shadow-xl shadow-primary/20">
                                {staff.email.substring(0, 2).toUpperCase()}
                            </div>
                            <div className="text-right">
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">SLA Performance</p>
                                <p className="text-2xl font-black text-emerald-500">{staff.sla_rating}%</p>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="space-y-1">
                                <p className="text-[8px] font-black uppercase text-slate-400">Authorized Email</p>
                                <p className="text-sm font-black text-foreground">{staff.email}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-[8px] font-black uppercase text-slate-400">Node Established</p>
                                <p className="text-sm font-black text-foreground">{new Date(staff.created_at).toLocaleDateString()}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 pt-6 border-t border-slate-50">
                            <div className="space-y-1">
                                <p className="text-[8px] font-black text-slate-400 uppercase">Completed</p>
                                <p className="text-xl font-black text-foreground">{staff.completed_tasks}</p>
                            </div>
                            <div className="space-y-1 text-right">
                                <p className="text-[8px] font-black text-slate-400 uppercase">Overdue</p>
                                <p className="text-xl font-black text-rose-500">{staff.overdue_tasks}</p>
                            </div>
                        </div>
                    </Card>

                    {/* SALES PERFORMANCE */}
                    <Card className="p-10 rounded-[3.5rem] bg-white border border-slate-100 shadow-sm space-y-8 text-left">
                        <div className="flex items-center gap-4">
                            <div className="h-12 w-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-500 shadow-inner">
                                <DollarSign size={24} />
                            </div>
                            <div>
                                <h3 className="text-xl font-black uppercase tracking-tighter text-foreground">Sales Volume</h3>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Lifetime Contribution</p>
                            </div>
                        </div>
                        <div>
                            <p className="text-4xl font-black text-foreground tracking-tighter">{formatPrice(totalSales)}</p>
                            <div className="flex items-center gap-2 mt-4">
                                <TrendingUp size={14} className="text-emerald-500" />
                                <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">{orders.length} Missions Logged</span>
                            </div>
                        </div>
                    </Card>

                    <Card className="p-10 rounded-[3.5rem] bg-white border border-slate-100 shadow-sm space-y-6 text-left relative overflow-hidden group">
                        <div className="relative z-10 space-y-6">
                            <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 flex items-center gap-2"><Clock size={16} /> Last Heartbeat</h3>
                            <div>
                                <p className="text-2xl font-black text-foreground uppercase tracking-tight">{new Date(staff.last_activity_at).toLocaleTimeString()}</p>
                                <p className="text-[9px] font-bold text-slate-400 uppercase mt-1 tracking-widest">{new Date(staff.last_activity_at).toLocaleDateString()}</p>
                            </div>
                        </div>
                        <Activity className="absolute -bottom-10 -right-10 h-48 w-48 text-primary/5 rotate-12 -z-0" />
                    </Card>
                </div>

                {/* RIGHT: AUDIT & ORDERS */}
                <div className="lg:col-span-8 space-y-8">

                    {/* RECENT SALES LOG */}
                    <Card className="rounded-[3.5rem] border border-slate-100 bg-white shadow-sm overflow-hidden text-left">
                        <div className="p-8 border-b border-slate-50 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Package className="h-6 w-6 text-primary" />
                                <h2 className="text-2xl font-black text-foreground uppercase tracking-tighter">Attributed Orders</h2>
                            </div>
                            <span className="text-[10px] font-black uppercase text-slate-400 bg-slate-50 px-4 py-2 rounded-full border border-slate-100">Live Queue</span>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="bg-slate-50 text-slate-400 font-black uppercase text-[9px] tracking-[0.2em]">
                                        <th className="px-10 py-6">Mission ID</th>
                                        <th className="px-10 py-6">Value</th>
                                        <th className="px-10 py-6">Status</th>
                                        <th className="px-10 py-6 text-right">Date</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {orders.slice(0, 5).map(order => (
                                        <tr key={order.id} className="hover:bg-slate-50 transition-colors">
                                            <td className="px-10 py-8 font-black text-foreground uppercase text-xs">#{order.id}</td>
                                            <td className="px-10 py-8 font-bold text-foreground">{formatPrice(order.total_price)}</td>
                                            <td className="px-10 py-8">
                                                <span className={cn(
                                                    "px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest",
                                                    order.status === 'Delivered' ? "bg-emerald-50 text-emerald-600" : "bg-primary/10 text-primary"
                                                )}>{order.status}</span>
                                            </td>
                                            <td className="px-10 py-8 text-right text-[10px] font-bold text-slate-400">{new Date(order.created_at).toLocaleDateString()}</td>
                                        </tr>
                                    ))}
                                    {orders.length === 0 && (
                                        <tr>
                                            <td colSpan={4} className="px-10 py-20 text-center opacity-30 italic text-xs font-black uppercase">No attributed orders found.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </Card>

                    <Card className="rounded-[3.5rem] border border-slate-100 bg-white shadow-sm overflow-hidden text-left">
                        <div className="p-8 border-b border-slate-50 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <History className="h-6 w-6 text-primary" />
                                <h2 className="text-2xl font-black text-foreground uppercase tracking-tighter">Surgical Audit Trail</h2>
                            </div>
                            <span className="text-[10px] font-black uppercase text-slate-400 bg-slate-50 px-4 py-2 rounded-full border border-slate-100">Action Telemetry</span>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="bg-slate-50 text-slate-400 font-black uppercase text-[9px] tracking-[0.2em]">
                                        <th className="px-10 py-6">Action Pulse</th>
                                        <th className="px-10 py-6">Identity Signals</th>
                                        <th className="px-10 py-6 text-right">Time</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {logs.map(log => (
                                        <tr key={log.id} className="hover:bg-slate-50/50 transition-colors group">
                                            <td className="px-10 py-8">
                                                <span className="text-[10px] font-black text-primary uppercase bg-primary/5 px-3 py-1.5 rounded-lg border border-primary/10">
                                                    {log.action.replace(/_/g, ' ')}
                                                </span>
                                                <p className="text-[9px] font-medium text-slate-400 mt-2 italic truncate max-w-[200px]">
                                                    {JSON.stringify(log.details)}
                                                </p>
                                            </td>
                                            <td className="px-10 py-8">
                                                <div className="space-y-2">
                                                    <div className="flex items-center gap-2">
                                                        <Globe size={10} className="text-slate-300" />
                                                        <span className="text-[10px] font-black text-foreground">{log.ip_address}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Smartphone size={10} className="text-slate-300" />
                                                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tight">{log.device_info}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-10 py-8 text-right">
                                                <p className="text-xs font-black text-foreground uppercase tracking-tight">{new Date(log.created_at).toLocaleTimeString()}</p>
                                                <p className="text-[9px] font-bold text-slate-400 uppercase">{new Date(log.created_at).toLocaleDateString()}</p>
                                            </td>
                                        </tr>
                                    ))}
                                    {logs.length === 0 && (
                                        <tr>
                                            <td colSpan={3} className="px-10 py-20 text-center opacity-30">
                                                <History size={48} className="mx-auto mb-4" />
                                                <p className="text-[10px] font-black uppercase tracking-widest italic">No operational logs recorded for this node.</p>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </Card>

                    {/* COMMAND CONTROLS */}
                    <div className="grid md:grid-cols-2 gap-8">
                         <Card className="p-10 rounded-[3.5rem] bg-white border border-slate-100 shadow-sm space-y-8 text-left group hover:border-primary/20 transition-all">
                             <div className="flex items-center gap-4">
                                 <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform"><Lock size={24} /></div>
                                 <h3 className="text-xl font-black uppercase tracking-tighter">Security Node</h3>
                             </div>
                             <div className="space-y-4">
                                 <Button className="w-full h-14 rounded-2xl bg-primary text-white font-black uppercase text-[10px] tracking-widest active:scale-95 transition-all shadow-xl shadow-primary/20">Reset Security PIN</Button>
                                 <Button variant="outline" className="w-full h-14 rounded-2xl border-rose-100 text-rose-500 font-black uppercase text-[10px] tracking-widest hover:bg-rose-50">Revoke Session</Button>
                             </div>
                         </Card>

                         <Card className="p-10 rounded-[3.5rem] bg-emerald-500 text-white border-none shadow-2xl relative overflow-hidden group text-left">
                             <div className="relative z-10 space-y-6">
                                 <div className="flex items-center gap-4">
                                     <div className="h-12 w-12 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-md border border-white/20 shadow-sm"><ShieldCheck size={28} /></div>
                                     <h3 className="text-xl font-black uppercase tracking-tighter">Operational Authority</h3>
                                 </div>
                                 <p className="text-xs font-medium opacity-80 leading-relaxed italic pr-4">
                                     &quot;Authorized to perform enterprise-level operations. All actions are logged and synced with the Master Ledger.&quot;
                                 </p>
                                 <div className="pt-4 border-t border-white/10 flex justify-between items-center">
                                     <span className="text-[8px] font-black uppercase tracking-widest opacity-60">Status: Verified Unit</span>
                                     <div className="h-2 w-2 rounded-full bg-white animate-pulse" />
                                 </div>
                             </div>
                             <Database className="absolute -bottom-10 -right-10 h-64 w-64 text-white/5 rotate-12 -z-0" />
                         </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}
