'use client';

import * as React from 'react';
import { Card } from '@/components/ui/card';
import {
    ShieldCheck,
    Database,
    CheckCircle2,
    QrCode
} from 'lucide-react';

interface AuthenticityProps {
    batchNo?: string;
    origin?: string;
    isVerified?: boolean;
}

export default function AuthenticitySentinel({ batchNo, origin }: AuthenticityProps) {
    return (
        <Card className="p-8 rounded-[3rem] bg-emerald-50 border border-emerald-100 shadow-sm space-y-8 relative overflow-hidden group text-left">
            <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">

                <div className="flex items-center gap-6">
                    <div className="h-16 w-16 rounded-[1.8rem] bg-white flex items-center justify-center text-emerald-500 shadow-inner group-hover:scale-110 transition-transform duration-500">
                        <ShieldCheck size={32} />
                    </div>
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="px-2 py-0.5 rounded bg-emerald-500 text-white text-[7px] font-black uppercase tracking-widest">Master Verified</span>
                            <h3 className="text-lg font-black uppercase tracking-tighter text-emerald-900 leading-none">Authenticity Secure</h3>
                        </div>
                        <p className="text-[10px] font-medium text-emerald-600 italic">
                            &quot;Every bottle in our cellar is 100% verified genuine before dispatch.&quot;
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4 flex-1 w-full max-w-sm">
                    <div className="p-4 rounded-2xl bg-white/50 border border-emerald-100 space-y-1">
                        <p className="text-[8px] font-black text-emerald-400 uppercase tracking-widest">Source Origin</p>
                        <p className="text-[11px] font-black text-emerald-800 uppercase truncate">{origin || 'Authorized Importer'}</p>
                    </div>
                    <div className="p-4 rounded-2xl bg-white/50 border border-emerald-100 space-y-1">
                        <p className="text-[8px] font-black text-emerald-400 uppercase tracking-widest">Batch Registry</p>
                        <p className="text-[11px] font-black text-emerald-800 uppercase truncate">{batchNo || 'OB-GRID-2026'}</p>
                    </div>
                </div>

                <div className="hidden lg:block text-right">
                    <QrCode size={48} className="text-emerald-200" />
                </div>
            </div>

            <div className="relative z-10 flex items-center justify-between pt-4 border-t border-emerald-200/50">
                <div className="flex items-center gap-2">
                    <CheckCircle2 size={12} className="text-emerald-500" />
                    <span className="text-[9px] font-black uppercase tracking-widest text-emerald-600">Anti-Counterfeit Protocol Active</span>
                </div>
                <button className="text-[9px] font-black uppercase tracking-widest text-emerald-700 underline underline-offset-4 hover:text-emerald-900 transition-colors">
                    Request Lab Report &rarr;
                </button>
            </div>

            {/* Background Graphic */}
            <Database className="absolute -bottom-10 -right-10 h-48 w-48 text-emerald-500/5 rotate-12 -z-0" />
        </Card>
    );
}
