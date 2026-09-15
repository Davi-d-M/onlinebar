'use client';

import * as React from 'react';
import { supabase } from '@/lib/supabaseClient';
import {
    DollarSign,
    MousePointer2,
    Target,
    Zap,
    Loader2,
    Copy,
    CheckCircle2,
    History,
    ArrowLeft,
    Rocket,
    Camera,
    Search,
    Wallet,
    Download,
    Trophy,
    Globe,
    Clock,
    PieChart,
    MessageCircle,
    X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { cn, formatPrice } from '@/lib/utils';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface AffiliateStats {
    clicks: number;
    conversions: number;
    available_earnings: number;
    pending_earnings: number;
}

interface ProductNode {
    id: number;
    name: string;
    price: number;
    image_url: string;
    category: string;
    commission_est: number;
}

interface AffiliateProfile {
    id: string;
    referral_code: string;
    phone_number: string;
    affiliates: {
        id: string;
        affiliate_tier: string;
    } | null;
}

export default function AffiliateCommandCenter() {
    const router = useRouter();
    const [loading, setLoading] = React.useState(true);
    const [isWithdrawing, setIsWithdrawing] = React.useState(false);
    const [withdrawAmount, setWithdrawAmount] = React.useState('');
    const [withdrawPhone, setWithdrawPhone] = React.useState('');
    const [profile, setProfile] = React.useState<AffiliateProfile | null>(null);
    const [stats, setStats] = React.useState<AffiliateStats>({ clicks: 0, conversions: 0, available_earnings: 0, pending_earnings: 0 });
    const [products, setProducts] = React.useState<ProductNode[]>([]);
    const [searchQuery, setSearchQuery] = React.useState('');
    const [copied, setCopied] = React.useState(false);
    const [activeTab, setActiveTab] = React.useState<'overview' | 'promote' | 'earnings' | 'assets'>('overview');

    const fetchAffiliateData = React.useCallback(async () => {
        if (!supabase) return;
        setLoading(true);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                router.push('/auth?mode=signin&redirect=/affiliate/dashboard');
                return;
            }

            // 1. Fetch Profile & Stats
            const [profRes, statsRes, prodRes] = await Promise.all([
                supabase.from('profiles').select('*, affiliates(*)').eq('id', session.user.id).single(),
                supabase.from('affiliate_performance_summary').select('*').eq('affiliate_id', session.user.id).single(),
                supabase.from('products').select('id, name, price, image_url, category').eq('status', 'Live').limit(8)
            ]);

            if (profRes.data) setProfile(profRes.data as AffiliateProfile);
            if (statsRes.data) setStats(statsRes.data as AffiliateStats);
            if (prodRes.data) {
                setProducts(prodRes.data.map(p => ({
                    ...p,
                    commission_est: p.price * 0.05 // 5% base
                })));
            }

        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [router]);

    React.useEffect(() => {
        fetchAffiliateData();
    }, [fetchAffiliateData]);

    const referralUrl = profile ? `${window.location.origin}/shop?ref=${profile.referral_code}` : '';

    const handleCopyLink = () => {
        navigator.clipboard.writeText(referralUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleWithdrawRequest = async () => {
        if (!supabase || !profile) return;
        const amount = parseFloat(withdrawAmount);
        if (amount < 1000) { alert("Minimum payout: KSh 1,000"); return; }
        if (amount > stats.available_earnings) { alert("Insufficient available balance."); return; }

        setLoading(true);
        try {
            const { error } = await supabase.from('affiliate_payouts').insert([{
                profile_id: profile.id,
                amount: amount,
                payment_method: 'M-Pesa',
                payment_details: withdrawPhone || profile.phone_number,
                status: 'Pending'
            }]);

            if (error) throw error;
            alert("Withdrawal protocol initialized! 🛰️ Check Payouts tab for status.");
            setIsWithdrawing(false);
            fetchAffiliateData();
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    if (loading) return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-white gap-4">
            <Loader2 className="h-10 w-10 text-primary animate-spin" />
            <p className="font-black text-slate-400 uppercase tracking-widest text-[10px]">Authorizing Command Link...</p>
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-50 text-left selection:bg-primary/20 pb-40">
            {/* STICKY SUB-NAV */}
            <div className="sticky top-0 z-[100] bg-white/80 backdrop-blur-xl border-b border-slate-100 shadow-sm px-8 py-4">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        <Link href="/profile" className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 hover:text-primary transition-all border border-slate-100"><ArrowLeft size={20} /></Link>
                        <div className="h-4 w-px bg-slate-100" />
                        <nav className="flex gap-2 p-1 bg-slate-50 rounded-2xl border border-slate-100">
                            {[
                                { id: 'overview', label: 'Dashboard', icon: Target },
                                { id: 'promote', label: 'Promote', icon: Rocket },
                                { id: 'earnings', label: 'Earnings', icon: Wallet },
                                { id: 'assets', label: 'Assets', icon: Camera },
                            ].map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id as 'overview' | 'promote' | 'earnings' | 'assets')}
                                    className={cn(
                                        "px-6 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all",
                                        activeTab === tab.id ? "bg-white text-primary shadow-sm" : "text-slate-400 hover:text-foreground"
                                    )}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </nav>
                    </div>
                        <div className="flex items-center gap-4">
                        <div className="text-right hidden sm:block">
                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Available Balance</p>
                            <p className="text-sm font-black text-emerald-600">{formatPrice(stats.available_earnings)}</p>
                        </div>
                        <Button
                            onClick={() => {
                                setWithdrawAmount(stats.available_earnings.toString());
                                setWithdrawPhone(profile?.phone_number || '');
                                setIsWithdrawing(true);
                            }}
                            disabled={stats.available_earnings < 1000}
                            className="h-10 px-6 rounded-xl bg-primary text-white font-black uppercase text-[9px] tracking-widest shadow-lg shadow-primary/20 disabled:opacity-30"
                        >
                            Withdraw
                        </Button>
                    </div>
                </div>
            </div>

            {/* 🚀 QUICK SHARE TRAY (STAMP SIZE) */}
            <div className="bg-primary p-2 flex justify-center gap-6 animate-in slide-in-from-top-2">
                <button
                    onClick={() => {
                        const text = `Check out Online Bar for premium drinks! Use my link to get a member discount: ${referralUrl}`;
                        window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
                    }}
                    className="flex items-center gap-2 text-[8px] font-black uppercase text-white hover:scale-105 transition-all"
                >
                    <MessageCircle size={14} className="fill-current" /> Share to WhatsApp
                </button>
                <div className="w-px h-3 bg-white/20 my-auto" />
                <button
                    onClick={() => {
                        handleCopyLink();
                        alert("Link copied! Paste it in your Instagram Bio or Stories. 📸");
                    }}
                    className="flex items-center gap-2 text-[8px] font-black uppercase text-white hover:scale-105 transition-all"
                >
                    <Camera size={14} /> Share to Instagram
                </button>
            </div>

            <div className="max-w-7xl mx-auto px-8 pt-12 space-y-12">

                {activeTab === 'overview' && (
                    <div className="space-y-12 animate-in fade-in duration-700">
                        {/* 1. EXECUTIVE HUD */}
                        <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-10">
                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <span className="px-2 py-0.5 rounded bg-primary text-white text-[7px] font-black uppercase tracking-widest animate-pulse">Partner Active</span>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">Grid ID: {profile?.affiliates?.id?.substring(0,8) || 'APX-NEW'}</p>
                                </div>
                                <h1 className="text-5xl lg:text-7xl font-black text-foreground uppercase tracking-tighter leading-[0.85]">
                                    Affiliate <br /><span className="text-primary italic">Command.</span>
                                </h1>
                            </div>

                            <Card className="p-8 rounded-[3rem] bg-white border border-slate-100 shadow-2xl flex items-center gap-8 group hover:scale-[1.02] transition-all">
                                <div className="h-20 w-20 rounded-[2rem] bg-primary/10 flex items-center justify-center text-primary shadow-inner group-hover:rotate-6 transition-transform duration-500">
                                    <Trophy size={40} />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-1">Affiliate Level</p>
                                    <h3 className="text-4xl font-black text-foreground tracking-tighter uppercase">{profile?.affiliates?.affiliate_tier || 'BRONZE'}</h3>
                                    <div className="flex items-center gap-2 mt-2">
                                        <span className="text-[8px] font-bold text-primary uppercase">5% Commission Active</span>
                                    </div>
                                </div>
                            </Card>
                        </header>

                        {/* 2. PERFORMANCE NODES */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                            {[
                                { label: 'Tactical Clicks', val: stats.clicks.toLocaleString(), icon: MousePointer2, color: 'indigo', meta: '+0% Velocity' },
                                { label: 'Conversions', val: stats.conversions, icon: Target, color: 'emerald', meta: '0.0% Conv Rate' },
                                { label: 'Pending Payout', val: formatPrice(stats.pending_earnings), icon: Clock, color: 'amber', meta: 'Hold: 7 Days' },
                                { label: 'Total Value', val: formatPrice(0), icon: DollarSign, color: 'primary', meta: 'Gross Generated' },
                            ].map((item) => (
                                <Card key={item.label} className="p-8 rounded-[2.5rem] bg-white border border-slate-100 shadow-sm flex flex-col justify-between group hover:shadow-xl transition-all relative overflow-hidden">
                                    <div className="relative z-10 space-y-6">
                                        <div className={cn(
                                            "h-10 w-10 rounded-xl flex items-center justify-center shadow-inner transition-transform group-hover:scale-110",
                                            item.color === 'indigo' ? "bg-indigo-50 text-indigo-500" :
                                            item.color === 'emerald' ? "bg-emerald-50 text-emerald-500" :
                                            item.color === 'amber' ? "bg-amber-50 text-amber-500" :
                                            "bg-primary/5 text-primary"
                                        )}>
                                            <item.icon size={20} />
                                        </div>
                                        <div>
                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{item.label}</p>
                                            <h3 className="text-3xl font-black text-foreground tracking-tighter uppercase">{item.val}</h3>
                                            <p className="text-[8px] font-bold text-slate-400 uppercase mt-4 tracking-widest">{item.meta}</p>
                                        </div>
                                    </div>
                                </Card>
                            ))}
                        </div>

                        {/* 3. MAIN ROCKET LINK */}
                        <section className="bg-primary/5 rounded-[3.5rem] p-10 sm:p-20 text-foreground relative overflow-hidden border border-primary/10 shadow-sm">
                            <div className="relative z-10 grid lg:grid-cols-2 gap-16 items-center text-left">
                                <div className="space-y-8">
                                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 rounded-full text-[10px] font-black uppercase tracking-widest border border-primary/20 text-primary">
                                        <Zap className="h-3 w-3 fill-current animate-bounce" /> High-Priority Node
                                    </div>
                                    <h2 className="text-4xl lg:text-6xl font-black uppercase tracking-tighter leading-[0.85]">
                                        Your Unique <br /><span className="text-primary italic">Rocket Link.</span>
                                    </h2>
                                    <p className="text-slate-500 font-medium text-lg leading-relaxed italic max-w-md">
                                        &quot;Deploy this link across your network. Every purchase established through this node earns you an instant 5% commission.&quot;
                                    </p>
                                    <div className="flex flex-col sm:flex-row gap-3">
                                        <div className="flex-1 bg-white border border-slate-100 rounded-2xl px-6 py-5 font-mono text-sm text-primary truncate select-all shadow-inner">
                                            {referralUrl}
                                        </div>
                                        <Button
                                            onClick={handleCopyLink}
                                            className="h-16 px-10 rounded-2xl bg-primary text-white font-black uppercase text-[10px] tracking-widest shadow-xl shadow-primary/20 hover:scale-105 transition-all shrink-0 active:scale-95"
                                        >
                                            {copied ? <><CheckCircle2 className="h-4 w-4 mr-2" /> Copied!</> : <><Copy className="h-4 w-4 mr-2" /> Copy Link</>}
                                        </Button>
                                    </div>
                                </div>
                                <div className="hidden lg:flex justify-center">
                                    <div className="h-80 w-80 rounded-[4rem] bg-primary/5 flex items-center justify-center border border-primary/10 relative group">
                                        <Rocket size={120} className="text-primary fill-current transition-transform duration-700 group-hover:scale-110 group-hover:-translate-y-4" />
                                        <div className="absolute inset-0 rounded-[4rem] border-2 border-primary/20 animate-ping opacity-20" />
                                    </div>
                                </div>
                            </div>
                            <Globe className="absolute -bottom-20 -right-20 h-96 w-96 text-white/5 rotate-12" />
                        </section>
                    </div>
                )}

                {activeTab === 'promote' && (
                    <div className="space-y-12 animate-in slide-in-from-right-8 duration-700 text-left">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                            <div className="space-y-2">
                                <h2 className="text-4xl font-black uppercase tracking-tighter text-foreground">Marketplace</h2>
                                <p className="text-slate-500 font-medium italic">Select premium inventory to promote via your tactical nodes.</p>
                            </div>
                            <div className="relative w-full md:w-96">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300" />
                                <Input
                                    value={searchQuery}
                                    onChange={e => setSearchQuery(e.target.value)}
                                    placeholder="Search bottles..."
                                    className="h-14 rounded-2xl border-slate-100 bg-white pl-12 font-bold shadow-sm"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                            {products.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase())).map(product => (
                                <Card key={product.id} className="group rounded-[3rem] bg-white border border-slate-100 shadow-sm hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 overflow-hidden flex flex-col">
                                    <div className="aspect-square bg-slate-50 p-8 flex items-center justify-center relative overflow-hidden">
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img src={product.image_url} alt={product.name} className="max-h-full w-auto object-contain transition-transform duration-700 group-hover:scale-110" />
                                        <div className="absolute bottom-4 left-4 right-4 translate-y-20 group-hover:translate-y-0 transition-transform duration-500">
                                            <Button
                                                onClick={() => {
                                                    const url = `${window.location.origin}/shop/${product.id}?ref=${profile?.referral_code}`;
                                                    navigator.clipboard.writeText(url);
                                                    alert("Deep Link Established! 🛰️");
                                                }}
                                                className="w-full h-12 rounded-xl bg-primary text-white font-black uppercase text-[9px] tracking-widest shadow-xl shadow-primary/20 active:scale-95"
                                            >
                                                Generate Deep Link
                                            </Button>
                                        </div>
                                    </div>
                                    <CardContent className="p-8 space-y-6 flex-1 flex flex-col justify-between text-left">
                                        <div className="space-y-1">
                                            <p className="text-[10px] font-black uppercase text-primary tracking-widest">{product.category}</p>
                                            <h4 className="text-lg font-black uppercase text-foreground tracking-tight leading-none truncate">{product.name}</h4>
                                        </div>
                                        <div className="pt-4 border-t border-slate-50 flex justify-between items-end">
                                            <div>
                                                <p className="text-[8px] font-black text-slate-400 uppercase mb-1">Retail Price</p>
                                                <p className="text-xl font-black text-foreground">{formatPrice(product.price)}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-[8px] font-black text-emerald-500 uppercase mb-1">Earning Est.</p>
                                                <p className="text-xl font-black text-emerald-500">{formatPrice(product.commission_est)}</p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'earnings' && (
                    <div className="space-y-12 animate-in slide-in-from-bottom-8 duration-700 text-left">
                        <div className="grid lg:grid-cols-3 gap-8">
                            <Card className="lg:col-span-2 rounded-[3.5rem] bg-white border border-slate-100 shadow-sm p-12 space-y-10">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="h-12 w-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 shadow-sm"><History size={24} /></div>
                                        <h3 className="text-2xl font-black uppercase tracking-tighter">Earnings Ledger</h3>
                                    </div>
                                    <Button variant="outline" className="h-10 px-4 rounded-xl border-slate-100 font-black uppercase text-[8px] tracking-widest">
                                        <Download className="h-3 w-3 mr-2" /> PDF Export
                                    </Button>
                                </div>
                                <div className="divide-y divide-slate-50">
                                    <div className="py-20 text-center opacity-30">
                                        <History size={48} className="mx-auto mb-4" />
                                        <p className="text-[10px] font-black uppercase tracking-widest">Awaiting first conversion.</p>
                                    </div>
                                </div>
                            </Card>

                            <div className="space-y-8">
                                <Card className="p-10 rounded-[3rem] bg-slate-50 border border-slate-100 shadow-sm space-y-10 relative overflow-hidden group hover:border-primary/20 transition-all">
                                    <div className="relative z-10 space-y-8">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-sm"><Wallet size={24} /></div>
                                            <h3 className="text-xl font-black uppercase tracking-tighter text-foreground leading-none">Instant Payout</h3>
                                        </div>
                                        <div className="space-y-2">
                                            <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Available to withdraw</p>
                                            <h2 className="text-5xl font-black text-foreground tracking-tighter leading-none">{formatPrice(stats.available_earnings)}</h2>
                                        </div>
                                        <Button className="w-full h-16 rounded-2xl bg-primary text-white font-black uppercase text-xs tracking-widest shadow-xl shadow-primary/20 hover:scale-105 transition-all">
                                            Initialize M-Pesa Payout
                                        </Button>
                                        <p className="text-[8px] text-center text-slate-400 font-bold uppercase tracking-widest italic leading-relaxed">
                                            &quot;Transfers to verified M-Pesa nodes are processed within 60 minutes. Minimum: KSh 1,000.&quot;
                                        </p>
                                    </div>
                                    <DollarSign className="absolute -bottom-10 -left-10 h-64 w-64 text-primary/5 rotate-12" />
                                </Card>

                                <Card className="p-8 rounded-[3rem] bg-white border border-slate-100 shadow-sm space-y-6 text-left">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 shadow-sm"><PieChart size={20} /></div>
                                        <h3 className="text-lg font-black uppercase tracking-tighter text-foreground">Economic Pulse</h3>
                                    </div>
                                    <div className="space-y-6">
                                        <div className="space-y-2">
                                            <div className="flex justify-between items-center text-[10px] font-black uppercase text-slate-400">
                                                <span>EPC (Earn per click)</span>
                                                <span className="text-foreground">KSh 0.0</span>
                                            </div>
                                            <div className="h-1 w-full bg-slate-50 rounded-full overflow-hidden border border-slate-100">
                                                <div className="h-full bg-indigo-500 w-[0%]" />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <div className="flex justify-between items-center text-[10px] font-black uppercase text-slate-400">
                                                <span>Monthly Lift</span>
                                                <span className="text-emerald-500">+0%</span>
                                            </div>
                                        </div>
                                    </div>
                                </Card>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* WITHDRAWAL MODAL */}
            {isWithdrawing && (
        <div className="fixed inset-0 z-[500] flex items-center justify-center bg-slate-900/10 backdrop-blur-md p-4 animate-in fade-in duration-300">
                    <Card className="max-w-md w-full bg-white rounded-[3rem] border-none shadow-2xl p-10 space-y-8 animate-in zoom-in-95 duration-300 text-left">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-sm"><Wallet size={24} /></div>
                                <h3 className="text-2xl font-black uppercase text-foreground tracking-tighter">Claim Earnings</h3>
                            </div>
                            <button onClick={() => setIsWithdrawing(false)} className="text-slate-300 hover:text-rose-500 transition-colors"><X size={24} /></button>
                        </div>

                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-slate-400 ml-1">M-Pesa Number</label>
                                <Input
                                    value={withdrawPhone}
                                    onChange={e => setWithdrawPhone(e.target.value)}
                                    placeholder="07XXXXXXXX"
                                    className="h-14 rounded-2xl bg-slate-50 border-slate-100 font-black text-lg"
                                />
                            </div>
                            <div className="space-y-2">
                                <div className="flex justify-between items-center px-1">
                                    <label className="text-[10px] font-black uppercase text-slate-400">Withdraw Amount</label>
                                    <span className="text-[9px] font-black text-primary uppercase">Available: {formatPrice(stats.available_earnings)}</span>
                                </div>
                                <Input
                                    value={withdrawAmount}
                                    onChange={e => setWithdrawAmount(e.target.value)}
                                    type="number"
                                    className="h-14 rounded-2xl bg-slate-50 border-slate-100 font-black text-xl text-primary"
                                />
                                <p className="text-[8px] font-medium text-slate-400 italic mt-1 px-1">&quot;Minimum protocol amount: KSh 1,000.&quot;</p>
                            </div>
                        </div>

                        <Button
                            onClick={handleWithdrawRequest}
                            disabled={loading || !withdrawAmount || parseFloat(withdrawAmount) < 1000}
                            className="w-full h-16 rounded-2xl bg-primary text-white font-black uppercase text-xs tracking-widest shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all"
                        >
                            {loading ? <Loader2 className="animate-spin" /> : <><CheckCircle2 className="mr-2 h-5 w-5" /> Initialize Transfer</>}
                        </Button>
                    </Card>
                </div>
            )}
        </div>
    );
}
