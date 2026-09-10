'use client';

import * as React from 'react';
import { Card } from '@/components/ui/card';
import {
    GlassWater,
    IceCream as Ice, // Using IceCream icon for Ice representation
    Citrus,
    Plus,
    Zap,
    Wine
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatPrice } from '@/lib/utils';
import { useCart } from '@/context/CartContext';
import { supabase } from '@/lib/supabaseClient';

interface ServeSpecs {
    mixer: string | null;
    mixer_id?: number;
    ice: string;
    garnish: string;
    glassware: string;
}

export default function PerfectServeWidget({ specs }: { specs?: ServeSpecs }) {
    const { addBundleToCart } = useCart();
    const [mixerProduct, setMixerProduct] = React.useState<any | null>(null);

    const defaultSpecs: ServeSpecs = {
        mixer: 'Premium Tonic',
        ice: 'Clear Cube',
        garnish: 'Lime Wedge',
        glassware: 'Highball'
    };

    const activeSpecs = specs || defaultSpecs;

    React.useEffect(() => {
        async function fetchMixer() {
            if (!activeSpecs.mixer_id || !supabase) return;
            const { data } = await supabase.from('products').select('*').eq('id', activeSpecs.mixer_id).single();
            if (data) setMixerProduct(data);
        }
        fetchMixer();
    }, [activeSpecs]);

    const handleAddEntireServe = () => {
        if (!mixerProduct) {
            alert("Mixer details not established. Manual selection required.");
            return;
        }
        // Simplified bundling logic
        addBundleToCart([
            { ...mixerProduct, quantity: 1, base_price: mixerProduct.price, image: mixerProduct.image_url }
        ]);
        alert("Mixer added to bag. Don&apos;t forget the ice! 🧊");
    };

    return (
        <Card className="p-10 rounded-[3.5rem] bg-slate-900 text-white border-none shadow-2xl relative overflow-hidden group text-left">
            <div className="relative z-10 space-y-10">
                <header className="flex justify-between items-center px-2">
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-2xl bg-primary/20 flex items-center justify-center text-primary shadow-inner">
                            <Zap size={24} fill="currentColor" />
                        </div>
                        <div>
                            <h3 className="text-xl font-black uppercase tracking-tighter text-white font-serif">The Perfect Serve</h3>
                            <p className="text-[9px] font-black text-primary/60 uppercase tracking-widest mt-1">Mixology Protocol Active</p>
                        </div>
                    </div>
                </header>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                    {[
                        { label: 'Glassware', val: activeSpecs.glassware, icon: Wine },
                        { label: 'Ice Node', val: activeSpecs.ice, icon: Ice },
                        { label: 'Garnish', val: activeSpecs.garnish, icon: Citrus },
                        { label: 'Mixer Hub', val: activeSpecs.mixer || 'Neat / Rocks', icon: GlassWater },
                    ].map((node) => (
                        <div key={node.label} className="space-y-4 text-center sm:text-left">
                            <div className="h-14 w-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white/40 mx-auto sm:mx-0 group-hover:text-primary transition-colors">
                                <node.icon size={28} />
                            </div>
                            <div>
                                <p className="text-[8px] font-black text-white/30 uppercase tracking-widest mb-1">{node.label}</p>
                                <p className="text-[11px] font-black uppercase text-white truncate">{node.val}</p>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="pt-8 border-t border-white/10 space-y-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Complete the night</span>
                        </div>
                        {mixerProduct && (
                            <span className="text-[10px] font-black text-primary uppercase">{formatPrice(mixerProduct.price)}</span>
                        )}
                    </div>

                    <Button
                        onClick={handleAddEntireServe}
                        disabled={!activeSpecs.mixer}
                        className="w-full h-18 rounded-[2rem] bg-white text-black font-black uppercase text-xs tracking-[0.2em] shadow-xl hover:bg-primary hover:text-white transition-all active:scale-95 flex items-center justify-center gap-4 group/btn"
                    >
                        <Plus size={20} /> Add Perfect Mixer
                    </Button>
                </div>
            </div>

            {/* Background Graphic */}
            <GlassWater className="absolute -bottom-10 -right-10 h-64 w-64 text-white/5 rotate-12 -z-0" />
        </Card>
    );
}
