'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { verifyBottle } from '@/lib/engines/trustService';
import {
    ShieldCheck,
    ShieldAlert,
    History,
    Wine,
    CheckCircle2,
    ChevronRight,
    Loader2,
    AlertTriangle
} from 'lucide-react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn, formatPrice } from '@/lib/utils';

export default function BottleVerificationPage() {
    const { id } = useParams();
    const [loading, setLoading] = useState(true);
    const [result, setResult] = useState<any>(null);

    useEffect(() => {
        async function runVerification() {
            if (!id) return;
            // Simulated metadata (In prod, fetch from browser/session)
            const meta = {
                ip: '197.248.31.2',
                city: 'Nairobi',
                deviceInfo: 'iPhone 15 Pro'
            };
            const res = await verifyBottle(id as string, meta);
            setResult(res);
            setLoading(false);
        }
        runVerification();
    }, [id]);

    if (loading) return (
        <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-4">
            <Loader2 className="animate-spin text-primary" size={40} />
            <p className="text-[10px] font-black uppercase text-slate-400 tracking-[0.4em]">Authenticating Passport...</p>
        </div>
    );

    if (!result?.valid) return (
        <div className="min-h-screen bg-white flex flex-col items-center justify-center p-8 text-center space-y-6">
            <div className="h-24 w-24 rounded-[2.5rem] bg-rose-50 flex items-center justify-center text-rose-500 shadow-inner">
                <ShieldAlert size={48} />
            </div>
            <div className="space-y-2">
                <h1 className="text-3xl font-black uppercase tracking-tighter text-foreground">Verification Failed</h1>
                <p className="text-slate-500 font-medium italic italic leading-relaxed max-w-xs mx-auto">
                    &quot;{result?.error || 'This identifier was not found in the Online Bar registry. Rely with caution.'}&quot;
                </p>
            </div>
            <Button onClick={() => window.location.reload()} className="h-14 px-10 rounded-2xl bg-slate-900 text-white font-black uppercase text-xs tracking-widest active:scale-95 transition-all shadow-xl">Retry Scan</Button>
        </div>
    );

    const { passport, history, isAnomaly } = result;

    return (
        <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 text-left selection:bg-primary/20">
            <div className="max-w-md mx-auto space-y-10 animate-in fade-in duration-1000">

                {/* 1. STATUS CARD */}
                <Card className={cn(
                    "p-10 rounded-[3.5rem] bg-white border-2 text-center space-y-8 relative overflow-hidden shadow-2xl",
                    isAnomaly ? "border-amber-200" : "border-primary/20"
                )}>
                    <div className="relative z-10 space-y-6">
                        <div className={cn(
                            "mx-auto h-24 w-24 rounded-[2.5rem] flex items-center justify-center shadow-xl animate-bounce transition-colors",
                            isAnomaly ? "bg-amber-500 text-white" : "bg-primary text-white"
                        )}>
                            {isAnomaly ? <AlertTriangle size={48} /> : <ShieldCheck size={48} />}
                        </div>

                        <div className="space-y-2">
                            <h2 className="text-4xl font-black uppercase tracking-tighter text-foreground leading-none">
                                {isAnomaly ? 'Review Flag' : 'Verified'}
                            </h2>
                            <p className="text-[10px] font-black uppercase text-slate-400 tracking-[0.4em]">Online Bar Trust Passport</p>
                        </div>

                        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                            <p className="text-[10px] font-black uppercase text-slate-400 mb-1">Passport Identifier</p>
                            <p className="text-sm font-black text-foreground font-mono">{passport.id}</p>
                        </div>

                        {isAnomaly && (
                            <div className="p-5 bg-amber-50 border border-amber-100 rounded-2xl text-left flex items-start gap-4">
                                <AlertTriangle size={20} className="text-amber-500 mt-0.5 shrink-0" />
                                <p className="text-[10px] text-amber-700 font-bold leading-relaxed italic">
                                    &quot;Unusual verification activity detected. This code has been scanned in multiple locations recently. Verify physical seal integrity.&quot;
                                </p>
                            </div>
                        )}
                    </div>

                    <Wine className="absolute -bottom-10 -right-10 h-64 w-64 text-primary/5 rotate-12 -z-0" />
                </Card>

                {/* 2. PRODUCT INTEL */}
                <section className="space-y-6">
                    <h3 className="text-xs font-black uppercase tracking-[0.4em] text-slate-400 ml-4">Product Intel</h3>
                    <Card className="p-8 rounded-[3rem] bg-white border border-slate-100 shadow-sm space-y-6">
                        <div className="flex items-center gap-6">
                            <div className="h-16 w-16 rounded-[2rem] bg-slate-50 border border-slate-100 flex items-center justify-center text-primary shadow-inner">
                                <Wine size={32} />
                            </div>
                            <div>
                                <h4 className="text-xl font-black text-foreground uppercase tracking-tight">{passport.product_name}</h4>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Batch: {passport.batch_number}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 pt-6 border-t border-slate-50">
                            <div className="space-y-1">
                                <p className="text-[8px] font-black uppercase text-slate-300">Manufacturer</p>
                                <p className="text-xs font-black text-foreground uppercase truncate">{passport.origin_manufacturer}</p>
                            </div>
                            <div className="space-y-1 text-right">
                                <p className="text-[8px] font-black uppercase text-slate-300">Authorized Distributor</p>
                                <p className="text-xs font-black text-primary uppercase truncate">{passport.authorized_distributor}</p>
                            </div>
                        </div>
                    </Card>
                </section>

                {/* 3. CHAIN OF CUSTODY (Timeline) */}
                <section className="space-y-6 text-left">
                    <h3 className="text-xs font-black uppercase tracking-[0.4em] text-slate-400 ml-4 flex items-center gap-2">
                        <History size={14} /> Chain of Custody
                    </h3>
                    <div className="relative pl-10 space-y-8 before:absolute before:left-[2.2rem] before:top-2 before:bottom-4 before:w-1 before:bg-slate-100 before:rounded-full">
                        {history.map((ev: any, i: number) => (
                            <div key={i} className="relative group transition-all animate-in slide-in-from-left-4 fade-in duration-500" style={{ animationDelay: `${i * 100}ms` }}>
                                <div className={cn(
                                    "absolute -left-12 h-10 w-10 rounded-xl flex items-center justify-center border-4 border-white shadow-lg z-10",
                                    i === history.length - 1 ? "bg-primary text-white" : "bg-white text-slate-300"
                                )}>
                                    <CheckCircle2 size={16} />
                                </div>
                                <div className="space-y-1 text-left">
                                    <div className="flex justify-between items-center pr-2">
                                        <h4 className="text-xs font-black text-foreground uppercase tracking-tight">{ev.event_type.replace(/_/g, ' ')}</h4>
                                        <span className="text-[8px] font-black text-slate-400 uppercase bg-white px-2 py-0.5 rounded-md border border-slate-100">{new Date(ev.timestamp).toLocaleDateString()}</span>
                                    </div>
                                    <p className="text-[10px] font-medium text-slate-500 italic">
                                        Node: <span className="text-foreground font-black uppercase tracking-widest">{ev.actor_label}</span>
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* 4. CALL TO ACTION */}
                <div className="pt-6 space-y-4">
                    <Button onClick={() => window.open('/contact', '_self')} variant="outline" className="w-full h-16 rounded-2xl border-slate-200 text-slate-400 font-black uppercase text-[10px] tracking-widest hover:bg-rose-50 hover:text-rose-500 hover:border-rose-100 transition-all">
                        Report Suspicious Product
                    </Button>
                    <Link href="/">
                        <Button className="w-full h-16 rounded-2xl bg-primary text-white font-black uppercase text-xs tracking-widest shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all">
                            Back to Official Store <ChevronRight className="ml-2 h-4 w-4" />
                        </Button>
                    </Link>
                </div>

                <div className="text-center opacity-30">
                    <p className="text-[8px] font-black uppercase tracking-widest text-slate-400">Powered by OB-OS Sentinel v1.0</p>
                </div>

            </div>
        </div>
    );
}
