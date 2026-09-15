'use client';

import * as React from 'react';
import { Card } from '@/components/ui/card';
import {
    Moon,
    Users,
    ArrowRight,
    Sparkles,
    Wine,
    Heart,
    Zap,
    Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn, formatPrice } from '@/lib/utils';
import { supabase } from '@/lib/supabaseClient';
import { useCart } from '@/context/CartContext';
import Image from 'next/image';

const OCCASIONS = [
    { id: 'CELEBRATION', label: 'Celebration', icon: Sparkles, color: 'bg-primary/10 text-primary' },
    { id: 'DATE_NIGHT', label: 'Date Night', icon: Heart, color: 'bg-rose-50 text-rose-500' },
    { id: 'PARTY', label: 'House Party', icon: Users, color: 'bg-indigo-50 text-indigo-500' },
    { id: 'DINNER', label: 'Dinner Tonight', icon: Wine, color: 'bg-emerald-50 text-emerald-500' },
    { id: 'CHILL', label: 'Chill Night', icon: Moon, color: 'bg-slate-100 text-slate-500' },
    { id: 'GIFT', label: 'Premium Gift', icon: Zap, color: 'bg-amber-50 text-amber-600' },
];

const BUDGETS = [
    { id: '2K', label: 'Under 2.5K', val: 2500 },
    { id: '5K', label: '2.5K - 5K', val: 5000 },
    { id: '10K', label: '5K - 10K', val: 10000 },
    { id: '20K', label: '10K - 20K+', val: 20000 },
];

interface BuildResult {
    id: number;
    name: string;
    price: number;
    image_url: string;
    category: string;
}

export default function BuildMyNightWidget() {
    const [step, setStep] = React.useState(1);
    const [occasion, setOccasion] = React.useState<string | null>(null);
    const [budget, setBudget] = React.useState<number | null>(null);
    const [loading, setLoading] = React.useState(false);
    const [results, setResults] = React.useState<BuildResult[]>([]);
    const { addBundleToCart } = useCart();

    const handleGenerate = async () => {
        if (!occasion || !budget || !supabase) return;
        setLoading(true);
        try {
            const { data } = await supabase
                .from('products')
                .select('id, name, price, image_url, category')
                .lte('price', budget)
                .order('rating', { ascending: false })
                .limit(4);

            if (data) setResults(data as BuildResult[]);
            setStep(3);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleAddAll = () => {
        const items = results.map(r => ({
            id: r.id,
            name: r.name,
            price: r.price,
            base_price: r.price,
            image: r.image_url,
            quantity: 1,
            category: r.category
        }));
        addBundleToCart(items);
        alert("Your night has been established in the bag! 🥂");
    };

    const handleOccasionSelect = (id: string) => {
        setOccasion(id);
        setStep(2);
    };

    return (
        <section className="max-w-7xl mx-auto px-6 sm:px-12 lg:px-20 py-24">
            <div className="grid lg:grid-cols-12 gap-16 items-center">

                {/* LEFT: CONTENT */}
                <div className="lg:col-span-5 space-y-10 text-left">
                    <div className="space-y-4">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 rounded-full text-[9px] font-black uppercase tracking-widest text-primary border border-primary/20">
                            <Sparkles size={12} /> Digital Concierge
                        </div>
                        <h2 className="text-5xl lg:text-7xl font-serif font-black uppercase tracking-tighter text-foreground leading-[0.85]">
                            Build My <br /> <span className="text-primary italic">Night.</span>
                        </h2>
                        <p className="text-slate-500 font-medium text-lg leading-relaxed italic max-w-sm">
                            &quot;Planning the perfect evening shouldn&apos;t be tactical. Select your occasion, set your budget, and I will handle the inventory.&quot;
                        </p>
                    </div>

                    {step < 3 && (
                         <div className="flex items-center gap-4">
                            {[1, 2].map(s => (
                                <div key={s} className={cn(
                                    "h-1.5 w-12 rounded-full transition-all duration-500",
                                    step === s ? "bg-primary" : "bg-slate-100"
                                )} />
                            ))}
                        </div>
                    )}
                </div>

                {/* RIGHT: INTERACTIVE HUD */}
                <div className="lg:col-span-7">
                    <Card className="p-10 rounded-[3.5rem] bg-white border border-slate-100 shadow-2xl relative overflow-hidden group min-h-[500px] flex flex-col justify-between">

                        {step === 1 && (
                            <div className="space-y-10 animate-in fade-in slide-in-from-right-8 duration-700">
                                <h3 className="text-2xl font-black uppercase tracking-tighter text-foreground">What are you planning?</h3>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                    {OCCASIONS.map(occ => (
                                        <button
                                            key={occ.id}
                                            onClick={() => handleOccasionSelect(occ.id)}
                                            className={cn(
                                                "p-6 rounded-[2rem] border-2 transition-all flex flex-col items-center gap-4 group/occ",
                                                occasion === occ.id ? "border-primary bg-primary/5" : "border-slate-50 bg-slate-50/50 hover:border-slate-100 hover:bg-white"
                                            )}
                                        >
                                            <div className={cn("h-12 w-12 rounded-2xl flex items-center justify-center transition-transform group/occ:scale-110 shadow-sm", occ.color)}>
                                                <occ.icon size={24} />
                                            </div>
                                            <span className="text-[10px] font-black uppercase tracking-widest">{occ.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {step === 2 && (
                            <div className="space-y-10 animate-in fade-in slide-in-from-right-8 duration-700">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-2xl font-black uppercase tracking-tighter text-foreground">Set your budget</h3>
                                    <button onClick={() => setStep(1)} className="text-[10px] font-black text-slate-400 uppercase hover:text-primary">Back</button>
                                </div>
                                <div className="grid sm:grid-cols-2 gap-4">
                                    {BUDGETS.map(bug => (
                                        <button
                                            key={bug.id}
                                            onClick={() => setBudget(bug.val)}
                                            className={cn(
                                                "p-8 rounded-[2.5rem] border-2 transition-all flex justify-between items-center group/bug",
                                                budget === bug.val ? "border-primary bg-primary/5" : "border-slate-50 bg-slate-50 hover:border-slate-100 hover:bg-white"
                                            )}
                                        >
                                            <span className="text-lg font-black uppercase tracking-tighter">{bug.label}</span>
                                            <div className={cn(
                                                "h-6 w-6 rounded-full border-2 flex items-center justify-center transition-all",
                                                budget === bug.val ? "border-primary bg-primary" : "border-slate-200"
                                            )}>
                                                {budget === bug.val && <div className="h-2 w-2 bg-white rounded-full animate-in zoom-in" />}
                                            </div>
                                        </button>
                                    ))}
                                </div>
                                <Button
                                    onClick={handleGenerate}
                                    disabled={loading || !budget}
                                    className="w-full h-18 rounded-[2rem] bg-primary text-white font-black uppercase text-xs tracking-[0.3em] shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
                                >
                                    {loading ? <Loader2 className="animate-spin" /> : "Establish Experience Protocol"}
                                </Button>
                            </div>
                        )}

                        {step === 3 && (
                            <div className="space-y-10 animate-in fade-in zoom-in-95 duration-700">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="text-2xl font-black uppercase tracking-tighter text-foreground leading-none">Your Night is Ready</h3>
                                        <p className="text-[10px] font-black text-primary uppercase tracking-widest mt-2">{occasion?.replace('_', ' ')} &bull; {formatPrice(budget!)} Limit</p>
                                    </div>
                                    <button onClick={() => setStep(1)} className="text-[10px] font-black text-slate-400 uppercase hover:text-primary underline">Restart</button>
                                </div>

                                <div className="grid gap-3">
                                    {results.map(prod => (
                                        <div key={prod.id} className="p-4 rounded-3xl bg-slate-50 border border-slate-100 flex items-center justify-between group hover:bg-white hover:shadow-xl transition-all">
                                            <div className="flex items-center gap-4">
                                                <div className="h-14 w-14 rounded-2xl bg-white p-2 border border-slate-100 flex items-center justify-center relative overflow-hidden">
                                                    <Image src={prod.image_url || '/placeholder.jpg'} alt="" fill className="object-contain p-2" />
                                                </div>
                                                <div className="text-left">
                                                    <p className="text-[11px] font-black uppercase text-foreground leading-none truncate max-w-[150px]">{prod.name}</p>
                                                    <p className="text-[9px] font-bold text-slate-400 uppercase mt-1 tracking-widest">{prod.category}</p>
                                                </div>
                                            </div>
                                            <span className="text-sm font-black text-primary">{formatPrice(prod.price)}</span>
                                        </div>
                                    ))}
                                </div>

                                <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
                                    <div>
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Experience Total</p>
                                        <p className="text-2xl font-black text-foreground">{formatPrice(results.reduce((s, r) => s + Number(r.price), 0))}</p>
                                    </div>
                                    <Button onClick={handleAddAll} className="h-16 px-10 rounded-2xl bg-primary text-white font-black uppercase text-[10px] tracking-widest shadow-2xl active:scale-95 transition-all flex items-center gap-3">
                                        Add Entire Selection <ArrowRight size={16} />
                                    </Button>
                                </div>
                            </div>
                        )}

                    </Card>
                </div>

            </div>
        </section>
    );
}
