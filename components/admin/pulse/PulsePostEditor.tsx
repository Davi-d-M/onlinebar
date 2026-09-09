'use client';

import * as React from 'react';
import { supabase } from '@/lib/supabaseClient';
import {
    X,
    Save,
    Loader2,
    Zap,
    Calendar,
    Clock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';

interface PulsePostEditorProps {
    areas: { id: string, zone_name: string }[];
    post?: { id: string, area_id: string, title: string, headline: string, description: string, status: string, start_time: string, end_time: string, hero_image_url: string, cta_label: string, is_featured: boolean, tags: string[] } | null;
    onClose: () => void;
    onSaved: () => void;
}

export default function PulsePostEditor({ areas, post, onClose, onSaved }: PulsePostEditorProps) {
    const [loading, setLoading] = React.useState(false);
    const [formData, setFormData] = React.useState({
        area_id: post?.area_id || areas[0]?.id || '',
        title: post?.title || '',
        headline: post?.headline || '',
        description: post?.description || '',
        status: post?.status || 'DRAFT',
        start_time: post?.start_time ? new Date(post.start_time).toISOString().slice(0, 16) : '',
        end_time: post?.end_time ? new Date(post.end_time).toISOString().slice(0, 16) : '',
        hero_image_url: post?.hero_image_url || '',
        cta_label: post?.cta_label || 'EXPLORE',
        is_featured: post?.is_featured || false,
        tags: post?.tags || []
    });

    const [tagInput, setTagInput] = React.useState('');

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (!supabase) return;

            const payload = {
                ...formData,
                updated_at: new Date().toISOString()
            };

            if (post?.id) {
                const { error } = await supabase.from('pulse_posts').update(payload).eq('id', post.id);
                if (error) throw error;
            } else {
                const { error } = await supabase.from('pulse_posts').insert([payload]);
                if (error) throw error;
            }

            onSaved();
        } catch (err) {
            console.error(err);
            alert("Uplink Failure: Unable to save moment.");
        } finally {
            setLoading(false);
        }
    };

    const addTag = () => {
        if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
            setFormData({ ...formData, tags: [...formData.tags, tagInput.trim()] });
            setTagInput('');
        }
    };

    return (
        <div className="fixed inset-0 z-[500] flex items-center justify-center bg-black/20 backdrop-blur-md p-6">
            <Card className="max-w-2xl w-full bg-white rounded-[3rem] shadow-2xl overflow-hidden border-none animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh]">
                <header className="p-8 bg-rose-500 text-white flex justify-between items-center shadow-lg shrink-0">
                    <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-xl bg-white/20 flex items-center justify-center text-white"><Zap size={20} /></div>
                        <div className="text-left">
                            <h2 className="text-xl font-black uppercase tracking-tighter">{post ? 'Edit' : 'Create'} Pulse Moment</h2>
                            <p className="text-[10px] font-black uppercase tracking-widest opacity-60">City Discovery Protocol</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="h-10 w-10 rounded-full hover:bg-white/10 flex items-center justify-center transition-colors"><X size={24} /></button>
                </header>

                <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-10 space-y-8 no-scrollbar text-left">

                    <div className="grid sm:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Active Sector</label>
                            <select
                                value={formData.area_id}
                                onChange={e => setFormData({ ...formData, area_id: e.target.value })}
                                className="w-full h-14 rounded-2xl bg-slate-50 border border-slate-100 px-6 font-black text-xs uppercase outline-none focus:ring-2 focus:ring-primary"
                            >
                                {areas.map(a => <option key={a.id} value={a.id}>{a.zone_name}</option>)}
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Moment Status</label>
                            <select
                                value={formData.status}
                                onChange={e => setFormData({ ...formData, status: e.target.value })}
                                className="w-full h-14 rounded-2xl bg-slate-50 border border-slate-100 px-6 font-black text-xs uppercase outline-none focus:ring-2 focus:ring-primary"
                            >
                                {['DRAFT', 'APPROVED', 'LIVE', 'ENDED', 'ARCHIVED'].map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Moment Title</label>
                        <Input
                            value={formData.title}
                            onChange={e => setFormData({ ...formData, title: e.target.value })}
                            className="h-14 rounded-2xl bg-slate-50 border-slate-100 font-bold"
                            placeholder="e.g. Friday Night Jazz"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Impact Headline</label>
                        <Input
                            value={formData.headline}
                            onChange={e => setFormData({ ...formData, headline: e.target.value })}
                            className="h-14 rounded-2xl bg-slate-50 border-slate-100 font-bold italic"
                            placeholder="e.g. Westlands is heating up tonight..."
                        />
                    </div>

                    <div className="grid sm:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-slate-400 ml-1 flex items-center gap-2"><Calendar size={12}/> Deployment Start</label>
                            <Input
                                type="datetime-local"
                                value={formData.start_time}
                                onChange={e => setFormData({ ...formData, start_time: e.target.value })}
                                className="h-14 rounded-2xl bg-slate-50 border-slate-100 font-bold"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-slate-400 ml-1 flex items-center gap-2"><Clock size={12}/> Tactical End</label>
                            <Input
                                type="datetime-local"
                                value={formData.end_time}
                                onChange={e => setFormData({ ...formData, end_time: e.target.value })}
                                className="h-14 rounded-2xl bg-slate-50 border-slate-100 font-bold"
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-4">
                        <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Social Tags</label>
                        <div className="flex gap-2">
                            <Input
                                value={tagInput}
                                onChange={e => setTagInput(e.target.value)}
                                className="h-12 rounded-xl bg-slate-50 border-slate-100"
                                placeholder="Add tag (e.g. Live Music)"
                            />
                            <Button type="button" onClick={addTag} variant="outline" className="h-12 rounded-xl">Add</Button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {formData.tags.map((t: string) => (
                                <span key={t} className="px-3 py-1 bg-slate-100 rounded-lg text-[9px] font-black uppercase text-slate-500 flex items-center gap-2">
                                    {t} <X size={10} className="cursor-pointer hover:text-rose-500" onClick={() => setFormData({ ...formData, tags: formData.tags.filter((tag: string) => tag !== t) })} />
                                </span>
                            ))}
                        </div>
                    </div>

                    <Button
                        type="submit"
                        disabled={loading}
                        className="w-full h-18 rounded-[2rem] bg-rose-500 text-white font-black uppercase text-xs tracking-[0.2em] shadow-2xl active:scale-95 transition-all"
                    >
                        {loading ? <Loader2 className="animate-spin" /> : <><Save className="mr-2" size={18} /> Establish Pulse Moment</>}
                    </Button>

                </form>
            </Card>
        </div>
    );
}
