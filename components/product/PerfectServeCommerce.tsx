'use client';

import * as React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useCart } from '@/context/CartContext';
import { formatPrice, cn } from '@/lib/utils';
import { ShoppingBag, Zap, Check } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import Image from 'next/image';

interface Props {
    mainProduct: { id: number, name: string, price: number, image_url: string };
    mixerId?: number;
    glassware?: string;
}

export default function PerfectServeCommerce({ mainProduct, mixerId, glassware }: Props) {
    const { addBundleToCart } = useCart();
    const [mixer, setMixer] = React.useState<{ id: number, name: string, price: number, image_url: string } | null>(null);
    const [isAdding, setIsAdding] = React.useState(false);
    const [success, setSuccess] = React.useState(false);

    React.useEffect(() => {
        async function fetchMixer() {
            if (!mixerId || !supabase) return;
            const { data } = await supabase.from('products').select('id, name, price, image_url').eq('id', mixerId).single();
            if (data) setMixer(data);
        }
        fetchMixer();
    }, [mixerId]);

    const handleAddServe = () => {
        setIsAdding(true);
        const bundle = [{
            ...mainProduct,
            base_price: mainProduct.price,
            image: mainProduct.image_url,
            quantity: 1,
            category: 'spirit'
        }];

        if (mixer) {
            bundle.push({
                ...mixer,
                base_price: mixer.price,
                image: mixer.image_url,
                quantity: 1,
                category: 'mixer'
            });
        }

        addBundleToCart(bundle);

        setTimeout(() => {
            setIsAdding(false);
            setSuccess(true);
            setTimeout(() => setSuccess(false), 3000);
        }, 800);
    };

    if (!mixer) return null;

    const total = mainProduct.price + mixer.price;

    return (
        <Card className="p-10 rounded-[3.5rem] bg-slate-50 border border-slate-100 shadow-inner relative overflow-hidden group">
            <div className="relative z-10 space-y-10">
                <header className="flex justify-between items-center px-2">
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-2xl bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/20 animate-pulse">
                            <Zap size={24} fill="currentColor" />
                        </div>
                        <div>
                            <h3 className="text-xl font-black uppercase tracking-tighter text-foreground italic">Shop the Serve</h3>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Integrated Mixology Node</p>
                        </div>
                    </div>
                </header>

                <div className="flex items-center gap-6 justify-center py-6">
                    <div className="relative h-24 w-24 bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
                        <Image src={mainProduct.image_url} alt="" fill className="object-contain p-2" />
                    </div>
                    <div className="text-primary font-black text-2xl animate-in zoom-in duration-500">+</div>
                    <div className="relative h-24 w-24 bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
                        <Image src={mixer.image_url} alt="" fill className="object-contain p-2" />
                    </div>
                </div>

                <div className="space-y-4 text-center">
                    <div className="space-y-1">
                        <p className="text-[9px] font-black uppercase text-slate-400">Tonight&apos;s Protocol</p>
                        <p className="text-sm font-black text-foreground uppercase">{mainProduct.name} + {mixer.name}</p>
                        {glassware && <p className="text-[8px] font-bold text-primary uppercase">Recommended: {glassware} Glass</p>}
                    </div>

                    <div className="pt-6 flex flex-col gap-4">
                        <div className="flex justify-between items-center px-6">
                            <span className="text-[10px] font-black text-slate-400 uppercase">Total Serve Bundle</span>
                            <span className="text-xl font-black text-foreground">{formatPrice(total)}</span>
                        </div>

                        <Button
                            onClick={handleAddServe}
                            disabled={isAdding}
                            className={cn(
                                "w-full h-18 rounded-[2rem] font-black uppercase text-xs tracking-[0.2em] shadow-xl transition-all active:scale-95",
                                success ? "bg-emerald-500 text-white" : "bg-slate-900 text-white hover:bg-primary shadow-primary/10"
                            )}
                        >
                            {isAdding ? <Zap size={20} className="animate-spin" /> : success ? <><Check size={20} className="mr-2" /> In Your Bag</> : <><ShoppingBag size={20} className="mr-2" /> Add Perfect Serve</>}
                        </Button>
                    </div>
                </div>
            </div>

            <Zap className="absolute -bottom-10 -right-10 h-64 w-64 text-primary/5 rotate-12 -z-0" />
        </Card>
    );
}
