'use client';

import * as React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import {
    ArrowLeft,
    Save,
    ShieldCheck,
    Loader2,
    BookOpen,
    Target,
    FlaskConical,
    Sparkles,
    ArrowUpRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { ProductDossier, SensoryDNA } from '@/lib/engines/productKnowledgeEngine';
import { Product } from '@/types/product';

interface Brand {
    id: string;
    name: string;
}

interface CategoryV2 {
    id: string;
    name: string;
}

export default function DossierEditor() {
    const { id } = useParams();
    const router = useRouter();
    const [loading, setLoading] = React.useState(true);
    const [saving, setSaving] = React.useState(false);
    const [product, setProduct] = React.useState<Product | null>(null);
    const [brands, setBrands] = React.useState<Brand[]>([]);
    const [categories, setCategories] = React.useState<CategoryV2[]>([]);

    const [form, setForm] = React.useState<Partial<ProductDossier>>({
        brand_id: null,
        category_v2_id: null,
        brand_identity: '',
        producer_name: '',
        country_of_origin: '',
        region_of_origin: '',
        abv_actual: '',
        volume_ml: 750,
        origin_story: '',
        production_method: '',
        kenyan_availability_status: 'AVAILABLE',
        sensory_dna: {
            sweetness: 50,
            body: 50,
            oak: 0,
            smoke: 0,
            intensity: 50,
            acidity: 0,
            tannin: 0,
            bitterness: 0
        },
        source_verification: {}
    });

    React.useEffect(() => {
        async function loadContext() {
            if (!supabase || !id) return;
            setLoading(true);
            try {
                // Fetch context data
                const [prodRes, dossierRes, brandsRes, catsRes] = await Promise.all([
                    supabase.from('products').select('*').eq('id', id).single(),
                    supabase.from('product_dossiers').select('*').eq('product_id', id).single(),
                    supabase.from('product_brands').select('*').order('name'),
                    supabase.from('product_categories_v2').select('*').order('name')
                ]);

                if (brandsRes.data) setBrands(brandsRes.data);
                if (catsRes.data) setCategories(catsRes.data);

                if (prodRes.data) {
                    setProduct(prodRes.data);
                    if (dossierRes.data) {
                        setForm(dossierRes.data as ProductDossier);
                    } else {
                        // Prefill some defaults from product record
                        setForm((f) => ({
                            ...f,
                            brand_identity: prodRes.data.brand || '',
                            country_of_origin: prodRes.data.beverage_specs?.origin || '',
                            abv_actual: prodRes.data.beverage_specs?.abv || ''
                        }));
                    }
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        }
        loadContext();
    }, [id]);

    const handleSave = async () => {
        if (!supabase || !id) return;
        setSaving(true);
        try {
            const { error } = await supabase.from('product_dossiers').upsert([{
                ...form,
                product_id: id,
                updated_at: new Date().toISOString()
            }], { onConflict: 'product_id' });

            if (error) throw error;
            alert("Dossier Node Synchronized. 🛰️");
            router.push('/admin/inventory/dossiers');
        } catch (err: unknown) {
            alert(`Uplink Failure: ${(err as Error).message}`);
        } finally {
            setSaving(false);
        }
    };

    const updateDNA = (key: keyof SensoryDNA, val: number) => {
        const currentDNA = form.sensory_dna || {
            sweetness: 50, body: 50, oak: 0, smoke: 0, intensity: 50, acidity: 0, tannin: 0, bitterness: 0
        };
        setForm({ ...form, sensory_dna: { ...currentDNA, [key]: val } });
    };

    const toggleVerification = (field: string, level: 'MANUFACTURER' | 'EDITORIAL' | 'TECHNICAL' | 'UNKNOWN') => {
        const currentVerification = form.source_verification || {};
        setForm({ ...form, source_verification: { ...currentVerification, [field]: level } });
    };

    if (loading) return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-white gap-4">
            <Loader2 className="h-10 w-10 text-primary animate-spin" />
            <p className="font-black text-slate-400 uppercase tracking-widest text-[10px]">Authorizing Research Access...</p>
        </div>
    );

    return (
        <div className="p-8 space-y-10 bg-slate-50 min-h-screen text-left pb-40 selection:bg-primary/20">
            <header className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 border-b border-slate-200 pb-8">
                <div className="flex items-center gap-6">
                    <button onClick={() => router.back()} className="h-12 w-12 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-slate-300 hover:text-primary transition-all shadow-sm">
                        <ArrowLeft size={24} />
                    </button>
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <BookOpen className="h-4 w-4 text-primary" />
                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Research Terminal</span>
                        </div>
                        <h1 className="text-4xl font-black text-foreground uppercase tracking-tighter leading-none">Dossier: {product?.name}</h1>
                    </div>
                </div>
                <div className="flex gap-4">
                    <Button onClick={handleSave} disabled={saving} className="rounded-xl h-14 px-8 bg-primary text-white font-black uppercase text-xs tracking-widest shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all">
                        {saving ? <Loader2 className="animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />} Sync Dossier
                    </Button>
                </div>
            </header>

            <div className="grid lg:grid-cols-12 gap-10">
                <div className="lg:col-span-8 space-y-10">

                    {/* SECTION 1: IDENTITY & ORIGIN */}
                    <Card className="p-10 rounded-[3.5rem] bg-white border border-slate-100 shadow-sm space-y-10">
                        <div className="flex items-center justify-between border-l-4 border-primary pl-4">
                            <h2 className="text-2xl font-black uppercase tracking-tight text-foreground">1. Identity & Origin</h2>
                            <div className="flex items-center gap-3">
                                <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Verification</p>
                                <div className="flex gap-1">
                                    {(['MANUFACTURER', 'EDITORIAL', 'UNKNOWN'] as const).map((lvl: 'MANUFACTURER' | 'EDITORIAL' | 'TECHNICAL' | 'UNKNOWN') => (
                                        <button
                                            key={lvl}
                                            onClick={() => toggleVerification('identity', lvl)}
                                            className={cn(
                                                "px-2 py-1 rounded-md text-[7px] font-black uppercase border transition-all",
                                                form.source_verification?.['identity'] === lvl ? "bg-primary text-white border-primary" : "bg-slate-50 text-slate-300"
                                            )}
                                        >
                                            {lvl.substring(0,3)}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="grid sm:grid-cols-2 gap-8">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Master Brand</label>
                                <select
                                    value={form.brand_id || ''}
                                    onChange={e => setForm({...form, brand_id: e.target.value})}
                                    className="w-full h-14 px-6 rounded-2xl border border-slate-100 bg-slate-50 text-sm font-bold outline-none"
                                >
                                    <option value="">Select Brand...</option>
                                    {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Hierarchy Category</label>
                                <select
                                    value={form.category_v2_id || ''}
                                    onChange={e => setForm({...form, category_v2_id: e.target.value})}
                                    className="w-full h-14 px-6 rounded-2xl border border-slate-100 bg-slate-50 text-sm font-bold outline-none"
                                >
                                    <option value="">Select Category...</option>
                                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Country of Origin</label>
                                <Input value={form.country_of_origin || ''} onChange={e => setForm({...form, country_of_origin: e.target.value})} className="h-14 rounded-2xl bg-slate-50 border-slate-100 font-bold" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-slate-400 ml-1">ABV (%)</label>
                                    <Input value={form.abv_actual || ''} onChange={e => setForm({...form, abv_actual: e.target.value})} className="h-14 rounded-2xl bg-slate-50 border-slate-100 font-bold" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Size (ml)</label>
                                    <Input type="number" value={form.volume_ml || 0} onChange={e => setForm({...form, volume_ml: parseInt(e.target.value)})} className="h-14 rounded-2xl bg-slate-50 border-slate-100 font-bold" />
                                </div>
                            </div>
                        </div>
                    </Card>

                    {/* SECTION 2: SENSORY DNA */}
                    <Card className="p-10 rounded-[3.5rem] bg-white border border-slate-100 shadow-sm space-y-10">
                        <div className="flex items-center justify-between border-l-4 border-primary pl-4">
                            <div className="flex items-center gap-3">
                                <FlaskConical className="h-6 w-6 text-primary" />
                                <h2 className="text-2xl font-black uppercase tracking-tight text-foreground">2. Sensory DNA Card</h2>
                            </div>
                            <div className="flex items-center gap-3">
                                <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Source Confidence</p>
                                <div className="flex gap-1">
                                    {(['TECHNICAL', 'EDITORIAL', 'UNKNOWN'] as const).map((lvl: 'MANUFACTURER' | 'EDITORIAL' | 'TECHNICAL' | 'UNKNOWN') => (
                                        <button
                                            key={lvl}
                                            onClick={() => toggleVerification('sensory_dna', lvl)}
                                            className={cn(
                                                "px-2 py-1 rounded-md text-[7px] font-black uppercase border transition-all",
                                                form.source_verification?.['sensory_dna'] === lvl ? "bg-primary text-white border-primary" : "bg-slate-50 text-slate-300"
                                            )}
                                        >
                                            {lvl.substring(0,3)}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="grid sm:grid-cols-2 gap-x-12 gap-y-8">
                            {[
                                { key: 'sweetness', label: 'Sweetness' },
                                { key: 'body', label: 'Body / Viscosity' },
                                { key: 'oak', label: 'Oak / Wood' },
                                { key: 'smoke', label: 'Smoke / Peat' },
                                { key: 'intensity', label: 'Intensity / Burn' },
                                { key: 'acidity', label: 'Acidity' },
                                { key: 'tannin', label: 'Tannin / Structure' },
                                { key: 'bitterness', label: 'Bitterness' },
                            ].map((metric) => (
                                <div key={metric.key} className="space-y-4">
                                    <div className="flex justify-between items-center px-1">
                                        <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">{metric.label}</label>
                                        <span className="text-xs font-black text-primary">{form.sensory_dna?.[metric.key as keyof SensoryDNA] ?? 0}%</span>
                                    </div>
                                    <input
                                        type="range"
                                        min="0"
                                        max="100"
                                        value={form.sensory_dna?.[metric.key as keyof SensoryDNA] ?? 50}
                                        onChange={e => updateDNA(metric.key as keyof SensoryDNA, parseInt(e.target.value))}
                                        className="w-full h-2 bg-slate-100 rounded-full appearance-none cursor-pointer accent-primary"
                                    />
                                </div>
                            ))}
                        </div>
                    </Card>

                    {/* SECTION 3: THE STORY & PRODUCTION */}
                    <Card className="p-10 rounded-[3.5rem] bg-white border border-slate-100 shadow-sm space-y-10 text-left">
                        <div className="flex items-center gap-4 border-l-4 border-primary pl-4">
                            <h2 className="text-2xl font-black uppercase tracking-tight text-foreground">3. Editorial Narrative</h2>
                        </div>

                        <div className="space-y-8">
                            <div className="space-y-3">
                                <label className="text-[10px] font-black uppercase text-slate-400 ml-1">The Origin Story</label>
                                <textarea
                                    value={form.origin_story || ''}
                                    onChange={e => setForm({...form, origin_story: e.target.value})}
                                    className="w-full h-48 rounded-[2rem] bg-slate-50 border border-slate-100 p-8 font-medium italic text-sm leading-relaxed resize-none outline-none focus:ring-4 focus:ring-primary/5 transition-all"
                                    placeholder="The history and legacy of this bottle..."
                                />
                            </div>
                            <div className="space-y-3">
                                <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Production Method</label>
                                <textarea
                                    value={form.production_method || ''}
                                    onChange={e => setForm({...form, production_method: e.target.value})}
                                    className="w-full h-40 rounded-[2rem] bg-slate-50 border border-slate-100 p-8 font-medium italic text-sm leading-relaxed resize-none outline-none focus:ring-4 focus:ring-primary/5 transition-all"
                                    placeholder="Distillation, maturation, and specific craft details..."
                                />
                            </div>
                        </div>
                    </Card>

                    {/* SECTION 4: KENYAN COMPLIANCE */}
                    <Card className="p-10 rounded-[3.5rem] bg-slate-900 text-white border-none shadow-2xl space-y-10 text-left relative overflow-hidden">
                        <div className="relative z-10 space-y-10">
                            <div className="flex items-center gap-4 border-l-4 border-primary pl-4">
                                <h2 className="text-2xl font-black uppercase tracking-tight">4. Kenya Compliance Hub</h2>
                            </div>

                            <div className="grid sm:grid-cols-2 gap-8">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-primary tracking-widest ml-1">Constituent Statement</label>
                                    <textarea
                                        value={form.constituents_statement || ''}
                                        onChange={e => setForm({...form, constituents_statement: e.target.value})}
                                        className="w-full h-24 rounded-2xl bg-white/5 border border-white/10 p-5 text-sm font-bold outline-none resize-none"
                                        placeholder="e.g. Contains Ethanol, Water, Botanicals..."
                                    />
                                </div>
                                <div className="space-y-4">
                                    <label className="text-[10px] font-black uppercase text-primary tracking-widest ml-1">Local Availability Node</label>
                                    <select
                                        value={form.kenyan_availability_status || 'AVAILABLE'}
                                        onChange={e => setForm({...form, kenyan_availability_status: e.target.value as 'AVAILABLE' | 'OUT_OF_STOCK' | 'DISCONTINUED'})}
                                        className="w-full h-14 px-6 rounded-2xl bg-white/5 border border-white/10 text-sm font-black uppercase outline-none"
                                    >
                                        <option value="AVAILABLE">Available for Dispatch</option>
                                        <option value="OUT_OF_STOCK">Out of Stock (Refilling)</option>
                                        <option value="DISCONTINUED">Expelled from Catalog</option>
                                    </select>
                                    <div className="flex items-center gap-2 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                                        <ShieldCheck size={14} className="text-emerald-500" />
                                        <span className="text-[8px] font-black uppercase tracking-widest">Compliant with Alcoholic Drinks Control Act</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <Target className="absolute -bottom-10 -left-10 h-64 w-64 text-white/5 rotate-12 -z-0" />
                    </Card>
                </div>

                <div className="lg:col-span-4 space-y-10">
                    <Card className="p-8 rounded-[3rem] bg-indigo-600 text-white space-y-8 relative overflow-hidden shadow-2xl">
                        <div className="relative z-10 space-y-6 text-left">
                            <div className="flex items-center gap-4">
                                <div className="h-12 w-12 rounded-2xl bg-white/10 flex items-center justify-center backdrop-blur-md border border-white/20 shadow-sm"><Sparkles size={24} className="text-primary" /></div>
                                <h3 className="text-xl font-black uppercase tracking-tighter leading-none">Research Assistant</h3>
                            </div>
                            <p className="text-xs font-medium opacity-80 leading-relaxed italic">
                                &quot;I recommend checking the producer&apos;s official website for the exact constituent statement required by the Kenyan Alcoholic Drinks Control Act.&quot;
                            </p>
                            <Button onClick={() => alert("Research Crawler Node under construction. 🛰️")} variant="ghost" className="w-full h-12 bg-white/5 border border-white/10 text-white font-black uppercase text-[10px] tracking-widest hover:bg-white/10">
                                Launch Research Crawler
                            </Button>
                        </div>
                    </Card>

                    <Card className="p-8 rounded-[3rem] bg-white border border-slate-100 shadow-sm space-y-8 text-left">
                        <h3 className="text-sm font-black uppercase text-slate-400 tracking-[0.4em]">Audit Timeline</h3>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between py-2 border-b border-slate-50">
                                <span className="text-[9px] font-black uppercase text-slate-500">Established</span>
                                <span className="text-[9px] font-black text-foreground">{form.created_at ? new Date(form.created_at).toLocaleDateString() : 'New Node'}</span>
                            </div>
                            <div className="flex items-center justify-between py-2 border-b border-slate-50">
                                <span className="text-[9px] font-black uppercase text-slate-500">Node Score</span>
                                <span className="text-[9px] font-black text-emerald-500">OPTIMAL</span>
                            </div>
                        </div>
                        <div className="pt-6">
                             <Button onClick={() => window.open(`/shop/${id}`, '_blank')} className="w-full h-14 rounded-2xl bg-slate-50 border border-slate-100 text-slate-400 hover:text-primary transition-all font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-2">
                                <ArrowUpRight size={14} /> Open Live PDP
                             </Button>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}
