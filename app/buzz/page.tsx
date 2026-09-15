'use client';

import * as React from 'react';
import { supabase } from '@/lib/supabaseClient';
import {
    Flame,
    TrendingUp,
    Users,
    Zap,
    Wine,
    ChevronRight,
    MapPin,
    Smartphone,
    Globe,
    Clock,
    Loader2,
    ArrowRight,
    Navigation,
    Sparkles,
    Star,
    CheckCircle2,
    Activity
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn, formatPrice } from '@/lib/utils';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import PulseDetailModal from '@/components/buzz/PulseDetailModal';
import BuzzStoryCard, { BuzzStory } from '@/components/buzz/BuzzStoryCard';

const LiveBuzzMap = dynamic(() => import('@/components/admin/dispatch/LiveDispatchMap'), {
    ssr: false,
    loading: () => <div className="h-full w-full bg-slate-100 animate-pulse rounded-[3.5rem]" />
});

interface BuzzArea {
    id: string;
    zone_name: string;
    buzz_score: number;
    buzz_status: 'BUZZING' | 'BUSY' | 'ACTIVE' | 'QUIET';
    active_visitors: number;
    active_orders: number;
    confidence?: number;
}

export default function TheBuzzDiscovery() {
    const [hotspots, setHotspots] = React.useState<BuzzArea[]>([]);
    const [stories, setStories] = React.useState<BuzzStory[]>([]);
    const [selectedArea, setSelectedArea] = React.useState<BuzzArea | null>(null);
    const [isDetailOpen, setIsDetailOpen] = React.useState(false);
    const [filter, setFilter] = React.useState<'trending' | 'near-me' | 'tonight'>('trending');
    const [loading, setLoading] = React.useState(true);
    const [nightPlannerOpen, setNightPlannerOpen] = React.useState(false);

    const fetchBuzzData = React.useCallback(async () => {
        if (!supabase) return;
        setLoading(true);
        try {
            const [hotspotsRes, storiesRes] = await Promise.all([
                supabase.from('buzz_metrics').select('*').order('buzz_score', { ascending: false }),
                supabase.from('buzz_posts').select('*, buzz_categories(label), buzz_media(*)').eq('status', 'LIVE').order('trend_score', { ascending: false })
            ]);

            if (hotspotsRes.data) {
                const data = (hotspotsRes.data as any[]).map(h => ({ ...h, confidence: 92 }));
                setHotspots(data);
                setSelectedArea(data[0]);
            }

            if (storiesRes.data) {
                setStories((storiesRes.data as any[]).map((s) => ({
                    id: s.id,
                    title: s.title,
                    description: s.description || '',
                    area_zone: s.area_zone || 'Nairobi',
                    category: s.buzz_categories?.label || 'General',
                    status: s.status,
                    trend_score: s.trend_score,
                    latitude: Number(s.latitude),
                    longitude: Number(s.longitude),
                    starts_at: s.start_at,
                    media: s.buzz_media.map((m: any) => ({ type: m.media_type, url: m.url })),
                    distance: '1.2 km',
                    confidence: 88
                })));
            }
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    }, []);

    React.useEffect(() => {
        fetchBuzzData();
    }, [fetchBuzzData]);

    if (loading) return (
        <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-white">
            <Loader2 className="h-10 w-10 text-primary animate-spin" />
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-300">Synchronizing City Signal...</p>
        </div>
    );

    return (
        <div className="min-h-screen bg-white py-12 px-4 sm:px-6 lg:px-8 text-left selection:bg-primary/20 pb-40 animate-in fade-in duration-1000">
            <div className="max-w-7xl mx-auto space-y-16">

                {/* 🏙️ PREMIUM DISCOVERY HEADER */}
                <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-10 border-b border-slate-100 pb-12">
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-sm"><Sparkles size={20} fill="currentColor" /></div>
                            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">Nairobi Intelligence Node</span>
                        </div>
                        <h1 className="text-5xl lg:text-7xl font-black text-foreground uppercase tracking-tighter leading-[0.85]">
                            The <br /> <span className="text-primary italic">City Buzz.</span>
                        </h1>
                        <p className="text-slate-500 text-lg font-medium italic max-w-xl leading-relaxed">
                            &quot;Nairobi is alive. Discover verified hotspots, trending moments, and synchronized city-pulse narratives.&quot;
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-4">
                        <div className="bg-slate-50 p-6 rounded-[2.5rem] border border-slate-100 flex items-center gap-8 shadow-inner">
                            <div className="text-left">
                                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Global Status</p>
                                <p className="text-xl font-black text-emerald-600 uppercase italic leading-none">Active</p>
                            </div>
                            <div className="h-10 w-px bg-slate-200" />
                            <div className="flex items-center gap-3">
                                <Users className="h-6 w-6 text-primary" />
                                <span className="text-2xl font-black text-foreground tabular-nums">{hotspots.reduce((s, a) => s + (a.active_visitors || 0), 0)}+</span>
                                <span className="text-[8px] font-black uppercase text-slate-400">Online</span>
                            </div>
                        </div>
                        <Button
                            onClick={() => setNightPlannerOpen(true)}
                            className="h-20 px-10 rounded-[2rem] bg-primary text-white font-black uppercase tracking-widest text-[10px] shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
                        >
                            <Zap className="h-4 w-4 mr-3 fill-current" /> Build My Night
                        </Button>
                    </div>
                </header>

                {/* 🔍 TACTICAL FILTERS */}
                <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
                    {[
                        { id: 'trending', label: 'Trending Now', icon: Flame },
                        { id: 'near-me', label: 'Happening Near Me', icon: MapPin },
                        { id: 'tonight', label: 'Tonight\'s Selections', icon: Clock }
                    ].map(f => (
                        <button
                            key={f.id}
                            onClick={() => setFilter(f.id as any)}
                            className={cn(
                                "flex items-center gap-3 px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shrink-0 border-2 shadow-sm",
                                filter === f.id ? "bg-primary border-primary text-white shadow-xl shadow-primary/20 scale-105" : "bg-white text-slate-400 border-slate-100 hover:border-primary/20 hover:text-primary"
                            )}
                        >
                            <f.icon size={16} className={cn(filter === f.id ? "text-white" : "text-primary")} />
                            {f.label}
                        </button>
                    ))}
                </div>

                {/* 🎞️ CINEMATIC STORY GRID */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10">
                    {stories.length === 0 ? (
                        <div className="col-span-full py-40 text-center opacity-20 border-2 border-dashed border-slate-100 rounded-[4rem]">
                            <Flame size={64} className="mx-auto mb-6" />
                            <p className="text-xl font-black uppercase tracking-widest">Awaiting the next Buzz...</p>
                        </div>
                    ) : stories.map(story => (
                        <BuzzStoryCard key={story.id} story={story} />
                    ))}
                </div>

                <div className="grid lg:grid-cols-12 gap-12 pt-10">

                    {/* 🗺️ THE PULSE MAP (LIGHT THEME) */}
                    <div className="lg:col-span-8 space-y-10">
                        <Card className="h-[700px] rounded-[4.5rem] bg-white border-8 border-slate-50 shadow-2xl relative overflow-hidden group">
                            <LiveBuzzMap riders={[]} />

                            <div className="absolute top-10 left-10 right-10 z-10 flex justify-between items-start pointer-events-none">
                                <div className="p-8 rounded-[3rem] bg-white/90 backdrop-blur-xl border border-slate-100 shadow-2xl pointer-events-auto animate-in slide-in-from-top-6 duration-1000">
                                    <h3 className="text-xs font-black uppercase tracking-[0.4em] text-primary mb-6 flex items-center gap-3">
                                        <div className="h-2 w-2 rounded-full bg-primary animate-ping" /> Live City Pulse
                                    </h3>
                                    <div className="space-y-4">
                                        {hotspots.slice(0, 3).map(area => (
                                            <div key={area.zone_name} className="flex items-center gap-6">
                                                <div className={cn(
                                                    "h-2 w-2 rounded-full",
                                                    area.buzz_status === 'BUZZING' ? "bg-rose-500 animate-pulse" : "bg-primary"
                                                )} />
                                                <span className="text-[11px] font-black uppercase text-foreground tracking-tight">{area.zone_name}</span>
                                                <div className="h-1 w-24 bg-slate-100 rounded-full overflow-hidden">
                                                    <div className="h-full bg-primary" style={{ width: `${area.buzz_score}%` }} />
                                                </div>
                                                <span className="text-[10px] font-black text-slate-400 ml-auto">{area.buzz_score}%</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="bg-white text-foreground border border-slate-100 px-8 py-4 rounded-full text-[10px] font-black uppercase tracking-[0.3em] shadow-lg pointer-events-auto">
                                    Grid Node: Nairobi Central
                                </div>
                            </div>

                            {/* Privacy Shield Disclaimer */}
                            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10 w-full max-w-md px-6">
                                <div className="bg-white/95 backdrop-blur-md p-5 rounded-3xl border border-slate-100 text-center shadow-2xl">
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-relaxed">
                                        🛡️ Privacy Safe: Locations are aggregated. <br /> Individual patron telemetry is never exposed to the grid.
                                    </p>
                                </div>
                            </div>
                        </Card>

                        <div className="grid sm:grid-cols-2 gap-8">
                             <Card className="p-12 rounded-[3.5rem] bg-slate-50 border border-slate-100 shadow-inner space-y-6 text-left group hover:border-primary/20 transition-all">
                                <div className="flex items-center gap-4">
                                    <div className="h-14 w-14 rounded-2xl bg-white flex items-center justify-center text-primary shadow-sm border border-slate-100 group-hover:scale-110 transition-transform"><Smartphone size={28} /></div>
                                    <h3 className="text-2xl font-black uppercase text-foreground tracking-tight leading-none">Sector <br /> Momentum</h3>
                                </div>
                                <p className="text-sm text-slate-500 font-medium italic leading-relaxed">
                                    &quot;Aggregated mobile density detected in Westlands Sector. Monitoring mission volume for peak tonight.&quot;
                                </p>
                             </Card>
                             <Card className="p-12 rounded-[3.5rem] bg-indigo-50/30 border border-indigo-100/50 shadow-sm space-y-8 text-left group hover:border-indigo-200 transition-all">
                                <div className="flex items-center gap-4">
                                    <div className="h-14 w-14 rounded-2xl bg-white flex items-center justify-center text-indigo-600 shadow-sm border border-indigo-100 group-hover:scale-110 transition-transform"><TrendingUp size={28} /></div>
                                    <h3 className="text-2xl font-black uppercase text-foreground tracking-tight leading-none">Discovery <br /> Metrics</h3>
                                </div>
                                <div className="space-y-4">
                                    {[
                                        { label: 'Map Signal Strength', val: 94 },
                                        { label: 'Event Verification', val: 82 },
                                        { label: 'System Confidence', val: 97 },
                                    ].map(cat => (
                                        <div key={cat.label} className="space-y-2">
                                            <div className="flex justify-between items-center text-[10px] font-black uppercase text-slate-400">
                                                <span>{cat.label}</span>
                                                <span className="text-indigo-600">{cat.val}%</span>
                                            </div>
                                            <div className="h-1 w-full bg-white/50 rounded-full overflow-hidden">
                                                <div className="h-full bg-indigo-500 transition-all duration-1000" style={{ width: `${cat.val}%` }} />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                             </Card>
                        </div>
                    </div>

                    {/* 📊 SECTOR INTELLIGENCE SIDEBAR */}
                    <div className="lg:col-span-4 space-y-10">
                        <section className="space-y-8">
                            <h2 className="text-2xl font-black uppercase tracking-tighter text-foreground px-6">Operational Sectors</h2>
                            <div className="space-y-5">
                                {hotspots.map(area => (
                                    <Card
                                        key={area.zone_name}
                                        onClick={() => setSelectedArea(area)}
                                        className={cn(
                                            "p-10 rounded-[3.5rem] border-2 cursor-pointer transition-all relative overflow-hidden group",
                                            selectedArea?.zone_name === area.zone_name ? "bg-white border-primary shadow-2xl scale-[1.02]" : "bg-slate-50 border-transparent hover:border-slate-200"
                                        )}
                                    >
                                        <div className="relative z-10 flex justify-between items-center">
                                            <div className="space-y-2">
                                                <h4 className="text-2xl font-black uppercase tracking-tighter text-foreground">{area.zone_name}</h4>
                                                <div className="flex items-center gap-2">
                                                     <p className={cn(
                                                        "text-[10px] font-black uppercase tracking-widest",
                                                        area.buzz_status === 'BUZZING' ? "text-rose-500" : "text-slate-400"
                                                    )}>{area.buzz_status}</p>
                                                    <div className="h-1 w-1 rounded-full bg-slate-200" />
                                                    <p className="text-[10px] font-black text-primary uppercase">92% CONFIDENT</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-4xl font-black text-foreground tracking-tighter tabular-nums leading-none">{area.buzz_score}</p>
                                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">BUZZ_SCORE™</p>
                                            </div>
                                        </div>
                                        <div className="mt-8 h-2 w-full bg-slate-200/50 rounded-full overflow-hidden border border-white/50 p-0.5">
                                            <div
                                                className={cn(
                                                    "h-full rounded-full transition-all duration-[2s] ease-out shadow-lg",
                                                    area.buzz_status === 'BUZZING' ? "bg-rose-500 shadow-rose-200" : "bg-primary shadow-primary/20"
                                                )}
                                                style={{ width: `${area.buzz_score}%` }}
                                            />
                                        </div>
                                        {selectedArea?.zone_name === area.zone_name && (
                                            <Zap className="absolute -bottom-6 -right-6 h-32 w-32 text-primary/5 rotate-12" />
                                        )}
                                    </Card>
                                ))}
                            </div>
                        </section>

                        {/* SECTOR DEEP-DIVE (LIGHT VERSION) */}
                        {selectedArea && (
                            <Card className="p-12 rounded-[4rem] bg-white border border-primary/10 shadow-2xl space-y-10 relative overflow-hidden animate-in zoom-in-95 duration-700">
                                <div className="relative z-10 space-y-10 text-left">
                                    <div className="flex items-center gap-5">
                                        <div className="h-16 w-16 rounded-[1.8rem] bg-primary/10 flex items-center justify-center text-primary shadow-inner border border-primary/20"><MapPin size={32} /></div>
                                        <div>
                                            <h3 className="text-3xl font-black uppercase tracking-tighter">{selectedArea.zone_name} Insights</h3>
                                            <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mt-1">Sector Intelligence Hub</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-8">
                                        <div className="space-y-1">
                                            <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Active Patrons</p>
                                            <p className="text-4xl font-black text-foreground tracking-tighter">{selectedArea.active_visitors}+</p>
                                        </div>
                                        <div className="space-y-1 text-right">
                                            <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Dispatch Node</p>
                                            <p className="text-4xl font-black text-foreground tracking-tighter">Ready</p>
                                        </div>
                                    </div>

                                    <div className="p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100 space-y-6 text-left relative overflow-hidden">
                                        <p className="text-[11px] font-black uppercase text-primary tracking-widest flex items-center gap-2">
                                            <CheckCircle2 size={14} /> Neural Match Result
                                        </p>
                                        <Link href={`/shop?category=${selectedArea.zone_name}`} className="flex items-center gap-5 text-left group/prod relative z-10">
                                            <div className="h-16 w-16 rounded-2xl bg-white flex items-center justify-center text-slate-900 group-hover/prod:scale-110 transition-transform shadow-lg border border-slate-100"><Wine size={32} /></div>
                                            <div className="min-w-0 flex-1 text-left">
                                                <p className="text-sm font-black uppercase truncate group-hover/prod:text-primary transition-colors">Premium Cellar Selection</p>
                                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Trending in {selectedArea.zone_name}</p>
                                            </div>
                                            <ArrowRight size={20} className="text-primary group-hover/prod:translate-x-2 transition-transform" />
                                        </Link>
                                        <Zap className="absolute -bottom-4 -right-4 h-24 w-24 text-primary/5 rotate-12" />
                                    </div>

                                    <Button
                                        onClick={() => setIsDetailOpen(true)}
                                        className="w-full h-20 rounded-[2rem] bg-primary text-white font-black uppercase text-xs tracking-[0.2em] shadow-xl shadow-primary/20 hover:bg-primary/90 transition-all active:scale-95"
                                    >
                                        Explore Sector Feed <ChevronRight className="ml-2 h-5 w-5" />
                                    </Button>
                                </div>
                            </Card>
                        )}
                    </div>
                </div>

            </div>

            {isDetailOpen && selectedArea && (
                <PulseDetailModal
                    areaName={selectedArea.zone_name}
                    onClose={() => setIsDetailOpen(false)}
                />
            )}
        </div>
    );
}
