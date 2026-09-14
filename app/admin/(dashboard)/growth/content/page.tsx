'use client';

import * as React from 'react';
import { supabase } from '@/lib/supabaseClient';
import {
    Layout,
    Plus,
    Sparkles,
    Rocket,
    ShieldAlert,
    Clock,
    Zap,
    Loader2,
    Camera as Instagram,
    MessageCircle,
    Music,
    ArrowRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { cn, formatPrice } from '@/lib/utils';
import Image from 'next/image';



export default function ContentCommandStudio() {
    const [step, setStep] = React.useState(1);
    const [title, setTitle] = React.useState('');
    const [desc, setDesc] = React.useState('');
    const [selectedProducts, setSelectedProducts] = React.useState<Array<{ id: number, name: string, price: number, image_url: string }>>([]);
    const [products, setProducts] = React.useState<Array<{ id: number, name: string, price: number, image_url: string }>>([]);
    const [generating, setGenerating] = React.useState(false);
    const [variants, setVariants] = React.useState<Array<{ platform: string, icon: React.ComponentType<{ size?: number }>, color: string, caption: string, cta: string }>>([]);

    React.useEffect(() => {
        async function fetchProducts() {
            if (!supabase) return;
            const { data } = await supabase.from('products').select('*').limit(5);
            if (data) setProducts(data);
        }
        fetchProducts();
    }, []);

    const handleAdapt = () => {
        setGenerating(true);
        // Simulated AI Adaptation Engine
        setTimeout(() => {
            setVariants([
                { platform: 'Instagram', icon: Instagram, color: 'text-rose-500', caption: `🚀 NEW ARRIVAL: ${title}. Premium selection now live. \n\n#OnlineBar #NairobiDispatch #Mixology`, cta: 'Link in Bio' },
                { platform: 'WhatsApp', icon: MessageCircle, color: 'text-emerald-500', caption: `*Tactical Alert* 🚨\n\nHello Patron! The new *${title}* is officially live in our cellar. \n\n🛒 Price: ${formatPrice(selectedProducts[0]?.price || 0)}\n\nOrder here: onlinebar.co.ke`, cta: 'Direct Message' },
                { platform: 'TikTok', icon: Music, color: 'text-black', caption: `The evolution of the bar. ${title} is here. 🔥 #NairobiNightlife #Cellar`, cta: 'Shop Now' },
            ]);
            setGenerating(false);
            setStep(2);
        }, 2000);
    };

    return (
        <div className="p-8 space-y-10 bg-slate-50 min-h-screen text-left selection:bg-primary/20 pb-40">
            <header className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 border-b border-slate-200 pb-8">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <Layout className="h-4 w-4 text-primary" />
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Growth Intelligence</span>
                    </div>
                    <h1 className="text-4xl font-black text-foreground uppercase tracking-tighter leading-none">Content Studio</h1>
                    <p className="text-muted-foreground text-sm font-medium mt-1">Design once, adapt everywhere. Orchestrate your brand narrative.</p>
                </div>
                <div className="flex gap-4">
                    <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl border border-slate-100 shadow-sm">
                        <Clock size={14} className="text-primary" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Scheduled: 12</span>
                    </div>
                    <Button className="rounded-xl h-12 px-8 bg-slate-900 text-white font-black uppercase text-[10px] tracking-widest shadow-xl hover:scale-105 active:scale-95 transition-all">
                        <Plus className="h-4 w-4 mr-2" /> New Master Campaign
                    </Button>
                </div>
            </header>

            <div className="grid lg:grid-cols-12 gap-10">

                {/* 1. CREATION HUB */}
                <div className="lg:col-span-8 space-y-8">
                    {step === 1 && (
                        <Card className="p-10 rounded-[3.5rem] bg-white border border-slate-100 shadow-sm space-y-10 animate-in fade-in slide-in-from-left-4 duration-700">
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-slate-400 ml-1 tracking-widest">Mission Title</label>
                                    <Input
                                        value={title}
                                        onChange={e => setTitle(e.target.value)}
                                        placeholder="e.g. Premium Weekend Drop"
                                        className="h-16 rounded-2xl bg-slate-50 border-slate-100 font-black text-lg uppercase tracking-tight"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-slate-400 ml-1 tracking-widest">Base Narrative</label>
                                    <Textarea
                                        value={desc}
                                        onChange={e => setDesc(e.target.value)}
                                        placeholder="Write the core story here..."
                                        className="min-h-[150px] rounded-3xl bg-slate-50 border-slate-100 p-8 text-sm font-medium leading-relaxed resize-none"
                                    />
                                </div>
                            </div>

                            <div className="space-y-6">
                                <p className="text-[10px] font-black uppercase text-slate-400 ml-1 tracking-widest">Link Tactical Payload (Products)</p>
                                <div className="grid sm:grid-cols-3 gap-3">
                                    {products.map(p => (
                                        <button
                                            key={p.id}
                                            onClick={() => setSelectedProducts(prev => prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p])}
                                            className={cn(
                                                "p-4 rounded-2xl border-2 transition-all text-left flex items-center gap-4 group",
                                                selectedProducts.includes(p) ? "border-primary bg-primary/5" : "border-slate-50 bg-slate-50 hover:border-slate-100"
                                            )}
                                        >
                                            <div className="h-10 w-10 rounded-xl bg-white border border-slate-100 relative overflow-hidden shrink-0">
                                                <Image src={p.image_url || '/placeholder.jpg'} alt="" fill className="object-contain" />
                                            </div>
                                            <span className="text-[9px] font-black uppercase leading-tight truncate">{p.name}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="pt-8 border-t border-slate-50 flex justify-end">
                                <Button
                                    onClick={handleAdapt}
                                    disabled={!title || generating}
                                    className="h-16 px-12 rounded-2xl bg-primary text-white font-black uppercase text-[10px] tracking-[0.2em] shadow-2xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-3"
                                >
                                    {generating ? <Loader2 className="animate-spin" /> : <><Sparkles size={16} /> Adapt Everywhere</>}
                                </Button>
                            </div>
                        </Card>
                    )}

                    {step === 2 && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-left-4 duration-700">
                            <div className="flex items-center justify-between px-4">
                                <h2 className="text-xl font-black uppercase tracking-tighter text-foreground">Platform Adaptations</h2>
                                <button onClick={() => setStep(1)} className="text-[10px] font-black text-primary uppercase underline">Back to Studio</button>
                            </div>

                            <div className="grid gap-6">
                                {variants.map(v => (
                                    <Card key={v.platform} className="p-8 rounded-[3rem] bg-white border border-slate-100 shadow-sm flex flex-col md:flex-row gap-8 group hover:shadow-xl transition-all">
                                        <div className="flex-1 space-y-6">
                                            <div className="flex items-center gap-3">
                                                <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center shadow-inner", v.color, "bg-slate-50")}>
                                                    <v.icon size={20} />
                                                </div>
                                                <span className="text-[10px] font-black uppercase tracking-widest text-foreground">{v.platform} Node</span>
                                            </div>
                                            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 italic text-sm font-medium text-slate-600 leading-relaxed">
                                                {v.caption}
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <span className="text-[8px] font-black uppercase text-slate-400">CTA: {v.cta}</span>
                                            </div>
                                        </div>
                                        <div className="w-full md:w-48 space-y-4">
                                            <p className="text-[8px] font-black uppercase text-slate-300">Format Preview</p>
                                            <div className="aspect-[4/5] bg-slate-200 rounded-2xl relative overflow-hidden border border-slate-300">
                                                <Image src={selectedProducts[0]?.image_url || '/placeholder.jpg'} alt="" fill className="object-contain p-4" />
                                            </div>
                                        </div>
                                    </Card>
                                ))}
                            </div>

                            <div className="pt-10 flex justify-end">
                                <Button className="h-20 px-20 rounded-[2rem] bg-slate-900 text-white font-black uppercase text-xs tracking-[0.3em] shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center gap-4">
                                    <Rocket size={24} /> Initiate Launch Sequence
                                </Button>
                            </div>
                        </div>
                    )}
                </div>

                {/* 2. COMPLIANCE & INTELLIGENCE */}
                <div className="lg:col-span-4 space-y-8">
                    <Card className="p-10 rounded-[3rem] bg-slate-900 text-white space-y-8 relative overflow-hidden shadow-2xl">
                        <div className="relative z-10 space-y-8 text-left">
                            <div className="flex items-center gap-4">
                                <div className="h-12 w-12 rounded-2xl bg-white/10 flex items-center justify-center backdrop-blur-md border border-white/20"><ShieldAlert size={24} className="text-primary" /></div>
                                <h3 className="text-xl font-black uppercase tracking-tighter">Compliance Engine</h3>
                            </div>

                            <div className="space-y-4">
                                {[
                                    { label: 'Alcohol Promotional Pricing', status: 'PASS', color: 'text-emerald-500' },
                                    { label: 'Minor-Targeted Language', status: 'PASS', color: 'text-emerald-500' },
                                    { label: 'Misleading Quality Claims', status: 'PASS', color: 'text-emerald-500' },
                                    { label: 'Platform Policy Review', status: 'PENDING', color: 'text-amber-500' },
                                ].map(rule => (
                                    <div key={rule.label} className="flex justify-between items-center py-3 border-b border-white/5">
                                        <span className="text-[10px] font-black uppercase text-slate-400">{rule.label}</span>
                                        <span className={cn("text-[9px] font-black uppercase", rule.color)}>{rule.status}</span>
                                    </div>
                                ))}
                            </div>

                            <p className="text-[9px] font-medium italic text-slate-500 leading-relaxed">
                                &quot;NACADA 2025 Protocol: Automated publishing held until manual validation of promotional mechanics.&quot;
                            </p>
                        </div>
                        <Zap size={64} className="absolute -bottom-6 -right-6 text-white/5 rotate-12" />
                    </Card>

                    <div className="p-8 rounded-[3rem] bg-white border border-slate-100 shadow-sm space-y-6 text-left group">
                        <div className="h-10 w-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 shadow-inner group-hover:rotate-6 transition-transform">
                            <ArrowRight size={20} />
                        </div>
                        <h4 className="text-lg font-black uppercase text-foreground leading-none tracking-tighter">Attribution Node</h4>
                        <p className="text-[10px] text-muted-foreground font-medium italic leading-relaxed">
                            &quot;All generated outbound URLs will automatically include encrypted tracking parameters to measure Social &rarr; Sales conversion.&quot;
                        </p>
                    </div>
                </div>

            </div>
        </div>
    );
}
