'use client';

import * as React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Megaphone, Zap, Target, Loader2, CheckCircle2, DollarSign } from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabaseClient';

export default function MerchantPromo() {
    const [loading, setLoading] = React.useState(false);
    const [success, setSuccess] = React.useState(false);
    const [budget, setBudget] = React.useState('5000');
    const [selectedProduct, setSelectedProduct] = React.useState('');
    const [myProducts, setMyProducts] = React.useState<{id: number, name: string}[]>([]);

    React.useEffect(() => {
        async function loadProds() {
            if (!supabase) return;
            const { data } = await supabase.from('products').select('id, name').limit(10);
            if (data) setMyProducts(data);
        }
        loadProds();
    }, []);

    const handleLaunch = async () => {
        setLoading(true);
        try {
            // Simulated campaign creation
            await new Promise(r => setTimeout(r, 1500));
            setSuccess(true);
            setTimeout(() => setSuccess(false), 5000);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className="p-10 rounded-[3.5rem] bg-white border border-slate-100 shadow-2xl relative overflow-hidden group text-left">
            <div className="relative z-10 space-y-10">
                <header className="flex justify-between items-start">
                    <div className="space-y-2">
                        <div className="flex items-center gap-3">
                            <Megaphone className="h-6 w-6 text-primary" />
                            <h2 className="text-3xl font-black uppercase tracking-tighter text-foreground leading-none">Promote My Product</h2>
                        </div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">Merchant Self-Service Growth Node</p>
                    </div>
                </header>

                <div className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-[9px] font-black uppercase text-slate-400 ml-1">Select Target Beverage</label>
                        <select
                            value={selectedProduct}
                            onChange={e => setSelectedProduct(e.target.value)}
                            className="w-full h-14 rounded-2xl bg-slate-50 border border-slate-100 px-6 font-bold text-foreground outline-none focus:ring-2 focus:ring-primary"
                        >
                            <option value="">Choose a product from your cellar...</option>
                            {myProducts.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[9px] font-black uppercase text-slate-400 ml-1">Daily Spend Budget (KES)</label>
                            <div className="relative">
                                <Input
                                    type="number"
                                    value={budget}
                                    onChange={e => setBudget(e.target.value)}
                                    className="h-14 rounded-2xl bg-slate-50 border-slate-100 pl-12 font-black text-lg"
                                />
                                <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[9px] font-black uppercase text-slate-400 ml-1">Strategy Profile</label>
                            <div className="flex gap-2">
                                {['Aggressive', 'Balanced'].map(s => (
                                    <button
                                        key={s}
                                        className={cn(
                                            "flex-1 h-14 rounded-2xl border-2 transition-all text-[10px] font-black uppercase tracking-widest",
                                            s === 'Aggressive' ? "border-primary bg-primary/5 text-primary" : "border-slate-100 text-slate-400"
                                        )}
                                    >
                                        {s}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-6 bg-emerald-50/50 rounded-3xl border border-emerald-100 flex items-start gap-4">
                    <Target size={20} className="text-emerald-500 mt-0.5 shrink-0" />
                    <p className="text-[10px] text-emerald-700 font-medium leading-relaxed italic">
                        &quot;Your product will be prioritized in &apos;Trending&apos; sections and featured in AI Concierge recommendations for patrons in your delivery zone.&quot;
                    </p>
                </div>

                <Button
                    onClick={handleLaunch}
                    disabled={loading || !selectedProduct}
                    className="w-full h-18 rounded-[2rem] bg-slate-900 text-white font-black uppercase text-xs tracking-[0.2em] shadow-2xl active:scale-95 transition-all flex items-center justify-center gap-4 group/btn"
                >
                    {loading ? <Loader2 className="animate-spin" /> : success ? <><CheckCircle2 /> Campaign Live</> : <><Zap /> Ignite Growth Sequence</>}
                </Button>
            </div>
            <Megaphone className="absolute -bottom-20 -left-20 h-64 w-64 text-slate-50 -z-0 rotate-12" />
        </Card>
    );
}
