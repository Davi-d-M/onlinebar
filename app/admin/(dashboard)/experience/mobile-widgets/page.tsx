'use client';

import * as React from 'react';
import { supabase } from '@/lib/supabaseClient';
import {
    Zap,
    Loader2,
    Save,
    X,
    TrendingUp,
    Settings2,
    Smartphone,
    Plus,
    Trash2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { useAdmin } from '@/context/AdminContext';
import { logAuditAction } from '@/lib/auditService';
import Image from 'next/image';

interface MobileWidget {
    id: string;
    title: string;
    description: string;
    content_type: 'PRODUCT' | 'TRENDING' | 'ANNOUNCEMENT' | 'ORDER';
    image_url: string;
    product_id: string | null;
    cta_label: string;
    deep_link: string;
    status: string;
    priority: number;
    target_segment: string;
    start_at: string;
    expires_at: string | null;
}

export default function MobileWidgetCommand() {
    const { email } = useAdmin();
    const [widgets, setWidgets] = React.useState<MobileWidget[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [editing, setEditing] = React.useState<Partial<MobileWidget> | null>(null);
    const [products, setProducts] = React.useState<Array<{ id: string, name: string, image_url: string }>>([]);

    const fetchWidgets = React.useCallback(async () => {
        if (!supabase) return;
        setLoading(true);
        try {
            const { data } = await supabase.from('mobile_app_widgets').select('*').order('priority', { ascending: false });
            if (data) setWidgets(data as MobileWidget[]);

            const { data: prodData } = await supabase.from('products').select('id, name, image_url').limit(10);
            if (prodData) setProducts(prodData as Array<{ id: string, name: string, image_url: string }>);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, []);

    React.useEffect(() => {
        fetchWidgets();
    }, [fetchWidgets]);

    const handleSave = async () => {
        if (!supabase || !editing) return;
        setLoading(true);
        try {
            const payload = {
                ...editing,
                updated_at: new Date().toISOString()
            };
            const { error } = await supabase.from('mobile_app_widgets').upsert([payload]);
            if (error) throw error;
            await logAuditAction(email, 'MOBILE_WIDGET_SAVE', { title: editing.title });
            setEditing(null);
            fetchWidgets();
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    const handleDelete = async (id: string) => {
        if (!supabase || !confirm("Expel this widget from all terminals?")) return;
        await supabase.from('mobile_app_widgets').delete().eq('id', id);
        fetchWidgets();
    };

    return (
        <div className="p-8 space-y-10 bg-slate-50 min-h-screen text-left selection:bg-primary/20 pb-40">
            <header className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 border-b border-slate-200 pb-8">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <Smartphone className="h-4 w-4 text-primary" />
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Terminal Experience</span>
                    </div>
                    <h1 className="text-4xl font-black text-foreground uppercase tracking-tighter leading-none">App Widget Command</h1>
                    <p className="text-muted-foreground text-sm font-medium mt-1">Design and publish live content nodes directly to patrons&apos; home screens.</p>
                </div>
                <Button
                    onClick={() => setEditing({
                        title: 'New Widget',
                        content_type: 'PRODUCT',
                        status: 'DRAFT',
                        priority: 10,
                        target_segment: 'ALL',
                        cta_label: 'SHOP NOW',
                        start_at: new Date().toISOString().substring(0, 16)
                    })}
                    className="rounded-xl h-12 px-8 bg-primary text-white font-black uppercase text-[10px] tracking-widest shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
                >
                    <Plus className="h-4 w-4 mr-2" /> Design New Widget
                </Button>
            </header>

            <div className="grid lg:grid-cols-12 gap-10">
                <div className="lg:col-span-8 space-y-6">
                    <div className="flex items-center justify-between px-4">
                        <h2 className="text-xl font-black uppercase tracking-tighter text-foreground">Active Nodes</h2>
                        <span className="text-[10px] font-black uppercase text-slate-400 bg-white px-3 py-1 rounded-full border border-slate-100">{widgets.length} Configured</span>
                    </div>

                    <div className="grid gap-4">
                        {loading && widgets.length === 0 ? (
                            <div className="p-20 text-center bg-white rounded-[3rem] border border-slate-100 animate-pulse">
                                <Loader2 className="h-8 w-8 text-primary animate-spin mx-auto" />
                            </div>
                        ) : widgets.map((w) => (
                            <Card key={w.id} className={cn(
                                "p-6 rounded-[2.5rem] border transition-all hover:shadow-xl relative overflow-hidden group",
                                w.status === 'PUBLISHED' ? "bg-white border-slate-100" : "bg-slate-50 border-dashed border-slate-200 opacity-60"
                            )}>
                                <div className="flex items-center gap-6 relative z-10 text-left">
                                    <div className="h-16 w-16 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center relative overflow-hidden shrink-0">
                                        {w.image_url ? (
                                            <Image src={w.image_url} alt="" fill className="object-contain p-2" />
                                        ) : (
                                            <Smartphone className="text-slate-300" />
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-3 mb-1">
                                            <span className="text-[10px] font-black uppercase text-primary tracking-widest">{w.content_type}</span>
                                            <div className="h-1 w-1 rounded-full bg-slate-200" />
                                            <span className="text-[8px] font-black uppercase text-slate-400">Target: {w.target_segment}</span>
                                        </div>
                                        <h3 className="text-xl font-black uppercase tracking-tight text-foreground">{w.title}</h3>
                                        <p className="text-[10px] font-medium text-slate-500 truncate italic">&quot;{w.description}&quot;</p>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <Button variant="ghost" size="icon" onClick={() => setEditing(w)} className="h-10 w-10 rounded-xl hover:bg-slate-50"><Settings2 size={18} /></Button>
                                        <Button variant="ghost" size="icon" onClick={() => handleDelete(w.id)} className="h-10 w-10 rounded-xl hover:bg-rose-50 text-rose-500"><Trash2 size={18} /></Button>
                                        <div className={cn(
                                            "px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest border",
                                            w.status === 'PUBLISHED' ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-slate-100 text-slate-400 border-slate-200"
                                        )}>
                                            {w.status}
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                </div>

                <div className="lg:col-span-4">
                    {/* WIDGET PREVIEW (PHONE FRAME) */}
                    <div className="sticky top-10 space-y-8">
                        <div className="relative mx-auto w-[280px] h-[580px] bg-slate-900 rounded-[3rem] border-[8px] border-slate-800 shadow-2xl overflow-hidden p-4">
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-slate-800 rounded-b-2xl z-20"></div>

                            {/* App Icon Mockup */}
                            <div className="mt-20 flex flex-wrap gap-6 justify-center opacity-40">
                                {[1,2,3,4,5,6].map(i => <div key={i} className="h-12 w-12 rounded-xl bg-slate-700" />)}
                            </div>

                            {/* THE REAL WIDGET PREVIEW */}
                            <div className="mt-10 animate-in zoom-in-95 duration-500">
                                <Card className="p-4 rounded-[2rem] bg-white border-none shadow-xl space-y-4 text-left relative overflow-hidden">
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="h-5 w-5 rounded-lg bg-primary flex items-center justify-center text-white"><Zap size={10} fill="currentColor" /></div>
                                        <span className="text-[10px] font-black uppercase tracking-tight text-slate-400">Online Bar</span>
                                    </div>

                                    <h4 className="text-sm font-black uppercase text-foreground leading-none">{editing?.title || 'Trending Tonight'}</h4>

                                    <div className="aspect-square w-full bg-slate-50 rounded-xl relative overflow-hidden flex items-center justify-center">
                                        {editing?.image_url ? (
                                            <Image src={editing.image_url} alt="" fill className="object-contain p-4" />
                                        ) : (
                                            <TrendingUp className="h-10 w-10 text-slate-200" />
                                        )}
                                    </div>

                                    <div className="space-y-1">
                                        <p className="text-[9px] font-medium text-slate-500 line-clamp-2 italic leading-relaxed">
                                            &quot;{editing?.description || 'Discover what Nairobi is drinking right now.'}&quot;
                                        </p>
                                    </div>

                                    <Button size="sm" className="w-full h-10 rounded-xl bg-primary text-white font-black uppercase text-[8px] tracking-widest shadow-lg shadow-primary/20 pointer-events-none">
                                        {editing?.cta_label || 'EXPLORE'}
                                    </Button>

                                    <div className="absolute -bottom-2 -right-2 h-12 w-12 bg-primary/5 rounded-full blur-xl"></div>
                                </Card>
                            </div>
                        </div>
                        <p className="text-[10px] font-black uppercase text-slate-400 text-center tracking-[0.3em]">Live Node Preview</p>
                    </div>
                </div>
            </div>

            {/* EDITOR SLIDE-OVER */}
            {editing && (
                <div className="fixed inset-0 z-[1000] flex items-center justify-end bg-slate-900/40 backdrop-blur-md">
                    <Card className="h-full w-full max-w-xl bg-white rounded-l-[4rem] border-none shadow-2xl flex flex-col animate-in slide-in-from-right-full duration-500 overflow-hidden text-left">
                        <div className="p-10 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                            <div className="flex items-center gap-4">
                                <div className="h-12 w-12 rounded-2xl bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/20"><Zap size={24} /></div>
                                <div>
                                    <h2 className="text-3xl font-black uppercase tracking-tighter text-foreground leading-none">Widget Studio</h2>
                                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mt-1">Configure Remote Content Node</p>
                                </div>
                            </div>
                            <button onClick={() => setEditing(null)} className="h-12 w-12 rounded-full hover:bg-white flex items-center justify-center transition-all shadow-sm border border-slate-100"><X size={24} /></button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-10 space-y-10 no-scrollbar">
                            <section className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Widget Title</label>
                                    <Input
                                        value={editing.title}
                                        onChange={e => setEditing({...editing, title: e.target.value})}
                                        className="h-14 rounded-2xl bg-slate-50 border-slate-100 font-bold"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Engagement Narrative</label>
                                    <Textarea
                                        value={editing.description}
                                        onChange={e => setEditing({...editing, description: e.target.value})}
                                        className="min-h-[100px] rounded-2xl bg-slate-50 border-slate-100 p-6 font-medium italic resize-none"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Target Product</label>
                                    <select
                                        value={editing.product_id || ''}
                                        onChange={e => setEditing({...editing, product_id: e.target.value})}
                                        className="w-full h-14 rounded-2xl bg-slate-50 border border-slate-100 px-6 font-black text-[10px] uppercase outline-none focus:ring-4 focus:ring-primary/5 transition-all"
                                    >
                                        <option value="">No Product Attached</option>
                                        {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                    </select>
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Content Logic</label>
                                        <select
                                            value={editing.content_type}
                                            onChange={e => setEditing({...editing, content_type: e.target.value as 'PRODUCT' | 'TRENDING' | 'ANNOUNCEMENT' | 'ORDER'})}
                                            className="w-full h-14 rounded-2xl bg-slate-50 border border-slate-100 px-6 font-black text-[10px] uppercase outline-none focus:ring-4 focus:ring-primary/5 transition-all"
                                        >
                                            <option value="PRODUCT">🛍️ Single Product</option>
                                            <option value="TRENDING">🔥 Trending Now</option>
                                            <option value="ANNOUNCEMENT">📣 Announcement</option>
                                            <option value="ORDER">🚚 Order Status</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Target Segment</label>
                                        <select
                                            value={editing.target_segment}
                                            onChange={e => setEditing({...editing, target_segment: e.target.value})}
                                            className="w-full h-14 rounded-2xl bg-slate-50 border border-slate-100 px-6 font-black text-[10px] uppercase outline-none focus:ring-4 focus:ring-primary/5 transition-all"
                                        >
                                            <option value="ALL">Global Audience</option>
                                            <option value="VIP">VIP & Legends Only</option>
                                            <option value="NEW">New Patrons (First 7d)</option>
                                            <option value="DORMANT">Re-engagement Candidates</option>
                                        </select>
                                    </div>
                                </div>
                            </section>

                            <section className="space-y-6">
                                <div className="flex items-center gap-3 border-l-4 border-primary pl-4">
                                    <h3 className="text-xl font-black uppercase tracking-tight">Technical Nodes</h3>
                                </div>
                                <div className="grid gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Asset URL (Remote Image)</label>
                                        <Input
                                            value={editing.image_url}
                                            onChange={e => setEditing({...editing, image_url: e.target.value})}
                                            placeholder="https://..."
                                            className="h-12 rounded-xl bg-slate-50 border-slate-100 text-xs font-mono"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Deep Link Protocol</label>
                                        <Input
                                            value={editing.deep_link}
                                            onChange={e => setEditing({...editing, deep_link: e.target.value})}
                                            placeholder="onbar://..."
                                            className="h-12 rounded-xl bg-slate-50 border-slate-100 text-xs font-mono"
                                        />
                                    </div>
                                </div>
                            </section>

                            <section className="space-y-6 pb-10">
                                <div className="flex items-center gap-3 border-l-4 border-indigo-500 pl-4">
                                    <h3 className="text-xl font-black uppercase tracking-tight text-indigo-600">Scheduling</h3>
                                </div>
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Deployment Start</label>
                                        <Input
                                            type="datetime-local"
                                            value={editing.start_at?.substring(0, 16)}
                                            onChange={e => setEditing({...editing, start_at: e.target.value})}
                                            className="h-12 rounded-xl bg-slate-50 border-slate-100"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Deployment Expiry</label>
                                        <Input
                                            type="datetime-local"
                                            value={editing.expires_at?.substring(0, 16) || ''}
                                            onChange={e => setEditing({...editing, expires_at: e.target.value})}
                                            className="h-12 rounded-xl bg-slate-50 border-slate-100"
                                        />
                                    </div>
                                </div>
                            </section>
                        </div>

                        <div className="p-10 border-t border-slate-100 bg-slate-50/50 flex gap-4">
                            <div className="flex-1 flex items-center gap-4">
                                <label className="text-[10px] font-black uppercase text-slate-400">Node Status</label>
                                <select
                                    value={editing.status}
                                    onChange={e => setEditing({...editing, status: e.target.value})}
                                    className="h-12 rounded-xl bg-white border border-slate-100 px-4 text-[10px] font-black uppercase"
                                >
                                    <option value="DRAFT">DRAFT</option>
                                    <option value="PUBLISHED">PUBLISHED</option>
                                    <option value="SCHEDULED">SCHEDULED</option>
                                    <option value="INACTIVE">INACTIVE</option>
                                </select>
                            </div>
                            <Button
                                onClick={handleSave}
                                disabled={loading}
                                className="flex-[2] h-16 rounded-2xl bg-slate-900 text-white font-black uppercase text-xs tracking-[0.2em] shadow-2xl hover:scale-[1.02] active:scale-95 transition-all"
                            >
                                {loading ? <Loader2 className="animate-spin mr-2" /> : <><Save size={20} className="mr-2" /> Commit to Terminal</>}
                            </Button>
                        </div>
                    </Card>
                </div>
            )}
        </div>
    );
}
