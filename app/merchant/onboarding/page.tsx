'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import {
    Store,
    ShieldCheck,
    FileText,
    Building2,
    CheckCircle2,
    Loader2,
    Zap,
    MapPin,
    Mail,
    Phone,
    Upload,
    ArrowRight,
    Lock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import Link from 'next/link';

type Step = 'welcome' | 'business' | 'documents' | 'settlement' | 'pending' | 'success';

export default function MerchantOnboarding() {
    const [step, setStep] = useState<Step>('welcome');
    const [loading, setLoading] = useState(false);

    // Form State
    const [businessName, setBusinessName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [address, setAddress] = useState('');

    const [permitFile, setPermitFile] = useState<File | null>(null);
    const [kraFile, setKraFile] = useState<File | null>(null);
    const [licenseFile, setLicenseFile] = useState<File | null>(null);

    const [bankName, setBankName] = useState('');
    const [accountNumber, setAccountNumber] = useState('');
    const [error, setError] = useState<string | null>(null);

    const handleFileUpload = async (file: File, folder: string) => {
        if (!supabase) return null;
        const BUCKET = 'merchant-documents';
        const path = `${folder}/${Date.now()}-${file.name.replace(/\s+/g, '_')}`;
        const { error: uploadError } = await supabase.storage.from(BUCKET).upload(path, file);
        if (uploadError) throw uploadError;
        const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
        return data.publicUrl;
    };

    const handleSubmit = async () => {
        if (!permitFile || !kraFile || !licenseFile) {
            setError("All business documents are required for verification.");
            return;
        }

        // Basic Format Validation
        const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
        if (!allowedTypes.includes(permitFile.type) || !allowedTypes.includes(kraFile.type) || !allowedTypes.includes(licenseFile.type)) {
            setError("Unsupported file format. Please upload PDF or Images (JPG/PNG).");
            return;
        }

        setLoading(true);
        setError(null);

        try {
            if (!supabase) return;

            // 1. Upload Docs
            const [permitUrl, kraUrl, licenseUrl] = await Promise.all([
                handleFileUpload(permitFile, 'permits'),
                handleFileUpload(kraFile, 'kra_pins'),
                handleFileUpload(licenseFile, 'licenses')
            ]);

            // 2. Create Supplier Record
            const { error: dbError } = await supabase
                .from('suppliers')
                .insert([{
                    name: businessName,
                    email,
                    phone,
                    bank_details: { bank_name: bankName, account_number: accountNumber },
                    business_permit_url: permitUrl,
                    kra_pin_url: kraUrl,
                    premises_license_url: licenseUrl,
                    verification_status: 'Pending',
                    is_active: false
                }]);

            if (dbError) throw dbError;
            setStep('pending');
        } catch (err: unknown) {
            setError((err as Error).message || "Failed to submit application.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 selection:bg-primary/20">
            <div className="max-w-md w-full space-y-12 animate-in fade-in duration-700">

                {/* BRANDING */}
                <div className="text-center space-y-4">
                    <div className="h-20 w-20 rounded-[2.5rem] bg-primary/10 flex items-center justify-center text-primary mx-auto shadow-sm">
                        <Store className="h-10 w-10" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black uppercase tracking-tighter text-foreground leading-none">Online Bar <span className="text-primary italic">Partner</span></h1>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mt-2">Scale • Supply • Settle</p>
                    </div>
                </div>

                {/* PROGRESSIVE CARD */}
                <Card className="p-10 rounded-[3.5rem] bg-white border-2 border-slate-50 shadow-2xl relative overflow-hidden text-left">
                    <div className="relative z-10 space-y-10">

                        {step === 'welcome' && (
                            <div className="space-y-8 text-center animate-in slide-in-from-bottom-4 duration-500">
                                <div className="space-y-2">
                                    <h2 className="text-2xl font-black text-foreground uppercase leading-tight">Apply for the <br/> Partner Grid</h2>
                                    <p className="text-sm text-slate-500 font-medium italic">&quot;Connect your cellar to Nairobi&apos;s elite patron network.&quot;</p>
                                </div>
                                <div className="p-6 bg-slate-50 rounded-3xl space-y-4 text-left">
                                    <div className="flex items-center gap-3">
                                        <div className="h-8 w-8 rounded-xl bg-emerald-50 text-emerald-500 flex items-center justify-center shadow-sm"><Zap size={16} /></div>
                                        <p className="text-[10px] font-black uppercase text-foreground">Rapid Onboarding</p>
                                    </div>
                                    <p className="text-[11px] text-slate-600 leading-relaxed font-medium">Verify your business, sync your catalog, and start fulfilling missions in under 24 hours.</p>
                                </div>
                                <Button onClick={() => setStep('business')} className="w-full h-18 rounded-[1.8rem] bg-primary text-white font-black uppercase text-xs tracking-widest shadow-xl shadow-primary/20 transition-all hover:scale-105 active:scale-95">
                                    Initialize Application <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                            </div>
                        )}

                        {step === 'business' && (
                            <div className="space-y-8 animate-in slide-in-from-right-4 duration-500 text-left">
                                <div className="space-y-2">
                                    <h3 className="text-xl font-black text-foreground uppercase tracking-tight">Business Profile</h3>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Enterprise Identity</p>
                                </div>
                                <div className="space-y-4">
                                    <div className="relative">
                                        <Input value={businessName} onChange={e => setBusinessName(e.target.value)} placeholder="Establishment Name" className="h-14 rounded-2xl bg-slate-50 border-slate-100 pl-12 font-bold" />
                                        <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300" />
                                    </div>
                                    <div className="relative">
                                        <Input value={email} onChange={e => setEmail(e.target.value)} placeholder="Business Email" className="h-14 rounded-2xl bg-slate-50 border-slate-100 pl-12 font-bold" />
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300" />
                                    </div>
                                    <div className="relative">
                                        <Input value={phone} onChange={e => setPhone(e.target.value)} placeholder="Official Phone No." className="h-14 rounded-2xl bg-slate-50 border-slate-100 pl-12 font-bold" />
                                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300" />
                                    </div>
                                    <div className="relative">
                                        <Input value={address} onChange={e => setAddress(e.target.value)} placeholder="Physical Address" className="h-14 rounded-2xl bg-slate-50 border-slate-100 pl-12 font-bold" />
                                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300" />
                                    </div>
                                </div>
                                <Button onClick={() => setStep('documents')} className="w-full h-16 rounded-2xl bg-primary text-white font-black uppercase text-xs tracking-widest active:scale-95 transition-all">
                                    Next: Documentation
                                </Button>
                            </div>
                        )}

                        {step === 'documents' && (
                            <div className="space-y-8 animate-in slide-in-from-right-4 duration-500 text-left">
                                <div className="space-y-2">
                                    <h3 className="text-xl font-black text-foreground uppercase tracking-tight">Legal Verification</h3>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Required PDF/Images</p>
                                </div>
                                <div className="space-y-4">
                                    {[
                                        { label: 'Business Permit', file: permitFile, set: setPermitFile, icon: ShieldCheck },
                                        { label: 'KRA PIN Certificate', file: kraFile, set: setKraFile, icon: FileText },
                                        { label: 'Premises License', file: licenseFile, set: setLicenseFile, icon: Building2 },
                                    ].map((doc, i) => (
                                        <label key={i} className="flex items-center justify-between p-5 rounded-2xl border border-slate-100 bg-slate-50 cursor-pointer hover:border-primary transition-all group">
                                            <div className="flex items-center gap-4">
                                                <doc.icon size={20} className={cn(doc.file ? "text-primary" : "text-slate-300 group-hover:text-primary transition-colors")} />
                                                <span className="text-[10px] font-black uppercase text-foreground">{doc.label}</span>
                                            </div>
                                            <div className={cn(
                                                "h-6 w-6 rounded-full flex items-center justify-center border",
                                                doc.file ? "bg-emerald-500 text-white border-emerald-500" : "border-slate-200"
                                            )}>
                                                {doc.file ? <CheckCircle2 size={12} /> : <Upload size={12} className="text-slate-300" />}
                                            </div>
                                            <input type="file" onChange={e => doc.set(e.target.files?.[0] || null)} className="hidden" accept=".pdf,image/*" />
                                        </label>
                                    ))}
                                </div>
                                <Button onClick={() => setStep('settlement')} className="w-full h-16 rounded-2xl bg-primary text-white font-black uppercase text-xs tracking-widest active:scale-95 transition-all">
                                    Next: Settlement
                                </Button>
                            </div>
                        )}

                        {step === 'settlement' && (
                            <div className="space-y-8 animate-in slide-in-from-right-4 duration-500 text-left">
                                <div className="space-y-2">
                                    <h3 className="text-xl font-black text-foreground uppercase tracking-tight">Financial Protocol</h3>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Payout Details</p>
                                </div>
                                <div className="space-y-4">
                                    <div className="relative">
                                        <Input value={bankName} onChange={e => setBankName(e.target.value)} placeholder="Bank Name" className="h-14 rounded-2xl bg-slate-50 border-slate-100 pl-12 font-bold" />
                                        <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300" />
                                    </div>
                                    <div className="relative">
                                        <Input value={accountNumber} onChange={e => setAccountNumber(e.target.value)} placeholder="Account Number" className="h-14 rounded-2xl bg-slate-50 border-slate-100 pl-12 font-bold" />
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300" />
                                    </div>
                                </div>
                                {error && <p className="text-[10px] font-black text-rose-500 uppercase animate-pulse text-center">{error}</p>}
                                <Button onClick={handleSubmit} disabled={loading} className="w-full h-16 rounded-2xl bg-primary text-white font-black uppercase text-xs tracking-widest active:scale-95 transition-all shadow-xl shadow-primary/20">
                                    {loading ? <Loader2 className="animate-spin" /> : "Complete Application"}
                                </Button>
                            </div>
                        )}

                        {step === 'pending' && (
                            <div className="space-y-8 text-center animate-in zoom-in-95 duration-700">
                                <div className="h-24 w-24 rounded-full bg-amber-50 flex items-center justify-center text-amber-500 mx-auto shadow-inner animate-pulse">
                                    <ShieldCheck className="h-12 w-12" />
                                </div>
                                <div className="space-y-2">
                                    <h2 className="text-2xl font-black text-foreground uppercase">Review Active</h2>
                                    <p className="text-sm text-slate-500 font-medium italic leading-relaxed">
                                        &quot;Your partner application has been logged on the grid. Our verification unit will contact you within 24 hours.&quot;
                                    </p>
                                </div>
                                <Link href="/" className="block">
                                    <Button variant="ghost" className="text-slate-400 font-black uppercase text-[10px]">Return to Lobby</Button>
                                </Link>
                            </div>
                        )}

                    </div>
                </Card>

                <div className="text-center flex items-center justify-center gap-2 opacity-30">
                    <ShieldCheck className="h-4 w-4" />
                    <p className="text-[8px] font-black uppercase tracking-widest text-slate-400">Secured by Online Bar Network v1.0</p>
                </div>

            </div>
        </div>
    );
}
