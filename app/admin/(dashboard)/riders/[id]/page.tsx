'use client';

import * as React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import {
  Truck,
  Star,
  BatteryMedium,
  ShieldCheck,
  ArrowLeft,
  Loader2,
  Trophy,
  Activity,
  History,
  Phone,
  XCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn, formatPrice } from '@/lib/utils';
import dynamic from 'next/dynamic';

const LiveMap = dynamic(() => import('@/components/admin/dispatch/LiveDispatchMap'), {
    ssr: false,
    loading: () => <div className="h-full w-full bg-slate-50 flex items-center justify-center animate-pulse rounded-[3rem] border border-slate-100"><Loader2 className="h-10 w-10 text-primary animate-spin" /></div>
});

interface RiderProfile {
    id: string;
    rider_name: string;
    rider_phone: string;
    vehicle_type: string;
    status: string;
    battery_level: number;
    total_deliveries: number;
    rating: number;
    area_zone: string;
    health_score: number;
    current_tier: string;
    acceptance_rate: number;
    last_activity_at: string;
    created_at: string;
    wallet?: { balance: number; total_earned: number };
}

interface Mission {
    id: number;
    total_price: number;
    created_at: string;
    status: string;
}

export default function RiderProfilePage() {
    const { id } = useParams();
    const router = useRouter();
    const [rider, setRider] = React.useState<RiderProfile | null>(null);
    const [loading, setLoading] = React.useState(true);
    const [missions, setMissions] = React.useState<Mission[]>([]);

    const fetchData = React.useCallback(async () => {
        if (!supabase || !id) return;
        setLoading(true);
        try {
            const { data: rData, error } = await supabase
                .from('rider_status')
                .select('*, wallet:rider_wallets(balance, total_earned)')
                .eq('id', id)
                .single();

            if (error) throw error;

            const processedRider = {
                ...rData,
                wallet: Array.isArray(rData.wallet) ? rData.wallet[0] : rData.wallet
            };

            const { data: mData } = await supabase
                .from('orders')
                .select('*')
                .eq('rider_phone', processedRider.rider_phone)
                .order('created_at', { ascending: false })
                .limit(10);

            setRider(processedRider);
            setMissions(mData || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [id]);

    React.useEffect(() => {
        fetchData();
    }, [fetchData]);

    if (loading) return (
        <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-white">
            <Loader2 className="animate-spin text-primary" />
            <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Opening Tactical File...</p>
        </div>
    );

    if (!rider) return (
        <div className="min-h-screen flex flex-col items-center justify-center p-8 text-center bg-white">
            <XCircle className="h-12 w-12 text-rose-500 mb-4" />
            <h1 className="text-2xl font-black uppercase text-foreground">Runner Not Found</h1>
            <Button onClick={() => router.back()} variant="ghost" className="mt-4">Return to Fleet</Button>
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
                            rider.status === 'Offline' ? "bg-slate-200 text-slate-400" : "bg-emerald-500 text-white animate-pulse"
                        )}>{rider.status}</span>
                        <p className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">{rider.current_tier} Operator</p>
                    </div>
                    <h1 className="text-4xl font-black text-foreground uppercase tracking-tighter leading-none">{rider.rider_name}</h1>
                </div>
            </header>

            <div className="grid lg:grid-cols-12 gap-10">

                {/* LEFT: TELEMETRY */}
                <div className="lg:col-span-4 space-y-8">
                    <Card className="p-10 rounded-[3.5rem] bg-white border border-slate-100 shadow-sm space-y-10 text-left">
                        <div className="flex justify-between items-start">
                            <div className="h-16 w-16 rounded-[2rem] bg-slate-50 border border-slate-100 flex items-center justify-center text-foreground font-black text-2xl shadow-inner">
                                {rider.rider_name.substring(0, 2).toUpperCase()}
                            </div>
                            <div className="text-right">
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Trust Score</p>
                                <p className="text-2xl font-black text-primary">{rider.health_score}%</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-6 rounded-[2rem] bg-slate-50 border border-slate-100 space-y-1">
                                <p className="text-[8px] font-black uppercase text-slate-400 flex items-center gap-2"><BatteryMedium size={12} className="text-primary" /> Battery</p>
                                <p className="text-xl font-black text-foreground">{rider.battery_level}%</p>
                            </div>
                            <div className="p-6 rounded-[2rem] bg-slate-50 border border-slate-100 space-y-1 text-right">
                                <p className="text-[8px] font-black uppercase text-slate-400 flex items-center justify-end gap-2"><Star size={12} className="text-amber-500 fill-current" /> Rating</p>
                                <p className="text-xl font-black text-foreground">{rider.rating}</p>
                            </div>
                        </div>

                        <div className="space-y-4 pt-6 border-t border-slate-50">
                            <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-slate-400">
                                <span>Global Earnings</span>
                                <Trophy size={14} className="text-amber-500" />
                            </div>
                            <div className="space-y-1">
                                <p className="text-3xl font-black text-foreground tracking-tighter">{formatPrice(rider.wallet?.total_earned || 0)}</p>
                                <p className="text-[9px] font-bold text-emerald-500 uppercase tracking-widest">Active Balance: {formatPrice(rider.wallet?.balance || 0)}</p>
                            </div>
                        </div>
                    </Card>

                    <Card className="p-10 rounded-[3.5rem] bg-white border border-slate-100 shadow-sm space-y-8 text-left">
                        <div className="flex items-center gap-4">
                            <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
                                <Activity size={24} />
                            </div>
                            <div>
                                <h3 className="text-xl font-black uppercase tracking-tighter text-foreground">Unit Specs</h3>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Operational Telemetry</p>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <div className="flex justify-between border-b border-slate-50 pb-4">
                                <span className="text-[9px] font-black uppercase text-slate-400">Vehicle</span>
                                <span className="text-xs font-black uppercase text-foreground">{rider.vehicle_type}</span>
                            </div>
                            <div className="flex justify-between border-b border-slate-50 pb-4">
                                <span className="text-[9px] font-black uppercase text-slate-400">Primary Zone</span>
                                <span className="text-xs font-black uppercase text-foreground">{rider.area_zone}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-[9px] font-black uppercase text-slate-400">Acceptance Rate</span>
                                <span className="text-xs font-black uppercase text-primary">{rider.acceptance_rate}%</span>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* RIGHT: MAP & ACTIVITY */}
                <div className="lg:col-span-8 space-y-8">
                    <div className="h-[450px] w-full relative overflow-hidden rounded-[3rem] border border-slate-100 shadow-sm">
                        <LiveMap riders={[{
                            id: rider.id,
                            rider_name: rider.rider_name,
                            status: rider.status,
                            battery_level: rider.battery_level
                        }]} />
                    </div>

                    <div className="grid md:grid-cols-2 gap-8">
                        {/* RECENT MISSIONS */}
                        <Card className="rounded-[3rem] border border-slate-100 bg-white shadow-sm overflow-hidden text-left">
                            <div className="p-8 border-b border-slate-50 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <History className="h-6 w-6 text-primary" />
                                    <h2 className="text-2xl font-black uppercase text-foreground tracking-tighter">Mission History</h2>
                                </div>
                                <span className="text-[10px] font-black text-slate-400 uppercase bg-slate-50 px-4 py-2 rounded-full border border-slate-100">Last 10 Drops</span>
                            </div>
                            <div className="divide-y divide-slate-50 max-h-[400px] overflow-y-auto no-scrollbar">
                                {missions.map((m) => (
                                    <div key={m.id} className="p-6 flex items-center justify-between group hover:bg-slate-50 transition-all">
                                        <div className="flex items-center gap-4">
                                            <div className="h-10 w-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400"><Truck size={18} /></div>
                                            <div>
                                                <p className="text-xs font-black uppercase text-foreground leading-none">Order #{m.id}</p>
                                                <p className="text-[8px] font-bold text-slate-400 uppercase mt-1">{new Date(m.created_at).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xs font-black text-foreground">{formatPrice(m.total_price)}</p>
                                            <span className={cn(
                                                "text-[7px] font-black uppercase",
                                                m.status === 'Delivered' ? "text-emerald-500" : "text-primary"
                                            )}>{m.status}</span>
                                        </div>
                                    </div>
                                ))}
                                {missions.length === 0 && <p className="p-12 text-center text-[10px] font-black uppercase text-slate-300 italic">No historical data available.</p>}
                            </div>
                        </Card>

                        {/* COMMAND ACTIONS */}
                        <Card className="p-10 rounded-[3.5rem] bg-white border border-slate-100 shadow-sm space-y-8 text-left">
                            <h3 className="text-xl font-black uppercase tracking-tighter text-foreground flex items-center gap-3"><ShieldCheck className="h-5 w-5 text-emerald-500" /> Operational Authority</h3>
                            <div className="space-y-4">
                                <Button onClick={() => window.open(`tel:${rider.rider_phone}`, '_self')} className="w-full h-14 rounded-2xl bg-primary text-white font-black uppercase text-[10px] tracking-widest shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all">
                                    <Phone size={14} className="mr-2" /> Direct Voice Link
                                </Button>
                                <Button variant="outline" className="w-full h-14 rounded-2xl border-slate-100 text-slate-400 font-black uppercase text-[10px] tracking-widest hover:bg-rose-50 hover:text-rose-500 hover:border-rose-100 transition-all">
                                    Suspend Unit Access
                                </Button>
                                <Button variant="outline" className="w-full h-14 rounded-2xl border-slate-100 text-slate-400 font-black uppercase text-[10px] tracking-widest hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-100 transition-all">
                                    Force GPS Heartbeat
                                </Button>
                            </div>
                            <div className="pt-6 border-t border-slate-50 space-y-2">
                                <p className="text-[8px] font-black uppercase text-slate-400 tracking-widest text-center italic leading-relaxed">
                                    &quot;Security Protocol active. Every command sent to this unit is recorded in the master audit log with admin ID.&quot;
                                </p>
                            </div>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}
