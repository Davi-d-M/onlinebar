'use client';

import * as React from 'react';
import {
    Zap,
    Smartphone,
    Share2,
    MessageCircle,
    Camera,
    Music,
    Video,
    Layout,
    Eye
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import Image from 'next/image';

interface Variant {
    platform: string;
    caption: string;
}

interface PreviewStudioProps {
    title: string;
    description: string;
    mediaUrls: string[];
    variants: Variant[];
}

export default function PreviewStudio({ title, description, mediaUrls, variants }: PreviewStudioProps) {
    const [activeTab, setActiveTab] = React.useState(variants[0]?.platform || 'INSTAGRAM');

    const activeVariant = variants.find(v => v.platform === activeTab) || { platform: activeTab, caption: description };

    return (
        <Card className="p-10 rounded-[3.5rem] bg-slate-50 border border-slate-100 shadow-inner space-y-10 text-left overflow-hidden relative">
            <header className="flex justify-between items-center px-4 relative z-10">
                <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-xl bg-white flex items-center justify-center text-primary shadow-sm"><Eye size={20} /></div>
                    <div>
                        <h3 className="text-xl font-black uppercase tracking-tighter text-foreground leading-none">Preview Studio</h3>
                        <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest mt-1">Multi-Channel Visual Audit</p>
                    </div>
                </div>
                <div className="flex bg-white p-1 rounded-xl border border-slate-100 shadow-sm overflow-x-auto no-scrollbar max-w-[300px]">
                    {variants.map(v => (
                        <button
                            key={v.platform}
                            onClick={() => setActiveTab(v.platform)}
                            className={cn(
                                "px-4 py-2 rounded-lg text-[8px] font-black uppercase transition-all whitespace-nowrap",
                                activeTab === v.platform ? "bg-primary text-white" : "text-slate-400 hover:text-foreground"
                            )}
                        >
                            {v.platform.substring(0, 3)}
                        </button>
                    ))}
                </div>
            </header>

            <div className="grid lg:grid-cols-2 gap-10 items-center relative z-10">
                {/* DEVICE FRAME */}
                <div className="relative mx-auto w-[280px] h-[580px] bg-white rounded-[3rem] border-[8px] border-slate-200 shadow-2xl overflow-hidden p-4 group">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-slate-200 rounded-b-2xl z-20"></div>

                    {/* Platform Specific Header */}
                    <div className="mt-8 mb-4 flex items-center justify-between px-2">
                        <div className="flex items-center gap-2">
                             <div className="h-6 w-6 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-[10px] font-black uppercase">O</div>
                             <span className="text-[9px] font-black uppercase tracking-tight">onlinebar</span>
                        </div>
                        <Share2 size={12} className="text-slate-300" />
                    </div>

                    <div className="aspect-[4/5] bg-slate-100 rounded-2xl relative overflow-hidden shadow-inner">
                        {mediaUrls[0] ? (
                            <Image src={mediaUrls[0]} alt="" fill className="object-cover" />
                        ) : (
                            <div className="h-full w-full flex items-center justify-center text-slate-200"><Video size={40} /></div>
                        )}
                        <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center text-white">
                             <div className="flex gap-3">
                                 <HeartIcon size={18} />
                                 <MessageCircle size={18} />
                             </div>
                             <Layout size={18} />
                        </div>
                    </div>

                    <div className="mt-4 px-2 space-y-2">
                        <p className="text-[10px] font-black uppercase text-foreground leading-tight">{title}</p>
                        <p className="text-[9px] font-medium text-slate-500 leading-relaxed italic line-clamp-4">
                            &quot;{activeVariant.caption}&quot;
                        </p>
                    </div>

                    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-32 h-1.5 bg-slate-100 rounded-full" />
                </div>

                {/* ADAPTATION METRICS */}
                <div className="space-y-8">
                    <div className="p-8 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6">
                        <h4 className="text-sm font-black uppercase tracking-widest text-slate-400 flex items-center gap-2"><Smartphone size={16} /> Adaptation Integrity</h4>
                        <div className="space-y-4">
                            {[
                                { label: 'Format Compatibility', val: '100%', color: 'text-emerald-500' },
                                { label: 'Caption Entropy', val: 'Optimal', color: 'text-primary' },
                                { label: 'Compliance Signal', val: 'Secure', color: 'text-indigo-500' },
                            ].map(m => (
                                <div key={m.label} className="flex justify-between items-center py-2 border-b border-slate-50 last:border-0">
                                    <span className="text-[10px] font-black uppercase text-slate-500">{m.label}</span>
                                    <span className={cn("text-[10px] font-black uppercase", m.color)}>{m.val}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="p-8 bg-primary/5 border border-primary/20 rounded-[2.5rem] relative overflow-hidden group">
                        <div className="relative z-10 space-y-2">
                            <p className="text-[9px] font-black uppercase text-primary tracking-[0.2em]">Predicted Discovery</p>
                            <h4 className="text-2xl font-black text-foreground uppercase tracking-tighter leading-none">8.4k reached</h4>
                        </div>
                        <Zap className="absolute -bottom-4 -right-4 h-24 w-24 text-primary/5 rotate-12" />
                    </div>
                </div>
            </div>

            <Zap className="absolute -bottom-10 -right-10 h-64 w-64 text-slate-100 rotate-12 -z-0" />
        </Card>
    );
}

const HeartIcon = ({ size }: { size: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
);
