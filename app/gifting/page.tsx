'use client';

import * as React from 'react';
import { supabase } from '@/lib/supabaseClient';
import {
    Gift,
    Heart,
    Users,
    Sparkles,
    ArrowRight,
    ArrowLeft,
    CheckCircle2,
    Zap,
    Smartphone,
    Target,
    ChevronRight,
    Wine,
    ShoppingBag,
    PenTool
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { cn, formatPrice } from '@/lib/utils';
import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { useRouter } from 'next/navigation';

const RECIPIENTS = [
    { id: 'PARTNER', label: 'Partner', icon: Heart, color: 'bg-rose-50 text-rose-500' },
    { id: 'PARENT', label: 'Parent', icon: Users, color: 'bg-indigo-50 text-indigo-500' },
    { id: 'CLIENT', label: 'Client', icon: Target, color: 'bg-slate-100 text-slate-600' },
    { id: 'FRIEND', label: 'Friend', icon: Sparkles, color: 'bg-amber-50 text-amber-600' },
];

const OCCASIONS = [
    { id: 'BIRTHDAY', label: 'Birthday' },
    { id: 'ANNIVERSARY', label: 'Anniversary' },
    { id: 'CELEBRATION', label: 'Celebration' },
    { id: 'THANK_YOU', label: 'Thank You' },
];

export default function GiftingHub() {
    const [step, setStep] = React.useState(1);
    const [recipient, setRecipient] = React.useState<string | null>(null);
    const [occasion, setOccasion] = React.useState<string | null>(null);

    // Box Builder State
    const [selectedBottle, setSelectedBottle] = React.useState<{ id: number, name: string, price: number, image_url: string } | null>(null);
    const [selectedSnacks, setSelectedSnacks] = React.useState<Array<{ id: number, name: string, price: number, image_url: string }>>([]);
    const [personalNote, setPersonalNote] = React.useState('');
    const [products, setProducts] = React.useState<Array<{ id: number, name: string, price: number, image_url: string, is_snack: boolean }>>([]);

    const { addBundleToCart } = useCart();
    const router = useRouter();

    React.useEffect(() => {
        async function fetchStock() {
            if (!supabase) return;
            const { data } = await supabase.from('products').select('*').eq('status', 'Live').limit(10);
            if (data) setProducts(data);
        }
        fetchStock();
    }, []);

    const handleEstablishGift = () => {
        if (!selectedBottle) return;

        const items = [
            { ...selectedBottle, quantity: 1, base_price: selectedBottle.price, image: selectedBottle.image_url },
            ...selectedSnacks.map(s => ({ ...s, quantity: 1, base_price: s.price, image: s.image_url }))
        ];

        addBundleToCart(items as any); // eslint-disable-line @typescript-eslint/no-explicit-any
        // Persist note to session storage for checkout to pick up
        if (personalNote) {
            sessionStorage.setItem('ob_gift_note', personalNote);
        }

        alert("Gift Box established in your bag! 🎁");
        router.push('/cart');
    };

    return (
        <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 text-left selection:bg-primary/20 pb-40">
            <div className="max-w-7xl mx-auto space-y-12">

                <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-slate-200 pb-10">
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <Link href="/" className="h-10 w-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-primary transition-all shadow-sm active:scale-90"><ArrowLeft size={20} /></Link>
                            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-sm"><Gift size={20} /></div>
                            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">Gifting Intelligence</span>
                        </div>
                        <h1 className="text-4xl lg:text-6xl font-black text-foreground uppercase tracking-tighter leading-none">
                            The <br /> <span className="text-primary italic">Gift Box.</span>
                        </h1>
                        <p className="text-slate-500 text-lg font-medium italic max-w-xl leading-relaxed">
                            &quot;Excellence in hospitality starts with the perfect gesture. Build a custom experience for someone special.&quot;
                        </p>
                    </div>
                </header>

                <div className="grid lg:grid-cols-12 gap-10">

                    {/* LEFT: BUILDER HUD */}
                    <div className="lg:col-span-8 space-y-8">

                        {/* STEP 1: CONTEXT */}
                        {step === 1 && (
                            <Card className="p-10 rounded-[3.5rem] bg-white border border-slate-100 shadow-sm space-y-10 animate-in fade-in slide-in-from-left-4">
                                <div className="space-y-10">
                                    <div>
                                        <h3 className="text-2xl font-black uppercase tracking-tighter text-foreground mb-6">Who is it for?</h3>
                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                            {RECIPIENTS.map(r => (
                                                <button
                                                    key={r.id}
                                                    onClick={() => setRecipient(r.id)}
                                                    className={cn(
                                                        "p-6 rounded-[2rem] border-2 transition-all flex flex-col items-center gap-4 group",
                                                        recipient === r.id ? "border-primary bg-primary/5" : "border-slate-50 bg-slate-50/50 hover:border-slate-100"
                                                    )}
                                                >
                                                    <div className={cn("h-12 w-12 rounded-2xl flex items-center justify-center shadow-sm transition-transform group-hover:scale-110", r.color)}>
                                                        <r.icon size={24} />
                                                    </div>
                                                    <span className="text-[10px] font-black uppercase tracking-widest">{r.label}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <h3 className="text-2xl font-black uppercase tracking-tighter text-foreground mb-6">What&apos;s the occasion?</h3>
                                        <div className="flex flex-wrap gap-3">
                                            {OCCASIONS.map(occ => (
                                                <button
                                                    key={occ.id}
                                                    onClick={() => setOccasion(occ.id)}
                                                    className={cn(
                                                        "px-8 py-3 rounded-2xl border-2 font-black uppercase text-[10px] tracking-widest transition-all",
                                                        occasion === occ.id ? "border-primary bg-primary text-white shadow-xl shadow-primary/20 scale-105" : "border-slate-100 bg-white text-slate-400 hover:border-slate-200"
                                                    )}
                                                >
                                                    {occ.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-8 border-t border-slate-50 flex justify-end">
                                    <Button
                                        disabled={!recipient || !occasion}
                                        onClick={() => setStep(2)}
                                        className="h-16 px-12 rounded-2xl bg-primary text-white font-black uppercase text-xs tracking-widest shadow-2xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
                                    >
                                        Initialize Curation <ArrowRight className="ml-2 h-5 w-5" />
                                    </Button>
                                </div>
                            </Card>
                        )}

                        {/* STEP 2: CURATION (PICK BOTTLE) */}
                        {step === 2 && (
                            <div className="space-y-8 animate-in fade-in slide-in-from-left-4 duration-700">
                                <div className="flex items-center justify-between px-4">
                                    <h2 className="text-xl font-black uppercase tracking-tighter">1. Select Main Bottle</h2>
                                    <button onClick={() => setStep(1)} className="text-[10px] font-black text-primary uppercase underline">Change Context</button>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    {products.filter(p => !p.is_snack).map(p => (
                                        <Card
                                            key={p.id}
                                            onClick={() => setSelectedBottle(p)}
                                            className={cn(
                                                "p-6 rounded-[2.5rem] border-2 cursor-pointer transition-all flex items-center gap-6 group hover:shadow-xl",
                                                selectedBottle?.id === p.id ? "border-primary bg-primary/5" : "border-slate-100 bg-white"
                                            )}
                                        >
                                            <div className="h-20 w-20 rounded-2xl bg-slate-50 relative overflow-hidden shrink-0 shadow-inner group-hover:scale-105 transition-transform">
                                                <Image src={p.image_url || '/placeholder.jpg'} alt="" fill className="object-contain p-2" />
                                            </div>
                                            <div className="flex-1 min-w-0 text-left">
                                                <p className="text-[11px] font-black uppercase text-foreground truncate">{p.name}</p>
                                                <p className="text-lg font-black text-primary mt-1">{formatPrice(p.price)}</p>
                                            </div>
                                            <div className={cn(
                                                "h-6 w-6 rounded-full border-2 flex items-center justify-center transition-all",
                                                selectedBottle?.id === p.id ? "bg-primary border-primary" : "border-slate-200"
                                            )}>
                                                {selectedBottle?.id === p.id && <CheckCircle2 size={14} className="text-white" />}
                                            </div>
                                        </Card>
                                    ))}
                                </div>
                                <div className="pt-8 flex justify-end">
                                    <Button
                                        disabled={!selectedBottle}
                                        onClick={() => setStep(3)}
                                        className="h-16 px-12 rounded-2xl bg-slate-900 text-white font-black uppercase text-xs tracking-widest shadow-2xl active:scale-95 transition-all"
                                    >
                                        Add Pairing & Note <ChevronRight className="ml-2 h-5 w-5" />
                                    </Button>
                                </div>
                            </div>
                        )}

                        {/* STEP 3: FINAL PACKAGE (SNACKS + NOTE) */}
                        {step === 3 && (
                            <Card className="p-10 rounded-[3.5rem] bg-white border border-slate-100 shadow-sm space-y-10 animate-in fade-in slide-in-from-left-4 duration-700">
                                <div className="space-y-8">
                                    <div>
                                        <h3 className="text-2xl font-black uppercase tracking-tighter text-foreground mb-6">2. Add Chilled Pairings</h3>
                                        <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
                                            {products.filter(p => p.is_snack).map(s => (
                                                <button
                                                    key={s.id}
                                                    onClick={() => setSelectedSnacks(prev => prev.some(x => x.id === s.id) ? prev.filter(x => x.id !== s.id) : [...prev, s])}
                                                    className={cn(
                                                        "p-4 rounded-[2rem] border-2 transition-all flex flex-col items-center gap-3 shrink-0 w-32",
                                                        selectedSnacks.some(x => x.id === s.id) ? "border-primary bg-primary/5" : "border-slate-50 bg-slate-50 hover:border-slate-100"
                                                    )}
                                                >
                                                    <div className="h-12 w-12 rounded-xl bg-white relative overflow-hidden shadow-sm">
                                                        <Image src={s.image_url || '/placeholder.jpg'} alt="" fill className="object-contain p-2" />
                                                    </div>
                                                    <span className="text-[8px] font-black uppercase text-center truncate w-full">{s.name}</span>
                                                    <span className="text-[9px] font-bold text-primary">{formatPrice(s.price)}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="flex items-center gap-3">
                                            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary shadow-sm"><PenTool size={16} /></div>
                                            <h3 className="text-xl font-black uppercase tracking-tighter text-foreground">3. Hand-Written Note</h3>
                                        </div>
                                        <Textarea
                                            value={personalNote}
                                            onChange={e => setPersonalNote(e.target.value)}
                                            placeholder="Enter your personal message here... (e.g. Happy Birthday Kelvin!)"
                                            className="min-h-[120px] rounded-3xl bg-slate-50 border-slate-100 p-6 text-sm font-medium italic resize-none focus:ring-4 focus:ring-primary/5"
                                        />
                                        <p className="text-[8px] font-black uppercase text-emerald-600 tracking-widest flex items-center gap-2">
                                            <CheckCircle2 size={12} /> Premium Gifting protocol active: Card & Wrapping included.
                                        </p>
                                    </div>
                                </div>

                                <div className="pt-8 border-t border-slate-50 flex justify-between items-center">
                                    <button
                                        onClick={() => setStep(2)}
                                        className="text-[10px] font-black text-slate-400 uppercase hover:text-primary flex items-center gap-2 transition-all active:scale-95"
                                    >
                                        <ArrowLeft size={14} /> Back to bottles
                                    </button>
                                    <Button
                                        onClick={handleEstablishGift}
                                        className="h-16 px-16 rounded-[1.5rem] bg-primary text-white font-black uppercase text-xs tracking-[0.2em] shadow-2xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
                                    >
                                        Establish Gift Protocol
                                    </Button>
                                </div>
                            </Card>
                        )}

                    </div>

                    {/* RIGHT: GIFT VISUALIZER */}
                    <div className="lg:col-span-4 space-y-8">
                        <Card className="p-10 rounded-[3.5rem] bg-slate-900 text-white space-y-10 relative overflow-hidden shadow-2xl">
                            <div className="relative z-10 space-y-8 text-left">
                                <div className="flex items-center gap-4">
                                    <div className="h-12 w-12 rounded-2xl bg-white/10 flex items-center justify-center backdrop-blur-md border border-white/20"><ShoppingBag size={24} className="text-primary" /></div>
                                    <div>
                                        <h3 className="text-2xl font-black uppercase tracking-tighter leading-none">Your Package</h3>
                                        <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest mt-1">Live Manifest</p>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    {selectedBottle ? (
                                        <div className="p-4 bg-white/5 rounded-2xl border border-white/10 flex items-center gap-4 animate-in zoom-in-95">
                                            <div className="h-12 w-12 rounded-xl bg-white p-2 relative overflow-hidden shadow-lg">
                                                <Image src={selectedBottle.image_url || '/placeholder.jpg'} alt="" fill className="object-contain p-1" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-[10px] font-black uppercase text-primary leading-none mb-1">Elite Node</p>
                                                <p className="text-xs font-black uppercase truncate">{selectedBottle.name}</p>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="p-8 border-2 border-dashed border-white/10 rounded-2xl text-center opacity-30">
                                            <Wine size={32} className="mx-auto mb-2" />
                                            <p className="text-[9px] font-black uppercase tracking-widest">Awaiting Bottle Node</p>
                                        </div>
                                    )}

                                    {selectedSnacks.length > 0 && (
                                        <div className="p-4 bg-white/5 rounded-2xl border border-white/10 space-y-3">
                                            <p className="text-[9px] font-black uppercase text-slate-500 tracking-widest px-1">Pairings Added</p>
                                            {selectedSnacks.map(s => (
                                                <div key={s.id} className="flex justify-between items-center text-[10px] font-black uppercase">
                                                    <span className="text-white/60 truncate max-w-[150px]">{s.name}</span>
                                                    <span className="text-primary">{formatPrice(s.price)}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {personalNote && (
                                        <div className="p-5 bg-white/5 rounded-2xl border border-white/10 relative">
                                            <p className="text-[8px] font-black uppercase text-slate-500 mb-2">Message Payload</p>
                                            <p className="text-[11px] font-medium italic text-primary leading-relaxed">&quot;{personalNote}&quot;</p>
                                            <Zap size={24} className="absolute -bottom-2 -right-2 text-white/5 rotate-12" />
                                        </div>
                                    )}
                                </div>

                                <div className="pt-8 border-t border-white/10 flex justify-between items-end">
                                    <div>
                                        <p className="text-[8px] font-black uppercase text-slate-500 tracking-widest mb-1">Package Total</p>
                                        <p className="text-3xl font-black">
                                            {formatPrice((selectedBottle?.price || 0) + selectedSnacks.reduce((s, x) => s + x.price, 0))}
                                        </p>
                                    </div>
                                    <CheckCircle2 size={32} className={cn("transition-all duration-500", selectedBottle ? "text-emerald-500 scale-110" : "text-white/10")} />
                                </div>
                            </div>
                            <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-br from-primary/5 via-transparent to-transparent pointer-events-none opacity-50"></div>
                        </Card>

                        <div className="p-8 rounded-[3rem] bg-white border border-slate-100 shadow-sm space-y-6 text-left group">
                            <div className="h-10 w-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 shadow-inner group-hover:rotate-6 transition-transform"><Smartphone size={20} /></div>
                            <h4 className="text-lg font-black uppercase text-foreground leading-none tracking-tighter">Track Gifting</h4>
                            <p className="text-[10px] text-muted-foreground font-medium italic leading-relaxed">
                                &quot;You will receive real-time alerts on your terminal when the recipient initializes their dispatch node.&quot;
                            </p>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
