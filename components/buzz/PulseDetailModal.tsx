'use client';

import * as React from 'react';
import { Card } from '@/components/ui/card';
import {
    X,
    ShoppingBag,
    ChevronRight,
    Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatPrice, normalizeImage } from '@/lib/utils';
import { supabase } from '@/lib/supabaseClient';
import Image from 'next/image';
import Link from 'next/link';

interface PulsePost {
    id: string;
    title: string;
    headline: string;
    description: string;
    start_time: string;
    hero_image_url: string;
    tags: string[];
    cta_label: string;
}

interface PulseDetailModalProps {
    areaName: string;
    postId?: string;
    onClose: () => void;
}

export default function PulseDetailModal({ areaName, postId, onClose }: PulseDetailModalProps) {
    const [post, setPost] = React.useState<PulsePost | null>(null);
    const [loading, setLoading] = React.useState(true);
    const [products, setProducts] = React.useState<{ id: number, name: string, price: number, image_url: string }[]>([]);

    React.useEffect(() => {
        async function fetchDetail() {
            if (!supabase) return;
            try {
                // 1. Fetch Post Detail
                let query = supabase.from('pulse_posts').select('*').eq('status', 'LIVE');
                if (postId) {
                    query = query.eq('id', postId);
                } else {
                    // Get latest for area
                    const { data: area } = await supabase.from('pulse_areas').select('id').eq('zone_name', areaName).single();
                    if (area) query = query.eq('area_id', area.id);
                }

                const { data: postData } = await query.order('created_at', { ascending: false }).limit(1).single();

                if (postData) {
                    setPost(postData as PulsePost);
                    // 2. Fetch Linked Products
                    const { data: linked } = await supabase.from('pulse_post_products').select('product_id').eq('post_id', postData.id);
                    if (linked && linked.length > 0) {
                        const ids = linked.map(l => l.product_id);
                        const { data: prodData } = await supabase.from('products').select('*').in('id', ids);
                        setProducts(prodData || []);
                    }
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        }
        fetchDetail();
    }, [areaName, postId]);

    return (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-slate-900/10 backdrop-blur-md p-4 animate-in fade-in duration-300">
            <Card className="max-w-lg w-full bg-white rounded-[3.5rem] shadow-2xl overflow-hidden border-none animate-in zoom-in-95 duration-500 flex flex-col max-h-[90vh]">

                {/* HERO AREA */}
                <div className="relative h-72 shrink-0 bg-slate-50">
                    <Image src={normalizeImage(post?.hero_image_url)} alt="" fill className="object-cover opacity-80" />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 via-transparent to-transparent" />
                    <button
                        onClick={onClose}
                        className="absolute top-6 right-6 h-12 w-12 rounded-full bg-white/20 backdrop-blur-md text-foreground flex items-center justify-center hover:bg-white transition-all z-20 shadow-sm border border-white/20"
                    >
                        <X size={24} />
                    </button>

                    <div className="absolute bottom-8 left-10 right-10 space-y-2">
                        <div className="flex items-center gap-3">
                            <span className="px-3 py-1 rounded-full bg-rose-500 text-white text-[9px] font-black uppercase tracking-widest animate-pulse">Live Now</span>
                            <span className="text-[9px] font-black text-white/60 uppercase tracking-[0.4em]">{areaName}</span>
                        </div>
                        <h2 className="text-3xl lg:text-4xl font-black text-white uppercase tracking-tighter leading-none">{post?.title || 'Sector Pulse'}</h2>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-10 space-y-10 no-scrollbar text-left">
                    {loading ? (
                        <div className="py-20 flex flex-col items-center gap-4 opacity-20">
                            <Loader2 className="animate-spin" size={40} />
                            <p className="text-[10px] font-black uppercase tracking-widest">Decrypting Sector Signal...</p>
                        </div>
                    ) : (
                        <>
                            <div className="space-y-4">
                                <h3 className="text-xl font-black text-foreground uppercase tracking-tight leading-snug italic">&quot;{post?.headline}&quot;</h3>
                                <p className="text-sm font-medium text-slate-500 leading-relaxed">{post?.description || 'Maintain tactical position. High density activity detected across the sector.'}</p>
                            </div>

                            <div className="flex flex-wrap gap-2">
                                {(post?.tags || ['Live Music', 'Premium Selection', 'Social Pulse']).map(tag => (
                                    <span key={tag} className="px-4 py-2 bg-slate-50 rounded-xl border border-slate-100 text-[10px] font-black uppercase text-slate-400 tracking-widest">
                                        #{tag.replace(/\s+/g, '')}
                                    </span>
                                ))}
                            </div>

                            <div className="space-y-6">
                                <div className="flex items-center justify-between border-b border-slate-50 pb-4">
                                    <h4 className="text-sm font-black uppercase tracking-widest text-primary flex items-center gap-2">
                                        <ShoppingBag size={16} /> Tonight&apos;s Collection
                                    </h4>
                                    <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Sector Exclusive</span>
                                </div>

                                <div className="space-y-4">
                                    {products.length > 0 ? products.map(p => (
                                        <div key={p.id} className="p-4 rounded-3xl bg-slate-50 border border-slate-100 flex items-center justify-between group hover:bg-white hover:shadow-xl transition-all">
                                            <div className="flex items-center gap-4">
                                                <div className="h-14 w-14 rounded-2xl bg-white border border-slate-100 p-2 flex items-center justify-center shrink-0">
                                                    <Image src={normalizeImage(p.image_url)} alt="" width={56} height={56} className="h-full w-full object-contain" />
                                                </div>
                                                <div className="text-left">
                                                    <p className="text-[11px] font-black uppercase text-foreground leading-tight truncate max-w-[150px]">{p.name}</p>
                                                    <p className="text-[10px] font-black text-primary mt-1">{formatPrice(p.price)}</p>
                                                </div>
                                            </div>
                                            <Link href={`/shop/${p.id}`}>
                                                <Button size="icon" variant="ghost" className="h-10 w-10 rounded-xl text-slate-300 hover:text-primary transition-all">
                                                    <ChevronRight size={20} />
                                                </Button>
                                            </Link>
                                        </div>
                                    )) : (
                                        <p className="text-[10px] font-bold text-slate-300 uppercase italic text-center py-6">No specific bottles linked to this moment.</p>
                                    )}
                                </div>
                            </div>
                        </>
                    )}
                </div>

                <div className="p-8 bg-slate-50 border-t border-slate-100 shrink-0">
                    <Button
                        onClick={onClose}
                        className="w-full h-16 rounded-[1.8rem] bg-primary text-white font-black uppercase text-[10px] tracking-[0.3em] shadow-xl shadow-primary/20 active:scale-95 transition-all"
                    >
                        {post?.cta_label || 'EXPLORE SECTOR'}
                    </Button>
                </div>

            </Card>
        </div>
    );
}
