'use client';

import * as React from 'react';
import {
    Users,
    Link as LinkIcon,
    ShoppingBag,
    TrendingUp,
    Wallet,
    PieChart,
    Zap,
    Search,
    Copy,
    CheckCircle2,
    Loader2
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn, formatPrice } from '@/lib/utils';
import { supabase } from '@/lib/supabaseClient';

interface AffiliateProfile {
    referral_code: string;
    current_level: string;
}

interface AffiliateProduct {
    id: number;
    name: string;
    price: number;
    image_url: string;
    category: string;
}

export default function AffiliateDashboard() {
    const [loading, setLoading] = React.useState(true);
    const [profile, setProfile] = React.useState<AffiliateProfile | null>(null);
    const [products, setProducts] = React.useState<AffiliateProduct[]>([]);
    const [searchQuery, setSearchQuery] = React.useState('');
    const [stats] = React.useState({
        clicks: 1284,
        visitors: 913,
        orders: 42,
        conversion: '4.6%',
        earnings: 18450
    });

    React.useEffect(() => {
        async function loadAffiliateData() {
            if (!supabase) return;
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
                const { data } = await supabase.from('affiliates').select('*').eq('user_id', session.user.id).single();
                setProfile(data);
            }

            const { data: prods } = await supabase.from('products').select('id, name, price, image_url, category').limit(10);
            setProducts(prods || []);
            setLoading(false);
        }
        loadAffiliateData();
    }, []);

    const copyLink = (productId?: number) => {
        const baseUrl = window.location.origin;
        const code = profile?.referral_code || 'DEMO10';
        const url = productId ? `${baseUrl}/shop/${productId}?r=${code}` : `${baseUrl}?r=${code}`;
        navigator.clipboard.writeText(url);
        alert("Link Copied! 🔗");
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-50"><Loader2 className="animate-spin text-primary" /></div>;

    return (
        <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 text-left selection:bg-primary/20">
            <div className="max-w-7xl mx-auto space-y-12">

                {/* 1. BRANDED HEADER */}
                <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-sm relative overflow-hidden group">
                    <div className="relative z-10 space-y-2">
                        <div className="flex items-center gap-3">
                            <Users className="h-5 w-5 text-primary" />
                            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Affiliate Command Hub</span>
                        </div>
                        <h1 className="text-4xl font-black text-foreground uppercase tracking-tighter leading-none">
                            Welcome Back, <span className="text-primary italic">{(profile?.referral_code as string) || 'Patron'}</span> 👋
                        </h1>
                        <p className="text-slate-500 text-sm font-medium italic">Monitor conversions and scale your beverage network.</p>
                    </div>

                    <div className="flex gap-4 relative z-10">
                        <div className="text-right">
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Global Rank</p>
                            <p className="text-2xl font-black text-primary uppercase italic">{(profile?.current_level as string) || 'Starter'}</p>
                        </div>
                        <Button onClick={() => copyLink()} className="h-14 px-8 rounded-2xl bg-slate-900 text-white font-black uppercase text-[10px] tracking-widest shadow-xl active:scale-95 transition-all">
                            <LinkIcon className="mr-2 h-4 w-4" /> Global Invite Link
                        </Button>
                    </div>
                    <Users className="absolute -bottom-10 -right-10 h-64 w-64 text-primary/5 rotate-12 -z-0" />
                </header>

                {/* 2. CONVERSION FUNNEL */}
                <div className="grid grid-cols-2 lg:grid-cols-5 gap-6">
                    {[
                        { label: 'Total Clicks', val: stats.clicks, icon: Zap, color: 'indigo' },
                        { label: 'Unique Visitors', val: stats.visitors, icon: Users, color: 'primary' },
                        { label: 'Attributed Orders', val: stats.orders, icon: ShoppingBag, color: 'emerald' },
                        { label: 'Conversion Rate', val: stats.conversion, icon: PieChart, color: 'rose' },
                        { label: 'Unpaid Commission', val: formatPrice(stats.earnings), icon: Wallet, color: 'primary' },
                    ].map((item) => (
                        <Card key={item.label} className="p-8 rounded-[2.5rem] bg-white border border-slate-100 shadow-sm flex flex-col justify-center gap-4 group hover:shadow-xl transition-all">
                            <div className={cn(
                                "h-10 w-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110",
                                item.color === 'indigo' ? "bg-indigo-50 text-indigo-500" :
                                item.color === 'primary' ? "bg-primary/5 text-primary" :
                                item.color === 'emerald' ? "bg-emerald-50 text-emerald-600" :
                                "bg-rose-50 text-rose-500"
                            )}>
                                <item.icon size={20} />
                            </div>
                            <div className="space-y-1">
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">{item.label}</p>
                                <h3 className="text-xl font-black text-foreground tracking-tighter uppercase">{item.val}</h3>
                            </div>
                        </Card>
                    ))}
                </div>

                <div className="grid lg:grid-cols-12 gap-10">

                    {/* 3. PRODUCT PROMOTER */}
                    <div className="lg:col-span-8 space-y-8 text-left">
                        <div className="flex items-center justify-between px-2">
                            <h2 className="text-2xl font-black uppercase tracking-tighter text-foreground">Promote Inventory</h2>
                            <div className="relative">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                                <Input
                                    value={searchQuery}
                                    onChange={e => setSearchQuery(e.target.value)}
                                    placeholder="Find a bottle to share..."
                                    className="h-12 rounded-2xl bg-white border-slate-100 pl-12 text-[10px] font-black uppercase tracking-widest w-72 shadow-sm"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            {products.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase())).map(p => (
                                <Card key={p.id} className="p-6 rounded-[2.5rem] bg-white border border-slate-100 shadow-sm flex items-center justify-between group hover:shadow-2xl transition-all">
                                    <div className="flex items-center gap-5 min-w-0">
                                        <div className="h-16 w-16 rounded-2xl bg-slate-50 border border-slate-100 p-2 flex items-center justify-center shrink-0">
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img src={p.image_url} alt="" className="max-h-full w-auto object-contain" />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-xs font-black text-foreground uppercase truncate tracking-tight">{p.name}</p>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="text-[10px] font-black text-primary">{formatPrice(p.price)}</span>
                                                <div className="h-1 w-1 rounded-full bg-slate-200" />
                                                <span className="text-[8px] font-bold text-emerald-500 uppercase tracking-widest">10% Commission</span>
                                            </div>
                                        </div>
                                    </div>
                                    <Button
                                        size="icon"
                                        onClick={() => copyLink(p.id)}
                                        className="h-10 w-10 rounded-xl bg-slate-50 text-slate-400 hover:bg-primary hover:text-white active:scale-95 transition-all shadow-inner"
                                    >
                                        <Copy size={16} />
                                    </Button>
                                </Card>
                            ))}
                        </div>
                    </div>

                    {/* 4. RECENT EARNINGS LEDGER */}
                    <div className="lg:col-span-4 space-y-8 text-left">
                        <Card className="p-10 rounded-[3.5rem] bg-white border border-slate-100 shadow-sm space-y-8">
                            <div className="flex items-center justify-between">
                                <h3 className="text-xl font-black text-foreground uppercase tracking-tighter">Earnings Ledger</h3>
                                <CheckCircle2 size={18} className="text-emerald-500" />
                            </div>

                            <div className="space-y-6">
                                {[
                                    { id: '8291', amount: 420, status: 'PAID', date: '28 Aug' },
                                    { id: '8244', amount: 185, status: 'PENDING', date: '29 Aug' },
                                    { id: '8102', amount: 560, status: 'PAYABLE', date: '30 Aug' },
                                ].map(entry => (
                                    <div key={entry.id} className="flex justify-between items-center group">
                                        <div className="flex items-center gap-4">
                                            <div className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-300 font-black text-[10px]">#{entry.id}</div>
                                            <div>
                                                <p className="text-sm font-black text-foreground">{formatPrice(entry.amount)}</p>
                                                <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">{entry.date}</p>
                                            </div>
                                        </div>
                                        <span className={cn(
                                            "px-2 py-0.5 rounded text-[7px] font-black uppercase border",
                                            entry.status === 'PAID' ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                                            entry.status === 'PENDING' ? "bg-primary/5 text-primary border-primary/10" :
                                            "bg-indigo-50 text-indigo-600 border-indigo-100"
                                        )}>{entry.status}</span>
                                    </div>
                                ))}
                            </div>

                            <div className="pt-6 border-t border-slate-50">
                                <Button className="w-full h-14 rounded-2xl bg-primary text-white font-black uppercase text-[10px] tracking-widest shadow-xl shadow-primary/20 active:scale-95 transition-all">
                                    Initialize Payout Request
                                </Button>
                            </div>
                        </Card>

                        <div className="p-8 rounded-[3rem] bg-indigo-50 border border-indigo-100 space-y-4">
                            <div className="flex items-center gap-3 text-indigo-700">
                                <TrendingUp size={18} />
                                <p className="text-xs font-black uppercase tracking-widest leading-none">Growth Tip</p>
                            </div>
                            <p className="text-[10px] text-indigo-600 font-medium italic leading-relaxed">
                                &quot;Your conversion rate is 2% higher when promoting **Chilled Whiskey Bundles** on Friday evenings. Focus your tactical links there!&quot;
                            </p>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
