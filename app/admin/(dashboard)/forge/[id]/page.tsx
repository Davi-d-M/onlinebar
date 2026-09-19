'use client';

import * as React from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
    ArrowLeft,
    Zap,
    Save,
    Loader2,
    LayoutGrid,
    ImageIcon,
    Box,
    DollarSign,
    Eye,
    ChevronRight,
    Search,
    ShieldCheck,
    Info
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabaseClient';
import { useAdmin } from '@/context/AdminContext';

// Forge Components
import ImageCoach from '@/components/admin/forge/ImageCoach';
import ThreeDStudio from '@/components/admin/forge/ThreeDStudio';
import PricingLab from '@/components/admin/forge/PricingLab';
import ReadinessGauge from '@/components/admin/forge/ReadinessGauge';
import LivePreview from '@/components/admin/forge/LivePreview';

type ForgeTab = 'visuals' | '3d' | 'pricing' | 'preview';

interface ForgeProductData {
    id: number;
    name: string;
    brand: string;
    category: string;
    price: number;
    cost_price: number;
    old_price?: number;
    image_url: string;
    description: string;
    beverage_specs: {
        model_3d_url?: string;
    };
}

export default function ProductForgeTerminal() {
    const { id } = useParams();
    const router = useRouter();
    const { role } = useAdmin();
    const [activeTab, setActiveTab] = React.useState<ForgeTab>('visuals');
    const [loading, setLoading] = React.useState(true);
    const [saving, setSaving] = React.useState(false);
    const [product, setProduct] = React.useState<ForgeProductData | null>(null);
    const [form, setForm] = React.useState<Partial<ForgeProductData>>({});
    const [visualsApproved, setVisualsApproved] = React.useState(true);

    React.useEffect(() => {
        async function loadProduct() {
            if (!supabase || !id) return;
            setLoading(true);
            try {
                const { data } = await supabase.from('products').select('*').eq('id', id).single();
                if (data) {
                    setProduct(data);
                    setForm(data);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        }
        loadProduct();
    }, [id]);

    const handleSave = async () => {
        if (!supabase || !id) return;
        setSaving(true);
        try {
            const { error } = await supabase.from('products').update(form).eq('id', id);
            if (error) throw error;
            setProduct({ ...product, ...form } as ForgeProductData);
            alert("Forge Node Synchronized. 🛰️");
        } catch (err: unknown) {
            alert(`Forge Error: ${(err as Error).message}`);
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteProduct = async (productId: number) => {
        if (!supabase || !canManageInventory) return;
        if (!window.confirm("Expunge this node from the global catalogue?")) return;
        try {
            await supabase.from('products').delete().eq('id', productId);
            alert("Node expelled from grid.");
            router.push('/admin/forge');
        } catch (err: unknown) {
            console.error(err);
        }
    };

    const canManageInventory = role === 'admin' || role === 'owner' || role === 'staff';

    if (loading) return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-white gap-4">
            <Loader2 className="h-10 w-10 text-primary animate-spin" />
            <p className="font-black text-slate-400 uppercase tracking-widest text-[10px]">Authorizing Forge Access...</p>
        </div>
    );

    const scores = {
        visuals: product?.image_url ? 94 : 0,
        content: product?.description ? 91 : 0,
        pricing: 98,
        inventory: 100,
        mobile: 93,
        seo: 86
    };

    const tabs = [
        { id: 'visuals', label: '2D Intelligence', icon: ImageIcon },
        { id: '3d', label: '3D Studio', icon: Box },
        { id: 'pricing', label: 'Pricing Lab', icon: DollarSign },
        { id: 'preview', label: 'Storefront', icon: Eye },
    ];

    return (
        <div className="p-8 space-y-10 bg-slate-50 min-h-screen text-left pb-40 selection:bg-primary/20">

            {/* TERMINAL HEADER */}
            <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 border-b border-slate-200 pb-10">
                <div className="flex items-center gap-8">
                    <button onClick={() => router.back()} className="h-14 w-14 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-slate-300 hover:text-primary transition-all shadow-sm">
                        <ArrowLeft size={28} />
                    </button>
                    <div className="space-y-2">
                        <div className="flex items-center gap-3">
                            <Zap className="h-4 w-4 text-primary" />
                            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary italic">Product Forge Terminal 2.0</span>
                        </div>
                        <h1 className="text-5xl font-black text-foreground uppercase tracking-tighter leading-none italic">
                            Refine: <span className="text-primary">{product?.name}</span>
                        </h1>
                    </div>
                </div>
                <div className="flex gap-4">
                    <div className="bg-white p-2 rounded-2xl border border-slate-100 shadow-sm flex gap-1">
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as ForgeTab)}
                                className={cn(
                                    "flex items-center gap-3 h-12 px-6 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                                    activeTab === tab.id ? "bg-slate-900 text-white shadow-xl" : "text-slate-400 hover:bg-slate-50"
                                )}
                            >
                                <tab.icon size={16} />
                                <span className="hidden sm:inline">{tab.label}</span>
                            </button>
                        ))}
                    </div>
                    <div className="flex flex-col gap-2">
                        <Button
                            onClick={handleSave}
                            data-behavior-id="forge.sync_node"
                            disabled={saving || !visualsApproved}
                            className={cn(
                                "rounded-2xl h-16 px-10 font-black uppercase text-xs tracking-widest shadow-xl transition-all",
                                visualsApproved ? "bg-primary text-white shadow-primary/20 hover:scale-[1.02] active:scale-95" : "bg-slate-200 text-slate-400 cursor-not-allowed"
                            )}
                        >
                            {saving ? <Loader2 className="animate-spin mr-3" /> : <Save className="h-5 w-5 mr-3" />} Sync Node
                        </Button>
                        {!visualsApproved && (
                            <p className="text-[7px] font-black text-rose-500 uppercase tracking-widest text-center animate-pulse">Publication Blocked: Low Visual Quality</p>
                        )}
                    </div>
                </div>
            </header>

            <div className="grid xl:grid-cols-12 gap-10">

                {/* LEFT: MAIN WORKSPACE */}
                <div className="xl:col-span-8 space-y-10">

                    {activeTab === 'visuals' && (
                        <Card className="p-10 rounded-[4rem] bg-white border border-slate-100 shadow-sm">
                             <div className="mb-10 flex items-center justify-between">
                                <div className="space-y-1">
                                    <h2 className="text-2xl font-black uppercase tracking-tight">Image Intelligence</h2>
                                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest italic">Pillar 2: Visual Fidelity & Conversion</p>
                                </div>
                                <ShieldCheck className="h-8 w-8 text-emerald-500/20" />
                            </div>
                            <ImageCoach
                                currentImageUrl={form.image_url}
                                onImageSelected={(file) => console.log("Selected:", file)}
                                onStatusChange={(approved) => setVisualsApproved(approved)}
                            />
                        </Card>
                    )}

                    {activeTab === '3d' && product && (
                        <div className="space-y-10">
                             <ThreeDStudio
                                productName={product.name}
                                modelUrl={product.beverage_specs?.model_3d_url}
                            />

                            <Card className="p-8 rounded-[3rem] bg-white border border-slate-100 shadow-sm flex items-center justify-between">
                                <div className="flex items-center gap-6">
                                    <div className="h-12 w-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-300"><Box size={24} /></div>
                                    <div>
                                        <p className="text-[10px] font-black uppercase text-slate-400">Master 3D Source</p>
                                        <p className="text-xs font-bold text-foreground font-mono">{product.beverage_specs?.model_3d_url || 'NULL_NODE'}</p>
                                    </div>
                                </div>
                                <Button variant="outline" className="h-12 px-6 rounded-xl border-slate-200 text-[10px] font-black uppercase tracking-widest">
                                    Update GLB Source
                                </Button>
                            </Card>
                        </div>
                    )}

                    {activeTab === 'pricing' && (
                        <PricingLab
                            basePrice={form.price || 0}
                            costPrice={form.cost_price || ((form.price || 0) * 0.6)}
                            onPriceChange={(p) => setForm({ ...form, price: p })}
                        />
                    )}

                    {activeTab === 'preview' && (
                         <div className="grid lg:grid-cols-2 gap-10">
                            <LivePreview product={{
                                name: form.name || '',
                                price: form.price || 0,
                                old_price: form.old_price,
                                image_url: form.image_url || '',
                                description: form.description || '',
                                brand: form.brand || '',
                                category: form.category || ''
                            }} />

                            <Card className="p-10 rounded-[4rem] bg-white border border-slate-100 shadow-sm space-y-10 text-left">
                                <div className="space-y-1">
                                    <h2 className="text-2xl font-black uppercase tracking-tight">Interactive Override</h2>
                                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-2">Manual Signal Control</p>
                                </div>

                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-[9px] font-black uppercase text-slate-400 ml-1">Live Name</label>
                                        <Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="h-14 rounded-2xl bg-slate-50 border-slate-100 font-bold" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[9px] font-black uppercase text-slate-400 ml-1">Live Description</label>
                                        <textarea
                                            value={form.description}
                                            onChange={e => setForm({ ...form, description: e.target.value })}
                                            className="w-full h-48 rounded-3xl bg-slate-50 border-slate-100 p-6 font-medium italic text-sm outline-none"
                                        />
                                    </div>
                                </div>

                                <div className="pt-8 border-t border-slate-50">
                                     <div className="p-6 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-700 flex items-center gap-4">
                                        <Info size={24} />
                                        <p className="text-[10px] font-bold uppercase leading-relaxed tracking-tight">
                                            Preview is updated in real-time. Changes are NOT committed to the grid until you hit &quot;Sync Node&quot;.
                                        </p>
                                    </div>
                                </div>
                            </Card>
                         </div>
                    )}

                </div>

                {/* RIGHT: READINESS & INTEL */}
                <div className="xl:col-span-4 space-y-10">

                    <Card className="p-10 rounded-[4rem] bg-white border border-slate-100 shadow-sm space-y-10 relative overflow-hidden">
                        <div className="relative z-10 space-y-8">
                             <ReadinessGauge scores={scores} />

                             <div className="pt-10 border-t border-slate-100 space-y-6">
                                <h3 className="text-xs font-black uppercase text-primary tracking-[0.4em]">Forge Actions</h3>
                                <div className="space-y-3">
                                    {product && (
                                        <button
                                            onClick={() => handleDeleteProduct(product.id)}
                                            className="w-full h-14 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-between px-6 hover:bg-rose-100 transition-all text-left text-rose-600"
                                        >
                                            <span className="text-[10px] font-black uppercase tracking-widest">Expunge from Catalog</span>
                                            <ChevronRight size={16} />
                                        </button>
                                    )}
                                </div>
                             </div>
                        </div>
                        <LayoutGrid className="absolute -bottom-10 -left-10 h-64 w-64 text-slate-50 rotate-12 -z-0" />
                    </Card>

                    <Card className="p-10 rounded-[4rem] bg-white border border-slate-100 shadow-sm space-y-8 text-left">
                        <h3 className="text-xs font-black uppercase text-slate-400 tracking-[0.4em]">Node Intelligence</h3>
                        <div className="space-y-6">
                            <div className="flex items-start gap-4">
                                <div className="h-10 w-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-500 shrink-0"><Search size={18} /></div>
                                <div>
                                    <p className="text-[10px] font-black uppercase text-foreground mb-1">High Discovery Potential</p>
                                    <p className="text-[9px] font-medium text-slate-400 leading-relaxed uppercase tracking-tight">This product is trending in &quot;Nairobi Nights&quot; searches. Visual quality is the bottleneck.</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4">
                                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0"><DollarSign size={18} /></div>
                                <div>
                                    <p className="text-[10px] font-black uppercase text-foreground mb-1">Margin Optimal</p>
                                    <p className="text-[9px] font-medium text-slate-400 leading-relaxed uppercase tracking-tight">32% Net margin exceeds category average. Recommended for Homepage Feature.</p>
                                </div>
                            </div>
                        </div>
                    </Card>

                </div>

            </div>

        </div>
    );
}
