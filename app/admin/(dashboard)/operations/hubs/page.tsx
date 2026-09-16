'use client';

import * as React from 'react';
import { supabase } from '@/lib/supabaseClient';
import {
    Building2,
    Plus,
    MapPin,
    Loader2,
    XCircle,
    Package,
    ArrowUpRight,
    Zap,
    Search,
    Edit3,
    Trash2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { useAdmin } from '@/context/AdminContext';
import { logAuditAction } from '@/lib/auditService';

interface Hub {
    id: string;
    name: string;
    city: string;
    address: string;
    is_active: boolean;
    latitude: number;
    longitude: number;
    stock_count?: number;
    active_riders?: number;
}

export default function HubsManagement() {
    const { email } = useAdmin();
    const [hubs, setHubs] = React.useState<Hub[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [searchQuery, setSearchQuery] = React.useState('');
    const [isEditing, setIsEditing] = React.useState(false);
    const [editHub, setEditHub] = React.useState<Partial<Hub> | null>(null);

    const fetchData = React.useCallback(async () => {
        if (!supabase) return;
        setLoading(true);
        try {
            const { data: hubsData } = await supabase.from('hubs').select('*').order('name');

            // Enrich with stock and rider counts
            const enrichedHubs = await Promise.all((hubsData || []).map(async (hub) => {
                const { count: stockCount } = await supabase!.from('hub_inventory').select('*', { count: 'exact', head: true }).eq('hub_id', hub.id);
                const { count: riderCount } = await supabase!.from('rider_status').select('*', { count: 'exact', head: true }).eq('hub_id', hub.id).neq('status', 'Offline');

                return {
                    ...hub,
                    stock_count: stockCount || 0,
                    active_riders: riderCount || 0
                };
            }));

            setHubs(enrichedHubs);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, []);

    React.useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleSaveHub = async () => {
        if (!supabase || !editHub) return;
        setLoading(true);
        try {
            const { error } = await supabase.from('hubs').upsert([editHub]);
            if (error) throw error;

            await logAuditAction(email, 'HUB_SAVE', { name: editHub.name });
            setIsEditing(false);
            setEditHub(null);
            fetchData();
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteHub = async (id: string, name: string) => {
        if (!supabase || !confirm(`Permanently expel hub "${name}"? This action is absolute.`)) return;
        try {
            const { error } = await supabase.from('hubs').delete().eq('id', id);
            if (error) throw error;
            fetchData();
        } catch (err) { console.error(err); }
    };

    const toggleHubStatus = async (id: string, current: boolean) => {
        if (!supabase) return;
        try {
            await supabase.from('hubs').update({ is_active: !current }).eq('id', id);
            setHubs(prev => prev.map(h => h.id === id ? { ...h, is_active: !current } : h));
        } catch (err) { console.error(err); }
    };

    const filteredHubs = hubs.filter(h =>
        h.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        h.city.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="p-8 space-y-10 bg-slate-50 min-h-screen text-left selection:bg-primary/20 pb-40">
            <header className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 border-b border-slate-200 pb-8">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <Building2 className="h-4 w-4 text-primary" />
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Regional Operations</span>
                    </div>
                    <h1 className="text-4xl font-black text-foreground uppercase tracking-tighter leading-none">Cellar Hubs</h1>
                    <p className="text-muted-foreground text-sm font-medium mt-1">Manage distributed cellars, regional inventory, and city-level mission routing.</p>
                </div>
                <Button
                    onClick={() => { setEditHub({ name: '', city: 'Nairobi', is_active: true }); setIsEditing(true); }}
                    className="rounded-xl h-12 px-8 bg-primary text-white font-black uppercase text-[10px] tracking-widest shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
                >
                    <Plus className="h-4 w-4 mr-2" /> Establish New Hub
                </Button>
            </header>

            <div className="grid lg:grid-cols-12 gap-10">
                <div className="lg:col-span-8 space-y-6">
                    <div className="flex items-center justify-between px-4">
                        <h2 className="text-xl font-black uppercase tracking-tighter text-foreground">Active Grid</h2>
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                            <Input
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                placeholder="Search hubs..."
                                className="h-12 w-64 pl-12 rounded-2xl bg-white border-slate-100 text-[10px] font-black uppercase"
                            />
                        </div>
                    </div>

                    <div className="grid gap-4">
                        {loading && hubs.length === 0 ? (
                            <div className="py-40 flex flex-col items-center gap-6 bg-white rounded-[3rem] border border-slate-100 animate-pulse">
                                <Loader2 className="h-10 w-10 text-primary animate-spin" />
                                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-300">Synchronizing Global Grid...</p>
                            </div>
                        ) : filteredHubs.map(hub => (
                            <Card key={hub.id} className={cn(
                                "p-8 rounded-[3rem] border transition-all hover:shadow-xl relative overflow-hidden group",
                                hub.is_active ? "bg-white border-slate-100" : "bg-slate-50 border-dashed border-slate-200 opacity-60"
                            )}>
                                <div className="flex flex-col md:flex-row justify-between items-center gap-8 relative z-10">
                                    <div className="flex items-center gap-6 flex-1 min-w-0">
                                        <div className="h-16 w-16 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-primary shadow-inner shrink-0 group-hover:scale-105 transition-transform">
                                            <Building2 size={32} />
                                        </div>
                                        <div className="text-left space-y-1 min-w-0">
                                            <div className="flex items-center gap-3">
                                                <span className="text-[9px] font-black uppercase text-primary tracking-widest">{hub.city}</span>
                                                <div className="h-1 w-1 rounded-full bg-slate-200" />
                                                <span className={cn(
                                                    "text-[8px] font-black uppercase tracking-widest",
                                                    hub.is_active ? "text-emerald-500" : "text-slate-400"
                                                )}>{hub.is_active ? 'Online' : 'Suspended'}</span>
                                            </div>
                                            <h3 className="text-2xl font-black text-foreground uppercase tracking-tight truncate leading-none">{hub.name}</h3>
                                            <div className="flex items-center gap-4 text-[9px] font-black text-slate-300 uppercase tracking-widest mt-2">
                                                <span className="flex items-center gap-1.5"><MapPin size={10} /> {hub.address || 'GPS Linked'}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-12 shrink-0">
                                        <div className="text-right">
                                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Stocked SKUs</p>
                                            <p className="text-2xl font-black text-foreground tabular-nums">{hub.stock_count}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Active Runners</p>
                                            <p className="text-2xl font-black text-foreground tabular-nums">{hub.active_riders}</p>
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => toggleHubStatus(hub.id, hub.is_active)}
                                                className={cn(
                                                    "w-12 h-6 rounded-full transition-all relative p-1 flex items-center shadow-inner",
                                                    hub.is_active ? "bg-emerald-500" : "bg-slate-200"
                                                )}
                                            >
                                                <div className={cn(
                                                    "h-4 w-4 rounded-full bg-white shadow-sm transition-all",
                                                    hub.is_active ? "translate-x-6" : "translate-x-0"
                                                )} />
                                            </button>
                                            <button
                                                onClick={() => { setEditHub(hub); setIsEditing(true); }}
                                                className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-300 hover:bg-primary hover:text-white transition-all shadow-sm border border-slate-100"
                                            >
                                                <Edit3 size={18} />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteHub(hub.id, hub.name)}
                                                className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-200 hover:text-rose-500 hover:bg-rose-50 transition-all border border-slate-100 shadow-sm"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                <Zap className="absolute -bottom-6 -right-6 h-32 w-32 text-primary/5 rotate-12" />
                            </Card>
                        ))}
                    </div>
                </div>

                <div className="lg:col-span-4 space-y-8">
                    <Card className="p-10 rounded-[3.5rem] bg-white border border-slate-100 shadow-sm space-y-10 relative overflow-hidden group">
                        <div className="relative z-10 space-y-8 text-left">
                            <div className="flex items-center gap-4">
                                <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-sm border border-primary/20"><Package size={24} className="fill-current" /></div>
                                <h3 className="text-2xl font-black uppercase tracking-tighter leading-none text-foreground">Grid Distribution</h3>
                            </div>

                            <p className="text-sm font-medium text-slate-500 italic leading-relaxed">
                                &quot;Online Bar OS automatically routes missions to the nearest operational hub based on the patron&apos;s tactical drop point.&quot;
                            </p>

                            <div className="space-y-4">
                                {[
                                    { label: 'Network Reach', val: '84%', color: 'rose' },
                                    { label: 'Dispatch Precision', val: '98.2%', color: 'emerald' },
                                    { label: 'Global Inventory', val: '12.4k', color: 'indigo' },
                                ].map(stat => (
                                    <div key={stat.label} className="flex justify-between items-center py-3 border-b border-slate-50 last:border-0">
                                        <span className="text-[10px] font-black uppercase text-slate-500">{stat.label}</span>
                                        <span className={cn("text-xs font-black",
                                            stat.color === 'rose' ? 'text-rose-500' :
                                            stat.color === 'emerald' ? 'text-emerald-500' : 'text-indigo-500'
                                        )}>{stat.val}</span>
                                    </div>
                                ))}
                            </div>

                            <Button
                                onClick={() => alert("Logistics Command Node: Under Construction. 🛰️")}
                                className="w-full h-16 rounded-[2rem] bg-primary text-white font-black uppercase text-xs tracking-widest shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all"
                            >
                                Open Logistics Command
                            </Button>
                        </div>
                    </Card>
                </div>
            </div>

            {/* EDIT MODAL */}
            {isEditing && editHub && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-end bg-slate-900/10 backdrop-blur-md animate-in fade-in duration-300">
                    <Card className="h-full w-full max-w-xl bg-white rounded-l-[4rem] border-none shadow-2xl flex flex-col animate-in slide-in-from-right-full duration-500 overflow-hidden text-left">
                        <div className="p-10 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                            <div className="flex items-center gap-4">
                                <div className="h-12 w-12 rounded-2xl bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/20"><Building2 size={24} /></div>
                                <div>
                                    <h2 className="text-3xl font-black uppercase tracking-tighter text-foreground leading-none">Hub Studio</h2>
                                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mt-1">Establish Cellar Node</p>
                                </div>
                            </div>
                            <button onClick={() => setIsEditing(false)} className="h-12 w-12 rounded-full hover:bg-white flex items-center justify-center transition-all shadow-sm border border-slate-100"><XCircle size={24} /></button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-10 space-y-10 no-scrollbar">
                            <div className="grid gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Hub Identifier (Name)</label>
                                    <Input
                                        value={editHub.name}
                                        onChange={e => setEditHub({...editHub, name: e.target.value})}
                                        className="h-14 rounded-2xl bg-slate-50 border-slate-100 font-bold"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-slate-400 ml-1">City Node</label>
                                    <Input
                                        value={editHub.city}
                                        onChange={e => setEditHub({...editHub, city: e.target.value})}
                                        className="h-14 rounded-2xl bg-slate-50 border-slate-100 font-bold"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Physical Address</label>
                                    <Input
                                        value={editHub.address || ''}
                                        onChange={e => setEditHub({...editHub, address: e.target.value})}
                                        className="h-14 rounded-2xl bg-slate-50 border-slate-100 font-bold"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Latitude</label>
                                        <Input
                                            value={editHub.latitude || ''}
                                            onChange={e => setEditHub({...editHub, latitude: parseFloat(e.target.value)})}
                                            className="h-14 rounded-2xl bg-slate-50 border-slate-100 font-mono"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Longitude</label>
                                        <Input
                                            value={editHub.longitude || ''}
                                            onChange={e => setEditHub({...editHub, longitude: parseFloat(e.target.value)})}
                                            className="h-14 rounded-2xl bg-slate-50 border-slate-100 font-mono"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="p-10 border-t border-slate-100 bg-slate-50/50 flex gap-4">
                            <Button
                                onClick={() => setIsEditing(false)}
                                variant="outline"
                                className="flex-1 h-16 rounded-2xl border-slate-200 text-slate-400 font-black uppercase text-xs tracking-[0.2em]"
                            >
                                Abort Establish
                            </Button>
                            <Button
                                onClick={handleSaveHub}
                                className="flex-[2] h-16 rounded-2xl bg-primary text-white font-black uppercase text-xs tracking-[0.2em] shadow-2xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all"
                            >
                                Deploy Hub Node <ArrowUpRight className="ml-2 h-4 w-4" />
                            </Button>
                        </div>
                    </Card>
                </div>
            )}
        </div>
    );
}
