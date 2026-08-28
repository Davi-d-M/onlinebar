'use client';

import * as React from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Card } from '@/components/ui/card';
import { Beaker, FlaskConical, TrendingUp, ArrowRight, Loader2, Play, Pause } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export default function ExperimentLab() {
    const [experiments, setExperiments] = React.useState<any[]>([]);
    const [loading, setLoading] = React.useState(true);

    const fetchExperiments = React.useCallback(async () => {
        if (!supabase) return;
        const { data } = await supabase.from('experiments').select('*, experiment_variants(*)').order('created_at', { ascending: false });
        if (data) setExperiments(data);
        setLoading(false);
    }, []);

    React.useEffect(() => {
        fetchExperiments();
    }, [fetchExperiments]);

    if (loading) return <div className="h-48 bg-slate-50 rounded-[3rem] animate-pulse" />;

    return (
        <Card className="p-10 rounded-[3.5rem] bg-white border border-slate-100 shadow-sm space-y-10 text-left">
            <div className="flex justify-between items-center px-2">
                <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-500 shadow-sm">
                        <FlaskConical size={24} />
                    </div>
                    <div>
                        <h3 className="text-xl font-black uppercase tracking-tighter text-foreground">Experiment Lab</h3>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">A/B Testing & Optimization Hub</p>
                    </div>
                </div>
                <Button size="sm" className="h-10 px-4 rounded-xl bg-primary text-white font-black uppercase text-[9px] tracking-widest"><Play size={12} className="mr-2" /> New Experiment</Button>
            </div>

            <div className="space-y-6">
                {experiments.length === 0 ? (
                    <div className="py-20 text-center opacity-30 border-2 border-dashed border-slate-100 rounded-[2.5rem]">
                        <Beaker size={48} className="mx-auto mb-4" />
                        <p className="text-[10px] font-black uppercase tracking-widest italic">Awaiting Scientific Hypotheses.</p>
                    </div>
                ) : (
                    experiments.map(exp => (
                        <div key={exp.id} className="p-8 rounded-[2.5rem] border border-slate-100 bg-slate-50/50 space-y-8 group hover:bg-white hover:shadow-xl transition-all">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h4 className="text-lg font-black uppercase text-foreground">{exp.name}</h4>
                                    <p className="text-[10px] font-medium text-slate-500 italic mt-1">&quot;{exp.hypothesis}&quot;</p>
                                </div>
                                <span className={cn(
                                    "px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border",
                                    exp.status === 'RUNNING' ? "bg-emerald-50 text-emerald-600 border-emerald-100 animate-pulse" : "bg-slate-100 text-slate-400"
                                )}>
                                    {exp.status}
                                </span>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                {exp.experiment_variants?.map((variant: any) => {
                                    const ctr = variant.reach_count > 0 ? (variant.conversion_count / variant.reach_count * 100).toFixed(1) : '0';
                                    return (
                                        <div key={variant.id} className="p-6 bg-white border border-slate-100 rounded-3xl space-y-4">
                                            <div className="flex justify-between items-center">
                                                <span className="text-[10px] font-black uppercase text-primary">{variant.label} (Variant {variant.key})</span>
                                                <TrendingUp size={12} className="text-emerald-500" />
                                            </div>
                                            <div className="flex justify-between items-end">
                                                <div className="space-y-1">
                                                    <p className="text-2xl font-black text-foreground">{ctr}%</p>
                                                    <p className="text-[8px] font-black text-slate-400 uppercase">Conversion Rate</p>
                                                </div>
                                                <p className="text-[10px] font-bold text-slate-300">{variant.reach_count} Reached</p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="flex gap-2">
                                <Button variant="outline" className="flex-1 h-12 rounded-xl border-slate-100 text-[9px] font-black uppercase tracking-widest"><Pause size={14} className="mr-2" /> Halt Test</Button>
                                <Button className="flex-1 h-12 rounded-xl bg-slate-900 text-white text-[9px] font-black uppercase tracking-widest">Select Winner <ArrowRight size={14} className="ml-2" /></Button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </Card>
    );
}
