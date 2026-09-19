'use client';

import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
    Zap,
    Search,
    RefreshCcw,
    ChevronRight,
    Loader2,
    Database,
    ShieldCheck,
    AlertTriangle,
    Flame,
    Box,
    Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { cn, formatPrice } from '@/lib/utils';
import { supabase } from '@/lib/supabaseClient';

interface ForgeProduct {
    id: number;
    name: string;
    brand: string;
    category: string;
    price: number;
    image_url: string;
    readiness_score: number;
    has_3d: boolean;
    status: string;
    stock: number;
}

type ForgeFilterMode = 'all' | '3d' | 'gaps' | 'readiness';

export default function ProductForgeDashboard() {
    const [products, setProducts] = React.useState<ForgeProduct[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [search, setSearch] = React.useState('');
    const [filterMode, setFilterMode] = React.useState<ForgeFilterMode>('all');

    const fetchData = React.useCallback(async () => {
        if (!supabase) return;
        setLoading(true);
        try {
            const { data } = await supabase
                .from('products')
                .select('*')
                .order('name');

            if (data) {
                setProducts(data.map(p => ({
                    id: p.id,
                    name: p.name,
                    brand: p.brand || 'Unknown',
                    category: p.category || 'Spirits',
                    price: p.price,
                    image_url: p.image_url,
                    stock: p.stock,
                    // Simulated readiness score logic
                    readiness_score: Math.floor(Math.random() * (98 - 65 + 1) + 65),
                    has_3d: !!p.beverage_specs?.model_3d_url,
                    status: p.status || 'Live'
                })));
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
        const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
                             p.brand.toLowerCase().includes(search.toLowerCase());

        let matchesFilter = true;
        if (filterMode === '3d') matchesFilter = p.has_3d;
        if (filterMode === 'gaps') matchesFilter = p.readiness_score < 80;
        if (filterMode === 'readiness') matchesFilter = p.readiness_score >= 90;

        return matchesSearch && matchesFilter;
    });

    return (
        <div className="p-8 space-y-10 bg-slate-50 min-h-screen text-left pb-40 selection:bg-primary/20">

            {/* FORGE DASHBOARD HEADER */}
            <header className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 border-b border-slate-200 pb-8">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <Flame className="h-4 w-4 text-primary" />
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary italic text-left">Catalogue Intelligence Node</span>
                    </div>
                    <h1 className="text-4xl lg:text-5xl font-black text-foreground uppercase tracking-tighter leading-none italic">
                        Apex Product <span className="text-primary">Forge.</span>
                    </h1>
                    <p className="text-muted-foreground text-sm font-medium mt-1">Transform raw inventory into high-conversion digital assets.</p>
                </div>
                <div className="flex gap-2">
                    <Button onClick={fetchData} variant="outline" className="rounded-xl h-12 px-6 border-slate-200 bg-white font-black uppercase text-[10px] tracking-widest hover:bg-slate-50 transition-all">
                        <RefreshCcw className={cn("h-4 w-4 mr-2", loading && "animate-spin")} /> Re-Scan Catalog
                    </Button>
                    <Link href="/admin/upload">
                        <Button className="rounded-xl h-12 px-6 bg-slate-900 text-white font-black uppercase text-[10px] tracking-widest hover:scale-[1.02] active:scale-95 transition-all">
                            <Database size={14} className="mr-2" /> Initialize New Node
                        </Button>
                    </Link>
                </div>
            </header>

            {/* CATALOG ANALYTICS */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                    { id: 'all', label: 'Catalog Health', val: '94%', icon: ShieldCheck, color: 'emerald' },
                    { id: '3d', label: '3D Coverage', val: `${Math.round((products.filter(p => p.has_3d).length / products.length) * 100) || 0}%`, icon: Box, color: 'indigo' },
                    { id: 'gaps', label: 'Media Gaps', val: products.filter(p => p.readiness_score < 80).length, icon: AlertTriangle, color: 'rose' },
                    { id: 'readiness', label: 'Market Readiness', val: products.filter(p => p.readiness_score >= 90).length, icon: Zap, color: 'primary' },
                ].map(stat => (
                    <Card
                        key={stat.label}
                        onClick={() => setFilterMode(stat.id as ForgeFilterMode)}
                        className={cn(
                            "p-8 rounded-[3rem] bg-white border shadow-sm group hover:shadow-xl transition-all text-left cursor-pointer",
                            filterMode === stat.id ? "border-primary ring-2 ring-primary/10" : "border-slate-100"
                        )}
                    >
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

            {/* FORGE GRID */}
            <div className="space-y-6">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 px-4">
                    <h2 className="text-2xl font-black uppercase tracking-tighter text-foreground italic">Grid Decryption</h2>
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                            <Input
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                placeholder="Search by SKU or Name..."
                                className="h-12 w-80 pl-12 rounded-2xl bg-white border-slate-100 text-[10px] font-black uppercase tracking-widest shadow-sm"
                            />
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {loading && products.length === 0 ? (
                        <div className="col-span-full py-40 flex flex-col items-center gap-6">
                            <Loader2 className="h-10 w-10 text-primary animate-spin" />
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-300">Synchronizing Forge Hub...</p>
                        </div>
                    ) : filtered.map(item => (
                        <Card key={item.id} className="rounded-[3.5rem] bg-white border border-slate-100 shadow-sm hover:shadow-2xl transition-all group overflow-hidden flex flex-col h-full text-left">
                            {/* SCORE HEADER */}
                            <div className="px-8 pt-8 pb-4 flex justify-between items-start">
                                <div className={cn(
                                    "px-4 py-1.5 rounded-full border text-[8px] font-black uppercase tracking-widest",
                                    item.readiness_score >= 90 ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                                    item.readiness_score >= 75 ? "bg-primary/5 text-primary border-primary/10" :
                                    "bg-rose-50 text-rose-600 border-rose-100"
                                )}>
                                    Forge Score: {item.readiness_score}
                                </div>
                                {item.has_3d && <Box size={14} className="text-indigo-400 animate-pulse" />}
                            </div>

                            <div className="p-8 pt-4 space-y-6 flex-1 flex flex-col">
                                <div className="flex gap-6 items-center">
                                    <div className="h-20 w-20 rounded-3xl bg-slate-50 border border-slate-100 overflow-hidden flex items-center justify-center p-2 group-hover:scale-105 transition-transform relative">
                                        {item.image_url ? (
                                            <Image
                                                src={item.image_url}
                                                alt={item.name}
                                                fill
                                                className="object-contain p-2"
                                                unoptimized={item.image_url.includes('unsplash.com')}
                                            />
                                        ) : (
                                            <Sparkles className="text-slate-200" />
                                        )}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="text-[9px] font-black uppercase text-primary tracking-widest mb-1">{item.brand}</p>
                                        <h3 className="text-xl font-black text-foreground uppercase tracking-tight truncate leading-tight italic">{item.name}</h3>
                                        <p className="text-[9px] font-bold text-slate-400 mt-1 uppercase">{formatPrice(item.price)} • {item.stock} Units</p>
                                    </div>
                                </div>

                                {/* GAP ANALYSIS (Simulated) */}
                                <div className="space-y-3 bg-slate-50 p-6 rounded-[2rem] border border-slate-100/50">
                                    <p className="text-[8px] font-black uppercase text-slate-400 tracking-widest">Readiness Protocol</p>
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2">
                                            <ShieldCheck size={10} className={item.readiness_score > 80 ? "text-emerald-500" : "text-slate-300"} />
                                            <span className="text-[8px] font-black uppercase text-slate-500">Visual Quality Certified</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {item.has_3d ? (
                                                <ShieldCheck size={10} className="text-emerald-500" />
                                            ) : (
                                                <AlertTriangle size={10} className="text-amber-500" />
                                            )}
                                            <span className="text-[8px] font-black uppercase text-slate-500">{item.has_3d ? '3D Stage Established' : '3D Model Missing'}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* CTA */}
                            <Link href={`/admin/forge/${item.id}`}>
                                <button className="w-full h-20 bg-slate-900 group-hover:bg-primary transition-colors flex items-center justify-center gap-3 text-white">
                                    <span className="text-[10px] font-black uppercase tracking-[0.3em]">Enter Forge Node</span>
                                    <ChevronRight size={16} />
                                </button>
                            </Link>
                        </Card>
                    ))}
                </div>
            </div>

            {/* MASTER HUD OVERLAY */}
            <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50">
                 <div className="bg-white/90 backdrop-blur-2xl px-10 py-5 rounded-[2.5rem] shadow-2xl flex items-center gap-10 border border-slate-100">
                    <Link href="/admin/audit" className="flex items-center gap-4 hover:bg-slate-50 p-2 rounded-xl transition-all">
                        <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                        <div>
                            <p className="text-[8px] font-black uppercase text-emerald-600 tracking-widest leading-none">Global Status</p>
                            <p className="text-[10px] font-black text-foreground uppercase mt-1">Operational</p>
                        </div>
                    </Link>
                    <div className="h-8 w-[1px] bg-slate-100" />
                    <Link href="/admin/upload" className="hover:bg-slate-50 p-2 rounded-xl transition-all">
                        <p className="text-[8px] font-black uppercase text-slate-400 tracking-widest leading-none text-left">Total Nodes</p>
                        <p className="text-[10px] font-black text-foreground uppercase mt-1 text-left">{products.length}</p>
                    </Link>
                    <div className="h-8 w-[1px] bg-slate-100" />
                    <button onClick={fetchData} className="flex items-center gap-3 hover:bg-slate-50 p-2 rounded-xl transition-all">
                        <Sparkles size={14} className="text-primary" />
                        <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">AI Command Active</span>
                    </button>
                 </div>
            </div>

        </div>
    );
}
