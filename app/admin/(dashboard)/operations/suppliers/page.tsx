'use client';

import * as React from 'react';
import { supabase } from '@/lib/supabaseClient';
import Link from 'next/link';
import {
    RefreshCcw,
    Plus,
    Activity,
    Target,
    FileDown,
    ShieldCheck,
    Building2,
    CheckCircle2,
    XCircle,
    Search
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { logAuditAction } from '@/lib/auditService';
import { useAdmin } from '@/context/AdminContext';

interface Supplier {
    id: number;
    name: string;
    email: string;
    rating: number;
    fill_rate: number;
    on_time_dispatch_rate: number;
    defect_rate: number;
    verification_status: 'Pending' | 'Verified' | 'Rejected';
    is_active: boolean;
    business_permit_url?: string;
    kra_pin_url?: string;
    premises_license_url?: string;
    created_at: string;
}

export default function SupplierScorecards() {
    const { email: adminEmail } = useAdmin();
    const [suppliers, setSuppliers] = React.useState<Supplier[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [message, setMessage] = React.useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const [search, setSearch] = React.useState('');

    const fetchSuppliers = React.useCallback(async () => {
        if (!supabase) return;
        setLoading(true);
        try {
            const { data, error } = await supabase.from('suppliers').select('*').order('created_at', { ascending: false });
            if (error) throw error;
            setSuppliers(data || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, []);

    React.useEffect(() => {
        fetchSuppliers();
    }, [fetchSuppliers]);

    const handleApprove = async (s: Supplier) => {
        if (!supabase || !confirm(`Activate ${s.name} for the partner grid?`)) return;
        try {
            const { error } = await supabase
                .from('suppliers')
                .update({ verification_status: 'Verified', is_active: true })
                .eq('id', s.id);

            if (error) throw error;
            await logAuditAction(adminEmail || 'system', 'APPROVE_SUPPLIER', { id: s.id, name: s.name });
            setMessage({ type: 'success', text: `${s.name} verified and active! ✅` });
            fetchSuppliers();
        } catch (err: unknown) {
            setMessage({ type: 'error', text: (err as Error).message });
        }
    };

    const pending = suppliers.filter(s => s.verification_status === 'Pending');
    const active = suppliers.filter(s => s.verification_status === 'Verified' && s.name.toLowerCase().includes(search.toLowerCase()));

    return (
        <div className="p-8 space-y-10 bg-slate-50 min-h-screen text-left pb-40">
            <header className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 border-b border-slate-200 pb-8">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <Building2 className="h-4 w-4 text-primary" />
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Nexus Partner Grid</span>
                    </div>
                    <h1 className="text-4xl font-black text-foreground uppercase tracking-tighter">Partner Logistics</h1>
                    <p className="text-muted-foreground text-sm font-medium mt-1">Algorithmically monitored bar partner & supply network.</p>
                </div>
                <div className="flex gap-2">
                    <Button onClick={fetchSuppliers} variant="outline" className="rounded-xl h-12 px-6 border-slate-200 bg-white font-black uppercase text-[10px] tracking-widest hover:bg-slate-50 transition-all active:scale-95">
                        <RefreshCcw className={cn("h-4 w-4 mr-2", loading && "animate-spin")} /> Sync Matrix
                    </Button>
                    <Link href="/merchant/onboarding" target="_blank">
                        <Button className="rounded-xl h-12 px-8 bg-primary text-white font-black uppercase text-[10px] tracking-widest shadow-xl shadow-primary/20 hover:scale-105 transition-all active:scale-95">
                            <Plus size={16} className="mr-2" /> Application Link
                        </Button>
                    </Link>
                </div>
            </header>

            {message && (
                <div className={cn(
                    "p-6 rounded-[2rem] border-2 flex items-center gap-4 animate-in slide-in-from-top-4",
                    message.type === 'success' ? "bg-emerald-50 border-emerald-100 text-emerald-600" : "bg-rose-50 border-rose-100 text-rose-600"
                )}>
                    {message.type === 'success' ? <CheckCircle2 size={24} /> : <XCircle size={24} />}
                    <p className="text-sm font-black uppercase tracking-widest">{message.text}</p>
                </div>
            )}

            {/* APPROVALS QUEUE */}
            {pending.length > 0 && (
                <section className="space-y-6">
                    <div className="flex items-center gap-3 px-2">
                        <ShieldCheck className="text-primary h-6 w-6" />
                        <h2 className="text-2xl font-black uppercase tracking-tighter text-foreground">Verification Queue</h2>
                    </div>
                    <div className="grid gap-4">
                        {pending.map(s => (
                            <Card key={s.id} className="p-8 rounded-[3rem] bg-white border border-slate-100 shadow-sm flex flex-col lg:flex-row justify-between items-center gap-8 group hover:border-primary/20 transition-all">
                                <div className="flex items-center gap-6 flex-1 text-left">
                                    <div className="h-16 w-16 rounded-[1.8rem] bg-primary/10 flex items-center justify-center text-primary shadow-sm font-black text-xl">
                                        {s.name.substring(0, 2).toUpperCase()}
                                    </div>
                                    <div>
                                        <h3 className="font-black text-foreground uppercase text-xl tracking-tight leading-none">{s.name}</h3>
                                        <div className="flex items-center gap-3 mt-2">
                                            <span className="text-[10px] font-bold text-slate-400 uppercase">{s.email}</span>
                                            <div className="h-1 w-1 rounded-full bg-slate-200" />
                                            <span className="text-[9px] font-black text-primary uppercase animate-pulse">Awaiting Review</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4">
                                    <div className="flex -space-x-2 mr-4">
                                        {s.business_permit_url && <button title="View Permit" onClick={() => window.open(s.business_permit_url, '_blank')} className="h-10 w-10 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center text-slate-400 hover:text-primary transition-colors shadow-sm"><FileDown size={14} /></button>}
                                        {s.kra_pin_url && <button title="View KRA PIN" onClick={() => window.open(s.kra_pin_url, '_blank')} className="h-10 w-10 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center text-slate-400 hover:text-primary transition-colors shadow-sm"><Activity size={14} /></button>}
                                        {s.premises_license_url && <button title="View License" onClick={() => window.open(s.premises_license_url, '_blank')} className="h-10 w-10 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center text-slate-400 hover:text-primary transition-colors shadow-sm"><Building2 size={14} /></button>}
                                    </div>
                                    <Button onClick={() => handleApprove(s)} className="h-12 px-8 rounded-xl bg-emerald-500 text-white font-black uppercase text-[10px] tracking-widest active:scale-95 shadow-lg shadow-emerald-500/10">Authorize Partner</Button>
                                    <Button variant="ghost" className="h-12 w-12 rounded-xl text-rose-400 hover:bg-rose-50"><XCircle size={20} /></Button>
                                </div>
                            </Card>
                        ))}
                    </div>
                </section>
            )}

            {/* ACTIVE PARTNERS MATRIX */}
            <section className="space-y-8">
                <div className="flex flex-col md:flex-row justify-between items-end gap-6 px-2">
                    <div className="space-y-1">
                        <h2 className="text-3xl font-black uppercase tracking-tighter text-foreground">Operational Nodes</h2>
                        <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Active Bar Partners</p>
                    </div>
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                        <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search Nodes..." className="h-12 rounded-2xl bg-white border-slate-100 pl-12 text-[10px] font-black uppercase tracking-widest w-72 shadow-sm" />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {active.map(s => (
                        <Card key={s.id} className="p-10 rounded-[3.5rem] bg-white border border-slate-100 shadow-sm relative overflow-hidden group hover:shadow-2xl hover:border-primary/20 transition-all text-left">
                            <div className="relative z-10 space-y-10">
                                <div className="flex justify-between items-start">
                                    <div className="flex items-center gap-5">
                                        <div className="h-16 w-16 rounded-[1.8rem] bg-secondary border border-slate-100 flex items-center justify-center text-foreground font-black text-xl shadow-inner group-hover:scale-110 transition-transform">
                                            {s.name.substring(0, 2).toUpperCase()}
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-black text-foreground uppercase tracking-tight leading-none">{s.name}</h3>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase mt-2">{s.email}</p>
                                        </div>
                                    </div>
                                    <div className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-500 flex items-center justify-center shadow-inner"><ShieldCheck size={20} /></div>
                                </div>

                                <div className="grid grid-cols-2 gap-8 py-6 border-y border-slate-50">
                                    <div className="space-y-2">
                                        <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Trust Rating</p>
                                        <p className="text-2xl font-black text-foreground">{s.rating}%</p>
                                    </div>
                                    <div className="space-y-2 text-right">
                                        <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest">SLA Speed</p>
                                        <p className="text-2xl font-black text-primary">{s.on_time_dispatch_rate}%</p>
                                    </div>
                                </div>

                                <div className="flex gap-2">
                                    <Button className="flex-1 h-14 rounded-2xl bg-primary text-white font-black uppercase text-[10px] tracking-widest shadow-xl shadow-primary/20 active:scale-95 transition-all">Order Stock</Button>
                                    <Button variant="outline" className="flex-1 h-14 rounded-2xl border-slate-100 font-black uppercase text-[10px] hover:bg-slate-50">Analytics</Button>
                                </div>
                            </div>
                            <Target className="absolute -bottom-10 -right-10 h-64 w-64 text-slate-50 -z-0 rotate-12" />
                        </Card>
                    ))}

                    {active.length === 0 && (
                        <div className="col-span-full py-32 text-center bg-white rounded-[3.5rem] border-2 border-dashed border-slate-100 opacity-40 flex flex-col items-center gap-4">
                            <Building2 size={48} className="text-slate-200" />
                            <p className="text-sm font-black text-slate-300 uppercase italic">No active nodes detected in this sector.</p>
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
}

