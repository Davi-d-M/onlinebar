'use client';

import * as React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import {
    Phone,
    Mail,
    MapPin,
    ShoppingBag,
    Clock,
    History,
    Loader2,
    ArrowLeft,
    Smartphone,
    Bot,
    BarChart3
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn, formatPrice } from '@/lib/utils';
import dynamic from 'next/dynamic';

const SessionForensics = dynamic(() => import('@/components/admin/SessionForensics'), { ssr: false });

interface Customer360 {
    profile: {
        id: string;
        public_id: string;
        full_name: string;
        phone_number: string;
        email: string;
        address: string;
        created_at: string;
        status_flag: string;
        lifetime_value: number;
        total_orders: number;
    };
    aggregate: {
        total_sessions: number;
        total_active_time_sec: number;
        total_pages_viewed: number;
        total_products_viewed: number;
        total_clicks: number;
        avg_scroll_depth: number;
        total_cart_additions: number;
        total_cart_removals: number;
        total_checkouts_started: number;
        total_rage_clicks: number;
        total_dead_clicks: number;
        top_traffic_source: string;
        preferred_device: string;
    };
    intelligence: {
        intent_score: number;
        churn_risk_score: number;
        predicted_next_action: string;
    };
    sessions: {
        id: string;
        created_at: string;
        source_channel: string;
        total_dwell_time_sec: number;
        total_active_time_sec: number;
        pages_viewed: number;
        clicks_count: number;
    }[];
    orders: {
        id: number;
        created_at: string;
        status: string;
        total_price: number;
        order_items?: { size: string }[];
    }[];
    preferences: {
        category_id: string;
        affinity_score: number;
    }[];
    interactions: unknown[];
}

export default function CustomerProfilePage() {
    const { phone } = useParams();
    const router = useRouter();
    const [data, setData] = React.useState<Customer360 | null>(null);
    const [loading, setLoading] = React.useState(true);
    const [selectedSessionId, setSelectedSessionId] = React.useState<string | null>(null);

    const fetchCustomerData = React.useCallback(async () => {
        if (!supabase || !phone) return;
        setLoading(true);
        try {
            // 1. Fetch Core Profile
            const { data: profile } = await supabase.from('profiles').select('*').eq('phone_number', phone).single();
            if (!profile) throw new Error("Patron not found");

            // 2. Fetch Intelligence & Commercial Data
            const [intRes, sessRes, ordersRes, prefRes, aggRes] = await Promise.all([
                supabase.from('customer_intelligence').select('*').eq('user_id', (profile as { id: string }).id).maybeSingle(),
                supabase.from('customer_sessions').select('*').eq('user_id', (profile as { id: string }).id).order('created_at', { ascending: false }).limit(5),
                supabase.from('orders').select('*, order_items(*)').eq('customer_phone', phone).order('created_at', { ascending: false }),
                supabase.from('customer_product_preferences').select('*').eq('user_id', (profile as { id: string }).id),
                supabase.from('customer_aggregate_metrics').select('*').eq('user_id', (profile as { id: string }).id).maybeSingle()
            ]);

            setData({
                profile,
                aggregate: aggRes.data || { total_sessions: 0, total_active_time_sec: 0, total_pages_viewed: 0, total_clicks: 0 },
                intelligence: intRes.data || { intent_score: 0, churn_risk_score: 0 },
                sessions: sessRes.data || [],
                orders: ordersRes.data || [],
                preferences: prefRes.data || [],
                interactions: []
            });

            if (sessRes.data?.[0]) setSelectedSessionId(sessRes.data[0].id);

        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [phone]);

    React.useEffect(() => {
        fetchCustomerData();
    }, [fetchCustomerData]);

    if (loading) return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 gap-4">
            <Loader2 className="h-10 w-10 text-primary animate-spin" />
            <p className="font-black text-slate-400 uppercase tracking-widest text-[10px]">Reconstructing Patron Profile...</p>
        </div>
    );

    if (!data) return null;

    const { profile, aggregate, intelligence, sessions, orders, preferences } = data;

    const formatDuration = (sec: number) => {
        const h = Math.floor(sec / 3600);
        const m = Math.floor((sec % 3600) / 60);
        return h > 0 ? `${h}h ${m}m` : `${m}m ${sec % 60}s`;
    };

    return (
        <div className="p-8 space-y-10 bg-slate-50 min-h-screen text-left selection:bg-primary/20 pb-40">
            <header className="flex items-center gap-6 border-b border-slate-200 pb-8">
                <Button onClick={() => router.back()} variant="outline" size="icon" className="h-12 w-12 rounded-xl bg-white border-slate-200">
                    <ArrowLeft size={20} />
                </Button>
                <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                        <span className="px-2 py-0.5 rounded-md bg-slate-900 text-white text-[7px] font-black uppercase tracking-widest">{profile.public_id || 'OB-OS-NODE'}</span>
                        <span className={cn(
                            "px-2 py-0.5 rounded-md text-[7px] font-black uppercase tracking-widest",
                            profile.status_flag === 'Active' ? "bg-emerald-500 text-white" : "bg-slate-200 text-slate-400"
                        )}>{profile.status_flag}</span>
                        <p className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">Customer since {new Date(profile.created_at).toLocaleDateString()}</p>
                    </div>
                    <h1 className="text-4xl font-black text-foreground uppercase tracking-tighter leading-none">{profile.full_name}</h1>
                </div>
                <div className="flex gap-2">
                    <Button className="h-12 px-6 rounded-xl bg-primary text-white font-black uppercase text-[10px] tracking-widest shadow-xl shadow-primary/20">
                        Launch Recovery Nudge
                    </Button>
                </div>
            </header>

            <div className="grid lg:grid-cols-12 gap-10">

                {/* LEFT: 360 SUMMARY */}
                <div className="lg:col-span-4 space-y-8">
                    {/* TOTAL EXPERIENCE SUMMARY */}
                    <Card className="p-10 rounded-[3.5rem] bg-slate-900 text-white shadow-2xl space-y-10 relative overflow-hidden">
                        <div className="relative z-10 space-y-8">
                            <h3 className="text-sm font-black uppercase tracking-[0.4em] text-slate-500">Total Experience</h3>
                            <div className="grid grid-cols-2 gap-y-6 gap-x-10">
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black uppercase text-slate-500">Sessions</p>
                                    <p className="text-2xl font-black">{aggregate.total_sessions}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black uppercase text-slate-500">Active Time</p>
                                    <p className="text-2xl font-black">{formatDuration(aggregate.total_active_time_sec)}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black uppercase text-slate-500">Pages viewed</p>
                                    <p className="text-2xl font-black">{aggregate.total_pages_viewed}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black uppercase text-slate-500">Total Clicks</p>
                                    <p className="text-2xl font-black">{aggregate.total_clicks.toLocaleString()}</p>
                                </div>
                            </div>
                        </div>
                        <History className="absolute -bottom-10 -right-10 h-64 w-64 text-white/5 -rotate-12" />
                    </Card>

                    {/* ENGAGEMENT SUMMARY */}
                    <Card className="p-10 rounded-[3.5rem] bg-white border border-slate-100 shadow-sm space-y-10">
                        <h3 className="text-sm font-black uppercase tracking-[0.4em] text-slate-400">Engagement Profile</h3>
                        <div className="space-y-6">
                            {[
                                { label: 'Top Page', val: aggregate.most_visited_category || 'Whiskey' },
                                { label: 'Top Search', val: aggregate.most_searched_term || 'Johnnie Walker' },
                                { label: 'Preferred Device', val: aggregate.preferred_device || 'Android' },
                                { label: 'Traffic Source', val: aggregate.top_traffic_source || 'Instagram' },
                            ].map(item => (
                                <div key={item.label} className="flex justify-between items-center border-b border-slate-50 pb-4 last:border-0">
                                    <span className="text-[10px] font-black uppercase text-slate-400">{item.label}</span>
                                    <span className="text-sm font-black text-foreground uppercase">{item.val}</span>
                                </div>
                            ))}
                        </div>
                    </Card>

                    {/* FRICTION RADAR */}
                    <Card className="p-10 rounded-[3.5rem] bg-rose-50 border border-rose-100 shadow-sm space-y-8">
                        <div className="flex items-center gap-4">
                            <ShieldAlert className="h-6 w-6 text-rose-500" />
                            <h3 className="text-lg font-black uppercase tracking-tight text-rose-900">Friction Radar</h3>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 bg-white rounded-2xl border border-rose-100">
                                <p className="text-[8px] font-black uppercase text-slate-400 mb-1">Rage Clicks</p>
                                <p className="text-xl font-black text-rose-600">{aggregate.total_rage_clicks}</p>
                            </div>
                            <div className="p-4 bg-white rounded-2xl border border-rose-100">
                                <p className="text-[8px] font-black uppercase text-slate-400 mb-1">Dead Clicks</p>
                                <p className="text-xl font-black text-rose-600">{aggregate.total_dead_clicks}</p>
                            </div>
                        </div>
                    </Card>

                    {/* INTELLIGENCE SCORES */}
                    <Card className="p-10 rounded-[3.5rem] bg-white border border-slate-100 shadow-sm space-y-10 relative overflow-hidden">
                        <div className="relative z-10 space-y-8">
                            <div className="flex justify-between items-center">
                                <h3 className="text-sm font-black uppercase tracking-[0.4em] text-slate-400">Derived Intel</h3>
                                <Bot className="h-5 w-5 text-primary" />
                            </div>

                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                                        <span>Purchase Intent</span>
                                        <span className="text-primary">{intelligence.intent_score}%</span>
                                    </div>
                                    <div className="h-1.5 w-full bg-slate-50 rounded-full overflow-hidden">
                                        <div className="h-full bg-primary transition-all duration-1000" style={{ width: `${intelligence.intent_score}%` }} />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                                        <span>Churn Risk</span>
                                        <span className="text-rose-500">{intelligence.churn_risk_score}%</span>
                                    </div>
                                    <div className="h-1.5 w-full bg-slate-50 rounded-full overflow-hidden">
                                        <div className="h-full bg-rose-500 transition-all duration-1000" style={{ width: `${intelligence.churn_risk_score}%` }} />
                                    </div>
                                </div>
                            </div>

                            <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 space-y-3">
                                <p className="text-[8px] font-black uppercase text-slate-400">AI Prediction</p>
                                <p className="text-xs font-bold text-foreground italic leading-relaxed">
                                    &quot;{intelligence.predicted_next_action || 'Maintaining tactical standby. Customer awaiting new vintage drops.'}&quot;
                                </p>
                            </div>
                        </div>
                        <Bot className="absolute -bottom-10 -left-10 h-48 w-48 text-primary/5 -rotate-12" />
                    </Card>

                    {/* CONTACT & LOGISTICS */}
                    <Card className="p-10 rounded-[3.5rem] bg-white border border-slate-100 shadow-sm space-y-8">
                        <div className="flex items-center gap-4">
                            <div className="h-10 w-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400">
                                <Smartphone size={20} />
                            </div>
                            <h3 className="text-lg font-black uppercase tracking-tight">Identity Relay</h3>
                        </div>
                        <div className="space-y-4">
                            <div className="flex items-center gap-4">
                                <Phone className="h-4 w-4 text-primary" />
                                <span className="text-sm font-bold text-foreground">{profile.phone_number}</span>
                            </div>
                            <div className="flex items-center gap-4">
                                <Mail className="h-4 w-4 text-primary" />
                                <span className="text-sm font-bold text-foreground">{profile.email}</span>
                            </div>
                            <div className="flex items-center gap-4">
                                <MapPin className="h-4 w-4 text-primary" />
                                <span className="text-sm font-bold text-foreground truncate">{profile.address || 'No Address Logged'}</span>
                            </div>
                        </div>
                    </Card>

                    {/* TOP INTERESTS */}
                    <Card className="p-10 rounded-[3.5rem] bg-white border border-slate-100 shadow-sm space-y-8">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-black uppercase tracking-tight">Category Affinity</h3>
                            <BarChart3 className="h-5 w-5 text-indigo-500" />
                        </div>
                        <div className="space-y-4">
                            {preferences.length > 0 ? preferences.map(pref => (
                                <div key={pref.category_id} className="space-y-2">
                                    <div className="flex justify-between items-center text-[8px] font-black uppercase">
                                        <span>{pref.category_id}</span>
                                        <span className="text-indigo-600">{pref.affinity_score}%</span>
                                    </div>
                                    <div className="h-1 w-full bg-slate-50 rounded-full overflow-hidden">
                                        <div className="h-full bg-indigo-500" style={{ width: `${pref.affinity_score}%` }} />
                                    </div>
                                </div>
                            )) : (
                                <p className="text-center py-6 text-[9px] font-bold text-slate-300 uppercase italic">Awaiting behavioral data...</p>
                            )}
                        </div>
                    </Card>
                </div>

                {/* RIGHT: TIMELINE & FORENSICS */}
                <div className="lg:col-span-8 space-y-8">
                    {/* COMMERCIAL HISTORY */}
                    <Card className="rounded-[3rem] border border-slate-100 bg-white shadow-sm overflow-hidden">
                        <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
                            <div className="flex items-center gap-3">
                                <ShoppingBag className="h-6 w-6 text-primary" />
                                <h2 className="text-2xl font-black uppercase tracking-tighter text-foreground">Mission History</h2>
                            </div>
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{orders.length} Deliveries</span>
                        </div>
                        <div className="divide-y divide-slate-50 overflow-x-auto no-scrollbar">
                            <table className="w-full text-left min-w-[600px]">
                                <thead>
                                    <tr className="text-[8px] font-black uppercase text-slate-400 tracking-widest bg-slate-50/50">
                                        <th className="px-8 py-4">Unit #</th>
                                        <th className="px-8 py-4">Date</th>
                                        <th className="px-8 py-4">Payload</th>
                                        <th className="px-8 py-4">Status</th>
                                        <th className="px-8 py-4 text-right">Value</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {orders.map(order => (
                                        <tr key={order.id} className="group hover:bg-slate-50/50 transition-colors">
                                            <td className="px-8 py-6 font-black text-xs text-foreground">#{order.id}</td>
                                            <td className="px-8 py-6 text-[10px] font-bold text-slate-400 uppercase">{new Date(order.created_at).toLocaleDateString()}</td>
                                            <td className="px-8 py-6">
                                                <div className="flex -space-x-2">
                                                    {order.order_items?.map((item: { size: string }, i: number) => (
                                                        <div key={i} className="h-8 w-8 rounded-lg bg-slate-100 border-2 border-white flex items-center justify-center text-[10px] font-black text-slate-400 shadow-sm uppercase">
                                                            {item.size?.substring(0,1)}
                                                        </div>
                                                    ))}
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <span className={cn(
                                                    "px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest",
                                                    order.status === 'Delivered' ? "bg-emerald-50 text-emerald-600 border border-emerald-100" :
                                                    order.status === 'Cancelled' ? "bg-rose-50 text-rose-600 border border-rose-100" :
                                                    "bg-slate-50 text-slate-500 border border-slate-100"
                                                )}>
                                                    {order.status}
                                                </span>
                                            </td>
                                            <td className="px-8 py-6 text-right font-black text-sm text-foreground">{formatPrice(order.total_price)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </Card>

                    {/* RECENT JOURNEY & FORENSICS */}
                    <div className="grid md:grid-cols-12 gap-8">
                        {/* Session Selector */}
                        <div className="md:col-span-4 space-y-6">
                            <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Recent Visits</h3>
                            <div className="space-y-3">
                                {sessions.map(sess => (
                                    <button
                                        key={sess.id}
                                        onClick={() => setSelectedSessionId(sess.id)}
                                        className={cn(
                                            "w-full p-6 rounded-3xl border text-left transition-all group relative overflow-hidden",
                                            selectedSessionId === sess.id ? "bg-primary text-white border-primary shadow-xl" : "bg-white border-slate-100 hover:border-primary/20"
                                        )}
                                    >
                                        <div className="relative z-10">
                                            <p className={cn("text-[8px] font-black uppercase tracking-widest mb-1", selectedSessionId === sess.id ? "text-white/60" : "text-slate-400")}>
                                                {new Date(sess.created_at).toLocaleDateString()} &bull; {new Date(sess.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                            <h4 className="font-black uppercase text-xs leading-none">{sess.source_channel} Source</h4>
                                            <p className={cn("text-[9px] font-bold mt-2", selectedSessionId === sess.id ? "text-white/80" : "text-slate-400")}>{sess.total_dwell_time_sec}s Dwell</p>
                                        </div>
                                        <History className={cn("absolute -bottom-2 -right-2 h-12 w-12 opacity-5", selectedSessionId === sess.id ? "text-white" : "text-primary")} />
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Forensics Component Integration */}
                        <div className="md:col-span-8">
                            {selectedSessionId ? (
                                <SessionForensics sessionId={selectedSessionId} />
                            ) : (
                                <div className="h-full bg-slate-50 rounded-[3rem] border border-slate-100 border-dashed flex items-center justify-center opacity-40">
                                    <Clock className="h-10 w-10 text-slate-300" />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
