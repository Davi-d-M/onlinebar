'use client';

import * as React from 'react';
import {
    Building2,
    Package,
    RefreshCcw,
    CheckCircle2,
    Wallet,
    FileDown,
    Search,
    Loader2,
    Wine,
    Activity,
    Trophy,
    Target
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn, formatPrice } from '@/lib/utils';
import { supabase } from '@/lib/supabaseClient';

interface Supplier {
    id: string;
    name: string;
}

interface InventoryProduct {
    id: number;
    name: string;
    stock: number;
    image_url: string;
    status: string;
}

export default function SupplierDashboard() {
    const [loading, setLoading] = React.useState(true);
    const [supplier, setSupplier] = React.useState<Supplier | null>(null);
    const [myInventory, setMyInventory] = React.useState<InventoryProduct[]>([]);
    const [searchQuery, setSearchQuery] = React.useState('');
    const [isUpdating, setIsUpdating] = React.useState<number | null>(null);

    React.useEffect(() => {
        async function loadSupplierData() {
            if (!supabase) return;
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
                const { data } = await supabase.from('suppliers').select('*').eq('user_id', session.user.id).single<Supplier>();
                setSupplier(data);

                if (data) {
                    const { data: prods } = await supabase.from('products').select('*').eq('supplier_id', data.id);
                    setMyInventory((prods as InventoryProduct[]) || []);
                }
            }
            setLoading(false);
        }
        loadSupplierData();
    }, []);

    const updateStock = async (productId: number, currentStock: number) => {
        const newStock = prompt(`Update stock for this item:`, String(currentStock));
        if (newStock === null || isNaN(Number(newStock))) return;

        setIsUpdating(productId);
        const { error } = await supabase!.from('products').update({ stock: Number(newStock) }).eq('id', productId);
        if (!error) {
            setMyInventory(prev => prev.map(p => p.id === productId ? { ...p, stock: Number(newStock) } : p));
        }
        setIsUpdating(null);
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-50"><Loader2 className="animate-spin text-primary" /></div>;

    return (
        <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 text-left selection:bg-primary/20">
            <div className="max-w-7xl mx-auto space-y-12">

                {/* 1. DISTRIBUTOR HEADER */}
                <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-sm relative overflow-hidden group">
                    <div className="relative z-10 flex items-center gap-6">
                        <div className="h-16 w-16 rounded-[2rem] bg-secondary border border-slate-100 flex items-center justify-center text-foreground font-black text-2xl shadow-inner group-hover:scale-110 transition-transform">
                            {supplier?.name?.substring(0, 2).toUpperCase() || 'SD'}
                        </div>
                        <div>
                            <div className="flex items-center gap-3 mb-1">
                                <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-600 text-[8px] font-black uppercase border border-emerald-100">Authorized Hub</span>
                                <p className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">Supply Network Node</p>
                            </div>
                            <h1 className="text-4xl font-black text-foreground uppercase tracking-tighter leading-none">{supplier?.name || 'Supplier Dashboard'}</h1>
                        </div>
                    </div>

                    <div className="flex gap-2 relative z-10">
                        <Button variant="outline" className="h-12 px-6 rounded-xl border-slate-200 bg-white font-black uppercase text-[10px] tracking-widest hover:bg-slate-50 transition-all shadow-sm">
                            <FileDown className="mr-2 h-4 w-4" /> Export Ledger
                        </Button>
                    </div>
                    <Building2 className="absolute -bottom-10 -right-10 h-64 w-64 text-primary/5 rotate-12 -z-0" />
                </header>

                {/* 2. OPERATIONAL HUD */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                    {[
                        { label: 'Active SKUs', val: myInventory.length, icon: Package, color: 'indigo' },
                        { label: 'Pending POs', val: 7, icon: Activity, color: 'primary' },
                        { label: 'Fulfillment Rate', val: '97%', icon: Target, color: 'emerald' },
                        { label: 'Settlement Bal', val: formatPrice(182000), icon: Wallet, color: 'primary' },
                    ].map((item) => (
                        <Card key={item.label} className="p-8 rounded-[2.5rem] bg-white border border-slate-100 shadow-sm flex flex-col justify-center gap-4 group hover:shadow-xl transition-all">
                            <div className={cn(
                                "h-12 w-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 shadow-inner",
                                item.color === 'indigo' ? "bg-indigo-50 text-indigo-500" :
                                item.color === 'primary' ? "bg-primary/5 text-primary" :
                                "bg-emerald-50 text-emerald-600"
                            )}>
                                <item.icon size={24} />
                            </div>
                            <div className="space-y-1">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">{item.label}</p>
                                <h3 className="text-xl font-black text-foreground tracking-tighter uppercase">{item.val}</h3>
                            </div>
                        </Card>
                    ))}
                </div>

                <div className="grid lg:grid-cols-12 gap-10">

                    {/* 3. INVENTORY SYNC */}
                    <div className="lg:col-span-8 space-y-8 text-left">
                        <div className="flex items-center justify-between px-2">
                            <h2 className="text-2xl font-black uppercase tracking-tighter text-foreground">Cellar Supply Sync</h2>
                            <div className="relative">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                                <Input
                                    value={searchQuery}
                                    onChange={e => setSearchQuery(e.target.value)}
                                    placeholder="Search your catalog..."
                                    className="h-12 rounded-2xl bg-white border-slate-100 pl-12 text-[10px] font-black uppercase tracking-widest w-72 shadow-sm"
                                />
                            </div>
                        </div>

                        <div className="grid gap-4">
                            {myInventory.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase())).map(p => (
                                <Card key={p.id} className="p-6 rounded-[2.5rem] bg-white border border-slate-100 shadow-sm flex items-center justify-between group hover:border-primary/20 transition-all">
                                    <div className="flex items-center gap-6">
                                        <div className="h-16 w-16 rounded-2xl bg-slate-50 border border-slate-100 p-2 flex items-center justify-center shrink-0">
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img src={p.image_url} alt="" className="max-h-full w-auto object-contain" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-black text-foreground uppercase tracking-tight leading-none">{p.name}</h3>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">Grid Status: {p.status || 'Live'}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-10">
                                        <div className="text-right">
                                            <p className="text-[8px] font-black text-slate-300 uppercase mb-1">Available Stock</p>
                                            <p className={cn(
                                                "text-xl font-black",
                                                p.stock <= 5 ? "text-rose-500" : "text-foreground"
                                            )}>{p.stock} Units</p>
                                        </div>
                                        <Button
                                            onClick={() => updateStock(p.id, p.stock)}
                                            disabled={isUpdating === p.id}
                                            className="h-12 px-6 rounded-xl bg-primary text-white font-black uppercase text-[10px] tracking-widest active:scale-95 transition-all shadow-lg shadow-primary/20"
                                        >
                                            {isUpdating === p.id ? <RefreshCcw className="animate-spin" /> : 'Sync Stock'}
                                        </Button>
                                    </div>
                                </Card>
                            ))}
                            {myInventory.length === 0 && (
                                <div className="py-24 text-center bg-white rounded-[3.5rem] border-2 border-dashed border-slate-100 opacity-40 flex flex-col items-center gap-6">
                                    <Wine size={48} className="text-slate-200" />
                                    <p className="text-sm font-black text-slate-300 uppercase italic">No inventory nodes linked to this hub.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* 4. PERFORMANCE & DOCUMENTS */}
                    <div className="lg:col-span-4 space-y-8 text-left">
                        <Card className="p-10 rounded-[3.5rem] bg-white border border-slate-100 shadow-sm space-y-8">
                            <div className="flex items-center justify-between">
                                <h3 className="text-xl font-black text-foreground uppercase tracking-tighter">Unit Scorecard</h3>
                                <Trophy size={18} className="text-amber-500" />
                            </div>
                            <div className="space-y-6">
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center text-[10px] font-black uppercase text-slate-400">
                                        <span>Order Fill Rate</span>
                                        <span className="text-emerald-500">97%</span>
                                    </div>
                                    <div className="h-1.5 w-full bg-slate-50 rounded-full overflow-hidden border border-slate-100">
                                        <div className="h-full bg-emerald-500" style={{ width: '97%' }} />
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center text-[10px] font-black uppercase text-slate-400">
                                        <span>Dispatch Speed</span>
                                        <span className="text-primary">94%</span>
                                    </div>
                                    <div className="h-1.5 w-full bg-slate-50 rounded-full overflow-hidden border border-slate-100">
                                        <div className="h-full bg-primary" style={{ width: '94%' }} />
                                    </div>
                                </div>
                            </div>
                        </Card>

                        <Card className="p-10 rounded-[3.5rem] bg-white border border-slate-100 shadow-xl space-y-6 relative overflow-hidden group">
                            <div className="relative z-10 space-y-6">
                                <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-inner group-hover:scale-110 transition-transform"><CheckCircle2 size={24} /></div>
                                <div>
                                    <h3 className="text-2xl font-black uppercase tracking-tighter leading-none mb-2 text-foreground">Legal <br/> <span className="text-primary italic">Document Vault</span></h3>
                                    <p className="text-[10px] text-slate-500 font-medium italic leading-relaxed">&quot;All compliance artifacts are encrypted and verified. Maintain your status by keeping your license and permits updated.&quot;</p>
                                </div>
                                <Button className="w-full h-14 rounded-2xl bg-primary text-white font-black uppercase text-[10px] tracking-widest shadow-xl shadow-primary/20 hover:scale-105 transition-all active:scale-95">Open Secure Vault</Button>
                            </div>
                            <Activity className="absolute -bottom-10 -left-10 h-48 w-48 text-primary/5 rotate-45 -z-0" />
                        </Card>
                    </div>

                </div>
            </div>
        </div>
    );
}
