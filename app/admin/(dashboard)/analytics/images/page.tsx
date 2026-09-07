'use client';

import * as React from 'react';
import { supabase } from '@/lib/supabaseClient';
import {
    RefreshCcw,
    ShieldAlert,
    CheckCircle2,
    Loader2,
    ChevronRight,
    Search,
    AlertTriangle,
    Camera
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import Image from 'next/image';

interface ProductImageHealth {
    id: number;
    name: string;
    image_url: string;
    image_quality_score: number;
    status: string;
}

export default function ImageIntelligencePage() {
    const [products, setProducts] = React.useState<ProductImageHealth[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [searchQuery, setSearchQuery] = React.useState('');

    const fetchHealthData = React.useCallback(async () => {
        if (!supabase) return;
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('products')
                .select('id, name, image_url, image_quality_score, status')
                .order('image_quality_score', { ascending: true }); // Show worst first

            if (error) throw error;
            setProducts(data || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, []);

    React.useEffect(() => {
        fetchHealthData();
    }, [fetchHealthData]);

    const stats = React.useMemo(() => {
        const excellent = products.filter(p => p.image_quality_score >= 80).length;
        const good = products.filter(p => p.image_quality_score >= 60 && p.image_quality_score < 80).length;
        const poor = products.filter(p => p.image_quality_score < 60).length;
        const avg = products.length > 0 ? Math.round(products.reduce((s, p) => s + (p.image_quality_score || 0), 0) / products.length) : 0;

        return { excellent, good, poor, avg };
    }, [products]);

    const filtered = products.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));

    return (
        <div className="p-8 space-y-10 bg-slate-50 min-h-screen text-left selection:bg-primary/20">
            <header className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 border-b border-slate-200 pb-8">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <Camera className="h-4 w-4 text-primary" />
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Visual Asset Intelligence</span>
                    </div>
                    <h1 className="text-4xl font-black text-foreground uppercase tracking-tighter leading-none">Image Health</h1>
                    <p className="text-muted-foreground text-sm font-medium mt-1">Catalog-wide photography audit and quality scoring.</p>
                </div>
                <Button onClick={fetchHealthData} variant="outline" className="rounded-xl h-12 px-6 border-slate-200 bg-white font-black uppercase text-[10px] tracking-widest transition-all">
                    <RefreshCcw className={cn("h-4 w-4 mr-2", loading && "animate-spin")} /> Re-Audit Catalog
                </Button>
            </header>

            {/* Visual HUD */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                    { label: 'Avg Health Score', val: `${stats.avg}/100`, icon: CheckCircle2, color: 'primary' },
                    { label: 'Poor Resolution', val: stats.poor, icon: ShieldAlert, color: 'rose' },
                    { label: 'Good Assets', val: stats.good, icon: Camera, color: 'amber' },
                    { label: 'Excellent', val: stats.excellent, icon: CheckCircle2, color: 'emerald' },
                ].map(item => (
                    <Card key={item.label} className="p-8 rounded-[2.5rem] bg-white border border-slate-100 shadow-sm group hover:shadow-xl transition-all relative overflow-hidden">
                        <div className={cn(
                            "h-12 w-12 rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110 shadow-sm",
                            item.color === 'rose' ? "bg-rose-50 text-rose-500" :
                            item.color === 'amber' ? "bg-amber-50 text-amber-500" :
                            item.color === 'primary' ? "bg-primary/5 text-primary" :
                            "bg-emerald-50 text-emerald-500"
                        )}>
                            <item.icon className="h-6 w-6" />
                        </div>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{item.label}</p>
                        <h3 className="text-3xl font-black text-foreground tracking-tighter uppercase">{item.val}</h3>
                    </Card>
                ))}
            </div>

            <div className="relative">
                <Input
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Search product identifiers..."
                    className="h-14 rounded-2xl border-slate-100 bg-white pl-12 text-sm font-medium shadow-sm"
                />
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300" />
            </div>

            {loading ? (
                <div className="p-32 text-center">
                    <Loader2 className="h-10 w-10 text-primary animate-spin mx-auto mb-4" />
                    <p className="text-[10px] font-black uppercase text-slate-300 tracking-widest">Scanning Catalog Assets...</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filtered.map(p => (
                        <Card key={p.id} className="p-6 rounded-[2.5rem] bg-white border border-slate-100 shadow-sm hover:shadow-2xl transition-all group overflow-hidden flex flex-col justify-between h-full">
                            <div className="space-y-6">
                                <div className="aspect-square rounded-3xl bg-slate-50 border border-slate-100 p-4 flex items-center justify-center relative overflow-hidden">
                                    <Image src={p.image_url} alt="" fill className="object-contain p-4 group-hover:scale-110 transition-transform duration-700" />

                                    <div className={cn(
                                        "absolute top-4 left-4 px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest shadow-lg z-10",
                                        p.image_quality_score >= 80 ? "bg-emerald-500 text-white" :
                                        p.image_quality_score >= 60 ? "bg-amber-500 text-white" : "bg-rose-500 text-white"
                                    )}>
                                        Score: {p.image_quality_score || 0}
                                    </div>
                                </div>

                                <div>
                                    <h4 className="font-black text-foreground uppercase text-xs truncate mb-2">{p.name}</h4>
                                    <div className="flex items-center gap-2">
                                        <div className="h-1.5 flex-1 bg-slate-100 rounded-full overflow-hidden">
                                            <div
                                                className={cn(
                                                    "h-full rounded-full transition-all duration-1000",
                                                    p.image_quality_score >= 80 ? "bg-emerald-500" :
                                                    p.image_quality_score >= 60 ? "bg-amber-500" : "bg-rose-500"
                                                )}
                                                style={{ width: `${p.image_quality_score || 0}%` }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-6">
                                <Link href={`/admin/upload?id=${p.id}`}>
                                    <Button variant="outline" className="w-full h-12 rounded-xl border-slate-100 font-black uppercase text-[10px] tracking-widest hover:bg-primary hover:text-white transition-all">
                                        Fix Assets <ChevronRight className="ml-2 h-4 w-4" />
                                    </Button>
                                </Link>
                            </div>

                            {p.image_quality_score < 60 && (
                                <div className="absolute -bottom-2 -right-2 p-4 text-rose-500/10">
                                    <AlertTriangle size={80} className="rotate-12" />
                                </div>
                            )}
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
