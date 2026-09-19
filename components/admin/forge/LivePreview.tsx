'use client';

import * as React from 'react';
import Image from 'next/image';
import { ShoppingBag, Star, ShieldCheck, Truck, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatPrice } from '@/lib/utils';

interface LivePreviewProps {
    product: {
        name: string;
        price: number;
        old_price?: number;
        image_url: string;
        description: string;
        brand: string;
        category: string;
    }
}

export default function LivePreview({ product }: LivePreviewProps) {
    const discount = product.old_price ? Math.round(((product.old_price - product.price) / product.old_price) * 100) : 0;

    return (
        <div className="bg-[#F1F5F9] rounded-[4rem] p-12 h-full overflow-hidden flex flex-col border border-slate-200/60 shadow-inner text-left">
            <div className="flex items-center gap-3 mb-8">
                <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Live Customer View</span>
            </div>

            <div className="bg-white rounded-[3rem] shadow-2xl overflow-hidden flex-1 flex flex-col">

                {/* HERO VISUAL */}
                <div className="relative aspect-[4/3] bg-slate-50 flex items-center justify-center p-12">
                    {product.image_url ? (
                        <Image src={product.image_url} alt="" fill className="object-contain p-12" />
                    ) : (
                        <Zap size={64} className="text-slate-100" />
                    )}

                    {discount > 0 && (
                        <div className="absolute top-8 left-8 bg-primary text-white px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl shadow-primary/20">
                            Save {discount}%
                        </div>
                    )}
                </div>

                {/* CONTENT AREA */}
                <div className="p-10 space-y-8 flex-1">
                    <div className="space-y-3">
                        <div className="flex items-center gap-3">
                            <span className="text-[10px] font-black text-primary uppercase tracking-widest">{product.brand}</span>
                            <div className="h-1 w-1 rounded-full bg-slate-200" />
                            <div className="flex items-center text-amber-400">
                                {[1,2,3,4,5].map(i => <Star key={i} size={10} fill="currentColor" />)}
                            </div>
                        </div>
                        <h3 className="text-3xl font-black text-slate-900 tracking-tighter uppercase leading-none">{product.name || 'UNNAMED_NODE'}</h3>
                    </div>

                    <div className="flex items-end gap-4">
                        <span className="text-4xl font-black text-slate-900 tracking-tighter">{formatPrice(product.price)}</span>
                        {product.old_price && (
                            <span className="text-xl font-bold text-slate-300 line-through mb-1">{formatPrice(product.old_price)}</span>
                        )}
                    </div>

                    <p className="text-sm font-medium text-slate-500 leading-relaxed italic line-clamp-3">
                        &quot;{product.description || 'Neural narrative pending synchronization...'}&quot;
                    </p>

                    <div className="pt-6 border-t border-slate-50 space-y-4">
                        <Button className="w-full h-16 rounded-2xl bg-slate-900 text-white font-black uppercase tracking-[0.3em] text-xs shadow-xl hover:scale-[1.02] active:scale-95 transition-all">
                            <ShoppingBag className="mr-3 h-4 w-4" /> Add to Bag
                        </Button>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex items-center gap-2 text-slate-400">
                                <Truck size={14} />
                                <span className="text-[8px] font-black uppercase">Instant Dispatch</span>
                            </div>
                            <div className="flex items-center gap-2 text-slate-400">
                                <ShieldCheck size={14} />
                                <span className="text-[8px] font-black uppercase">100% Authentic</span>
                            </div>
                        </div>
                    </div>
                </div>

            </div>

            <div className="mt-8 text-center">
                <p className="text-[8px] font-black uppercase tracking-[0.4em] text-slate-300">Synchronized with Forge Node in real-time</p>
            </div>
        </div>
    );
}
