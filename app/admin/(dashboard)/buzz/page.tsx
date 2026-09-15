'use client';

import * as React from 'react';
import { supabase } from '@/lib/supabaseClient';
import {
    Calendar,
    MapPin,
    Eye,
    Loader2,
    ChevronRight,
    Zap,
    Clock,
    Camera,
    Video,
    Flame,
    Plus,
    TrendingUp
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import BuzzStudio from '@/components/admin/buzz/BuzzStudio';

interface BuzzPost {
    id: string;
    title: string;
    status: string;
    trend_score: number;
    area_zone: string;
    start_at: string;
    category_label?: string;
}

export default function BuzzAdminHUD() {
    const [posts, setPosts] = React.useState<BuzzPost[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [studioOpen, setStudioOpen] = React.useState(false);
    const [editingPostId, setEditingPostId] = React.useState<string | null>(null);

    const fetchBuzz = React.useCallback(async () => {
        if (!supabase) return;
        setLoading(true);
        try {
            const { data } = await supabase
                .from('buzz_posts')
                .select(`
                    *,
                    buzz_categories(label)
                `)
                .order('created_at', { ascending: false });

            if (data) {
                setPosts((data as Array<{ id: string, title: string, status: string, trend_score: number, area_zone: string, start_at: string, buzz_categories: { label: string } | null }>).map((d) => ({
                    id: d.id,
                    title: d.title,
                    status: d.status,
                    trend_score: d.trend_score,
                    area_zone: d.area_zone,
                    start_at: d.start_at,
                    category_label: d.buzz_categories?.label || 'General'
                })));
            }
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    }, []);

    React.useEffect(() => {
        fetchBuzz();
    }, [fetchBuzz]);

    return (
        <div className="p-8 space-y-10 bg-slate-50 min-h-screen text-left selection:bg-primary/20 pb-40">
            <header className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 border-b border-slate-200 pb-8">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <Flame className="h-4 w-4 text-rose-500" />
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-rose-500">Live City Discovery</span>
                    </div>
                    <h1 className="text-4xl font-black text-foreground uppercase tracking-tighter leading-none">The Buzz Command</h1>
                    <p className="text-muted-foreground text-sm font-medium mt-1">Orchestrate trending events, hotspots, and city-pulse narratives.</p>
                </div>
                <div className="flex gap-4">
                    <Button variant="outline" className="h-12 px-6 rounded-xl border-slate-200 bg-white font-black uppercase text-[10px] tracking-widest">
                        <Calendar size={14} className="mr-2" /> Global Schedule
                    </Button>
                    <Button
                        onClick={() => { setEditingPostId(null); setStudioOpen(true); }}
                        className="rounded-xl h-12 px-8 bg-rose-500 text-white font-black uppercase text-[10px] tracking-widest shadow-xl shadow-rose-500/20 hover:scale-105 active:scale-95 transition-all"
                    >
                        <Plus className="h-4 w-4 mr-2" /> Create Buzz Node
                    </Button>
                </div>
            </header>

            {/* GLOBAL PULSE METRICS */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                {[
                    { label: 'Active Buzz', val: posts.filter(p => p.status === 'LIVE' || p.status === 'TRENDING').length, icon: Zap, color: 'rose' },
                    { label: 'Global Trend Score', val: '84/100', icon: TrendingUp, color: 'primary' },
                    { label: 'Discovery Reach', val: '12.4k', icon: Eye, color: 'indigo' },
                    { label: 'Map Signal Rate', val: '62%', icon: MapPin, color: 'emerald' },
                ].map((node) => (
                    <Card key={node.label} className="p-8 rounded-[3.5rem] bg-white border border-slate-100 shadow-sm flex flex-col items-center justify-center gap-4 text-center group hover:shadow-xl transition-all">
                        <div className={cn(
                            "h-14 w-14 rounded-full flex items-center justify-center transition-transform group-hover:scale-110 shadow-inner",
                            node.color === 'rose' ? "bg-rose-50 text-rose-500" :
                            node.color === 'indigo' ? "bg-indigo-50 text-indigo-500" :
                            node.color === 'emerald' ? "bg-emerald-50 text-emerald-500" :
                            "bg-primary/10 text-primary"
                        )}>
                            <node.icon size={28} />
                        </div>
                        <div className="space-y-1">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">{node.label}</p>
                            <h3 className="text-2xl font-black text-foreground tracking-tighter uppercase leading-none">{node.val}</h3>
                        </div>
                    </Card>
                ))}
            </div>

            <div className="grid lg:grid-cols-12 gap-10">

                {/* BUZZ REGISTRY */}
                <div className="lg:col-span-8 space-y-6">
                    <div className="flex items-center justify-between px-4">
                        <h2 className="text-xl font-black uppercase tracking-tighter text-foreground text-left w-full">Buzz Registry</h2>
                    </div>

                    <div className="grid gap-4">
                        {loading && posts.length === 0 ? (
                            <div className="py-40 flex flex-col items-center gap-6 bg-white rounded-[3rem] border border-slate-100 animate-pulse">
                                <Loader2 className="h-10 w-10 text-rose-500 animate-spin" />
                                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-300">Synchronizing City Signal...</p>
                            </div>
                        ) : posts.map(post => (
                            <Card key={post.id} className="p-6 rounded-[2.5rem] bg-white border border-slate-100 shadow-sm hover:shadow-xl transition-all group overflow-hidden relative">
                                <div className="flex flex-col md:flex-row justify-between items-center gap-8 relative z-10">
                                    <div className="flex items-center gap-8 flex-1 min-w-0">
                                        <div className="h-20 w-20 rounded-[2rem] bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-300 group-hover:scale-105 transition-transform shrink-0 relative overflow-hidden">
                                            <Camera size={32} className="opacity-20" />
                                            {/* Media Type Indicator */}
                                            <div className="absolute top-2 right-2 h-6 w-6 rounded-full bg-black/10 backdrop-blur-md flex items-center justify-center">
                                                <Video size={12} className="text-white" />
                                            </div>
                                        </div>
                                        <div className="text-left space-y-1 min-w-0">
                                            <div className="flex items-center gap-3">
                                                <span className="text-[9px] font-black uppercase text-rose-500 tracking-widest">{post.category_label}</span>
                                                <div className="h-1 w-1 rounded-full bg-slate-200" />
                                                <span className="text-[8px] font-black uppercase text-slate-400">{post.area_zone}</span>
                                            </div>
                                            <h3 className="text-2xl font-black text-foreground uppercase tracking-tight truncate leading-none">{post.title}</h3>
                                            <div className="flex items-center gap-4 text-[9px] font-black text-slate-300 uppercase tracking-widest mt-2">
                                                <span className="flex items-center gap-1.5"><Clock size={10} /> {new Date(post.start_at).toLocaleDateString()}</span>
                                                <span className="flex items-center gap-1.5"><Eye size={10} /> 1.2k Views</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-10 shrink-0">
                                        <div className="text-right">
                                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Trend Score</p>
                                            <div className="flex items-center gap-2 justify-end">
                                                <span className="text-2xl font-black text-foreground">{post.trend_score}</span>
                                                <TrendingUp size={16} className={cn(post.trend_score > 70 ? "text-emerald-500" : "text-amber-500")} />
                                            </div>
                                        </div>
                                        <div className={cn(
                                            "px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest",
                                            post.status === 'LIVE' ? "bg-rose-50 text-rose-600 border border-rose-100" : "bg-slate-50 text-slate-400"
                                        )}>
                                            {post.status}
                                        </div>
                                        <button
                                            onClick={() => { setEditingPostId(post.id); setStudioOpen(true); }}
                                            className="h-12 w-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-300 hover:bg-rose-500 hover:text-white transition-all"
                                        >
                                            <ChevronRight size={24} />
                                        </button>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                </div>

                {/* BUZZ INTELLIGENCE SIDEBAR */}
                <div className="lg:col-span-4 space-y-8">
                    <Card className="p-10 rounded-[3.5rem] bg-slate-900 text-white space-y-10 relative overflow-hidden shadow-2xl">
                        <div className="relative z-10 space-y-8 text-left">
                            <div className="flex items-center gap-4">
                                <div className="h-12 w-12 rounded-2xl bg-white/10 flex items-center justify-center backdrop-blur-md border border-white/20"><TrendingUp size={24} className="text-rose-500" /></div>
                                <h3 className="text-2xl font-black uppercase tracking-tighter leading-none">Intelligence Engine</h3>
                            </div>

                            <p className="text-sm font-medium text-slate-400 italic leading-relaxed">
                                &quot;Trend Scores are calculated in real-time based on high-intent actions: Map Opens, Directions Requested, and Social Shares.&quot;
                            </p>

                            <div className="space-y-4">
                                {[
                                    { label: 'Map Signal Sensitivity', val: '94%', color: 'rose' },
                                    { label: 'Discovery conversion', val: '8.7%', color: 'emerald' },
                                    { label: 'Average Engagement', val: '46s', color: 'indigo' },
                                ].map(stat => (
                                    <div key={stat.label} className="flex justify-between items-center py-3 border-b border-white/5 last:border-0">
                                        <span className="text-[10px] font-black uppercase text-slate-500">{stat.label}</span>
                                        <span className={cn("text-xs font-black", `text-${stat.color}-500`)}>{stat.val}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <Zap size={64} className="absolute -bottom-6 -right-6 text-white/5 -rotate-12" />
                    </Card>

                    <Card className="p-8 rounded-[3rem] bg-white border border-slate-100 shadow-sm space-y-6 text-left group">
                        <div className="h-12 w-12 rounded-2xl bg-rose-50 flex items-center justify-center text-rose-500 shadow-inner group-hover:rotate-6 transition-transform">
                            <MapPin size={24} />
                        </div>
                        <h4 className="text-lg font-black uppercase text-foreground leading-none tracking-tighter">Sector Heatmap</h4>
                        <div className="space-y-4">
                            {[
                                { label: 'Westlands Sector', val: 92 },
                                { label: 'Kilimani Node', val: 86 },
                                { label: 'CBD Central', val: 74 },
                                { label: 'Lavington Grid', val: 61 },
                            ].map(sector => (
                                <div key={sector.label} className="space-y-2">
                                    <div className="flex justify-between text-[9px] font-black uppercase">
                                        <span className="text-slate-400">{sector.label}</span>
                                        <span className="text-rose-500">{sector.val}%</span>
                                    </div>
                                    <div className="h-1.5 w-full bg-slate-50 rounded-full overflow-hidden border border-slate-100 p-0.5">
                                        <div className="h-full bg-rose-500 rounded-full transition-all duration-1000" style={{ width: `${sector.val}%` }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>

            </div>

            {studioOpen && (
                <BuzzStudio
                    postId={editingPostId}
                    onClose={() => setStudioOpen(false)}
                    onSave={fetchBuzz}
                />
            )}
        </div>
    );
}
