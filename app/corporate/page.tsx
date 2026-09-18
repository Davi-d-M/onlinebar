'use client';

import * as React from 'react';
import {
    Briefcase,
    Calendar,
    Users,
    Wine,
    ArrowRight,
    ShieldCheck,
    FileText,
    Globe,
    Building2,
    Target,
    CheckCircle2,
    Zap,
    X,
    Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useSettings } from '@/lib/useSettings';
import { supabase } from '@/lib/supabaseClient';

export default function CorporatePortal() {
    const { settings } = useSettings();
    const [guestCount, setGuestCount] = React.useState(50);
    const [durationHours, setDurationHours] = React.useState(4);

    // Form State
    const [isFormOpen, setIsFormOpen] = React.useState(false);
    const [isSubmitting, setIsSubmitting] = React.useState(false);
    const [submitted, setSubmitted] = React.useState(false);
    const [form, setForm] = React.useState({
        company: '',
        contact_name: '',
        email: '',
        phone: '',
        requirements: ''
    });

    const estimates = React.useMemo(() => {
        // High-level beverage volume estimates for events
        const perPersonPerHour = 1.5; // Average drinks
        const totalDrinks = guestCount * durationHours * perPersonPerHour;

        return {
            wine: Math.ceil(totalDrinks * 0.3 / 5), // 5 glasses per bottle
            whiskey: Math.ceil(totalDrinks * 0.2 / 25), // 25 tots per bottle
            beer: Math.ceil(totalDrinks * 0.5),
            softs: Math.ceil(guestCount * 2)
        };
    }, [guestCount, durationHours]);

    const handleInquirySubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!supabase) return;
        setIsSubmitting(true);

        try {
            const { error } = await supabase.from('messages').insert([{
                name: form.contact_name,
                email: form.email,
                subject: 'CORPORATE_INQUIRY',
                message: `Company: ${form.company}\nPhone: ${form.phone}\nGuests: ${guestCount}\nDuration: ${durationHours}h\nRequirements: ${form.requirements}`,
                status: 'New'
            }]);

            if (error) throw error;
            setSubmitted(true);
            setTimeout(() => {
                setIsFormOpen(false);
                setSubmitted(false);
                setForm({ company: '', contact_name: '', email: '', phone: '', requirements: '' });
            }, 3000);
        } catch (err) {
            console.error(err);
            alert("Uplink Failure. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 text-left selection:bg-primary/20 pb-40">
            <div className="max-w-7xl mx-auto space-y-12">

                <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-10 border-b border-slate-200 pb-10">
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-xl bg-slate-100 flex items-center justify-center text-primary shadow-sm border border-slate-200"><Building2 size={20} /></div>
                            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Executive B2B Terminal</span>
                        </div>
                        <h1 className="text-4xl lg:text-7xl font-black text-foreground uppercase tracking-tighter leading-none">
                            The <br /> <span className="text-primary italic">Corporate Bar.</span>
                        </h1>
                        <p className="text-slate-500 text-lg font-medium italic max-w-xl leading-relaxed">
                            &quot;Institutional hospitality, refined. We power office events, high-stakes meetings, and premium corporate gifting at scale.&quot;
                        </p>
                    </div>

                    <Card className="p-8 rounded-[3rem] bg-white border border-slate-100 shadow-2xl flex items-center gap-6 group hover:scale-[1.02] transition-all">
                        <div className="h-16 w-16 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 shadow-inner group-hover:rotate-6 transition-transform">
                            <ShieldCheck size={32} />
                        </div>
                        <div>
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Client Rank</p>
                            <h3 className="text-xl font-black text-foreground uppercase tracking-tight">Institutional</h3>
                            <span className="text-[8px] font-bold text-emerald-600 uppercase">Priority Dispatch Active</span>
                        </div>
                    </Card>
                </header>

                <div className="grid lg:grid-cols-12 gap-10">

                    {/* LEFT: EVENT PLANNER */}
                    <div className="lg:col-span-8 space-y-10">
                        <Card className="p-10 rounded-[3.5rem] bg-white border border-slate-100 shadow-sm space-y-12 text-left">
                            <div className="flex items-center gap-4 border-b border-slate-50 pb-8">
                                <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary"><Calendar size={24} /></div>
                                <div>
                                    <h2 className="text-2xl font-black uppercase tracking-tighter">Event Planner</h2>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Volume Estimation Node</p>
                                </div>
                            </div>

                            <div className="grid sm:grid-cols-2 gap-12">
                                <div className="space-y-8">
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center">
                                            <label className="text-[10px] font-black uppercase text-foreground tracking-widest">Guest Count</label>
                                            <span className="text-xl font-black text-primary">{guestCount}</span>
                                        </div>
                                        <input
                                            type="range"
                                            min="10"
                                            max="500"
                                            step="10"
                                            value={guestCount}
                                            onChange={e => setGuestCount(Number(e.target.value))}
                                            className="w-full accent-primary h-1.5 bg-slate-100 rounded-full appearance-none cursor-pointer"
                                        />
                                    </div>

                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center">
                                            <label className="text-[10px] font-black uppercase text-foreground tracking-widest">Duration (Hours)</label>
                                            <span className="text-xl font-black text-primary">{durationHours}h</span>
                                        </div>
                                        <input
                                            type="range"
                                            min="1"
                                            max="12"
                                            value={durationHours}
                                            onChange={e => setDurationHours(Number(e.target.value))}
                                            className="w-full accent-primary h-1.5 bg-slate-100 rounded-full appearance-none cursor-pointer"
                                        />
                                    </div>
                                </div>

                                <div className="bg-slate-50 p-8 rounded-[2.5rem] border border-slate-100 space-y-6">
                                    <h4 className="text-xs font-black uppercase text-slate-400 tracking-widest">Estimated Manifest</h4>
                                    <div className="grid grid-cols-2 gap-4">
                                        {[
                                            { label: 'Wine Bottles', val: estimates.wine, icon: Wine },
                                            { label: 'Spirits', val: estimates.whiskey, icon: Target },
                                            { label: 'Beer Units', val: estimates.beer, icon: Zap },
                                            { label: 'Mixers/Softs', val: estimates.softs, icon: Globe },
                                        ].map(node => (
                                            <div key={node.label} className="p-4 bg-white rounded-2xl border border-slate-100 shadow-sm text-left">
                                                <node.icon size={14} className="text-primary mb-3" />
                                                <p className="text-lg font-black text-foreground leading-none">{node.val}</p>
                                                <p className="text-[8px] font-black text-slate-400 uppercase mt-1 tracking-tighter">{node.label}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="pt-8 border-t border-slate-50 flex justify-end">
                                <Button
                                    onClick={() => setIsFormOpen(true)}
                                    className="h-16 px-12 rounded-2xl bg-primary text-white font-black uppercase text-xs tracking-[0.2em] shadow-xl shadow-primary/20 active:scale-95 transition-all flex items-center gap-3"
                                >
                                    Generate Executive Quote <ArrowRight size={18} />
                                </Button>
                            </div>
                        </Card>

                        <div className="grid sm:grid-cols-2 gap-6">
                            <Card className="p-10 rounded-[3rem] bg-white border border-slate-100 shadow-sm space-y-6 text-left group hover:border-indigo-100 transition-all">
                                <div className="h-12 w-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 group-hover:scale-110 transition-transform"><FileText size={24} /></div>
                                <h3 className="text-xl font-black uppercase tracking-tighter">Tax Invoices</h3>
                                <p className="text-[10px] text-slate-500 font-medium italic leading-relaxed">
                                    &quot;Full KRA-compliant tax invoices provided for all institutional dispatches. Simplify your accounting node.&quot;
                                </p>
                            </Card>
                            <Card className="p-10 rounded-[3rem] bg-white border border-slate-100 shadow-sm space-y-6 text-left group hover:border-emerald-100 transition-all">
                                <div className="h-12 w-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform"><Users size={24} /></div>
                                <h3 className="text-xl font-black uppercase tracking-tighter">Account Management</h3>
                                <p className="text-[10px] text-slate-500 font-medium italic leading-relaxed">
                                    &quot;Dedicated executive handler assigned to high-volume institutional accounts for recurring restocks.&quot;
                                </p>
                            </Card>
                        </div>
                    </div>

                    {/* RIGHT: BENEFITS */}
                    <div className="lg:col-span-4 space-y-8">
                        <Card className="p-10 rounded-[3.5rem] bg-white border border-slate-100 shadow-sm space-y-10 relative overflow-hidden group hover:border-primary/20 transition-all">
                            <div className="relative z-10 space-y-8 text-left">
                                <div className="flex items-center gap-4">
                                    <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/10"><Briefcase size={24} className="text-primary" /></div>
                                    <h3 className="text-2xl font-black uppercase tracking-tighter leading-none text-foreground">B2B Perks</h3>
                                </div>

                                <div className="space-y-4">
                                    {[
                                        'Bulk Inventory Discounts',
                                        'Priority Dispatch Window',
                                        'Recurring Order Protocol',
                                        'Custom Gifting Solutions',
                                        'Executive Event Staffing'
                                    ].map(perk => (
                                        <div key={perk} className="flex items-center gap-4 py-3 border-b border-white/5 last:border-0">
                                            <CheckCircle2 size={16} className="text-primary" />
                                            <span className="text-[11px] font-black uppercase tracking-widest text-slate-300">{perk}</span>
                                        </div>
                                    ))}
                                </div>

                                <Button
                                    onClick={() => setIsFormOpen(true)}
                                    className="w-full h-16 rounded-2xl bg-primary text-white font-black uppercase text-xs tracking-widest shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all"
                                >
                                    Initialize Corporate Account
                                </Button>
                            </div>
                            <div className="absolute -bottom-10 -left-10 h-64 w-64 bg-primary/10 rounded-full blur-3xl opacity-20"></div>
                        </Card>

                        {/* CORPORATE LEAD MODAL */}
                        {isFormOpen && (
                            <div className="fixed inset-0 z-[6000] flex items-center justify-center p-4 bg-slate-900/10 backdrop-blur-md animate-in fade-in duration-300">
                                <Card className="max-w-xl w-full p-8 sm:p-12 rounded-[3rem] bg-white border border-slate-100 shadow-2xl relative animate-in zoom-in-95 duration-500 overflow-hidden">
                                    <button onClick={() => setIsFormOpen(false)} className="absolute top-8 right-8 text-slate-300 hover:text-foreground transition-colors"><X size={24}/></button>

                                    {submitted ? (
                                        <div className="py-20 text-center space-y-6 animate-in zoom-in-95">
                                            <div className="h-20 w-20 rounded-[2rem] bg-emerald-50 text-emerald-500 mx-auto flex items-center justify-center shadow-inner"><CheckCircle2 size={40} /></div>
                                            <div className="space-y-2">
                                                <h3 className="text-2xl font-black uppercase tracking-tighter">Payload Received.</h3>
                                                <p className="text-slate-500 font-medium italic italic px-10 leading-relaxed">
                                                    &quot;Your executive inquiry has been transmitted to our corporate desk. An account manager will reach out shortly.&quot;
                                                </p>
                                            </div>
                                        </div>
                                    ) : (
                                        <form onSubmit={handleInquirySubmit} className="space-y-8 text-left">
                                            <div className="space-y-2">
                                                <h3 className="text-2xl font-black uppercase tracking-tighter">Corporate Inquiry</h3>
                                                <p className="text-[10px] font-black uppercase text-primary tracking-widest">Protocol: Institutional Onboarding</p>
                                            </div>

                                            <div className="space-y-4">
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="space-y-1">
                                                        <label className="text-[9px] font-black uppercase text-slate-400 ml-1">Company Name</label>
                                                        <Input required value={form.company} onChange={e => setForm({...form, company: e.target.value})} className="h-12 rounded-xl bg-slate-50 border-slate-100 font-bold" />
                                                    </div>
                                                    <div className="space-y-1">
                                                        <label className="text-[9px] font-black uppercase text-slate-400 ml-1">Contact Name</label>
                                                        <Input required value={form.contact_name} onChange={e => setForm({...form, contact_name: e.target.value})} className="h-12 rounded-xl bg-slate-50 border-slate-100 font-bold" />
                                                    </div>
                                                </div>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="space-y-1">
                                                        <label className="text-[9px] font-black uppercase text-slate-400 ml-1">Work Email</label>
                                                        <Input required type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="h-12 rounded-xl bg-slate-50 border-slate-100 font-bold" />
                                                    </div>
                                                    <div className="space-y-1">
                                                        <label className="text-[9px] font-black uppercase text-slate-400 ml-1">Phone Number</label>
                                                        <Input required value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} className="h-12 rounded-xl bg-slate-50 border-slate-100 font-bold" />
                                                    </div>
                                                </div>
                                                <div className="space-y-1">
                                                    <label className="text-[9px] font-black uppercase text-slate-400 ml-1">Event Requirements</label>
                                                    <Textarea required value={form.requirements} onChange={e => setForm({...form, requirements: e.target.value})} placeholder="Describe your event or bulk needs..." className="min-h-[100px] rounded-2xl bg-slate-50 border-slate-100 font-medium resize-none p-4" />
                                                </div>
                                            </div>

                                            <Button type="submit" disabled={isSubmitting} className="w-full h-16 rounded-2xl bg-primary text-white font-black uppercase text-xs tracking-widest shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all">
                                                {isSubmitting ? <Loader2 className="animate-spin" /> : 'Submit Inquiry'}
                                            </Button>
                                        </form>
                                    )}

                                    <div className="absolute -bottom-10 -right-10 h-48 w-48 bg-primary/5 rounded-full blur-3xl"></div>
                                </Card>
                            </div>
                        )}

                        <div className="p-10 rounded-[3rem] bg-indigo-600 text-white space-y-6 text-left relative overflow-hidden shadow-xl">
                            <h4 className="text-sm font-black uppercase tracking-[0.3em] opacity-60">Office Pulse</h4>
                            <p className="text-lg font-black tracking-tight leading-tight italic">
                                &quot;Powering the Nairobi Friday 5 PM culture with chilled dispatches across the CBD and Westlands.&quot;
                            </p>
                            <Zap className="absolute -bottom-4 -right-4 h-24 w-24 text-white/5 rotate-12" />
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
