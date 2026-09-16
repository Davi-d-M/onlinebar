'use client';

import * as React from 'react';
import { supabase } from '@/lib/supabaseClient';
import {
    Layout,
    Plus,
    Rocket,
    Search,
    Loader2,
    Trash2,
    ChevronRight,
    Sparkles,
    CheckCircle2,
    Calendar
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import PreviewStudio from '@/components/admin/content/PreviewStudio';
import ChannelConnector from '@/components/admin/content/ChannelConnector';
import { ContentCommand } from '@/lib/engines/contentCommandEngine';
import { useAdmin } from '@/context/AdminContext';

interface ContentItem {
    id: string;
    title: string;
    status: string;
    media_urls: string[];
    created_at: string;
    content_variants?: Array<{ platform: string, caption: string }>;
}

export default function ContentCommandHub() {
    const { email: adminEmail } = useAdmin();
    const [items, setItems] = React.useState<ContentItem[]>([]);
    const [search, setSearch] = React.useState('');
    const [isEstablishing, setIsEstablishing] = React.useState(false);

    // Establishing State
    const [newTitle, setNewTitle] = React.useState('');
    const [newDesc, setNewDesc] = React.useState('');
    const [selectedPlatforms, setSelectedPlatforms] = React.useState<string[]>(['INSTAGRAM', 'WHATSAPP']);

    const fetchContent = React.useCallback(async () => {
        if (!supabase) return;
        try {
            const { data } = await supabase
                .from('content_master')
                .select('*, content_variants(*)')
                .neq('status', 'ARCHIVED')
                .order('created_at', { ascending: false });
            if (data) setItems(data as ContentItem[]);
        } finally { }
    }, []);

    React.useEffect(() => {
        fetchContent();
    }, [fetchContent]);

    const handleInitialize = async () => {
        if (!newTitle || !newDesc) return;
        setIsEstablishing(true);
        try {
            await ContentCommand.establishMasterContent({
                title: newTitle,
                description: newDesc,
                mediaUrls: [],
                platforms: selectedPlatforms
            }, adminEmail || 'Admin');

            setNewTitle('');
            setNewDesc('');
            fetchContent();
            alert("Master narrative established. Grid variants created. 🛰️");
        } catch (err) { console.error(err); }
        finally { setIsEstablishing(false); }
    };

    const togglePlatform = (p: string) => {
        setSelectedPlatforms(prev => prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p]);
    };

    return (
        <div className="p-8 space-y-10 bg-slate-50 min-h-screen text-left pb-40 selection:bg-primary/20">
            <header className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 border-b border-slate-200 pb-8">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <Layout className="h-4 w-4 text-primary" />
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Content Command Node</span>
                    </div>
                    <h1 className="text-4xl lg:text-5xl font-black text-foreground uppercase tracking-tighter leading-none">The Command Center</h1>
                    <p className="text-muted-foreground text-sm font-medium mt-1 italic">Orchestrating brand narratives across all platform terminals.</p>
                </div>
                <div className="flex gap-4">
                    <Link href="/admin/growth/calendar">
                        <Button variant="outline" className="rounded-xl h-12 px-6 border-slate-200 bg-white font-black uppercase text-[10px] tracking-widest shadow-sm">
                            <Calendar size={14} className="mr-2" /> Strategic Timeline
                        </Button>
                    </Link>
                </div>
            </header>

            <div className="grid lg:grid-cols-12 gap-10">
                <div className="lg:col-span-7 space-y-10">

                    {/* 🚀 INITIATION STUDIO */}
                    <Card className="p-10 rounded-[3.5rem] bg-white border border-slate-100 shadow-sm space-y-10 text-left relative overflow-hidden">
                        <div className="flex items-center justify-between border-b border-slate-50 pb-8">
                            <div className="flex items-center gap-4">
                                <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-inner"><Plus size={24} /></div>
                                <div>
                                    <h2 className="text-2xl font-black text-foreground uppercase tracking-tighter leading-none">New Master Narrative</h2>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Design Once. Adapt Everywhere.</p>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[9px] font-black uppercase text-slate-400 ml-1">Narrative Title</label>
                                <Input
                                    value={newTitle}
                                    onChange={e => setNewTitle(e.target.value)}
                                    className="h-14 rounded-2xl bg-slate-50 border-slate-100 font-bold"
                                    placeholder="e.g. Weekend Vintages Collection"
                                />
                            </div>
                            <div className="space-y-2">
                                <div className="flex justify-between items-center px-1">
                                    <label className="text-[9px] font-black uppercase text-slate-400">Core Description</label>
                                    <button className="text-[8px] font-black text-primary uppercase flex items-center gap-1 hover:opacity-70"><Sparkles size={10} /> AI Polish</button>
                                </div>
                                <textarea
                                    value={newDesc}
                                    onChange={e => setNewDesc(e.target.value)}
                                    className="w-full h-32 rounded-3xl bg-slate-50 border-slate-100 p-6 font-medium text-sm italic resize-none outline-none focus:ring-4 focus:ring-primary/5 transition-all"
                                    placeholder="Tell the brand story..."
                                />
                            </div>

                            <div className="space-y-4">
                                <label className="text-[9px] font-black uppercase text-slate-400 ml-1">Deployment Terminals</label>
                                <div className="flex flex-wrap gap-2">
                                    {['INSTAGRAM', 'TIKTOK', 'X', 'WHATSAPP'].map(p => (
                                        <button
                                            key={p}
                                            onClick={() => togglePlatform(p)}
                                            className={cn(
                                                "px-6 py-2.5 rounded-xl border-2 font-black uppercase text-[8px] tracking-widest transition-all",
                                                selectedPlatforms.includes(p) ? "bg-primary text-white border-primary shadow-lg shadow-primary/20" : "bg-white border-slate-100 text-slate-400"
                                            )}
                                        >
                                            {p}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <Button
                            onClick={handleInitialize}
                            disabled={isEstablishing || !newTitle}
                            className="w-full h-20 rounded-[2rem] bg-primary text-white font-black uppercase text-xs tracking-[0.2em] shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all"
                        >
                            {isEstablishing ? <Loader2 className="animate-spin mr-3" /> : <Rocket size={20} className="mr-3" />}
                            Establish Master Content
                        </Button>
                    </Card>

                    {/* 🎞️ CONTENT MANIFEST */}
                    <div className="space-y-6">
                        <div className="flex items-center justify-between px-4">
                            <h2 className="text-xl font-black uppercase tracking-tighter text-foreground">Content Manifest</h2>
                            <div className="relative">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                                <Input
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                    placeholder="Search manifest..."
                                    className="h-12 w-64 pl-12 rounded-2xl bg-white border-slate-100 text-[10px] font-black uppercase"
                                />
                            </div>
                        </div>

                        <div className="grid gap-4">
                            {items.filter(i => i.title.toLowerCase().includes(search.toLowerCase())).map(item => (
                                <Card key={item.id} className="p-6 rounded-[2.5rem] bg-white border border-slate-100 shadow-sm hover:shadow-xl transition-all group overflow-hidden relative">
                                    <div className="flex justify-between items-center relative z-10 text-left">
                                        <div className="flex items-center gap-6 flex-1 min-w-0">
                                            <div className="h-16 w-16 rounded-[1.5rem] bg-slate-50 border border-slate-100 flex items-center justify-center text-primary shrink-0">
                                                <Layout size={28} />
                                            </div>
                                            <div className="min-w-0">
                                                <div className="flex items-center gap-3 mb-1">
                                                    <span className="text-[10px] font-black uppercase text-primary tracking-widest">{item.status}</span>
                                                    <div className="h-1 w-1 rounded-full bg-slate-200" />
                                                    <span className="text-[8px] font-bold text-slate-400 uppercase">{new Date(item.created_at).toLocaleDateString()}</span>
                                                </div>
                                                <h3 className="text-xl font-black text-foreground uppercase tracking-tight truncate">{item.title}</h3>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-6">
                                            <div className="flex -space-x-2">
                                                {(item.content_variants || []).map((v, idx) => (
                                                    <div key={idx} className="h-7 w-7 rounded-full bg-white border-2 border-white shadow-sm flex items-center justify-center text-[7px] font-black uppercase text-slate-400" title={v.platform}>
                                                        {v.platform.substring(0, 1)}
                                                    </div>
                                                ))}
                                            </div>
                                            <button
                                                onClick={() => ContentCommand.expelContentNode(item.id, adminEmail || 'Admin').then(() => fetchContent())}
                                                className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-300 hover:text-rose-500 hover:bg-rose-50 transition-all opacity-0 group-hover:opacity-100"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                            <button
                                                onClick={() => {
                                                    // This should eventually open a detail/edit view
                                                    alert("Variant Inspector Node under construction. 🛰️");
                                                }}
                                                className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-300 hover:bg-primary hover:text-white transition-all shadow-sm"
                                            >
                                                <ChevronRight size={20} />
                                            </button>
                                        </div>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    </div>
                </div>

                {/* 🔌 CHANNELS & PREVIEW SIDEBAR */}
                <div className="lg:col-span-5 space-y-10">
                    <ChannelConnector />

                    {items.length > 0 && (
                        <div className="animate-in fade-in zoom-in-95 duration-700">
                             <PreviewStudio
                                title={items[0].title}
                                description="Live Preview from manifest."
                                mediaUrls={items[0].media_urls}
                                variants={items[0].content_variants || []}
                             />
                        </div>
                    )}

                    <Card className="p-10 rounded-[3.5rem] bg-indigo-600 text-white space-y-8 relative overflow-hidden shadow-2xl">
                        <div className="relative z-10 space-y-6 text-left">
                            <div className="flex items-center gap-4">
                                <div className="h-12 w-12 rounded-2xl bg-white/10 flex items-center justify-center backdrop-blur-md border border-white/20"><Sparkles size={24} className="text-primary" /></div>
                                <h3 className="text-2xl font-black uppercase tracking-tighter leading-none">Neural Insights</h3>
                            </div>
                            <p className="text-sm font-medium text-slate-100 italic leading-relaxed">
                                &quot;Video reels on Instagram are currently generating 42% higher conversion than static carousels. We recommend Establish Video protocol for your next mission.&quot;
                            </p>
                            <div className="pt-6 border-t border-white/10 flex justify-between items-center">
                                <span className="text-[10px] font-black uppercase tracking-widest text-primary">Strategic Advantage</span>
                                <CheckCircle2 size={18} className="text-emerald-400" />
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}
