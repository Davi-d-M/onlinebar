'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Phone, Truck, Loader2, ArrowLeft, ShieldCheck, Key } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Link from 'next/link';

export default function RiderLogin() {
    const router = useRouter();
    const [phone, setPhone] = React.useState('');
    const [otp, setOtp] = React.useState('');
    const [step, setStep] = React.useState<'phone' | 'otp'>('phone');
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);

    const requestOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const res = await fetch('/api/rider/auth/otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phone })
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Uplink Failed.");

            setStep('otp');
            if (data.dev_otp) {
                setOtp(data.dev_otp);
            }
        } catch (err: unknown) {
            setError((err as Error).message);
        } finally {
            setLoading(false);
        }
    };

    const verifyOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const res = await fetch('/api/rider/auth/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phone, otp })
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Authorization Denied.");

            // Save secure session
            localStorage.setItem('ob_rider_session', data.token);
            localStorage.setItem('ob_rider_phone', phone);

            router.push(`/rider/dashboard?phone=${phone}`);
        } catch (err: unknown) {
            setError((err as Error).message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 text-left">
            <div className="max-w-md w-full space-y-10 bg-white p-10 rounded-[3rem] shadow-2xl border border-slate-100 relative overflow-hidden">
                <div className="text-center space-y-4">
                    <div className="mx-auto h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
                        <Truck className="h-8 w-8" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-foreground uppercase tracking-tighter">Runner Terminal</h1>
                        <p className="text-[10px] font-black uppercase text-primary tracking-[0.2em] mt-2">Logistics Authorization</p>
                    </div>
                </div>

                {step === 'phone' ? (
                    <form onSubmit={requestOtp} className="space-y-6 animate-in fade-in slide-in-from-left-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-slate-400 ml-1 tracking-widest">Tactical Phone</label>
                            <div className="relative">
                                <Input
                                    value={phone}
                                    onChange={e => setPhone(e.target.value)}
                                    placeholder="07XXXXXXXX"
                                    className="h-14 rounded-2xl bg-slate-50 border-slate-100 pl-12 text-sm font-bold"
                                    required
                                />
                                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300" />
                            </div>
                        </div>

                        <Button
                            disabled={loading}
                            className="w-full h-20 rounded-[2rem] bg-primary text-white font-black uppercase text-sm tracking-[0.3em] shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all"
                        >
                            {loading ? <Loader2 className="h-5 w-5 animate-spin mr-3" /> : 'Request OTP'}
                        </Button>
                    </form>
                ) : (
                    <form onSubmit={verifyOtp} className="space-y-6 animate-in fade-in slide-in-from-right-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-slate-400 ml-1 tracking-widest">Enter Verification Code</label>
                            <div className="relative">
                                <Input
                                    value={otp}
                                    onChange={e => setOtp(e.target.value)}
                                    placeholder="••••••"
                                    className="h-14 rounded-2xl bg-slate-50 border-slate-100 pl-12 text-center text-xl font-black tracking-[0.5em]"
                                    maxLength={6}
                                    required
                                />
                                <Key className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300" />
                            </div>
                            <p className="text-[8px] font-black text-slate-400 uppercase text-center mt-2">Check your device for the grid access key.</p>
                        </div>

                        <Button
                            disabled={loading}
                            className="w-full h-20 rounded-[2rem] bg-indigo-600 text-white font-black uppercase text-sm tracking-[0.3em] shadow-xl shadow-indigo-100 hover:scale-[1.02] active:scale-95 transition-all"
                        >
                            {loading ? <Loader2 className="h-5 w-5 animate-spin mr-3" /> : 'Verify & Enter'}
                        </Button>

                        <button
                            type="button"
                            onClick={() => setStep('phone')}
                            className="w-full text-center text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-primary transition-colors"
                        >
                            Wrong number? Change phone
                        </button>
                    </form>
                )}

                {error && (
                    <div className="p-4 rounded-2xl bg-rose-50 border border-rose-100 text-center animate-shake">
                        <p className="text-[10px] font-black text-rose-600 uppercase tracking-widest leading-relaxed">Violation: {error}</p>
                    </div>
                )}

                <div className="text-center pt-4 border-t border-slate-50 flex items-center justify-center gap-6">
                    <Link href="/" className="text-[10px] font-black text-slate-300 hover:text-primary uppercase tracking-widest flex items-center gap-2">
                        <ArrowLeft size={12} /> Base
                    </Link>
                    <div className="h-4 w-px bg-slate-100"></div>
                    <div className="flex items-center gap-1.5">
                        <ShieldCheck className="h-3 w-3 text-emerald-500" />
                        <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest">Secure Uplink</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
