'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, Plus, Loader2, ChevronRight, Search } from 'lucide-react';
import Link from 'next/link';

interface Crew {
    id: string;
    name: string;
    motto: string;
    total_xp: number;
    member_count: number;
    rank_nairobi: number;
    logo_url?: string;
}

export default function CrewsPage() {
    const [crews, setCrews] = useState<Crew[]>([]);
    const [myCrew, setMyCrew] = useState<Crew | null>(null);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => {
        async function loadCrews() {
            if (!supabase) return;

            const [allCrews, memberRes] = await Promise.all([
                supabase.from('crews').select('*').order('total_xp', { ascending: false }),
                supabase.auth.getSession().then(({data}) =>
                    (data.session && supabase) ? supabase.from('crew_members').select('crews(*)').eq('user_id', data.session.user.id).maybeSingle() : null
                )
            ]);

            if (allCrews.data) setCrews(allCrews.data);
            if (memberRes?.data) setMyCrew(memberRes.data.crews as any);

            setLoading(false);
        }
        loadCrews();
    }, []);

    if (loading) return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 gap-4">
            <Loader2 className="animate-spin text-primary" />
            <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Entering Crew Hub...</p>
        </div>
    );

    return (
        <div className="min-h-screen bg-white py-16 px-4 sm:px-6 lg:px-8 text-left">
            <div className="max-w-5xl mx-auto space-y-12">

                {/* Header */}
                <header className="flex flex-col md:flex-row justify-between items-end gap-6 border-b border-slate-100 pb-10">
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-500 shadow-sm"><Users size={24} /></div>
                            <h1 className="text-5xl font-black tracking-tighter text-foreground uppercase">Nairobi Crews</h1>
                        </div>
                        <p className="text-slate-500 font-medium text-lg max-w-xl italic">
                            Join forces with other patrons. Contribute XP, climb the rankings, and unlock team-only rewards.
                        </p>
                    </div>
                    <Button className="h-14 px-8 rounded-2xl bg-slate-900 text-white font-black uppercase text-xs tracking-widest shadow-xl active:scale-95 transition-all">
                        <Plus size={18} className="mr-2" /> Start My Crew
                    </Button>
                </header>

                {/* My Crew Section */}
                {myCrew ? (
                    <section className="space-y-6">
                        <h2 className="text-xl font-black uppercase tracking-tighter text-foreground">Your Active Crew</h2>
                        <Card className="p-10 rounded-[3.5rem] bg-gradient-to-br from-indigo-600 to-slate-900 text-white border-none shadow-2xl relative overflow-hidden group">
                            <div className="relative z-10 grid md:grid-cols-2 gap-10 items-center">
                                <div className="flex items-center gap-8">
                                    <div className="h-24 w-24 rounded-[2rem] bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-4xl font-black shadow-inner">
                                        {myCrew.name.substring(0, 2).toUpperCase()}
                                    </div>
                                    <div className="space-y-2">
                                        <h3 className="text-3xl font-black uppercase tracking-tighter">{myCrew.name}</h3>
                                        <p className="text-sm font-medium italic opacity-70">&quot;{myCrew.motto || 'Conquering the Nairobi night.'}&quot;</p>
                                        <div className="flex items-center gap-4 pt-2">
                                            <span className="text-[10px] font-black uppercase tracking-widest bg-white/20 px-3 py-1 rounded-full">Rank #{myCrew.rank_nairobi || '---'}</span>
                                            <span className="text-[10px] font-black uppercase tracking-widest bg-white/20 px-3 py-1 rounded-full">{myCrew.member_count} Members</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <div className="flex justify-between items-end">
                                            <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Season XP Progress</p>
                                            <p className="text-lg font-black">{myCrew.total_xp.toLocaleString()} XP</p>
                                        </div>
                                        <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                                            <div className="h-full bg-primary" style={{ width: '64%' }} />
                                        </div>
                                    </div>
                                    <Link href={`/profile/crews/${myCrew.id}`}>
                                        <Button className="w-full h-14 rounded-2xl bg-white text-slate-900 font-black uppercase text-[10px] tracking-widest hover:bg-primary hover:text-white transition-all">
                                            Enter Crew Command
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                            <Users className="absolute -bottom-10 -right-10 h-64 w-64 text-white/5 rotate-12 -z-0" />
                        </Card>
                    </section>
                ) : (
                    <Card className="p-12 rounded-[3.5rem] bg-slate-50 border border-slate-100 text-center space-y-6 shadow-inner">
                        <Users className="h-16 w-16 text-slate-200 mx-auto" />
                        <div className="space-y-2">
                            <h3 className="text-2xl font-black uppercase tracking-tighter">No Active Crew Found</h3>
                            <p className="text-slate-400 font-medium italic text-sm">Patrons with crews earn 20% more XP through contribution multipliers.</p>
                        </div>
                        <div className="flex justify-center gap-4">
                            <Button variant="outline" className="h-12 rounded-xl border-slate-200 font-black uppercase text-[10px]">Browse Discovery</Button>
                            <Button className="h-12 rounded-xl bg-slate-900 text-white font-black uppercase text-[10px]">Create New</Button>
                        </div>
                    </Card>
                )}

                {/* Global Rankings */}
                <section className="space-y-10">
                    <div className="flex justify-between items-end px-2">
                        <h2 className="text-3xl font-black uppercase tracking-tighter text-foreground">Global Ranking</h2>
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                            <input
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                placeholder="Find Crew..."
                                className="h-12 rounded-2xl bg-slate-50 border border-slate-100 pl-12 text-[10px] font-black uppercase tracking-widest w-64 outline-none focus:ring-4 focus:ring-primary/5 transition-all"
                            />
                        </div>
                    </div>

                    <div className="grid gap-4">
                        {crews.filter(c => c.name.toLowerCase().includes(search.toLowerCase())).map((crew, idx) => (
                            <Card key={crew.id} className="p-8 rounded-[2.5rem] bg-white border border-slate-100 shadow-sm group hover:border-primary/20 transition-all flex items-center justify-between">
                                <div className="flex items-center gap-6">
                                    <div className="h-12 w-12 rounded-xl bg-slate-50 flex items-center justify-center font-black text-slate-400 group-hover:text-primary transition-colors">
                                        {idx + 1}
                                    </div>
                                    <div className="h-14 w-14 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center text-foreground font-black">
                                        {crew.name.substring(0, 2).toUpperCase()}
                                    </div>
                                    <div>
                                        <h3 className="font-black text-foreground uppercase text-lg tracking-tighter leading-none">{crew.name}</h3>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase mt-1">{crew.member_count} Patrons Active</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-12">
                                    <div className="text-right hidden sm:block">
                                        <p className="text-[8px] font-black uppercase text-primary">Power Level</p>
                                        <p className="text-xl font-black text-foreground">{crew.total_xp.toLocaleString()} XP</p>
                                    </div>
                                    <Button variant="ghost" size="icon" className="h-12 w-12 rounded-2xl bg-slate-50 border border-slate-100 group-hover:bg-primary group-hover:text-white transition-all">
                                        <ChevronRight />
                                    </Button>
                                </div>
                            </Card>
                        ))}
                    </div>
                </section>

            </div>
        </div>
    );
}
