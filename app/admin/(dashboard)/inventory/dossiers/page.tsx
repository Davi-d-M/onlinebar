'use client';

import * as React from 'react';
import { supabase } from '@/lib/supabaseClient';
import {
    BookOpen,
    Search,
    RefreshCcw,
    CheckCircle2,
    ShieldCheck,
    AlertTriangle,
    Eye,
    Edit3,
    Loader2,
    Database,
    Filter,
    Download,
    Trash2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface DossierOverview {
    id: string;
    product_id: number;
    product_name: string;
    brand: string;
    category: string;
    is_dossier_complete: boolean;
    last_verified: string;
    source_confidence: string;
}

export default function ProductDossierGrid() {
    const [products, setProducts] = React.useState<DossierOverview[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [search, setSearch] = React.useState('');
    const [filterCategory, setFilterCategory] = React.useState<string>('all');

    const fetchData = React.useCallback(async () => {
        if (!supabase) return;
        setLoading(true);
        try {
            // Join with dossier to check completeness
            const { data } = await supabase
                .from('products')
                .select(`
                    id,
                    name,
                    brand,
                    category,
                    product_dossiers(id, last_verified_at, source_verification)
                `)
                .eq('status', 'Live')
                .order('name');

            if (data) {
                const dbData = data as unknown as Array<{
                    id: number;
                    name: string;
                    brand: string | null;
                    category: string | null;
                    product_dossiers: Array<{ id: string; last_verified_at: string }>;
                }>;
                setProducts(dbData.map((p) => {
                    const dossier = p.product_dossiers?.[0];
                    return {
                        id: dossier?.id || '',
                        product_id: p.id,
                        product_name: p.name,
                        brand: p.brand || 'Unknown',
                        category: p.category || 'Spirits',
                        is_dossier_complete: !!dossier?.id,
                        last_verified: dossier?.last_verified_at || 'Never',
                        source_confidence: dossier ? 'Optimal' : 'Low'
                    };
                }));
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, []);

    React.useEffect(() => {
        fetchData();
    }, [fetchData]);

    const filtered = products.filter(p => {
        const matchesSearch = p.product_name.toLowerCase().includes(search.toLowerCase()) ||
                             p.brand.toLowerCase().includes(search.toLowerCase());
        const matchesCategory = filterCategory === 'all' || p.category.toLowerCase() === filterCategory.toLowerCase();
        return matchesSearch && matchesCategory;
    });

    const categories = ['all', ...Array.from(new Set(products.map(p => p.category.toLowerCase())))];

    const handleDeleteDossier = async (productId: number, productName: string) => {
        if (!supabase || !window.confirm(`Are you sure you want to expunge the research dossier for ${productName}? This will reset all verification data.`)) return;
        try {
            const { error } = await supabase.from('product_dossiers').delete().eq('product_id', productId);
            if (error) throw error;
            fetchData();
        } catch (err) {
            console.error("Dossier Expunge Failure:", err);
            alert("Uplink Failure: Could not expunge dossier.");
        }
    };

    return (
        <div className="p-8 space-y-10 bg-slate-50 min-h-screen text-left pb-40 selection:bg-primary/20">
            <header className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 border-b border-slate-200 pb-8">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <BookOpen className="h-4 w-4 text-primary" />
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Kenya Master Catalogue</span>
                    </div>
                    <h1 className="text-4xl lg:text-5xl font-black text-foreground uppercase tracking-tighter leading-none">Beverage Dossiers</h1>
                    <p className="text-muted-foreground text-sm font-medium mt-1">Research, verification, and high-fidelity knowledge management.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" className="rounded-xl h-12 px-6 border-slate-200 bg-white font-black uppercase text-[10px] tracking-widest hover:bg-slate-50 transition-all shadow-sm">
                        <Download size={14} className="mr-2" /> Batch Import
                    </Button>
                    <Button onClick={fetchData} variant="outline" className="rounded-xl h-12 px-6 border-slate-200 bg-white font-black uppercase text-[10px] tracking-widest hover:bg-slate-50 transition-all">
                        <RefreshCcw className={cn("h-4 w-4 mr-2", loading && "animate-spin")} /> Sync Library
                    </Button>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                    { label: 'Total Dossiers', val: products.length, icon: Database, color: 'primary' },
                    { label: 'Verified Nodes', val: products.filter(p => p.is_dossier_complete).length, icon: ShieldCheck, color: 'emerald' },
                    { label: 'Awaiting Research', val: products.filter(p => !p.is_dossier_complete).length, icon: AlertTriangle, color: 'rose' },
                    { label: 'Network Confidence', val: '92%', icon: CheckCircle2, color: 'indigo' },
                ].map(stat => (
                    <Card key={stat.label} className="p-8 rounded-[3rem] bg-white border border-slate-100 shadow-sm group hover:shadow-xl transition-all">
                        <div className={cn(
                            "h-10 w-10 rounded-xl flex items-center justify-center mb-6 shadow-inner transition-transform group-hover:scale-110",
                            stat.color === 'primary' ? "bg-primary/10 text-primary" :
                            stat.color === 'emerald' ? "bg-emerald-50 text-emerald-500" :
                            stat.color === 'rose' ? "bg-rose-50 text-rose-500" :
                            "bg-indigo-50 text-indigo-500"
                        )}>
                            <stat.icon size={20} />
                        </div>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
                        <h3 className="text-2xl font-black text-foreground uppercase tracking-tight">{stat.val}</h3>
                    </Card>
                ))}
            </div>

            <div className="space-y-6">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 px-4">
                    <h2 className="text-2xl font-black uppercase tracking-tighter text-foreground">Inventory Payload</h2>
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="relative">
                            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                            <select
                                value={filterCategory}
                                onChange={e => setFilterCategory(e.target.value)}
                                className="h-12 w-48 pl-12 rounded-2xl bg-white border-slate-100 text-[10px] font-black uppercase tracking-widest shadow-sm outline-none"
                            >
                                {categories.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                            <Input
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                placeholder="Search by bottle or brand..."
                                className="h-12 w-80 pl-12 rounded-2xl bg-white border-slate-100 text-[10px] font-black uppercase tracking-widest shadow-sm"
                            />
                        </div>
                    </div>
                </div>

                <div className="grid gap-4">
                    {loading && products.length === 0 ? (
                        <div className="py-40 flex flex-col items-center gap-6">
                            <Loader2 className="h-10 w-10 text-primary animate-spin" />
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-300">Decrypting Knowledge Nodes...</p>
                        </div>
                    ) : filtered.map(item => (
                        <Card key={item.product_id} className="p-6 rounded-[2.5rem] bg-white border border-slate-100 shadow-sm hover:shadow-xl transition-all group overflow-hidden relative">
                            <div className="flex justify-between items-center relative z-10 text-left">
                                <div className="flex items-center gap-8 flex-1 min-w-0">
                                    <div className={cn(
                                        "h-16 w-16 rounded-[1.5rem] border flex items-center justify-center shrink-0",
                                        item.is_dossier_complete ? "bg-emerald-50 border-emerald-100 text-emerald-500" : "bg-slate-50 border-slate-100 text-slate-300"
                                    )}>
                                        <BookOpen size={28} />
                                    </div>
                                    <div className="min-w-0">
                                        <div className="flex items-center gap-3 mb-1">
                                            <span className="text-[9px] font-black uppercase text-primary tracking-widest">{item.brand}</span>
                                            <div className="h-1 w-1 rounded-full bg-slate-200" />
                                            <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">{item.category}</span>
                                        </div>
                                        <h3 className="text-xl font-black text-foreground uppercase tracking-tight truncate">{item.product_name}</h3>
                                        <div className="flex items-center gap-3 mt-3">
                                            {item.is_dossier_complete ? (
                                                <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-emerald-50 text-emerald-600 border border-emerald-100">
                                                    <CheckCircle2 size={10} />
                                                    <span className="text-[8px] font-black uppercase">Verified Node</span>
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-amber-50 text-amber-600 border border-amber-100 animate-pulse">
                                                    <AlertTriangle size={10} />
                                                    <span className="text-[8px] font-black uppercase">Research Required</span>
                                                </div>
                                            )}
                                            <span className="text-[8px] font-black text-slate-300 uppercase">Last Sync: {item.last_verified !== 'Never' ? new Date(item.last_verified).toLocaleDateString() : 'Never'}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4">
                                    <Link href={`/shop/${item.product_id}`} target="_blank">
                                        <button className="h-12 w-12 rounded-xl bg-slate-50 flex items-center justify-center text-slate-300 hover:text-indigo-500 hover:bg-indigo-50 transition-all border border-slate-100 shadow-sm" title="Preview PDP">
                                            <Eye size={20} />
                                        </button>
                                    </Link>
                                    <Link href={`/admin/inventory/dossiers/edit/${item.product_id}`}>
                                        <button className="h-12 w-12 rounded-xl bg-slate-50 flex items-center justify-center text-slate-300 hover:bg-primary hover:text-white transition-all shadow-sm border border-slate-100">
                                            <Edit3 size={20} />
                                        </button>
                                    </Link>
                                    <button
                                        onClick={() => handleDeleteDossier(item.product_id, item.product_name)}
                                        className="h-12 w-12 rounded-xl bg-slate-50 flex items-center justify-center text-slate-300 hover:bg-rose-500 hover:text-white transition-all shadow-sm border border-slate-100"
                                        title="Expunge Dossier"
                                    >
                                        <Trash2 size={20} />
                                    </button>
                                </div>
                            </div>
                            {item.is_dossier_complete && <ShieldCheck className="absolute -bottom-4 -right-4 h-24 w-24 text-emerald-500/5 rotate-12" />}
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    );
}
