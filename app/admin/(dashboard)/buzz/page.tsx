'use client';

import * as React from 'react';
import { supabase } from '@/lib/supabaseClient';
import {
    Loader2,
    ChevronRight,
    Zap,
    Clock,
    Camera,
    Plus,
    TrendingUp,
    CheckCircle2,
    Trash2,
    Activity,
    Navigation,
    ShieldCheck,
    Star,
    Eye,
    MapPin,
    Calendar
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import BuzzStudio from '@/components/admin/buzz/BuzzStudio';
import VenueManager from '@/components/admin/buzz/VenueManager';

interface BuzzPost {
    id: string;
    title: string;
    status: string;
    trend_score: number;
    area_zone: string;
    start_at: string;
    category_label?: string;
    confidence?: number;
}

export default function BuzzCommandTower() {
    const [activeTab, setActiveTab] = React.useState<'happenings' | 'venues'>('happenings');
    const [posts, setPosts] = React.useState<BuzzPost[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [studioOpen, setStudioOpen] = React.useState(false);
    const [editingPostId, setEditingPostId] = React.useState<string | null>(null);

    const fetchBuzz = React.useCallback(async () => {
        if (!supabase) return;
        setLoading(true);
        try {
            const [postsRes] = await Promise.all([
                supabase.from('buzz_posts').select('*, buzz_categories(label)').order('created_at', { ascending: false }),
                supabase.from('buzz_venues').select('*').limit(5)
            ]);

            if (postsRes.data) {
                setPosts((postsRes.data as { id: string, title: string, status: string, trend_score: number, area_zone: string, start_at: string, buzz_categories: { label: string } | null }[]).map((d) => ({
                    id: d.id,
                    title: d.title,
                    status: d.status,
                    trend_score: d.trend_score,
                    area_zone: d.area_zone,
                    start_at: d.start_at,
                    confidence: 88, // Neural simulation
                    category_label: d.buzz_categories?.label || 'General'
                })));
            }

        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    }, []);

    const handleDeleteBuzz = async (id: string, title: string) => {
        if (!supabase || !confirm(`Permanently expel buzz node "${title}"?`)) return;
        try {
            const { error } = await supabase.from('buzz_posts').delete().eq('id', id);
            if (error) throw error;
            fetchBuzz();
        } catch (err) { console.error(err); }
    };

    React.useEffect(() => {
        fetchBuzz();
    }, [fetchBuzz]);

    return (
        <div className="p-8 space-y-10 bg-slate-50 min-h-screen text-left selection:bg-primary/20 pb-40">
            {/* 🏙️ CITY WAR ROOM HEADER */}
            <header className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 border-b border-slate-200 pb-8">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="h-2 w-2 rounded-full bg-primary animate-ping" />
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">City Intelligence Node</span>
                    </div>
                    <h1 className="text-4xl lg:text-5xl font-black text-foreground uppercase tracking-tighter leading-none">Buzz Command</h1>
                    <p className="text-slate-500 text-sm font-medium mt-1 italic">Orchestrating live moments, verified venues, and sector-level discovery.</p>
                </div>
                <div className="flex gap-4">
                    <div className="bg-white p-1 rounded-2xl border border-slate-100 shadow-sm flex overflow-x-auto no-scrollbar">
                        <button onClick={() => setActiveTab('happenings')} className={cn("px-6 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all", activeTab === 'happenings' ? "bg-primary text-white shadow-lg" : "text-slate-400")}>Live Nowcasts</button>
                        <button onClick={() => setActiveTab('venues')} className={cn("px-6 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all", activeTab === 'venues' ? "bg-primary text-white shadow-lg" : "text-slate-400")}>Venue Registry</button>
                    </div>
                    <Link href="/admin/growth/calendar">
                        <Button variant="outline" className="h-12 px-6 rounded-xl border-slate-200 bg-white font-black uppercase text-[10px] tracking-widest shadow-sm">
                            <Calendar size={14} className="mr-2" /> Global Schedule
                        </Button>
                    </Link>
                    <Button
                        onClick={() => { setEditingPostId(null); setStudioOpen(true); }}
                        className="rounded-xl h-12 px-8 bg-primary text-white font-black uppercase text-[10px] tracking-widest shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
                    >
                        <Plus className="h-4 w-4 mr-2" /> Create Buzz Node
                    </Button>
                </div>
            </header>

            {activeTab === 'happenings' ? (
                <>
                {/* 📡 GLOBAL PULSE (LIGHT THEME) */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 animate-in fade-in duration-700">
                {[
                    { label: 'Active Buzz', val: posts.filter(p => p.status === 'LIVE' || p.status === 'TRENDING').length, icon: Zap, color: 'primary' },
                    { label: 'Global Pulse', val: '91/100', icon: TrendingUp, color: 'emerald' },
                    { label: 'Discovery Reach', val: '12.4k', icon: Eye, color: 'indigo' },
                    { label: 'Sector Signal', val: 'Strong', icon: MapPin, color: 'rose' },
                ].map((node) => (
                    <Card key={node.label} className="p-8 rounded-[3.5rem] bg-white border border-slate-100 shadow-sm flex flex-col items-center justify-center gap-4 text-center group hover:shadow-xl transition-all">
                        <div className={cn(
                            "h-14 w-14 rounded-full flex items-center justify-center transition-transform group-hover:scale-110 shadow-inner",
                            node.color === 'primary' ? "bg-primary/10 text-primary" :
                            node.color === 'indigo' ? "bg-indigo-50 text-indigo-500" :
                            node.color === 'emerald' ? "bg-emerald-50 text-emerald-500" :
                            "bg-rose-50 text-rose-500"
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

                {/* THE HUB: LIVE HAPPENINGS */}
                <div className="lg:col-span-8 space-y-8">
                    <div className="flex items-center justify-between px-4">
                        <div className="flex items-center gap-3">
                            <Activity className="h-5 w-5 text-primary animate-pulse" />
                            <h2 className="text-2xl font-black uppercase tracking-tighter text-foreground">Live Nowcasts</h2>
                        </div>
                    </div>

                    <div className="grid gap-6">
                        {loading && posts.length === 0 ? (
                            <div className="py-40 flex flex-col items-center gap-6 bg-white rounded-[3rem] border border-slate-100 animate-pulse">
                                <Loader2 className="h-10 w-10 text-primary animate-spin" />
                                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-300">Synchronizing City Signal...</p>
                            </div>
                        ) : posts.map(post => (
                            <Card key={post.id} className={cn(
                                "p-8 rounded-[3.5rem] bg-white border transition-all hover:shadow-2xl relative overflow-hidden group",
                                post.status === 'LIVE' ? "border-primary/20" : "border-slate-100"
                            )}>
                                <div className="flex flex-col md:flex-row justify-between items-center gap-8 relative z-10 text-left">
                                    <div className="flex items-center gap-8 flex-1 min-w-0">
                                        <div className="h-20 w-20 rounded-[2rem] bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-300 group-hover:scale-105 transition-transform shrink-0 relative overflow-hidden">
                                            <Camera size={32} className="opacity-20" />
                                            {post.status === 'LIVE' && (
                                                <div className="absolute top-2 right-2 h-4 w-4 rounded-full bg-rose-500 animate-pulse" />
                                            )}
                                        </div>
                                        <div className="space-y-1 min-w-0">
                                            <div className="flex items-center gap-3">
                                                <span className="text-[9px] font-black uppercase text-primary tracking-widest">{post.category_label}</span>
                                                <div className="h-1 w-1 rounded-full bg-slate-200" />
                                                <span className="text-[8px] font-black uppercase text-slate-400">{post.area_zone}</span>
                                            </div>
                                            <h3 className="text-2xl font-black text-foreground uppercase tracking-tight truncate leading-none">{post.title}</h3>
                                            <div className="flex items-center gap-4 text-[9px] font-black text-slate-300 uppercase tracking-widest mt-3">
                                                <span className="flex items-center gap-1.5 px-2 py-1 rounded bg-emerald-50 text-emerald-600 border border-emerald-100"><CheckCircle2 size={10} /> {post.confidence}% Confident</span>
                                                <span className="flex items-center gap-1.5"><Eye size={10} /> 1.2k Views</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-10 shrink-0">
                                        <div className="text-right">
                                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Buzz Score</p>
                                            <div className="flex items-center gap-2 justify-end">
                                                <span className="text-2xl font-black text-foreground tabular-nums">{post.trend_score}</span>
                                                <TrendingUp size={16} className={cn(post.trend_score > 70 ? "text-emerald-500" : "text-amber-500")} />
                                            </div>
                                        </div>
                                        <div className={cn(
                                            "px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest border",
                                            post.status === 'LIVE' ? "bg-primary/10 text-primary border-primary/20" : "bg-slate-50 text-slate-400 border-slate-100"
                                        )}>
                                            {post.status}
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={(e) => { e.stopPropagation(); handleDeleteBuzz(post.id, post.title); }}
                                                className="h-12 w-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-300 hover:text-rose-500 hover:bg-rose-50 transition-all opacity-0 group-hover:opacity-100"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                            <button
                                                onClick={() => { setEditingPostId(post.id); setStudioOpen(true); }}
                                                className="h-12 w-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-300 hover:bg-primary hover:text-white transition-all shadow-sm"
                                            >
                                                <ChevronRight size={24} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                <Zap className="absolute -bottom-6 -right-6 h-32 w-32 text-primary/5 rotate-12 pointer-events-none" />
                            </Card>
                        ))}
                    </div>
                </div>

                {/* LOGISTICS & SIGNALS SIDEBAR */}
                <div className="lg:col-span-4 space-y-8">
                    <Card className="p-10 rounded-[3.5rem] bg-white border border-slate-100 shadow-sm space-y-10 relative overflow-hidden group">
                        <div className="relative z-10 space-y-8 text-left">
                            <div className="flex items-center gap-4">
                                <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-sm border border-primary/10"><Navigation size={24} className="fill-current" /></div>
                                <h3 className="text-2xl font-black uppercase tracking-tighter leading-none text-foreground">Sector Signal</h3>
                            </div>

                            <p className="text-sm font-medium text-slate-500 italic leading-relaxed">
                                &quot;Monitoring aggregated sector-level traffic and search demand to identify emerging city hotspots.&quot;
                            </p>

                            <div className="space-y-6">
                                {[
                                    { label: 'Westlands Grid', val: 94, color: 'bg-primary' },
                                    { label: 'Kilimani Node', val: 81, color: 'bg-emerald-500' },
                                    { label: 'Lavington Area', val: 42, color: 'bg-amber-500' },
                                    { label: 'CBD Central', val: 19, color: 'bg-slate-200' },
                                ].map(sector => (
                                    <div key={sector.label} className="space-y-2">
                                        <div className="flex justify-between items-end">
                                            <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{sector.label}</span>
                                            <span className="text-sm font-black text-foreground">{sector.val}%</span>
                                        </div>
                                        <div className="h-1.5 w-full bg-slate-50 rounded-full overflow-hidden border border-slate-100">
                                            <div className={cn("h-full rounded-full transition-all duration-1000", sector.color)} style={{ width: `${sector.val}%` }} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </Card>

                    <Card className="p-10 rounded-[3.5rem] bg-white border border-slate-100 shadow-sm space-y-10 relative overflow-hidden group">
                        <div className="relative z-10 space-y-8 text-left">
                             <div className="flex items-center gap-4">
                                <div className="h-12 w-12 rounded-2xl bg-rose-50 flex items-center justify-center text-rose-500 shadow-sm border border-rose-100"><ShieldCheck size={24} /></div>
                                <h3 className="text-2xl font-black uppercase tracking-tighter text-foreground leading-none">Trust Sentinel</h3>
                            </div>
                            <p className="text-sm font-medium text-slate-400 leading-relaxed italic">
                                &quot;All city nodes must be verified within a 12-hour window to maintain high confidence status.&quot;
                            </p>
                            <div className="space-y-4">
                                <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                                    <Clock size={16} className="text-primary" />
                                    <span className="text-[9px] font-black uppercase text-slate-500">14 Expiry Alerts</span>
                                </div>
                                <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                                    <Star size={16} className="text-amber-500" />
                                    <span className="text-[9px] font-black uppercase text-slate-500">8 New Venue Claims</span>
                                </div>
                            </div>
                        </div>
                        <Zap size={64} className="absolute -bottom-6 -right-6 text-primary/5 rotate-12" />
                    </Card>
                </div>

                </div>
                </>
            ) : (
                <VenueManager />
            )}

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
