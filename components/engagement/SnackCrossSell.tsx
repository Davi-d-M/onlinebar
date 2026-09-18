'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Cookie, Plus, Zap } from 'lucide-react';
import { formatPrice, normalizeImage } from '@/lib/utils';
import { useCart } from '@/context/CartContext';
import Image from 'next/image';

interface SnackSuggestion {
    id: number;
    name: string;
    price: number;
    image_url: string;
    category: string;
}

export default function SnackCrossSell() {
    const { cart, addToCart } = useCart();
    const [suggestions, setSuggestions] = useState<SnackSuggestion[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchPairings() {
            if (!supabase || cart.length === 0) {
                setLoading(false);
                return;
            }

            // Logic: Base suggestions on items in cart (could be more complex)
            const { data } = await supabase
                .from('products')
                .select('*')
                .eq('is_snack', true)
                .gt('stock', 0)
                .limit(3);

            setSuggestions(data || []);
            setLoading(false);
        }
        fetchPairings();
    }, [cart]);

    if (loading || suggestions.length === 0) return null;

    return (
        <Card className="p-8 rounded-[2.5rem] bg-slate-50 border border-slate-100 shadow-inner space-y-6 text-left relative overflow-hidden group">
            <div className="flex justify-between items-center relative z-10">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-sm"><Cookie size={24} /></div>
                    <div>
                        <h3 className="text-xl font-black uppercase tracking-tighter text-foreground leading-none">Forgot the snacks?</h3>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">Recommended Pairings</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 relative z-10">
                {suggestions.map((s) => (
                    <div key={s.id} className="bg-white p-4 rounded-2xl border border-slate-100 flex items-center justify-between gap-4 group/item hover:border-primary/20 transition-all shadow-sm">
                        <div className="flex items-center gap-4">
                            <div className="h-12 w-12 rounded-xl bg-slate-50 relative overflow-hidden shrink-0">
                                <Image src={normalizeImage(s.image_url)} alt={s.name} fill className="object-contain p-2" />
                            </div>
                            <div className="min-w-0">
                                <p className="text-[11px] font-black text-foreground uppercase truncate">{s.name}</p>
                                <p className="text-xs font-black text-primary">{formatPrice(s.price)}</p>
                            </div>
                        </div>
                        <Button
                            size="icon"
                            onClick={() => addToCart({
                                id: s.id,
                                name: s.name,
                                price: s.price,
                                base_price: s.price,
                                quantity: 1,
                                category: s.category,
                                image: normalizeImage(s.image_url)
                            })}
                            className="h-8 w-8 rounded-lg bg-primary text-white shadow-lg shadow-primary/10 active:scale-90 transition-all"
                        >
                            <Plus size={14} />
                        </Button>
                    </div>
                ))}
            </div>

            {/* Background Pattern */}
            <Zap className="absolute -bottom-10 -left-10 h-32 w-32 text-primary/5 rotate-45" />
        </Card>
    );
}
