'use client';

import * as React from 'react';
import {
    X,
    Save,
    Video,
    MapPin,
    Plus,
    Trash2,
    Loader2,
    Zap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabaseClient';
import Image from 'next/image';

interface BuzzStudioProps {
    postId?: string | null;
    onClose: () => void;
    onSave: () => void;
}

export default function BuzzStudio({ postId, onClose, onSave }: BuzzStudioProps) {
    const [loading, setLoading] = React.useState(false);
    const [categories, setCategories] = React.useState<any[]>([]);
    const [form, setForm] = React.useState({
        title: '',
        description: '',
        category_id: '',
        status: 'DRAFT',
        area_zone: '',
        latitude: '',
        longitude: '',
        start_at: '',
        end_at: '',
        is_featured: false
    });
    const [media, setMedia] = React.useState<Array<{ type: 'IMAGE' | 'VIDEO', url: string, sort_order: number }>>([]);

    React.useEffect(() => {
        async function loadContext() {
            if (!supabase) return;
            const { data } = await supabase.from('buzz_categories').select('*').eq('is_active', true);
            if (data) setCategories(data);

            if (postId) {
                const { data: post } = await supabase.from('buzz_posts').select('*, buzz_media(*)').eq('id', postId).single();
                if (post) {
                    setForm({
                        title: post.title,
                        description: post.description,
                        category_id: post.category_id,
                        status: post.status,
                        area_zone: post.area_zone,
                        latitude: String(post.latitude),
                        longitude: String(post.longitude),
                        start_at: post.start_at.substring(0, 16),
                        end_at: post.end_at.substring(0, 16),
                        is_featured: post.is_featured
                    });
                    setMedia(post.buzz_media.map((m: any) => ({ type: m.media_type, url: m.url, sort_order: m.sort_order })));
                }
            }
        }
        loadContext();
    }, [postId]);

    const handleSave = async () => {
        if (!supabase) return;
        setLoading(true);
        try {
            const slug = form.title.toLowerCase().replace(/\s+/g, '-');
            const payload = {
                ...form,
                slug,
                latitude: parseFloat(form.latitude),
                longitude: parseFloat(form.longitude),
                start_at: new Date(form.start_at).toISOString(),
                end_at: new Date(form.end_at).toISOString()
            };

            let res;
            if (postId) {
                res = await supabase.from('buzz_posts').update(payload).eq('id', postId).select().single();
            } else {
                res = await supabase.from('buzz_posts').insert([payload]).select().single();
            }

            if (res.error) throw res.error;

            // Handle Media
            if (res.data) {
                await supabase.from('buzz_media').delete().eq('buzz_id', res.data.id);
                if (media.length > 0) {
                    await supabase.from('buzz_media').insert(media.map(m => ({
                        buzz_id: res.data.id,
                        media_type: m.type,
                        url: m.url,
                        sort_order: m.sort_order
                    })));
                }
            }

            alert("Buzz node established. 🚀");
            onSave();
            onClose();
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    return (
        <div className="fixed inset-0 z-[1000] flex items-center justify-end bg-slate-900/40 backdrop-blur-md">
            <Card className="h-full w-full max-w-4xl bg-white rounded-l-[4rem] border-none shadow-2xl flex flex-col animate-in slide-in-from-right-full duration-500 overflow-hidden text-left">

                {/* Header */}
                <div className="p-10 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-2xl bg-rose-500 text-white flex items-center justify-center shadow-lg shadow-rose-500/20"><Zap size={24} /></div>
                        <div>
                            <h2 className="text-3xl font-black uppercase tracking-tighter text-foreground leading-none">Buzz Studio</h2>
                            <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mt-1">Establish Live City Node</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="h-12 w-12 rounded-full hover:bg-white flex items-center justify-center transition-all shadow-sm border border-slate-100"><X size={24} /></button>
                </div>

                <div className="flex-1 overflow-y-auto p-10 space-y-12 no-scrollbar">

                    {/* 1. CORE NARRATIVE */}
                    <section className="space-y-8">
                        <div className="flex items-center gap-3 border-l-4 border-rose-500 pl-4">
                            <h3 className="text-xl font-black uppercase tracking-tight">1. Core Narrative</h3>
                        </div>
                        <div className="grid gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Event/Place Title</label>
                                <Input
                                    value={form.title}
                                    onChange={e => setForm({...form, title: e.target.value})}
                                    className="h-14 rounded-2xl bg-slate-50 border-slate-100 font-bold"
                                    placeholder="e.g. Nairobi Night Market"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Live Description</label>
                                <Textarea
                                    value={form.description}
                                    onChange={e => setForm({...form, description: e.target.value})}
                                    className="min-h-[120px] rounded-3xl bg-slate-50 border-slate-100 p-6 font-medium italic resize-none"
                                    placeholder="Tell the city what's happening..."
                                />
                            </div>
                            <div className="grid sm:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Category</label>
                                    <select
                                        value={form.category_id}
                                        onChange={e => setForm({...form, category_id: e.target.value})}
                                        className="w-full h-14 rounded-2xl bg-slate-50 border border-slate-100 px-6 font-black text-xs uppercase outline-none focus:ring-4 focus:ring-rose-500/5 transition-all"
                                    >
                                        <option value="">Select Category</option>
                                        {categories.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Initial Status</label>
                                    <select
                                        value={form.status}
                                        onChange={e => setForm({...form, status: e.target.value})}
                                        className="w-full h-14 rounded-2xl bg-slate-50 border border-slate-100 px-6 font-black text-xs uppercase outline-none"
                                    >
                                        <option value="DRAFT">Draft Protocol</option>
                                        <option value="LIVE">Live Deployment</option>
                                        <option value="TRENDING">High-Traction (Trending)</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* 2. GEOGRAPHICAL NODE */}
                    <section className="space-y-8">
                        <div className="flex items-center gap-3 border-l-4 border-rose-500 pl-4">
                            <h3 className="text-xl font-black uppercase tracking-tight">2. Geographical Node</h3>
                        </div>
                        <div className="grid sm:grid-cols-3 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Sector (Area)</label>
                                <Input
                                    value={form.area_zone}
                                    onChange={e => setForm({...form, area_zone: e.target.value})}
                                    className="h-14 rounded-2xl bg-slate-50 border-slate-100 font-bold"
                                    placeholder="e.g. Westlands"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Latitude</label>
                                <Input
                                    value={form.latitude}
                                    onChange={e => setForm({...form, latitude: e.target.value})}
                                    className="h-14 rounded-2xl bg-slate-50 border-slate-100 font-mono font-bold"
                                    placeholder="-1.26..."
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Longitude</label>
                                <Input
                                    value={form.longitude}
                                    onChange={e => setForm({...form, longitude: e.target.value})}
                                    className="h-14 rounded-2xl bg-slate-50 border-slate-100 font-mono font-bold"
                                    placeholder="36.81..."
                                />
                            </div>
                        </div>
                        <Button variant="outline" className="w-full h-14 rounded-2xl border-dashed border-2 border-slate-200 text-slate-400 font-black uppercase text-[10px] tracking-widest hover:border-rose-500 hover:text-rose-500 transition-all flex items-center justify-center gap-2">
                            <MapPin size={16} /> Precision Map Pinpoint
                        </Button>
                    </section>

                    {/* 3. CINEMATIC ASSETS */}
                    <section className="space-y-8">
                        <div className="flex items-center gap-3 border-l-4 border-rose-500 pl-4">
                            <h3 className="text-xl font-black uppercase tracking-tight">3. Cinematic Assets</h3>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                            {media.map((m, i) => (
                                <div key={i} className="aspect-[9/16] rounded-3xl bg-slate-100 relative overflow-hidden group/media border border-slate-200">
                                    {m.type === 'VIDEO' ? (
                                        <div className="h-full w-full flex items-center justify-center bg-slate-900"><Video className="text-white" /></div>
                                    ) : (
                                        <Image src={m.url} alt="" fill className="object-cover" />
                                    )}
                                    <button
                                        onClick={() => setMedia(media.filter((_, idx) => idx !== i))}
                                        className="absolute top-2 right-2 h-8 w-8 rounded-full bg-rose-500 text-white flex items-center justify-center opacity-0 group-hover/media:opacity-100 transition-opacity shadow-lg"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                    <div className="absolute bottom-2 left-2 bg-black/40 backdrop-blur-md px-3 py-1 rounded-lg text-[8px] font-black text-white uppercase">{m.type}</div>
                                </div>
                            ))}
                            <button className="aspect-[9/16] rounded-3xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center gap-3 text-slate-300 hover:border-rose-500 hover:text-rose-500 transition-all group">
                                <Plus size={32} className="group-hover:scale-110 transition-transform" />
                                <span className="text-[9px] font-black uppercase tracking-widest">Add Media</span>
                            </button>
                        </div>
                    </section>

                    {/* 4. TEMPORAL NODE */}
                    <section className="space-y-8 pb-10">
                        <div className="flex items-center gap-3 border-l-4 border-rose-500 pl-4">
                            <h3 className="text-xl font-black uppercase tracking-tight">4. Temporal Node</h3>
                        </div>
                        <div className="grid sm:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Start Protocol (Time)</label>
                                <Input
                                    type="datetime-local"
                                    value={form.start_at}
                                    onChange={e => setForm({...form, start_at: e.target.value})}
                                    className="h-14 rounded-2xl bg-slate-50 border-slate-100 font-bold"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-slate-400 ml-1">End Protocol (Expiry)</label>
                                <Input
                                    type="datetime-local"
                                    value={form.end_at}
                                    onChange={e => setForm({...form, end_at: e.target.value})}
                                    className="h-14 rounded-2xl bg-slate-50 border-slate-100 font-bold"
                                />
                            </div>
                        </div>
                    </section>
                </div>

                {/* Footer Actions */}
                <div className="p-10 border-t border-slate-100 bg-slate-50/50 flex gap-4">
                    <Button
                        onClick={onClose}
                        variant="outline"
                        className="flex-1 h-16 rounded-2xl border-slate-200 text-slate-400 font-black uppercase text-xs tracking-[0.2em]"
                    >
                        Abort Mission
                    </Button>
                    <Button
                        onClick={handleSave}
                        disabled={loading}
                        className="flex-[2] h-16 rounded-2xl bg-rose-500 text-white font-black uppercase text-xs tracking-[0.2em] shadow-2xl shadow-rose-500/20 hover:scale-[1.02] active:scale-95 transition-all"
                    >
                        {loading ? <Loader2 className="animate-spin mr-2" /> : <><Save size={20} className="mr-2" /> Deploy Buzz Node</>}
                    </Button>
                </div>

            </Card>
        </div>
    );
}
