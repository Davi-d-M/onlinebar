'use client';

import * as React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Zap, ShoppingBag, Plus, X, RefreshCcw } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import Image from 'next/image';
import { handleOutOfStock } from '@/lib/engines/SaveTheSaleEngine';
import { useCart } from '@/context/CartContext';

export default function OOSRecovery({ productId, isOpen, onClose }: { productId: number, isOpen: boolean, onClose: () => void }) {
    const [recoveryData, setRecoveryData] = React.useState<{ message: string, suggestions: { id: number, name: string, price: number, category: string, image_url: string }[] } | null>(null);
    const [loading, setLoading] = React.useState(true);
    const { addToCart } = useCart();

    React.useEffect(() => {
        if (isOpen) {
            async function fetchRecovery() {
                const data = await handleOutOfStock(productId);
                setRecoveryData(data);
                setLoading(false);
            }
            fetchRecovery();
        }
    }, [isOpen, productId]);

    if (!isOpen || (!loading && !recoveryData)) return null;

    return (
        <div className="fixed inset-0 z-[3000] flex items-center justify-center bg-background/20 backdrop-blur-md p-6">
            <Card className="max-w-md w-full bg-white rounded-[3.5rem] border border-border shadow-2xl overflow-hidden animate-in zoom-in-95 duration-500 flex flex-col text-left">
                <div className="bg-primary p-8 text-white flex justify-between items-center shadow-lg relative overflow-hidden">
                    <div className="flex items-center gap-4 relative z-10">
                        <div className="h-10 w-10 rounded-xl bg-white/20 flex items-center justify-center text-white"><ShoppingBag size={24} /></div>
                        <h3 className="text-xl font-black uppercase tracking-tighter">Save the Sale</h3>
                    </div>
                    <button onClick={onClose} className="h-10 w-10 rounded-full hover:bg-white/10 flex items-center justify-center transition-colors relative z-10"><X size={24} /></button>
                    <Zap className="absolute -bottom-10 -right-10 h-48 w-48 text-white/5 -rotate-12" />
                </div>

                <div className="p-10 space-y-8 flex-1">
                    {loading ? (
                        <div className="py-20 text-center space-y-4">
                            <RefreshCcw className="animate-spin text-primary mx-auto h-8 w-8" />
                            <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Scanning Cellar for Alternatives...</p>
                        </div>
                    ) : (
                        <div className="space-y-8 animate-in fade-in duration-500">
                            <div className="space-y-2">
                                <h4 className="text-2xl font-black text-foreground uppercase tracking-tighter leading-tight">{recoveryData?.message}</h4>
                                <p className="text-xs text-slate-500 font-medium italic italic leading-relaxed pr-4">
                                    &quot;Our sentinel node detected this vintage is currently out of reach, but these alternatives are chilled and ready for immediate dispatch.&quot;
                                </p>
                            </div>

                            <div className="space-y-3">
                                {recoveryData?.suggestions?.map((s) => (
                                    <div key={s.id} className="p-4 rounded-3xl bg-slate-50 border border-slate-100 flex items-center gap-4 group hover:bg-white hover:shadow-lg hover:border-primary/20 transition-all">
                                        <div className="h-14 w-14 rounded-2xl bg-white p-2 border border-slate-100 shrink-0">
                                            <Image src={s.image_url || '/placeholder.jpg'} alt="" width={56} height={56} className="h-full w-full object-contain" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-[10px] font-black uppercase truncate text-foreground">{s.name}</p>
                                            <p className="text-sm font-black text-primary">{formatPrice(s.price)}</p>
                                        </div>
                                        <Button
                                            size="sm"
                                            className="h-10 px-4 rounded-xl bg-primary text-white font-black uppercase text-[8px] active:scale-95"
                                            onClick={() => {
                                                addToCart({
                                                    id: s.id,
                                                    name: s.name,
                                                    price: s.price,
                                                    base_price: s.price,
                                                    quantity: 1,
                                                    category: s.category,
                                                    image: s.image_url
                                                });
                                                onClose();
                                            }}
                                        >
                                            <Plus size={12} className="mr-1" /> Swap
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <div className="p-6 bg-slate-50 border-t border-slate-100 text-center">
                    <button onClick={onClose} className="text-[9px] font-black uppercase text-slate-400 hover:text-primary transition-colors tracking-widest underline underline-offset-4">Continue Browsing Other Vintages</button>
                </div>
            </Card>
        </div>
    );
}
