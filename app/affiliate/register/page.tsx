'use client';

import * as React from 'react';
import { supabase } from '@/lib/supabaseClient';
import {
    Target,
    Users,
    ShieldCheck,
    Loader2,
    Rocket,
    Camera,
    MessageSquare,
    Globe,
    CheckCircle2
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import Link from 'next/link';

export default function AffiliateRegistration() {
    const [loading, setLoading] = React.useState(false);
    const [success, setSuccess] = React.useState(false);
    const [formData, setFormData] = React.useState({
        business_name: '',
        bio: '',
        audience_size: '',
        primary_channels: [] as string[],
        preferred_payout_method: 'M-Pesa',
        payout_details: ''
    });

    const channels = [
        { id: 'Instagram', icon: Camera },
        { id: 'TikTok', icon: Target },
        { id: 'WhatsApp', icon: MessageSquare },
        { id: 'Website', icon: Globe }
    ];

    const toggleChannel = (id: string) => {
        setFormData(prev => ({
            ...prev,
            primary_channels: prev.primary_channels.includes(id)
                ? prev.primary_channels.filter(c => c !== id)
                : [...prev.primary_channels, id]
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!supabase) return;
        setLoading(true);

        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) throw new Error("Please sign in to the grid first.");

            const { error } = await supabase
                .from('affiliates')
                .insert([{
                    id: session.user.id,
                    ...formData,
                    audience_size: parseInt(formData.audience_size) || 0,
                    verification_status: 'Pending',
                    marketing_agreement_accepted: true
                }]);

            if (error) throw error;
            setSuccess(true);
        } catch (err: unknown) {
            alert((err as Error).message);
        } finally {
            setLoading(false);
        }
    };

    if (success) return (
        <div className="min-h-screen bg-white flex flex-col items-center justify-center p-8 text-center space-y-8 animate-in zoom-in-95 duration-700">
            <div className="h-24 w-24 rounded-[2.5rem] bg-emerald-50 flex items-center justify-center text-emerald-500 shadow-inner">
                <CheckCircle2 size={48} />
            </div>
            <div className="space-y-2">
                <h1 className="text-4xl font-black uppercase tracking-tighter text-foreground leading-none">Proposal Transmitted</h1>
                <p className="text-slate-500 font-medium italic max-w-sm mx-auto leading-relaxed">
                    Your partner application is being verified by the Online Bar Command. Access to tactical links will be granted upon authorization.
                </p>
            </div>
            <Link href="/affiliate/dashboard">
                <Button className="h-16 px-10 rounded-2xl bg-primary text-white font-black uppercase text-xs tracking-widest active:scale-95 transition-all shadow-xl shadow-primary/20">
                    Enter Dashboard
                </Button>
            </Link>
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-50 py-16 px-4 sm:px-6 lg:px-8 text-left selection:bg-primary/20">
            <div className="max-w-4xl mx-auto space-y-12">

                <header className="border-b border-slate-200 pb-10">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="h-10 w-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 shadow-sm border border-indigo-100"><Rocket size={20} /></div>
                        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-500">Partner with the Grid</span>
                    </div>
                    <h1 className="text-4xl lg:text-6xl font-black text-foreground uppercase tracking-tighter leading-none">Become an <br /> <span className="text-primary italic">Affiliate Partner.</span></h1>
                    <p className="text-slate-500 text-lg font-medium mt-4 italic max-w-2xl leading-relaxed">
                        Authorize your marketing nodes and start earning commission on every premium bottle dispatched through your network.
                    </p>
                </header>

                <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                    <div className="lg:col-span-7 space-y-8">
                        <Card className="p-10 rounded-[3.5rem] bg-white border border-slate-100 shadow-sm space-y-8">
                            <h2 className="text-xl font-black text-foreground uppercase tracking-tight flex items-center gap-3">
                                <Users className="h-5 w-5 text-primary" /> Marketer Profile
                            </h2>

                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Business / Display Name</label>
                                    <Input required value={formData.business_name} onChange={e => setFormData({...formData, business_name: e.target.value})} placeholder="e.g. David Tech Reviews" className="h-14 rounded-2xl bg-slate-50 border-slate-100 font-bold" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Short Bio / Strategy</label>
                                    <textarea required value={formData.bio} onChange={e => setFormData({...formData, bio: e.target.value})} placeholder="How do you plan to promote the bar?" className="w-full h-32 rounded-[2rem] bg-slate-50 border border-slate-100 p-6 text-sm font-medium outline-none focus:ring-4 focus:ring-primary/5 transition-all resize-none" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Est. Audience Size</label>
                                    <Input type="number" required value={formData.audience_size} onChange={e => setFormData({...formData, audience_size: e.target.value})} placeholder="e.g. 5000" className="h-14 rounded-2xl bg-slate-50 border-slate-100 font-bold" />
                                </div>
                            </div>
                        </Card>

                        <Card className="p-10 rounded-[3.5rem] bg-white border border-slate-100 shadow-sm space-y-8">
                            <h2 className="text-xl font-black text-foreground uppercase tracking-tight flex items-center gap-3">
                                <ShieldCheck className="h-5 w-5 text-primary" /> Payout Nodes
                            </h2>
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Payout Method</label>
                                    <select value={formData.preferred_payout_method} onChange={e => setFormData({...formData, preferred_payout_method: e.target.value})} className="w-full h-14 px-6 rounded-2xl bg-slate-50 border border-slate-100 text-sm font-bold uppercase outline-none">
                                        <option value="M-Pesa">M-Pesa (Kenya)</option>
                                        <option value="Bank">Bank Transfer</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Payment Identifier (Phone/Account)</label>
                                    <Input required value={formData.payout_details} onChange={e => setFormData({...formData, payout_details: e.target.value})} placeholder="e.g. 07XXXXXXXX" className="h-14 rounded-2xl bg-slate-50 border-slate-100 font-bold" />
                                </div>
                            </div>
                        </Card>
                    </div>

                    <div className="lg:col-span-5 space-y-8">
                        <Card className="p-10 rounded-[3.5rem] bg-white border border-slate-100 shadow-sm space-y-8 text-left">
                            <h2 className="text-xl font-black text-foreground uppercase tracking-tight">Active Channels</h2>
                            <div className="grid grid-cols-2 gap-3">
                                {channels.map(ch => (
                                    <button
                                        key={ch.id}
                                        type="button"
                                        onClick={() => toggleChannel(ch.id)}
                                        className={cn(
                                            "p-6 rounded-[2rem] border-2 transition-all flex flex-col items-center gap-4 group",
                                            formData.primary_channels.includes(ch.id)
                                                ? "border-primary bg-primary/5 text-primary shadow-lg"
                                                : "border-slate-50 bg-slate-50/50 text-slate-300 hover:border-primary/20"
                                        )}
                                    >
                                        <ch.icon size={24} />
                                        <span className="text-[9px] font-black uppercase tracking-widest">{ch.id}</span>
                                    </button>
                                ))}
                            </div>
                            <p className="text-[10px] text-slate-400 font-medium italic leading-relaxed text-center px-4">
                                &quot;Multi-channel attribution is enabled by default for all authorized partners.&quot;
                            </p>
                        </Card>

                        <div className="pt-6">
                            <Button
                                type="submit"
                                disabled={loading}
                                className="w-full h-24 rounded-[2.5rem] bg-primary text-white font-black uppercase text-sm tracking-[0.4em] shadow-2xl shadow-primary/20 hover:bg-primary/90 transition-all active:scale-95"
                            >
                                {loading ? <Loader2 className="animate-spin h-6 w-6" /> : "Deploy Application"}
                            </Button>
                        </div>

                        <div className="p-8 bg-slate-900 rounded-[2.5rem] text-white space-y-6 relative overflow-hidden shadow-2xl">
                            <div className="relative z-10 flex items-center gap-4">
                                <div className="h-10 w-10 rounded-xl bg-white/10 flex items-center justify-center backdrop-blur-md border border-white/20 shadow-sm"><ShieldCheck size={20} className="text-primary" /></div>
                                <h3 className="text-lg font-black uppercase tracking-tight">Partner Integrity</h3>
                            </div>
                            <p className="relative z-10 text-[10px] text-slate-400 font-medium leading-relaxed italic">
                                &quot;All applications undergo manual compliance review to ensure alignment with premium beverage marketing standards.&quot;
                            </p>
                            <Rocket className="absolute -bottom-6 -right-6 h-32 w-32 text-white/5 -rotate-12" />
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}
