'use client';

import * as React from 'react';
import {
    Sparkles,
    ShoppingBag,
    Zap
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { cn, formatPrice } from '@/lib/utils';
import { NeuralSommelier, PairingNode } from '@/lib/engines/sommelierEngine';
import Image from 'next/image';
import { useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/button';

export default function PerfectPairingNode({ productId, category }: { productId: number, category: string }) {
    const [pairings, setPairings] = React.useState<PairingNode[]>([]);
    const [loading, setLoading] = React.useState(true);
    const { addToCart } = useCart();

    React.useEffect(() => {
        async function loadPairings() {
            const data = await NeuralSommelier.getPerfectPairings(productId, category);
            setPairings(data);
            setLoading(false);
        }
        loadPairings();
    }, [productId, category]);

    if (loading) return <div className="h-48 bg-slate-50 rounded-[3rem] animate-pulse" />;
    if (pairings.length === 0) return null;

    return (
        <section className="space-y-6 animate-in fade-in duration-1000">
            <header className="flex items-center gap-3 px-4">
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-sm"><Sparkles size={20} fill="currentColor" /></div>
                <div>
                    <h3 className="text-xl font-black uppercase tracking-tighter text-foreground leading-none">Perfect Pairings</h3>
                    <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest mt-1">Curated by AI Sommelier</p>
                </div>
            </header>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {pairings.map((p) => (
                    <Card key={p.id} className="p-6 rounded-[2.5rem] bg-white border border-slate-100 shadow-sm hover:shadow-xl transition-all group overflow-hidden relative">
                        <div className="flex items-center gap-6 relative z-10 text-left">
                            <div className="h-20 w-20 rounded-[1.5rem] bg-slate-50 border border-slate-100 flex items-center justify-center p-3 shrink-0 relative overflow-hidden group-hover:scale-105 transition-transform">
                                <Image src={p.image_url || '/placeholder.jpg'} alt="" fill className="object-contain p-2" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-[9px] font-black uppercase text-primary tracking-widest mb-1">{p.reason}</p>
                                <h4 className="text-sm font-black uppercase text-foreground truncate">{p.name}</h4>
                                <div className="flex items-center justify-between mt-4">
                                    <p className="text-lg font-black text-foreground">{formatPrice(p.price)}</p>
                                    <Button
                                        size="sm"
                                        onClick={() => addToCart({ id: p.id, name: p.name, price: p.price, base_price: p.price, image: p.image_url, quantity: 1 })}
                                        className="h-10 px-6 rounded-xl bg-slate-900 text-white font-black uppercase text-[8px] tracking-widest active:scale-95 transition-all"
                                    >
                                        <ShoppingBag size={12} className="mr-2" /> Add
                                    </Button>
                                </div>
                            </div>
                        </div>
                        <Zap className="absolute -bottom-4 -right-4 h-16 w-16 text-primary/5 rotate-12" />
                    </Card>
                ))}
            </div>
        </section>
    );
}
