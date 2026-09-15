'use client';

import * as React from 'react';
import { supabase } from '@/lib/supabaseClient';
import {
    Building2,
    Plus,
    Search,
    Edit3,
    Trash2,
    CheckCircle2,
    MapPin,
    ArrowUpRight,
    Star,
    Loader2,
    X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export default function VenueManager() {
    const [venues, setVenues] = React.useState<any[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [search, setSearch] = React.useState('');
    const [isEditing, setIsEditing] = React.useState(false);
    const [editForm, setEditForm] = React.useState<any>(null);

    const fetchVenues = React.useCallback(async () => {
        if (!supabase) return;
        setLoading(true);
        try {
            const { data } = await supabase.from('buzz_venues').select('*').order('name');
            if (data) setVenues(data);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    }, []);

    React.useEffect(() => {
        fetchVenues();
    }, [fetchVenues]);

    const handleDeleteVenue = async (id: string, name: string) => {
        if (!supabase || !confirm(`Permanently expel venue "${name}"?`)) return;
        try {
            const { error } = await supabase.from('buzz_venues').delete().eq('id', id);
            if (error) throw error;
            fetchVenues();
        } catch (err) { console.error(err); }
    };

    const handleSave = async () => {
        if (!supabase || !editForm) return;
        setLoading(true);
        try {
            const slug = editForm.name.toLowerCase().replace(/\s+/g, '-');
            const { error } = await supabase.from('buzz_venues').upsert([{ ...editForm, slug }]);
            if (error) throw error;
            setIsEditing(false);
            fetchVenues();
        } catch (err) { console.error(err); }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <header className="flex justify-between items-center px-4">
                <h2 className="text-2xl font-black uppercase tracking-tighter text-foreground">Venue Registry</h2>
                <div className="flex gap-4">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                        <Input
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="h-12 w-64 pl-12 rounded-2xl bg-white border-slate-100"
                            placeholder="Find venue..."
                        />
                    </div>
                    <Button
                        onClick={() => { setEditForm({ name: '', city: 'Nairobi', category: 'Bar', is_active: true }); setIsEditing(true); }}
                        className="h-12 rounded-xl bg-primary text-white font-black uppercase text-[10px] tracking-widest shadow-xl shadow-primary/20"
                    >
                        <Plus className="h-4 w-4 mr-2" /> Add Venue
                    </Button>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading && venues.length === 0 ? (
                    <div className="col-span-full py-20 flex flex-col items-center gap-4">
                        <Loader2 className="h-8 w-8 text-primary animate-spin" />
                        <p className="text-[10px] font-black uppercase text-slate-300 tracking-widest">Accessing Registry...</p>
                    </div>
                ) : venues.filter(v => v.name.toLowerCase().includes(search.toLowerCase())).map(venue => (
                    <Card key={venue.id} className="p-8 rounded-[3rem] bg-white border border-slate-100 shadow-sm group hover:shadow-xl transition-all relative overflow-hidden">
                        <div className="relative z-10 space-y-6 text-left">
                            <div className="flex justify-between items-start">
                                <div className="h-16 w-16 rounded-[1.5rem] bg-slate-50 border border-slate-100 flex items-center justify-center text-primary group-hover:scale-105 transition-transform">
                                    <Building2 size={32} />
                                </div>
                                <div className={cn(
                                    "px-3 py-1 rounded-full text-[8px] font-black uppercase border tracking-widest",
                                    venue.is_verified ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-slate-50 text-slate-400 border-slate-100"
                                )}>
                                    {venue.is_verified ? 'Verified' : 'Pending'}
                                </div>
                            </div>

                            <div>
                                <p className="text-[9px] font-black uppercase text-primary tracking-widest mb-1">{venue.category}</p>
                                <h3 className="text-xl font-black text-foreground uppercase tracking-tight truncate">{venue.name}</h3>
                                <div className="flex items-center gap-2 text-slate-400 mt-2">
                                    <MapPin size={12} />
                                    <span className="text-[10px] font-bold uppercase tracking-widest">{venue.city}</span>
                                </div>
                            </div>

                            <div className="pt-6 border-t border-slate-50 flex justify-between items-center">
                                <div className="flex items-center gap-1 text-amber-500">
                                    <Star size={12} fill="currentColor" />
                                    <span className="text-[10px] font-black">{venue.rating}</span>
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={() => { setEditForm(venue); setIsEditing(true); }} className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-300 hover:bg-primary hover:text-white transition-all"><Edit3 size={18} /></button>
                                    <button
                                        onClick={() => handleDeleteVenue(venue.id, venue.name)}
                                        className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-200 hover:text-rose-500 hover:bg-rose-50 transition-all"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>

            {isEditing && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-end bg-slate-900/10 backdrop-blur-md p-4 animate-in fade-in duration-300">
                    <Card className="h-full w-full max-w-xl bg-white rounded-l-[4rem] shadow-2xl flex flex-col animate-in slide-in-from-right-full duration-500 overflow-hidden text-left">
                        <div className="p-10 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                            <div className="flex items-center gap-4">
                                <div className="h-12 w-12 rounded-2xl bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/20"><Building2 size={24} /></div>
                                <h2 className="text-3xl font-black uppercase tracking-tighter text-foreground leading-none">Venue Studio</h2>
                            </div>
                            <button onClick={() => setIsEditing(false)} className="h-12 w-12 rounded-full hover:bg-white flex items-center justify-center transition-all border border-slate-100 shadow-sm"><X size={24} /></button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-10 space-y-8 no-scrollbar">
                             <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Venue Identity</label>
                                <Input value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} className="h-14 rounded-2xl bg-slate-50 border-slate-100 font-bold" />
                             </div>
                             <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-slate-400 ml-1">City Hub</label>
                                    <Input value={editForm.city} onChange={e => setEditForm({...editForm, city: e.target.value})} className="h-14 rounded-2xl bg-slate-50 border-slate-100 font-bold" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Category Type</label>
                                    <select value={editForm.category} onChange={e => setEditForm({...editForm, category: e.target.value})} className="w-full h-14 rounded-2xl bg-slate-50 border-slate-100 px-6 font-black text-xs uppercase outline-none">
                                        <option value="Bar">Bar</option>
                                        <option value="Club">Nightclub</option>
                                        <option value="Lounge">Executive Lounge</option>
                                        <option value="Rooftop">Rooftop Experience</option>
                                    </select>
                                </div>
                             </div>
                             <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Physical Address</label>
                                <Input value={editForm.address || ''} onChange={e => setEditForm({...editForm, address: e.target.value})} className="h-14 rounded-2xl bg-slate-50 border-slate-100 font-bold" />
                             </div>
                        </div>

                        <div className="p-10 border-t border-slate-100 bg-slate-50/50 flex gap-4">
                            <Button onClick={() => setIsEditing(false)} variant="outline" className="flex-1 h-16 rounded-2xl border-slate-200 text-slate-400 font-black uppercase text-xs tracking-widest">Discard</Button>
                            <Button onClick={handleSave} className="flex-[2] h-16 rounded-2xl bg-primary text-white font-black uppercase text-xs tracking-widest shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all">
                                Deploy Venue Node <ArrowUpRight className="ml-2 h-4 w-4" />
                            </Button>
                        </div>
                    </Card>
                </div>
            )}
        </div>
    );
}
