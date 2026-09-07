'use client';

import * as React from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Card } from '@/components/ui/card';
import { ShieldCheck, Clock, ArrowRight, Scale } from 'lucide-react';
import { formatPrice } from '@/lib/utils';

export default function TaxControlCenter() {
    const [taxData, setTaxData] = React.useState({
        output_vat: 0,
        input_vat: 0,
        excise: 0,
        days_to_deadline: 0
    });
    const [loading, setLoading] = React.useState(true);

    const fetchTaxPosition = React.useCallback(async () => {
        if (!supabase) return;
        try {
            // Aggregate from ledger
            const { data } = await supabase
                .from('ledger_entries')
                .select('amount, account_id')
                .or('account_id.eq.2100,account_id.eq.2200');

            let vatPayable = 0;
            let excisePayable = 0;

            data?.forEach(e => {
                if (e.account_id === '2100') vatPayable += e.amount;
                if (e.account_id === '2200') excisePayable += e.amount;
            });

            // Calculate deadline (KRA 20th of next month)
            const now = new Date();
            const deadline = new Date(now.getFullYear(), now.getMonth() + 1, 20);
            const diffDays = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

            setTaxData({
                output_vat: vatPayable,
                input_vat: 0, // In real app, pull from Purchases COGS
                excise: excisePayable,
                days_to_deadline: diffDays
            });
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }, []);

    React.useEffect(() => {
        fetchTaxPosition();
    }, [fetchTaxPosition]);

    if (loading) return <div className="h-64 bg-slate-50 rounded-[3rem] animate-pulse" />;

    return (
        <Card className="p-10 rounded-[3.5rem] bg-white border border-slate-100 shadow-sm space-y-10 text-left">
            <header className="flex justify-between items-center px-2">
                <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-sm">
                        <ShieldCheck size={24} />
                    </div>
                    <div>
                        <h3 className="text-xl font-black uppercase tracking-tighter text-foreground">Tax Command</h3>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Live KRA Liability Position</p>
                    </div>
                </div>
                <div className="flex items-center gap-2 px-3 py-1 bg-amber-50 text-amber-600 rounded-full text-[9px] font-black uppercase border border-amber-100">
                    <Clock size={12} className="mr-1" /> {taxData.days_to_deadline} Days Remaining
                </div>
            </header>

            <div className="grid sm:grid-cols-2 gap-8">
                <div className="space-y-6">
                    <div className="flex justify-between items-end border-b border-slate-50 pb-4">
                        <div className="space-y-1">
                            <p className="text-[9px] font-black uppercase text-slate-400">VAT Liability</p>
                            <h4 className="text-2xl font-black text-foreground">{formatPrice(taxData.output_vat)}</h4>
                        </div>
                        <Scale className="text-slate-200 mb-1" size={20} />
                    </div>
                    <div className="flex justify-between items-end">
                        <div className="space-y-1">
                            <p className="text-[9px] font-black uppercase text-slate-400">Excise Position</p>
                            <h4 className="text-2xl font-black text-foreground">{formatPrice(taxData.excise)}</h4>
                        </div>
                    </div>
                </div>

                <div className="p-8 bg-slate-50 rounded-[2.5rem] flex flex-col justify-between group overflow-hidden relative">
                    <div className="relative z-10 space-y-4">
                        <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Net Tax Exposure</p>
                        <h2 className="text-4xl font-black text-primary tracking-tighter leading-none">
                            {formatPrice(taxData.output_vat + taxData.excise)}
                        </h2>
                        <button className="flex items-center gap-2 text-[9px] font-black uppercase text-primary hover:underline pt-4">
                            Generate eTIMS Draft <ArrowRight size={12} />
                        </button>
                    </div>
                    <ShieldCheck size={80} className="absolute -bottom-6 -right-6 text-primary/5 -rotate-12" />
                </div>
            </div>
        </Card>
    );
}
