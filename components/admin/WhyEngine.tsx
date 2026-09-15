'use client';

import * as React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Brain, Sparkles, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { analyzeMissionTimeline, AnalysisResult } from '@/lib/engines/reasoningEngine';

interface MissionEvent {
    created_at: string;
    event_type: string;
}

export default function WhyEngine({ events, missionId }: { events: MissionEvent[], missionId: string }) {
    const [result, setResult] = React.useState<AnalysisResult | null>(null);
    const [loading, setLoading] = React.useState(false);

    const handleAnalyze = () => {
        setLoading(true);
        setTimeout(() => {
            const analysis = analyzeMissionTimeline(events);
            setResult(analysis);
            setLoading(false);
        }, 1200); // Artificial "Intelligence" delay
    };

    return (
        <Card className="p-10 rounded-[3.5rem] bg-white border border-slate-100 shadow-sm relative overflow-hidden group text-left">
            <div className="relative z-10 space-y-8">
                <div className="flex justify-between items-start">
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-sm border border-primary/20">
                            <Brain size={28} />
                        </div>
                        <div>
                            <h3 className="text-xl font-black uppercase tracking-tighter text-foreground leading-none">Surgical Analysis</h3>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Reasoning Engine: Mission #{missionId}</p>
                        </div>
                    </div>
                    {!result && !loading && (
                        <Button
                            onClick={handleAnalyze}
                            className="h-10 px-6 rounded-xl bg-primary text-white text-[9px] font-black uppercase tracking-widest shadow-lg active:scale-95 transition-all"
                        >
                            Analyze mission
                        </Button>
                    )}
                </div>

                {loading ? (
                    <div className="flex items-center gap-4 animate-pulse py-4">
                        <Loader2 className="animate-spin text-primary" size={20} />
                        <p className="text-[11px] font-black uppercase tracking-widest text-slate-400">Deconstructing mission telemetry...</p>
                    </div>
                ) : result ? (
                    <div className="space-y-6 animate-in zoom-in-95 duration-500 text-left">
                        <p className="text-lg font-medium leading-relaxed italic text-slate-500">
                            &quot;{result.conclusion}&quot;
                        </p>

                        {result.bottlenecks.length > 0 && (
                            <div className="space-y-3">
                                {result.bottlenecks.map((b, i) => (
                                    <div key={i} className="flex items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-2xl">
                                        <div className="flex items-center gap-3">
                                            <div className={cn(
                                                "h-2 w-2 rounded-full",
                                                b.severity === 'Major' ? "bg-rose-500 animate-pulse" : "bg-amber-500"
                                            )} />
                                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{b.label}</span>
                                        </div>
                                        <span className="text-xs font-black text-foreground">+{b.delay} Delay</span>
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className="p-5 bg-primary/5 border border-primary/10 rounded-2xl flex items-start gap-4">
                            <Sparkles size={18} className="text-primary mt-0.5 shrink-0" />
                            <div>
                                <p className="text-[10px] font-black uppercase text-primary tracking-widest mb-1">Recommendation</p>
                                <p className="text-[11px] font-medium text-slate-600 leading-relaxed italic">{result.recommendation}</p>
                            </div>
                        </div>

                        <Button
                            variant="ghost"
                            onClick={() => setResult(null)}
                            className="text-[8px] font-black uppercase tracking-widest text-slate-300 hover:text-primary p-0 h-auto"
                        >
                            Reset Analysis
                        </Button>
                    </div>
                ) : (
                    <div className="py-10 text-center opacity-30">
                        <Sparkles size={48} className="mx-auto mb-4 text-slate-300" />
                        <p className="text-[10px] font-black uppercase tracking-widest italic text-slate-400">Awaiting manual analysis trigger.</p>
                    </div>
                )}
            </div>

            {/* Background Pattern */}
            <Brain className="absolute -bottom-20 -right-20 h-80 w-80 text-primary/5 rotate-12 -z-0" />
        </Card>
    );
}
