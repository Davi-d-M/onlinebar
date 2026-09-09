'use client';

import * as React from 'react';
import { Card } from '@/components/ui/card';
import {
    Rocket,
    Send,
    MessageCircle,
    Camera as Instagram,
    Share2 as Facebook,
    Mail,
    Music,
    CheckCircle2,
    Loader2,
    Sparkles,
    ChevronRight,
    Users,
    Activity,
    Plus,
    Target,
    RefreshCcw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { cn, formatPrice } from '@/lib/utils';
import { supabase } from '@/lib/supabaseClient';
import { orchestrateCampaign } from '@/lib/engines/marketingOrchestrator';

export default function MarketingCommandCenter() {
    const [title, setTitle] = React.useState('');
    const [message, setMessage] = React.useState('');
    const [selectedChannels, setSelectedChannels] = React.useState<string[]>(['WHATSAPP', 'INSTAGRAM']);
    const [selectedAudience, setSelectedAudience] = React.useState('ALL_CUSTOMERS');
    const [loading, setLoading] = React.useState(false);
    const [success, setSuccess] = React.useState(false);
    const [campaigns, setCampaigns] = React.useState<{ id: string, title: string, status: string, created_at: string, campaign_jobs?: { id: string, channel: string, status: string }[] }[]>([]);

    const fetchCampaigns = React.useCallback(async () => {
        if (!supabase) return;
        const { data } = await supabase.from('marketing_campaigns_v2').select('*, campaign_jobs(*)').order('created_at', { ascending: false }).limit(5);
        if (data) setCampaigns(data as { id: string, title: string, status: string, created_at: string, campaign_jobs?: { id: string, channel: string, status: string }[] }[]);
    }, []);

    React.useEffect(() => {
        fetchCampaigns();
    }, [fetchCampaigns]);

    const handleLaunch = async () => {
        if (!title || !message) return;
        setLoading(true);
        try {
            await orchestrateCampaign({
                title,
                message,
                channels: selectedChannels as ('WHATSAPP' | 'INSTAGRAM' | 'FACEBOOK' | 'TIKTOK' | 'GMAIL')[],
                audienceSegment: selectedAudience
            });
            setSuccess(true);
            setTimeout(() => setSuccess(false), 5000);
            setTitle('');
            setMessage('');
            fetchCampaigns();
        } catch (err: unknown) {
            console.error("Campaign Launch Failure:", (err as Error).message || err);
        } finally {
            setLoading(false);
        }
    };

    const toggleChannel = (ch: string) => {
        setSelectedChannels(prev => prev.includes(ch) ? prev.filter(c => c !== ch) : [...prev, ch]);
    };

    return (
        <div className="space-y-10 text-left selection:bg-primary/20 animate-in fade-in duration-1000">

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
                {[
                    { label: 'Attributed Revenue', val: formatPrice(0), icon: Target, color: 'primary' },
                    { label: 'Active Campaigns', val: campaigns.length, icon: Rocket, color: 'indigo' },
                    { label: 'Avg. Conversion', val: '0.0%', icon: Activity, color: 'emerald' },
                    { label: 'Audience Reach', val: '0', icon: Users, color: 'rose' },
                ].map((item) => (
                    <Card key={item.label} className="aspect-[4/5] rounded-[4rem] bg-white border border-slate-100 shadow-sm flex flex-col items-center justify-center gap-6 group hover:shadow-2xl transition-all relative overflow-hidden text-center p-6">
                        <div className={cn(
                            "h-14 w-14 rounded-full flex items-center justify-center transition-transform group-hover:scale-110 shadow-inner",
                            item.color === 'primary' ? "bg-primary/10 text-primary" :
                            item.color === 'indigo' ? "bg-indigo-50 text-indigo-500" :
                            item.color === 'emerald' ? "bg-emerald-50 text-emerald-500" :
                            "bg-rose-50 text-rose-500"
                        )}>
                            <item.icon size={28} />
                        </div>
                        <div className="space-y-2">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">{item.label}</p>
                            <h3 className="text-2xl font-black text-foreground tracking-tighter uppercase leading-none">{item.val}</h3>
                        </div>
                    </Card>
                ))}
            </div>

            <div className="grid lg:grid-cols-12 gap-10">

                {/* 2. CAMPAIGN BUILDER */}
                <div className="lg:col-span-7 space-y-8 text-left">
                    <Card className="p-10 rounded-[3.5rem] bg-white border border-slate-100 shadow-sm space-y-10">
                        <div className="flex items-center justify-between border-b border-slate-50 pb-8">
                            <div className="flex items-center gap-4">
                                <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-inner"><Plus size={24} /></div>
                                <div>
                                    <h2 className="text-2xl font-black text-foreground uppercase tracking-tighter leading-none">New Campaign</h2>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Multi-Channel Orchestration</p>
                                </div>
                            </div>
                            {success && (
                                <div className="px-4 py-2 bg-emerald-50 text-emerald-600 rounded-xl text-[9px] font-black uppercase flex items-center gap-2 animate-in slide-in-from-top-2">
                                    <CheckCircle2 size={14} /> Mission Launched
                                </div>
                            )}
                        </div>

                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[9px] font-black uppercase text-slate-400 ml-1">Campaign Headline</label>
                                <Input value={title} onChange={e => setTitle(e.target.value)} className="h-14 rounded-2xl bg-slate-50 border-slate-100 font-bold" placeholder="e.g. Premium Weekend Drop" />
                            </div>

                            <div className="space-y-2">
                                <div className="flex justify-between items-center px-1">
                                    <label className="text-[9px] font-black uppercase text-slate-400">Core Narrative</label>
                                    <button className="text-[8px] font-black text-primary uppercase flex items-center gap-1 hover:opacity-70"><Sparkles size={10} /> AI Polish</button>
                                </div>
                                <Textarea value={message} onChange={e => setMessage(e.target.value)} className="min-h-[120px] rounded-3xl bg-slate-50 border-slate-100 p-6 resize-none font-medium text-slate-600" placeholder="Describe the mission creative..." />
                            </div>

                            <div className="space-y-4">
                                <label className="text-[9px] font-black uppercase text-slate-400 ml-1">Deployment Channels</label>
                                <div className="grid grid-cols-5 gap-3">
                                    {[
                                        { id: 'WHATSAPP', icon: MessageCircle, color: 'emerald' },
                                        { id: 'INSTAGRAM', icon: Instagram, color: 'primary' },
                                        { id: 'FACEBOOK', icon: Facebook, color: 'indigo' },
                                        { id: 'TIKTOK', icon: Music, color: 'slate' },
                                        { id: 'GMAIL', icon: Mail, color: 'rose' },
                                    ].map(ch => (
                                        <button
                                            key={ch.id}
                                            onClick={() => toggleChannel(ch.id)}
                                            className={cn(
                                                "p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 group/ch",
                                                selectedChannels.includes(ch.id)
                                                    ? `bg-${ch.color}-50 border-${ch.color}-200 text-${ch.color}-600 shadow-lg shadow-${ch.color}-500/5`
                                                    : "bg-white border-slate-100 text-slate-300 hover:border-slate-200"
                                            )}
                                        >
                                            <ch.icon size={20} className={cn(selectedChannels.includes(ch.id) ? "" : "group-hover/ch:text-slate-400")} />
                                            <span className="text-[8px] font-black uppercase">{ch.id.substring(0, 2)}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[9px] font-black uppercase text-slate-400 ml-1">Target Audience</label>
                                <select value={selectedAudience} onChange={e => setSelectedAudience(e.target.value)} className="w-full h-14 rounded-2xl bg-slate-50 border border-slate-100 px-6 font-black text-xs uppercase outline-none focus:ring-2 focus:ring-primary">
                                    <option value="ALL_CUSTOMERS">All Patrons (2.4k)</option>
                                    <option value="VIP_ONLY">VIP & Legends (412)</option>
                                    <option value="INACTIVE_30D">Inactive 30D (184)</option>
                                    <option value="SNACK_BUYERS">Snack Enthusiasts (621)</option>
                                </select>
                            </div>
                        </div>

                        <Button onClick={handleLaunch} disabled={loading || !title} className="w-full h-18 rounded-[2rem] bg-slate-900 text-white font-black uppercase text-xs tracking-[0.2em] shadow-2xl active:scale-95 transition-all flex items-center justify-center gap-4 group/btn">
                            {loading ? <Loader2 className="animate-spin" /> : <><Send className="h-5 w-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" /> Publish Everywhere</>}
                        </Button>
                    </Card>
                </div>

                {/* 3. CAMPAIGN HISTORY */}
                <div className="lg:col-span-5 space-y-8 text-left">
                    <Card className="p-10 rounded-[3.5rem] bg-slate-50 border border-slate-100 shadow-inner space-y-8 h-full">
                        <div className="flex items-center justify-between">
                            <h3 className="text-xl font-black text-foreground uppercase tracking-tighter">Mission Log</h3>
                            <button onClick={fetchCampaigns} className="text-slate-300 hover:text-primary transition-colors"><RefreshCcw size={18} /></button>
                        </div>

                        <div className="space-y-4 max-h-[600px] overflow-y-auto no-scrollbar pr-2">
                            {campaigns.map(c => (
                                <div key={c.id} className="p-6 bg-white border border-slate-100 rounded-[2.5rem] shadow-sm space-y-4 group hover:shadow-xl transition-all">
                                    <div className="flex justify-between items-start">
                                        <div className="space-y-1">
                                            <p className="text-[10px] font-black uppercase text-foreground truncate max-w-[200px]">{c.title}</p>
                                            <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">{new Date(c.created_at).toLocaleDateString()}</p>
                                        </div>
                                        <span className={cn(
                                            "px-2 py-0.5 rounded text-[7px] font-black uppercase",
                                            c.status === 'COMPLETED' ? "bg-emerald-50 text-emerald-600" : "bg-primary/10 text-primary"
                                        )}>{c.status}</span>
                                    </div>
                                    <div className="flex gap-2">
                                        {c.campaign_jobs?.map((j: { id: string, channel: string, status: string }) => (
                                            <div key={j.id} title={j.channel} className={cn(
                                                "h-6 w-6 rounded-lg flex items-center justify-center border",
                                                j.status === 'COMPLETED' ? "bg-emerald-50 border-emerald-100 text-emerald-500" : "bg-slate-50 border-slate-100 text-slate-300"
                                            )}>
                                                {j.channel === 'WHATSAPP' && <MessageCircle size={12} />}
                                                {j.channel === 'INSTAGRAM' && <Instagram size={12} />}
                                                {j.channel === 'FACEBOOK' && <Facebook size={12} />}
                                                {j.channel === 'GMAIL' && <Mail size={12} />}
                                                {j.channel === 'TIKTOK' && <Music size={12} />}
                                            </div>
                                        ))}
                                    </div>
                                    <button className="w-full pt-2 flex justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                                        <ChevronRight size={16} className="text-primary" />
                                    </button>
                                </div>
                            ))}
                            {campaigns.length === 0 && (
                                <div className="py-20 text-center opacity-30">
                                    <Rocket size={48} className="mx-auto mb-4" />
                                    <p className="text-[10px] font-black uppercase tracking-widest">No previous launches.</p>
                                </div>
                            )}
                        </div>
                    </Card>
                </div>

            </div>
        </div>
    );
}
