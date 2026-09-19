'use client';

import * as React from 'react';
import Image from 'next/image';
import {
    Camera,
    CheckCircle2,
    AlertTriangle,
    XCircle,
    Info,
    Sparkles,
    Wand2
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { auditImageQuality, autoFixImage, type ImageAuditResult, type ImagePurpose } from '@/lib/engines/imageEngine';

interface ImageCoachProps {
    onImageSelected: (file: File) => void;
    onStatusChange?: (isApproved: boolean) => void;
    currentImageUrl?: string;
}

export default function ImageCoach({ onImageSelected, onStatusChange, currentImageUrl }: ImageCoachProps) {
    const [file, setFile] = React.useState<File | null>(null);
    const [preview, setPreview] = React.useState<string | null>(currentImageUrl || null);
    const [audit, setAudit] = React.useState<ImageAuditResult | null>(null);
    const [analyzing, setAnalyzing] = React.useState(false);
    const [purpose, setPurpose] = React.useState<ImagePurpose>('MAIN');

    const runAudit = async (f: File, p: ImagePurpose) => {
        setAnalyzing(true);
        const result = await auditImageQuality(f, p);
        setAudit(result);
        setAnalyzing(false);
        onStatusChange?.(result.isApproved);
        onImageSelected(f);
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (!selectedFile) return;

        setFile(selectedFile);
        setPreview(URL.createObjectURL(selectedFile));
        await runAudit(selectedFile, purpose);
    };

    const handleAutoFix = async () => {
        if (!file) return;
        setAnalyzing(true);
        const fixedBlob = await autoFixImage(file);
        const fixedFile = new File([fixedBlob], `fixed-${file.name}`, { type: 'image/webp' });

        setFile(fixedFile);
        setPreview(URL.createObjectURL(fixedFile));
        await runAudit(fixedFile, purpose);
    };

    const handlePurposeChange = async (newPurpose: ImagePurpose) => {
        setPurpose(newPurpose);
        if (file) await runAudit(file, newPurpose);
    };

    return (
        <div className="space-y-8">
            {/* PURPOSE SELECTOR */}
            <div className="flex gap-2 p-1 bg-slate-50 rounded-2xl border border-slate-100 w-fit">
                {(['MAIN', 'LIFESTYLE', 'DETAIL', 'SOCIAL'] as ImagePurpose[]).map(p => (
                    <button
                        key={p}
                        onClick={() => handlePurposeChange(p)}
                        className={cn(
                            "px-4 py-2 rounded-xl text-[8px] font-black uppercase tracking-widest transition-all",
                            purpose === p ? "bg-white text-foreground shadow-sm" : "text-slate-400 hover:text-slate-600"
                        )}
                    >
                        {p}
                    </button>
                ))}
            </div>

            <div className="grid lg:grid-cols-2 gap-10">

                {/* UPLOADER / PREVIEW */}
                <div className="space-y-6">
                    <label className={cn(
                        "relative flex flex-col items-center justify-center w-full aspect-square rounded-[3.5rem] border-2 border-dashed transition-all cursor-pointer overflow-hidden group",
                        !preview ? "bg-slate-50 border-slate-200 hover:bg-primary/5 hover:border-primary/30" : "bg-white border-transparent shadow-xl"
                    )}>
                        <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />

                        {preview ? (
                            <>
                                <Image src={preview} alt="Forge Preview" fill className="object-contain p-8" unoptimized />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                                    <div className="flex flex-col items-center gap-3 text-white">
                                        <Camera size={32} />
                                        <span className="text-[10px] font-black uppercase tracking-widest">Replace Master Visual</span>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="flex flex-col items-center gap-4 text-slate-300 group-hover:text-primary transition-colors">
                                <Camera size={48} className="group-hover:scale-110 transition-transform duration-500" />
                                <div className="text-center">
                                    <p className="text-[10px] font-black uppercase tracking-[0.3em]">Drop Product Master</p>
                                    <p className="text-[8px] font-bold mt-2 opacity-60 italic">RAW / JPG / WEBP / PNG</p>
                                </div>
                            </div>
                        )}

                        {analyzing && (
                            <div className="absolute inset-0 bg-white/80 backdrop-blur-md flex flex-col items-center justify-center gap-4 z-20">
                                <div className="h-2 w-48 bg-slate-100 rounded-full overflow-hidden">
                                    <div className="h-full bg-primary animate-progress-fast shadow-[0_0_10px_#F5A000]" />
                                </div>
                                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-primary animate-pulse">Neural Inspection Active...</span>
                            </div>
                        )}
                    </label>

                    <div className="flex gap-4">
                        <Button
                            type="button"
                            onClick={handleAutoFix}
                            disabled={!file || analyzing}
                            className="flex-1 h-14 rounded-2xl bg-indigo-600 text-white font-black uppercase text-[10px] tracking-widest shadow-lg shadow-indigo-100 hover:bg-indigo-700 active:scale-95 transition-all"
                        >
                            <Wand2 size={16} className="mr-2" /> Auto-Fix Node
                        </Button>
                    </div>
                </div>

                {/* COACHING TERMINAL */}
                <div className="space-y-8">
                    <Card className="p-8 rounded-[3rem] bg-white border border-slate-100 shadow-sm relative overflow-hidden">
                        <div className="flex items-center justify-between mb-8">
                            <div className="space-y-1 text-left">
                                <h3 className="text-xl font-black text-foreground uppercase tracking-tighter">Visual Intelligence</h3>
                                <div className="flex items-center gap-2">
                                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">GATE STATUS:</span>
                                    {audit ? (
                                        <span className={cn(
                                            "px-2 py-0.5 rounded text-[7px] font-black uppercase tracking-tighter",
                                            audit.isApproved ? "bg-emerald-50 text-emerald-600 border border-emerald-100" : "bg-rose-50 text-rose-600 border border-rose-100"
                                        )}>
                                            {audit.isApproved ? 'PASS' : 'REJECTED'}
                                        </span>
                                    ) : <span className="text-[7px] font-black text-slate-300 uppercase tracking-tighter">AWAITING SIGNAL</span>}
                                </div>
                            </div>
                            {audit && (
                                <div className={cn(
                                    "h-20 w-20 rounded-full border-4 flex items-center justify-center flex-col shadow-inner",
                                    audit.score >= 90 ? "border-emerald-500 text-emerald-500 bg-emerald-50" :
                                    audit.score >= 70 ? "border-primary text-primary bg-primary/5" :
                                    "border-rose-500 text-rose-500 bg-rose-50"
                                )}>
                                    <span className="text-2xl font-black leading-none">{audit.score}</span>
                                    <span className="text-[8px] font-black uppercase tracking-tighter">/ 100</span>
                                </div>
                            )}
                        </div>

                        {audit ? (
                            <div className="space-y-8">
                                <div className="grid grid-cols-2 gap-4">
                                    {[
                                        { label: 'Resolution', val: audit.breakdown.resolution, max: 20 },
                                        { label: 'Sharpness', val: audit.breakdown.sharpness, max: 20 },
                                        { label: 'Lighting', val: audit.breakdown.lighting, max: 15 },
                                        { label: 'Composition', val: audit.breakdown.composition, max: 15 },
                                    ].map(metric => (
                                        <div key={metric.label} className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-left">
                                            <div className="flex justify-between items-center mb-2">
                                                <span className="text-[8px] font-black uppercase text-slate-400">{metric.label}</span>
                                                <span className="text-[8px] font-black text-foreground">{metric.val}/{metric.max}</span>
                                            </div>
                                            <div className="h-1 w-full bg-slate-200 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-primary transition-all duration-1000"
                                                    style={{ width: `${(metric.val/metric.max)*100}%` }}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="space-y-4 text-left">
                                    <h4 className="text-[10px] font-black uppercase text-primary tracking-[0.2em] flex items-center gap-2">
                                        <Info size={12} /> Improvement Protocol
                                    </h4>
                                    <div className="space-y-3">
                                        {audit.coachingAdvice.length > 0 ? audit.coachingAdvice.map((advice, i) => (
                                            <div key={i} className="flex gap-4 p-4 rounded-2xl bg-amber-50 border border-amber-100 text-amber-700">
                                                <AlertTriangle size={16} className="shrink-0" />
                                                <p className="text-[10px] font-bold uppercase leading-relaxed tracking-tight">{advice}</p>
                                            </div>
                                        )) : (
                                            <div className="flex gap-4 p-4 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-700">
                                                <CheckCircle2 size={16} className="shrink-0" />
                                                <p className="text-[10px] font-bold uppercase leading-relaxed tracking-tight">Catalogue Integrity Optimal. Visual Node Ready.</p>
                                            </div>
                                        )}
                                        {audit.issues.length > 0 && (
                                            <div className="flex gap-4 p-4 rounded-2xl bg-rose-50 border border-rose-100 text-rose-700">
                                                <XCircle size={16} className="shrink-0" />
                                                <p className="text-[10px] font-bold uppercase leading-relaxed tracking-tight">{audit.issues[0]}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="py-20 flex flex-col items-center justify-center text-center gap-4 opacity-20">
                                <Sparkles size={40} />
                                <p className="text-[9px] font-black uppercase tracking-widest max-w-[200px]">Awaiting master visual for neural audit.</p>
                            </div>
                        )}
                    </Card>
                </div>

            </div>
        </div>
    );
}
