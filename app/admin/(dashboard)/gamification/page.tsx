'use client';

import * as React from 'react';
import { supabase } from '@/lib/supabaseClient';
import {
    Flame,
    Target,
    Activity as Zap,
    Save,
    Loader2,
    CheckCircle2,
    ShieldAlert,
    Settings as SettingsIcon,
    Dices,
    Star,
    ShieldCheck,
    Crown,
    Gem,
    Trophy,
    ShoppingBag,
    Wine,
    MessageSquare,
    Users,
    Rocket,
    Plus,
    Trash2,
    DollarSign
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { useAdmin } from '@/context/AdminContext';
import { logAuditAction } from '@/lib/auditService';

const DEFAULTS = {
    streak: {
        milestone_days: 14,
        milestone_reward_label: "KSh 500 Bar Voucher",
        xp_per_day: 10
    },
    missions: [
        { type: 'buy-mixers', label: 'Buy Any Mixer', xp: 100, target: 2 },
        { type: 'review-product', label: 'Review Beverage', xp: 50, target: 5 },
        { type: 'watch-video', label: 'Watch Tasting Video', xp: 30, target: 1 },
        { type: 'refer-friend', label: 'Refer Friend', xp: 200, target: 1 },
        { type: 'wishlist-items', label: 'Wishlist 5 Items', xp: 40, target: 5 },
        { type: 'share-product', label: 'Share Product', xp: 25, target: 1 },
    ],
    rewards: {
        crate_probabilities: [
            { label: '50 XP', chance: 40, value: 50, type: 'xp' },
            { label: '100 XP', chance: 30, value: 100, type: 'xp' },
            { label: 'KSh 100 Coupon', chance: 20, value: 100, type: 'voucher' },
            { label: 'Free Delivery', chance: 10, value: 0, type: 'perk' },
        ],
        spin_probabilities: [
            { label: '10 XP', chance: 50, value: 10, type: 'xp' },
            { label: '100 XP', chance: 25, value: 100, type: 'xp' },
            { label: 'Free Shipping', chance: 15, value: 0, type: 'perk' },
            { label: 'KSh 500 Coupon', chance: 5, value: 500, type: 'voucher' },
            { label: 'Mystery Prize', chance: 5, value: 0, type: 'mystery' },
        ]
    },
    tiers: [
        { id: 'patron', label: 'Patron', threshold: 0, icon: 'Star' },
        { id: 'silver', label: 'Silver VIP', threshold: 500, icon: 'ShieldCheck' },
        { id: 'gold', label: 'Gold VIP', threshold: 1000, icon: 'Crown' },
        { id: 'diamond', label: 'Diamond VIP', threshold: 2000, icon: 'Gem' },
        { id: 'legend', label: 'Mixology Legend', threshold: 5000, icon: 'Trophy' },
    ],
    badges: [
        { key: 'first-pour', label: 'First Pour', icon: 'ShoppingBag', desc: 'Your first bar order complete.' },
        { key: 'bar-regular', label: 'Bar Regular', icon: 'Wine', desc: 'Ordered 5+ times this month.' },
        { key: 'connoisseur', label: 'Connoisseur', icon: 'MessageSquare', desc: 'Shared expertise on 5+ beverages.' },
        { key: 'social-patron', label: 'Social Patron', icon: 'Users', desc: 'Referred a friend successfully.' },
        { key: 'vvip-shopper', label: 'VVIP Patron', icon: 'Rocket', desc: 'Spent over KSh 50,000.' },
        { key: 'mixology-master', label: 'Mixology Master', icon: 'Gem', desc: 'Achieved Diamond Rank.' },
    ],
    seasons: [
        { id: 'S01', name: 'Nairobi Nights', status: 'Active', multiplier: 1.5 },
    ]
};

const ICON_OPTIONS = ['Star', 'ShieldCheck', 'Crown', 'Gem', 'Trophy', 'ShoppingBag', 'Wine', 'MessageSquare', 'Users', 'Rocket'];

const IconMap: Record<string, React.ElementType> = {
    Star, ShieldCheck, Crown, Gem, Trophy, ShoppingBag, Wine, MessageSquare, Users, Rocket
};

export default function AdminGamificationPage() {
    const { email } = useAdmin();
    const [loading, setLoading] = React.useState(true);
    const [saving, setSaving] = React.useState(false);
    const [message, setMessage] = React.useState<{ type: 'success' | 'error', text: string } | null>(null);

    const [config, setConfig] = React.useState(DEFAULTS);
    const [activeTab, setActiveTab] = React.useState<'streaks' | 'missions' | 'rewards' | 'tiers' | 'seasons' | 'simulator'>('streaks');

    // Simulator State
    const [simPurchase, setSimPurchase] = React.useState('5000');
    const [simResults, setSimResults] = React.useState<{ xp: number, points: number, rank: string, voucher: string } | null>(null);

    const runSimulation = () => {
        const amount = Number(simPurchase) || 0;
        const xp = Math.floor(amount / 10); // 1 XP per 10 KSh
        const points = Math.floor(xp * 1.5);

        // Find Rank
        const rank = [...config.tiers].sort((a, b) => b.threshold - a.threshold).find(t => xp >= t.threshold)?.label || 'Patron';
        const voucher = amount >= 5000 ? 'KSh 200 Voucher' : 'No Voucher';

        setSimResults({ xp, points, rank, voucher });
    };

    React.useEffect(() => {
        async function fetchConfig() {
            if (!supabase) return;
            setLoading(true);
            const { data } = await supabase.from('settings').select('*').eq('key', 'gamification').maybeSingle();
            if (data) setConfig(data.value);
            setLoading(false);
        }
        fetchConfig();
    }, []);

    const handleSave = async () => {
        if (!supabase) return;
        setSaving(true);
        try {
            const { error } = await supabase
                .from('settings')
                .upsert({
                    key: 'gamification',
                    value: config,
                    is_published: true,
                    updated_at: new Date().toISOString()
                }, { onConflict: 'key' });

            if (error) throw error;
            await logAuditAction(email, 'UPDATE_GAMIFICATION', config);
            setMessage({ type: 'success', text: "Bar Reward protocols updated successfully." });
        } catch (err: unknown) {
            const error = err as Error;
            setMessage({ type: 'error', text: error.message });
        } finally {
            setSaving(false);
            setTimeout(() => setMessage(null), 5000);
        }
    };

    if (loading) return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-white gap-4">
            <Loader2 className="h-10 w-10 text-primary animate-spin" />
            <p className="font-black text-slate-400 uppercase tracking-widest text-[10px]">Syncing Reward Matrix...</p>
        </div>
    );

    return (
        <div className="p-8 space-y-10 bg-slate-50 min-h-screen text-left pb-40">
            <header className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 border-b border-slate-200 pb-8">
                <div>
                    <h1 className="text-4xl font-black text-foreground uppercase tracking-tighter">Bar Club Engine</h1>
                    <p className="text-slate-500 text-sm font-medium mt-1">Configure patron engagement loops and automated VIP rewards.</p>
                </div>
                <div className="flex gap-2">
                    <Button onClick={handleSave} disabled={saving} className="rounded-xl h-12 px-8 bg-primary text-white font-black uppercase text-[10px] tracking-widest hover:bg-primary/90 shadow-xl shadow-primary/20 transition-all">
                        {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                        Commit Config
                    </Button>
                </div>
            </header>

            {message && (
                <div className={cn(
                    "p-6 rounded-[2rem] border-2 flex items-start gap-4 animate-in slide-in-from-top-4",
                    message.type === 'success' ? "bg-emerald-50 border-emerald-100 text-emerald-600" : "bg-rose-50 border-rose-100 text-rose-600"
                )}>
                    {message.type === 'success' ? <CheckCircle2 className="h-6 w-6 shrink-0" /> : <ShieldAlert className="h-6 w-6 shrink-0" />}
                    <div>
                        <p className="text-sm font-black uppercase tracking-tight">{message.type === 'success' ? 'Protocol Updated' : 'Uplink Error'}</p>
                        <p className="text-xs font-medium italic">{message.text}</p>
                    </div>
                </div>
            )}

            <div className="flex gap-2 p-1 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-x-auto no-scrollbar max-w-4xl text-left">
                {[
                    { id: 'streaks', label: 'Patron Streaks', icon: Flame },
                    { id: 'missions', label: 'Bar Missions', icon: Target },
                    { id: 'rewards', label: 'Reward Odds', icon: Dices },
                    { id: 'tiers', label: 'VIP Tiers', icon: Crown },
                    { id: 'seasons', label: 'Seasons', icon: Rocket },
                    { id: 'simulator', label: 'Value Simulator', icon: Zap },
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as 'streaks' | 'missions' | 'rewards' | 'tiers' | 'seasons' | 'simulator')}
                        className={cn(
                            "flex items-center gap-3 px-6 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shrink-0 border-2 border-transparent",
                            activeTab === tab.id ? "bg-primary text-white border-primary shadow-lg shadow-primary/20" : "text-slate-400 hover:bg-slate-50 hover:text-foreground"
                        )}
                    >
                        <tab.icon className="h-4 w-4" />
                        {tab.label}
                    </button>
                ))}
            </div>

            <div className="grid lg:grid-cols-12 gap-10">
                <div className="lg:col-span-8 space-y-8 text-left">

                    {activeTab === 'streaks' && (
                        <Card className="rounded-[3rem] border border-slate-100 p-10 bg-white shadow-sm space-y-8 animate-in fade-in slide-in-from-left-4 duration-500">
                            <h2 className="text-xl font-black text-foreground uppercase flex items-center gap-3"><Flame className="h-5 w-5 text-rose-500" /> Patron Streak Logic</h2>
                            <div className="grid sm:grid-cols-2 gap-8">
                                <div className="space-y-2 text-left">
                                    <label className="text-[10px] font-black uppercase text-slate-400">Milestone Days</label>
                                    <Input
                                        type="number"
                                        value={config.streak.milestone_days}
                                        onChange={e => setConfig({...config, streak: {...config.streak, milestone_days: Number(e.target.value)}})}
                                        className="h-14 rounded-2xl bg-slate-50 border-slate-100 font-black text-lg"
                                    />
                                </div>
                                <div className="space-y-2 text-left">
                                    <label className="text-[10px] font-black uppercase text-slate-400">Daily Visit XP</label>
                                    <Input
                                        type="number"
                                        value={config.streak.xp_per_day}
                                        onChange={e => setConfig({...config, streak: {...config.streak, xp_per_day: Number(e.target.value)}})}
                                        className="h-14 rounded-2xl bg-slate-50 border-slate-100 font-black text-lg"
                                    />
                                </div>
                                <div className="space-y-2 sm:col-span-2 text-left">
                                    <label className="text-[10px] font-black uppercase text-slate-400">Milestone Reward Label</label>
                                    <Input
                                        value={config.streak.milestone_reward_label}
                                        onChange={e => setConfig({...config, streak: {...config.streak, milestone_reward_label: e.target.value}})}
                                        className="h-14 rounded-2xl bg-slate-50 border-slate-100 font-bold"
                                    />
                                </div>
                            </div>
                        </Card>
                    )}

                    {activeTab === 'missions' && (
                        <Card className="rounded-[3rem] border border-slate-100 p-10 bg-white shadow-sm space-y-8 animate-in fade-in slide-in-from-left-4 duration-500">
                             <h2 className="text-xl font-black text-foreground uppercase flex items-center gap-3"><Target className="h-5 w-5 text-primary" /> Active Bar Missions</h2>
                             <div className="space-y-4">
                                 {config.missions.map((m, i) => (
                                     <div key={m.type} className="p-6 rounded-3xl bg-slate-50 border border-slate-100 grid sm:grid-cols-3 gap-6 items-end group text-left">
                                         <div className="space-y-2">
                                             <label className="text-[8px] font-black uppercase text-slate-400">Mission Label</label>
                                             <Input value={m.label} onChange={e => {
                                                 const newMissions = [...config.missions];
                                                 newMissions[i].label = e.target.value;
                                                 setConfig({...config, missions: newMissions});
                                             }} className="h-12 rounded-xl bg-white border-none font-bold text-xs" />
                                         </div>
                                         <div className="space-y-2 text-left">
                                             <label className="text-[8px] font-black uppercase text-slate-400">Target Count</label>
                                             <Input type="number" value={m.target} onChange={e => {
                                                 const newMissions = [...config.missions];
                                                 newMissions[i].target = Number(e.target.value);
                                                 setConfig({...config, missions: newMissions});
                                             }} className="h-12 rounded-xl bg-white border-none font-black text-xs" />
                                         </div>
                                         <div className="space-y-2 text-left">
                                             <label className="text-[8px] font-black uppercase text-slate-400">XP Reward</label>
                                             <Input type="number" value={m.xp} onChange={e => {
                                                 const newMissions = [...config.missions];
                                                 newMissions[i].xp = Number(e.target.value);
                                                 setConfig({...config, missions: newMissions});
                                             }} className="h-12 rounded-xl bg-white border-none font-black text-xs" />
                                         </div>
                                     </div>
                                 ))}
                             </div>
                        </Card>
                    )}

                    {activeTab === 'tiers' && (
                        <div className="space-y-10 animate-in fade-in slide-in-from-left-4 duration-500">
                            {/* VIP Tiers Editor */}
                            <Card className="rounded-[3rem] border border-slate-100 p-10 bg-white shadow-sm space-y-8">
                                <div className="flex justify-between items-center text-left">
                                    <h2 className="text-xl font-black text-foreground uppercase flex items-center gap-3"><Crown className="h-5 w-5 text-primary" /> VIP Pathway</h2>
                                    <Button onClick={() => setConfig({...config, tiers: [...config.tiers, { id: 'new', label: 'New Rank', threshold: 0, icon: 'Star' }]})} variant="outline" className="h-10 rounded-xl text-[8px] font-black uppercase"><Plus className="h-3 w-3 mr-2" /> Add Tier</Button>
                                </div>
                                <div className="space-y-6">
                                    {config.tiers.map((t, i) => {
                                        const Icon = IconMap[t.icon] || Star;
                                        return (
                                            <div key={i} className="p-6 rounded-3xl bg-slate-50 border border-slate-100 grid sm:grid-cols-4 gap-6 items-end group relative text-left">
                                                <div className="space-y-2">
                                                    <label className="text-[8px] font-black uppercase text-slate-400">Rank Label</label>
                                                    <Input value={t.label} onChange={e => {
                                                        const newTiers = [...config.tiers];
                                                        newTiers[i].label = e.target.value;
                                                        setConfig({...config, tiers: newTiers});
                                                    }} className="h-12 rounded-xl bg-white border-none font-bold text-xs" />
                                                </div>
                                                <div className="space-y-2 text-left">
                                                    <label className="text-[8px] font-black uppercase text-slate-400">XP Threshold</label>
                                                    <Input type="number" value={t.threshold} onChange={e => {
                                                        const newTiers = [...config.tiers];
                                                        newTiers[i].threshold = Number(e.target.value);
                                                        setConfig({...config, tiers: newTiers});
                                                    }} className="h-12 rounded-xl bg-white border-none font-black text-xs" />
                                                </div>
                                                <div className="space-y-2 text-left">
                                                    <label className="text-[8px] font-black uppercase text-slate-400">Visual Icon</label>
                                                    <select
                                                        value={t.icon}
                                                        onChange={e => {
                                                            const newTiers = [...config.tiers];
                                                            newTiers[i].icon = e.target.value;
                                                            setConfig({...config, tiers: newTiers});
                                                        }}
                                                        className="w-full h-12 rounded-xl bg-white border-none text-[10px] font-black uppercase px-4 outline-none focus:ring-2 focus:ring-primary"
                                                    >
                                                        {ICON_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                                    </select>
                                                </div>
                                                <div className="flex items-center justify-center">
                                                    <div className="h-12 w-12 rounded-xl bg-white flex items-center justify-center text-primary shadow-sm">
                                                        {React.createElement(Icon, { className: "h-6 w-6" })}
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => {
                                                        if (window.confirm("Expunge this VIP tier from the reward matrix?")) {
                                                            setConfig({...config, tiers: config.tiers.filter((_, idx) => idx !== i)});
                                                        }
                                                    }}
                                                    className="absolute top-2 right-2 h-8 w-8 rounded-lg bg-white border border-slate-100 flex items-center justify-center text-slate-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all shadow-sm"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        );
                                    })}
                                </div>
                            </Card>

                            {/* Achievement Badges Editor */}
                            <Card className="rounded-[3rem] border border-slate-100 p-10 bg-white shadow-sm space-y-8">
                                <div className="flex justify-between items-center text-left">
                                    <h2 className="text-xl font-black text-foreground uppercase flex items-center gap-3"><Trophy className="h-5 w-5 text-amber-500" /> Patron Badges</h2>
                                    <Button onClick={() => setConfig({...config, badges: [...config.badges, { key: 'new', label: 'New Badge', icon: 'Rocket', desc: 'Badge description here.' }]})} variant="outline" className="h-10 rounded-xl text-[8px] font-black uppercase"><Plus className="h-3 w-3 mr-2" /> Add Badge</Button>
                                </div>
                                <div className="grid sm:grid-cols-2 gap-6 text-left">
                                    {config.badges.map((b, i) => {
                                        const Icon = IconMap[b.icon] || Rocket;
                                        return (
                                            <div key={i} className="p-8 rounded-[2.5rem] bg-slate-50 border border-slate-100 space-y-6 group relative overflow-hidden text-left">
                                                <div className="flex gap-4 items-start text-left">
                                                    <div className="h-16 w-16 rounded-2xl bg-white flex items-center justify-center text-primary shadow-sm shrink-0">
                                                        {React.createElement(Icon, { className: "h-8 w-8" })}
                                                    </div>
                                                    <div className="flex-1 space-y-4 text-left">
                                                        <div className="space-y-1">
                                                            <label className="text-[8px] font-black uppercase text-slate-400">Badge Label</label>
                                                            <Input value={b.label} onChange={e => {
                                                                const newBadges = [...config.badges];
                                                                newBadges[i].label = e.target.value;
                                                                setConfig({...config, badges: newBadges});
                                                            }} className="h-10 rounded-xl bg-white border-none font-bold text-xs" />
                                                        </div>
                                                        <div className="space-y-1 text-left">
                                                            <label className="text-[8px] font-black uppercase text-slate-400">Icon Key</label>
                                                            <select
                                                                value={b.icon}
                                                                onChange={e => {
                                                                    const newBadges = [...config.badges];
                                                                    newBadges[i].icon = e.target.value;
                                                                    setConfig({...config, badges: newBadges});
                                                                }}
                                                                className="w-full h-10 rounded-xl bg-white border-none text-[9px] font-black uppercase px-3 outline-none"
                                                            >
                                                                {ICON_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                                            </select>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="space-y-1 text-left">
                                                    <label className="text-[8px] font-black uppercase text-slate-400 ml-1">Requirement / Description</label>
                                                    <Input value={b.desc} onChange={e => {
                                                        const newBadges = [...config.badges];
                                                        newBadges[i].desc = e.target.value;
                                                        setConfig({...config, badges: newBadges});
                                                    }} className="h-10 rounded-xl bg-white border-none text-[10px] font-medium italic" />
                                                </div>
                                                <button
                                                    onClick={() => {
                                                        if (window.confirm("Delete this achievement badge? Existing patrons will lose this node.")) {
                                                            setConfig({...config, badges: config.badges.filter((_, idx) => idx !== i)});
                                                        }
                                                    }}
                                                    className="absolute top-4 right-4 h-8 w-8 rounded-lg bg-white border border-slate-100 flex items-center justify-center text-slate-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all shadow-sm"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        );
                                    })}
                                </div>
                            </Card>
                        </div>
                    )}

                    {activeTab === 'seasons' && (
                        <Card className="rounded-[3rem] border border-slate-100 p-10 bg-white shadow-sm space-y-8 animate-in fade-in slide-in-from-left-4 duration-500">
                            <div className="flex justify-between items-center">
                                <h2 className="text-xl font-black text-foreground uppercase flex items-center gap-3"><Rocket className="h-5 w-5 text-indigo-500" /> Season Hub</h2>
                                <Button onClick={() => setConfig({...config, seasons: [...(config.seasons || []), { id: 'NEW', name: 'New Season', status: 'Draft', multiplier: 1.0 }]})} variant="outline" className="h-10 rounded-xl text-[8px] font-black uppercase"><Plus className="h-3 w-3 mr-2" /> Start Season</Button>
                            </div>
                            <div className="space-y-4">
                                {(config.seasons || []).map((s, i) => (
                                    <div key={i} className="p-8 rounded-[2.5rem] bg-slate-50 border border-slate-100 flex items-center justify-between group">
                                        <div className="flex items-center gap-6">
                                            <div className="h-14 w-14 rounded-2xl bg-white flex items-center justify-center text-indigo-500 shadow-sm font-black">{s.id}</div>
                                            <div>
                                                <h3 className="font-black text-foreground uppercase">{s.name}</h3>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase mt-1">{s.status}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-8">
                                            <div className="text-right">
                                                <p className="text-[8px] font-black uppercase text-primary">XP Multiplier</p>
                                                <p className="text-lg font-black text-foreground">{s.multiplier}x</p>
                                            </div>
                                            <Button variant="ghost" size="icon" className="h-12 w-12 rounded-xl border border-slate-200 group-hover:bg-primary group-hover:text-white transition-all"><SettingsIcon size={18} /></Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    )}

                    {activeTab === 'simulator' && (
                        <Card className="rounded-[3rem] border border-border p-10 bg-white shadow-sm space-y-10 animate-in fade-in slide-in-from-left-4 duration-500 text-left">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-sm"><Zap className="h-5 w-5" /></div>
                                <h2 className="text-xl font-black text-foreground uppercase">Patron Reward Simulator</h2>
                            </div>

                            <div className="grid sm:grid-cols-2 gap-10 items-start text-left">
                                <div className="space-y-6 text-left">
                                    <div className="space-y-2 text-left">
                                        <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Simulation Order Amount</label>
                                        <div className="relative">
                                            <Input
                                                value={simPurchase}
                                                onChange={e => setSimPurchase(e.target.value.replace(/\D/g, ''))}
                                                className="h-16 rounded-2xl bg-slate-50 border-slate-100 font-black text-2xl text-primary pl-14"
                                            />
                                            <DollarSign className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={24} />
                                        </div>
                                    </div>
                                    <Button onClick={runSimulation} className="w-full h-16 rounded-2xl bg-primary text-white font-black uppercase tracking-[0.2em] shadow-xl shadow-primary/20 transition-all hover:scale-105 active:scale-95">
                                        Execute Simulation
                                    </Button>
                                </div>

                                {simResults && (
                                    <div className="space-y-6 animate-in zoom-in-95 duration-500 text-left">
                                        <div className="p-8 rounded-[2.5rem] bg-secondary border border-border space-y-8 text-left">
                                            <div className="flex justify-between items-center pb-4 border-b border-border">
                                                <span className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">XP Yield</span>
                                                <span className="text-2xl font-black text-foreground">+{simResults.xp} XP</span>
                                            </div>
                                            <div className="flex justify-between items-center pb-4 border-b border-border">
                                                <span className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Bar Points</span>
                                                <span className="text-2xl font-black text-foreground">{simResults.points} pts</span>
                                            </div>
                                            <div className="flex justify-between items-center pb-4 border-b border-border">
                                                <span className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Predicted VIP Rank</span>
                                                <span className="text-lg font-black text-primary italic uppercase">{simResults.rank}</span>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </Card>
                    )}

                </div>

                <div className="lg:col-span-4 space-y-8 text-left">
                    <Card className="p-8 rounded-[3rem] bg-white text-foreground border border-slate-100 shadow-xl relative overflow-hidden group text-left">
                        <div className="relative z-10 space-y-6 text-left">
                            <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-[0.4em]">Engine Status</h3>
                            <div className="space-y-4 text-left">
                                <div className="flex justify-between items-center py-4 border-b border-slate-50">
                                    <span className="text-[10px] font-black uppercase text-slate-400">Total Patrons Tracked</span>
                                    <span className="text-lg font-black text-foreground">---</span>
                                </div>
                                <div className="flex justify-between items-center py-4 border-b border-slate-50">
                                    <span className="text-[10px] font-black uppercase text-slate-400">VVIP Density</span>
                                    <span className="text-xs font-black text-primary">Normal</span>
                                </div>
                            </div>
                        </div>
                        <Zap className="absolute -bottom-10 -right-10 h-48 w-48 text-primary/10 rotate-12" />
                    </Card>

                    <div className="p-8 rounded-[3rem] bg-white border border-slate-100 shadow-sm space-y-4 text-left">
                        <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary"><SettingsIcon className="h-5 w-5" /></div>
                        <h4 className="text-lg font-black uppercase tracking-tighter text-foreground">Optimization Tip</h4>
                        <p className="text-[10px] text-slate-500 font-medium leading-relaxed italic text-left">
                            &quot;Keep the Milestone reward high and ensure VIP tiers provide tangible beverage discounts to maximize patron retention.&quot;
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
