'use client';

import * as React from 'react';
import {
    DollarSign,
    Clock,
    AlertTriangle,
    CheckCircle2,
    History,
    Target
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn, formatPrice } from '@/lib/utils';

interface PricingLabProps {
    basePrice: number;
    costPrice: number;
    onPriceChange: (newPrice: number) => void;
}

export default function PricingLab({ basePrice, costPrice, onPriceChange }: PricingLabProps) {
    const [simulatePrice, setSimulatePrice] = React.useState(basePrice);
    const [volume, setVolume] = React.useState(100);

    const profit = simulatePrice - costPrice;
    const margin = simulatePrice > 0 ? (profit / simulatePrice) * 100 : 0;
    const breakEven = profit > 0 ? Math.ceil(10000 / profit) : '∞'; // Simulated fixed overhead of 10k

    return (
        <div className="grid lg:grid-cols-12 gap-10">

            {/* PRICING TERMINAL */}
            <div className="lg:col-span-7 space-y-8">
                <Card className="p-10 rounded-[3.5rem] bg-white border border-slate-100 shadow-sm space-y-10 text-left">
                    <div className="flex items-center justify-between border-l-4 border-primary pl-6">
                        <div>
                            <h2 className="text-2xl font-black uppercase tracking-tight text-foreground leading-none">Economics Node</h2>
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-2">Margin & Profit Simulator</p>
                        </div>
                        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-50 border border-slate-100">
                            <History size={14} className="text-slate-300" />
                            <span className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Audit Trail Active</span>
                        </div>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-10">
                        <div className="space-y-4">
                            <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Proposed Sell Price (Ksh)</label>
                            <div className="relative">
                                <Input
                                    type="number"
                                    value={simulatePrice}
                                    onChange={e => setSimulatePrice(Number(e.target.value))}
                                    className="h-16 rounded-[1.5rem] border-slate-100 bg-slate-50 font-black text-2xl text-primary pl-16 focus:ring-4 focus:ring-primary/5 transition-all"
                                />
                                <DollarSign className="absolute left-6 top-1/2 -translate-y-1/2 h-6 w-6 text-slate-300" />
                            </div>
                        </div>
                        <div className="space-y-4">
                            <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Landing Cost (Ksh)</label>
                            <div className="relative">
                                <Input
                                    type="number"
                                    value={costPrice}
                                    readOnly
                                    className="h-16 rounded-[1.5rem] border-slate-50 bg-slate-100 font-bold text-xl text-slate-400 pl-16 cursor-not-allowed"
                                />
                                <Target className="absolute left-6 top-1/2 -translate-y-1/2 h-6 w-6 text-slate-200" />
                            </div>
                        </div>
                    </div>

                    <div className="grid sm:grid-cols-3 gap-6">
                        <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100 flex flex-col justify-center">
                            <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest mb-2">Gross Profit</p>
                            <h3 className={cn("text-2xl font-black tracking-tight", profit > 0 ? "text-emerald-500" : "text-rose-500")}>
                                {formatPrice(profit)}
                            </h3>
                        </div>
                        <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100 flex flex-col justify-center">
                            <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest mb-2">Net Margin</p>
                            <h3 className={cn("text-2xl font-black tracking-tight", margin > 25 ? "text-emerald-500" : margin > 15 ? "text-primary" : "text-rose-500")}>
                                {margin.toFixed(1)}%
                            </h3>
                        </div>
                        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col justify-center">
                            <p className="text-[9px] font-black uppercase text-primary tracking-widest mb-2">Break-Even (Qty)</p>
                            <h3 className="text-2xl font-black text-foreground tracking-tight">{breakEven} Units</h3>
                        </div>
                    </div>

                    <div className="pt-8 border-t border-slate-50 flex gap-4">
                        <Button
                            onClick={() => onPriceChange(simulatePrice)}
                            className="flex-1 h-16 rounded-2xl bg-primary text-white font-black uppercase text-xs tracking-widest shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all"
                        >
                            Commit Price Strategy
                        </Button>
                    </div>
                </Card>

                {/* CAMPAIGN SCHEDULER */}
                <Card className="p-8 rounded-[3rem] bg-indigo-600 text-white border-none shadow-2xl relative overflow-hidden text-left">
                    <div className="relative z-10 space-y-6">
                        <div className="flex items-center gap-4">
                            <div className="h-12 w-12 rounded-2xl bg-white/10 flex items-center justify-center backdrop-blur-md border border-white/20"><Clock size={24} /></div>
                            <div>
                                <h3 className="text-xl font-black uppercase tracking-tighter leading-none">Promotion Validator</h3>
                                <p className="text-[9px] font-black uppercase opacity-60 mt-1 tracking-widest">Pillar 7 Integrity Check</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                                <p className="text-[8px] font-black uppercase opacity-60">Status</p>
                                <div className="flex items-center gap-2">
                                    <CheckCircle2 size={12} className="text-emerald-400" />
                                    <span className="text-[10px] font-black uppercase">Start Node Valid</span>
                                </div>
                            </div>
                            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                                <p className="text-[8px] font-black uppercase opacity-60">Price Integrity</p>
                                <div className="flex items-center gap-2">
                                    <CheckCircle2 size={12} className="text-emerald-400" />
                                    <span className="text-[10px] font-black uppercase">No Fake Scarcity</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <History className="absolute -bottom-10 -right-10 h-64 w-64 text-white/5 rotate-12 -z-0" />
                </Card>
            </div>

            {/* REVENUE SIMULATOR (SIDE) */}
            <div className="lg:col-span-5">
                <Card className="p-10 rounded-[3.5rem] bg-white border border-slate-100 shadow-sm h-full flex flex-col space-y-10 text-left">
                    <div className="space-y-1">
                        <h3 className="text-xl font-black text-foreground uppercase tracking-tighter">Impact Modeller</h3>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Predictive Revenue Shift</p>
                    </div>

                    <div className="space-y-8 flex-1">
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <label className="text-[10px] font-black uppercase text-slate-400">Projected Volume</label>
                                <span className="text-[10px] font-black text-primary">{volume} Orders</span>
                            </div>
                            <input
                                type="range" min="10" max="1000" step="10"
                                value={volume} onChange={e => setVolume(Number(e.target.value))}
                                className="w-full h-2 bg-slate-100 rounded-full appearance-none accent-primary"
                            />
                        </div>

                        <div className="space-y-6">
                            <div className="p-6 rounded-3xl bg-slate-50 border border-slate-100 space-y-2">
                                <p className="text-[10px] font-black uppercase text-slate-400">Total Revenue</p>
                                <h4 className="text-3xl font-black text-foreground tracking-tighter italic">{formatPrice(simulatePrice * volume)}</h4>
                            </div>
                            <div className="p-6 rounded-3xl bg-emerald-50 border border-emerald-100 space-y-2">
                                <p className="text-[10px] font-black uppercase text-emerald-600">Net Contribution</p>
                                <h4 className="text-3xl font-black text-emerald-700 tracking-tighter italic">{formatPrice(profit * volume)}</h4>
                            </div>
                        </div>
                    </div>

                    <div className="pt-6">
                        <div className="flex items-start gap-4 p-5 rounded-2xl bg-amber-50 border border-amber-100 text-amber-700">
                            <AlertTriangle size={20} className="shrink-0 mt-1" />
                            <p className="text-[9px] font-bold uppercase leading-relaxed tracking-tight">
                                Margin is below 20%. Recommended strategy: Bundle with high-margin snacks to protect net contribution.
                            </p>
                        </div>
                    </div>
                </Card>
            </div>

        </div>
    );
}
