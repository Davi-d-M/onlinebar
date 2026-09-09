'use client';

import * as React from 'react';
import { supabase } from '@/lib/supabaseClient';
import {
    Flame,
    Plus,
    Calendar,
    MapPin,
    Image as ImageIcon,
    MoreHorizontal,
    Play,
    Pause,
    Trash2,
    TrendingUp,
    ShieldAlert
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import PulsePostEditor from '@/components/admin/pulse/PulsePostEditor';

interface PulseArea {
    id: string;
    zone_name: string;
    buzz_mode: string;
    is_active: boolean;
}

interface PulsePost {
    id: string;
    area_id: string;
    title: string;
    headline: string;
    description: string;
    status: string;
    start_time: string;
    end_time: string;
    hero_image_url: string;
    cta_label: string;
    is_featured: boolean;
    tags: string[];
    area?: { zone_name: string };
}

export default function PulseControlCenter() {
    const [areas, setAreas] = React.useState<PulseArea[]>([]);
    const [posts, setPosts] = React.useState<PulsePost[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [isEditorOpen, setIsEditorOpen] = React.useState(false);
    const [editingPost, setEditingPost] = React.useState<PulsePost | null>(null);

    const fetchData = React.useCallback(async () => {
        if (!supabase) return;
        setLoading(true);
        try {
            const [areasRes, postsRes] = await Promise.all([
                supabase.from('pulse_areas').select('*').order('zone_name'),
                supabase.from('pulse_posts').select('*, area:pulse_areas(zone_name)').order('created_at', { ascending: false })
            ]);
            setAreas(areasRes.data || []);
            setPosts(postsRes.data || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, []);

    React.useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleUpdateStatus = async (postId: string, status: string) => {
        if (!supabase) return;
        const { error } = await supabase.from('pulse_posts').update({ status }).eq('id', postId);
        if (!error) fetchData();
    };

    const handleDeletePost = async (postId: string, title: string) => {
        if (!supabase || !confirm(`Permanently delete "${title}" moment?`)) return;
        try {
            const { error } = await supabase.from('pulse_posts').delete().eq('id', postId);
            if (error) throw error;
            fetchData();
        } catch (err) {
            console.error(err);
            alert("Deletion protocol failed.");
        }
    };

    if (loading && posts.length === 0) return <div className="min-h-screen flex items-center justify-center bg-slate-50"><Loader2 className="animate-spin text-primary" /></div>;

    return (
        <div className="p-8 space-y-10 bg-slate-50 min-h-screen text-left selection:bg-primary/20 pb-40">
            <header className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 border-b border-slate-200 pb-8">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="h-2 w-2 rounded-full bg-rose-500 animate-pulse"></div>
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-rose-600">Pulse CMS Established</span>
                    </div>
                    <h1 className="text-4xl font-black text-foreground uppercase tracking-tighter leading-none">City Pulse Control</h1>
                    <p className="text-muted-foreground text-sm font-medium mt-1">Manage neighborhoods, schedule moments, and monitor social engagement.</p>
                </div>
                <div className="flex gap-2">
                    <Button onClick={() => { setEditingPost(null); setIsEditorOpen(true); }} className="rounded-xl h-12 px-8 bg-primary text-white font-black uppercase text-[10px] tracking-widest shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all">
                        <Plus className="h-4 w-4 mr-2" /> Create Pulse Moment
                    </Button>
                </div>
            </header>

            {/* PULSE METRICS HUD */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: 'Active Sectors', val: areas.filter(a => a.is_active).length, icon: MapPin, color: 'indigo' },
                    { label: 'Live Moments', val: posts.filter(p => p.status === 'LIVE').length, icon: Flame, color: 'rose' },
                    { label: 'Upcoming Pulse', val: posts.filter(p => p.status === 'APPROVED' || p.status === 'SCHEDULED').length, icon: Calendar, color: 'primary' },
                    { label: 'Total Pulse Engagement', val: '42.8K', icon: TrendingUp, color: 'emerald' },
                ].map((item) => (
                    <Card key={item.label} className="p-8 rounded-[2.5rem] bg-white border border-slate-100 shadow-sm flex items-center gap-6 group hover:shadow-xl transition-all">
                        <div className={cn(
                            "h-12 w-12 rounded-2xl flex items-center justify-center shadow-inner",
                            item.color === 'indigo' ? "bg-indigo-50 text-indigo-500" :
                            item.color === 'rose' ? "bg-rose-50 text-rose-500" :
                            item.color === 'emerald' ? "bg-emerald-50 text-emerald-500" :
                            "bg-primary/5 text-primary"
                        )}>
                            <item.icon size={24} />
                        </div>
                        <div>
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{item.label}</p>
                            <h3 className="text-xl font-black text-foreground tracking-tighter uppercase">{item.val}</h3>
                        </div>
                    </Card>
                ))}
            </div>

            <div className="grid lg:grid-cols-12 gap-10">

                {/* CONTENT QUEUE */}
                <div className="lg:col-span-8 space-y-6">
                    <h2 className="text-xl font-black uppercase tracking-tighter text-foreground px-2">Moment Queue</h2>
                    <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-slate-50 text-slate-400 font-black uppercase text-[9px] tracking-[0.2em]">
                                    <th className="px-10 py-6">Pulse Moment</th>
                                    <th className="px-10 py-6 text-center">Status</th>
                                    <th className="px-10 py-6 text-center">Schedule</th>
                                    <th className="px-10 py-6 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {posts.map((post) => (
                                    <tr key={post.id} className="hover:bg-slate-50/50 transition-all group">
                                        <td className="px-10 py-8">
                                            <div className="flex items-center gap-4">
                                                <div className="h-10 w-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400">
                                                    <ImageIcon size={18} />
                                                </div>
                                                <div>
                                                    <p className="text-xs font-black text-foreground uppercase truncate max-w-[200px]">{post.title}</p>
                                                    <p className="text-[9px] font-bold text-primary uppercase mt-1 tracking-widest">{post.area?.zone_name}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-10 py-8 text-center">
                                            <span className={cn(
                                                "px-3 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-widest border",
                                                post.status === 'LIVE' ? "bg-emerald-50 text-emerald-600 border-emerald-100 animate-pulse" :
                                                post.status === 'DRAFT' ? "bg-slate-100 text-slate-400 border-slate-200" :
                                                "bg-primary/5 text-primary border-primary/10"
                                            )}>{post.status}</span>
                                        </td>
                                        <td className="px-10 py-8 text-center">
                                            <p className="text-[10px] font-black text-foreground">{new Date(post.start_time).toLocaleDateString()}</p>
                                            <p className="text-[8px] font-bold text-slate-400 uppercase mt-1">{new Date(post.start_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                                        </td>
                                        <td className="px-10 py-8 text-right">
                                            <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Button onClick={() => { setEditingPost(post); setIsEditorOpen(true); }} variant="ghost" size="icon" className="h-9 w-9 rounded-xl hover:text-primary hover:bg-white border border-transparent hover:border-slate-100"><MoreHorizontal size={16} /></Button>
                                                {post.status === 'LIVE' ? (
                                                    <Button onClick={() => handleUpdateStatus(post.id, 'ARCHIVED')} variant="ghost" size="icon" className="h-9 w-9 rounded-xl text-rose-500 hover:bg-rose-50 border border-transparent hover:border-rose-100"><Pause size={16} /></Button>
                                                ) : (
                                                    <Button onClick={() => handleUpdateStatus(post.id, 'LIVE')} variant="ghost" size="icon" className="h-9 w-9 rounded-xl text-emerald-500 hover:bg-emerald-50 border border-transparent hover:border-emerald-100"><Play size={16} /></Button>
                                                )}
                                                <Button onClick={() => handleDeletePost(post.id, post.title)} variant="ghost" size="icon" className="h-9 w-9 rounded-xl text-slate-300 hover:text-rose-500 hover:bg-rose-50 transition-all border border-transparent hover:border-rose-100"><Trash2 size={16} /></Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {posts.length === 0 && (
                                    <tr>
                                        <td colSpan={4} className="py-20 text-center opacity-20 flex flex-col items-center gap-4">
                                            <ImageIcon size={48} />
                                            <p className="text-[10px] font-black uppercase tracking-widest">Moment queue is currently empty.</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* AREA MANAGEMENT */}
                <div className="lg:col-span-4 space-y-6">
                    <h2 className="text-xl font-black uppercase tracking-tighter text-foreground px-4">Permanent Sectors</h2>
                    <div className="space-y-4">
                        {areas.map(area => (
                            <Card key={area.id} className="p-6 rounded-[2.5rem] bg-white border border-slate-100 shadow-sm space-y-6 group hover:border-primary/20 transition-all">
                                <div className="flex justify-between items-start">
                                    <div className="flex items-center gap-4">
                                        <div className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-300 group-hover:text-primary transition-colors">
                                            <MapPin size={20} />
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-black uppercase text-foreground">{area.zone_name}</h4>
                                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{area.buzz_mode} Mode</p>
                                        </div>
                                    </div>
                                    <button className={cn(
                                        "w-10 h-5 rounded-full p-0.5 transition-all relative",
                                        area.is_active ? "bg-emerald-500" : "bg-slate-200"
                                    )}>
                                        <div className={cn("h-4 w-4 bg-white rounded-full transition-all shadow-sm", area.is_active ? "translate-x-5" : "translate-x-0")} />
                                    </button>
                                </div>
                            </Card>
                        ))}
                    </div>

                    <Card className="p-8 rounded-[3rem] bg-slate-900 text-white space-y-6 relative overflow-hidden shadow-2xl">
                        <div className="relative z-10 space-y-4">
                            <ShieldAlert className="h-8 w-8 text-primary" />
                            <h3 className="text-lg font-black uppercase tracking-tighter leading-none">Content Guard</h3>
                            <p className="text-[10px] text-slate-400 font-medium italic leading-relaxed">
                                &quot;All City Pulse moments require Admin authorization before deployment to the grid. Ensure media artifacts are optimized for mobile delivery.&quot;
                            </p>
                        </div>
                        <Flame className="absolute -bottom-10 -left-10 h-32 w-32 text-primary/10 rotate-12" />
                    </Card>
                </div>

            </div>

            {isEditorOpen && (
                <PulsePostEditor
                    areas={areas}
                    post={editingPost}
                    onClose={() => setIsEditorOpen(false)}
                    onSaved={() => { setIsEditorOpen(false); fetchData(); }}
                />
            )}
        </div>
    );
}

const Loader2 = ({ className }: { className?: string }) => (
    <div className={cn("animate-spin", className)}><Flame size={32} /></div>
);
