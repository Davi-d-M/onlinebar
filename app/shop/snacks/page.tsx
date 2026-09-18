'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
    Cookie,
    Zap,
    Flame,
    ArrowLeft,
    Star,
    Clock,
    Loader2,
    Utensils
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import ProductCard from '@/components/home/ProductCard';

const SUBCATS = [
    { label: 'Trending', icon: Flame },
    { label: 'Crisps', icon: Zap },
    { label: 'Chocolate', icon: Cookie },
    { label: 'Nuts', icon: Utensils },
    { label: 'Healthy', icon: Star },
];

interface SnackProduct {
    id: number;
    name: string;
    price: number;
    image_url: string;
    sub_category: string;
    stock: number;
}

export default function SnackShopPage() {
    const [products, setProducts] = useState<SnackProduct[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeSub, setActiveSub] = useState('Trending');

    useEffect(() => {
        async function loadSnacks() {
            setLoading(true);
            if (!supabase) return;

            let query = supabase.from('products').select('*').eq('is_snack', true);

            if (activeSub !== 'Trending') {
                query = query.eq('sub_category', activeSub);
            }

            const { data } = await query.order('created_at', { ascending: false });
            setProducts(data || []);
            setLoading(false);
        }
        loadSnacks();
    }, [activeSub]);

    return (
        <div className="min-h-screen bg-white text-left selection:bg-primary/20">
            {/* 1. Header */}
            <header className="bg-slate-50 py-16 border-b border-slate-100 relative overflow-hidden">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <Link href="/shop" className="inline-flex items-center gap-2 text-[10px] font-black uppercase text-slate-400 hover:text-primary transition-colors mb-8">
                        <ArrowLeft className="h-4 w-4" /> Back to Bar
                    </Link>
                    <div className="max-w-xl space-y-6">
                        <h1 className="text-6xl font-black text-foreground uppercase tracking-tighter leading-none">
                            The Snack <span className="text-primary italic">Shop.</span>
                        </h1>
                        <p className="text-slate-500 text-lg font-medium leading-relaxed italic">
                            &quot;Premium pairings for your favorite beverages. Chilled, crunchy, and delivered with surgical speed.&quot;
                        </p>
                    </div>
                </div>
                <Utensils className="absolute -bottom-10 -right-10 h-64 w-64 text-primary/5 rotate-12 -z-0" />
            </header>

            {/* 2. Tactical Discovery Bar */}
            <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 flex flex-wrap gap-3 items-center sticky top-20 bg-white/80 backdrop-blur-xl z-40 border-b border-slate-50">
                {SUBCATS.map((cat) => (
                    <button
                        key={cat.label}
                        onClick={() => setActiveSub(cat.label)}
                        className={cn(
                            "px-6 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2",
                            activeSub === cat.label
                                ? "bg-primary text-white shadow-xl shadow-primary/20 scale-105"
                                : "bg-slate-50 text-slate-400 hover:bg-slate-100"
                        )}
                    >
                        <cat.icon className="h-3 w-3" />
                        {cat.label}
                    </button>
                ))}
            </div>

            {/* 3. Products Grid */}
            <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
                {loading ? (
                    <div className="py-32 flex flex-col items-center justify-center gap-4">
                        <Loader2 className="animate-spin text-primary" size={40} />
                        <p className="text-[10px] font-black uppercase text-slate-300">Scanning Cellar Nodes...</p>
                    </div>
                ) : products.length === 0 ? (
                    <div className="py-32 text-center opacity-30">
                        <Cookie size={64} className="mx-auto mb-4" />
                        <p className="text-sm font-black uppercase tracking-widest italic">Restock mission in progress for {activeSub}.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        {products.map((p) => (
                            <ProductCard key={p.id} product={{
                                id: p.id,
                                name: p.name,
                                price: p.price,
                                image: p.image_url,
                                category: p.sub_category,
                                stock: p.stock
                            }} />
                        ))}
                    </div>
                )}
            </div>

            {/* 4. Quick Delivery CTA */}
            <section className="max-w-7xl mx-auto px-4 py-24 sm:px-6 lg:px-8">
                <Card className="p-12 rounded-[4rem] bg-indigo-600 text-white border-none shadow-2xl relative overflow-hidden group">
                    <div className="relative z-10 grid md:grid-cols-2 gap-12 items-center">
                        <div className="space-y-6">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-xl bg-white/10 flex items-center justify-center backdrop-blur-md border border-white/20"><Clock className="h-6 w-6" /></div>
                                <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Speed Protocol</span>
                            </div>
                            <h2 className="text-5xl font-black uppercase tracking-tighter leading-none">Ready in <br/> <span className="text-primary italic">20 Minutes</span></h2>
                            <p className="text-lg font-medium opacity-70 italic max-w-sm">
                                &quot;Tactical dispatch active. Your bites arrive while your drinks are still chilled to the core.&quot;
                            </p>
                            <Button className="h-16 px-10 rounded-2xl bg-white text-indigo-600 font-black uppercase text-xs tracking-widest hover:bg-primary hover:text-white transition-all shadow-xl active:scale-95">
                                Start Fast Order
                            </Button>
                        </div>
                        <div className="hidden md:flex justify-center">
                            <div className="h-80 w-80 rounded-full border-4 border-white/10 flex items-center justify-center relative">
                                <div className="h-64 w-64 rounded-full bg-white/5 animate-ping absolute" />
                                <Zap className="h-32 w-32 text-white opacity-10" />
                            </div>
                        </div>
                    </div>
                    <Zap className="absolute -bottom-20 -right-20 h-[500px] w-[500px] text-white/5 rotate-45 -z-0" />
                </Card>
            </section>
        </div>
    );
}
