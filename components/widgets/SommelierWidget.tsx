'use client';

import * as React from 'react';
import { supabase } from '@/lib/supabaseClient';
import {
    Sparkles,
    ArrowRight,
    Wine,
    Zap,
    ShoppingBag
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn, formatPrice } from '@/lib/utils';
import Image from 'next/image';
import Link from 'next/link';

interface Recommendation {
    id: number;
    name: string;
    price: number;
    image_url: string;
    category: string;
}

export default function SommelierWidget() {
    const [recs, setRecs] = React.useState<Recommendation[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [persona, setPersona] = React.useState<string>('Elite');

    React.useEffect(() => {
        async function fetchRecs() {
            if (!supabase) return;
            const { data: { session } } = await supabase.auth.getSession();

            let category = 'whiskey'; // Default
            if (session) {
                const { data: prof } = await supabase.from('profiles').select('interests, membership_tier').eq('id', session.user.id).single();
                if (prof?.interests?.[0]) category = prof.interests[0];
                if (prof?.membership_tier) setPersona(prof.membership_tier);
            }

            const { data: products } = await supabase
                .from('products')
                .select('id, name, price, image_url, category')
                .ilike('category', `%${category}%`)
                .eq('status', 'Live')
                .limit(3);

            if (products) setRecs(products as Recommendation[]);
            setLoading(false);
        }
        fetchRecs();
    }, []);

    if (loading) return <div className="h-96 bg-slate-50 rounded-[4rem] animate-pulse mx-6" />;
    if (recs.length === 0) return null;

    return (
        <section className="max-w-7xl mx-auto px-6 sm:px-12 lg:px-20 space-y-12 animate-in fade-in duration-1000">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-slate-100 pb-10">
                <div className="space-y-4 text-left">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-sm"><Sparkles size={20} fill="currentColor" /></div>
                        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">Neural Personalization</span>
                    </div>
                    <h2 className="text-4xl lg:text-5xl font-black text-foreground uppercase tracking-tighter leading-none">
                        Sommelier <br /> <span className="text-primary italic">Selection.</span>
                    </h2>
                    <p className="text-slate-500 text-lg font-medium italic max-w-xl">
                        &quot;Based on your {persona} profile, we&apos;ve reserved these elite selections for your private grid.&quot;
                    </p>
                </div>
                <Link href="/shop">
                    <Button variant="outline" className="h-14 px-8 rounded-2xl border-2 border-slate-100 font-black uppercase text-[10px] tracking-widest hover:bg-slate-50 transition-all active:scale-95">
                        View Personalized Menu <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                </Link>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {recs.map((r, i) => (
                    <Card key={r.id} className={cn(
                        "p-10 rounded-[3.5rem] bg-white border border-slate-100 shadow-sm hover:shadow-2xl transition-all group relative overflow-hidden flex flex-col items-center text-center gap-8",
                        i === 1 && "md:scale-110 md:z-10 md:border-primary/20 md:shadow-primary/5"
                    )}>
                        <div className="aspect-square w-full bg-slate-50 rounded-[2.5rem] flex items-center justify-center p-10 relative overflow-hidden group-hover:scale-105 transition-transform duration-700">
                             <Image src={r.image_url || '/placeholder.jpg'} alt="" fill className="object-contain p-8" />
                             <div className="absolute top-6 left-6 h-10 w-10 rounded-xl bg-white/80 backdrop-blur-md flex items-center justify-center text-primary shadow-sm">
                                 <Wine size={20} />
                             </div>
                        </div>

                        <div className="space-y-2 w-full">
                            <p className="text-[10px] font-black uppercase text-primary tracking-widest">{r.category}</p>
                            <h3 className="text-2xl font-black text-foreground uppercase tracking-tight truncate leading-none">{r.name}</h3>
                            <p className="text-3xl font-black text-foreground tracking-tighter pt-2">{formatPrice(r.price)}</p>
                        </div>

                        <div className="w-full pt-4 border-t border-slate-50">
                            <Link href={`/shop/${r.id}`}>
                                <Button className="w-full h-16 rounded-2xl bg-primary text-white font-black uppercase text-xs tracking-widest shadow-xl shadow-primary/20 hover:scale-105 transition-all active:scale-95">
                                    <ShoppingBag size={18} className="mr-3" /> Establish Order
                                </Button>
                            </Link>
                        </div>

                        {i === 1 && <Zap className="absolute -top-10 -right-10 h-32 w-32 text-primary/5 rotate-12" />}
                    </Card>
                ))}
            </div>
        </section>
    );
}
