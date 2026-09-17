'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { OB_OS } from '@/lib/onlineBarOS';
import {
    Mail,
    Lock,
    Loader2,
    Key,
    Smartphone,
    Globe,
    ShieldCheck,
    MapPin
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

type AuthMethod = 'email' | 'phone';

interface AuthFormProps {
    initialMode?: 'signin' | 'signup';
    onSuccess?: (userId: string) => void;
}

interface AuthError {
  message: string;
  details?: string;
  code?: string;
  hint?: string;
}

export default function AuthForm({ initialMode = 'signin', onSuccess }: AuthFormProps) {
  const [method, setAuthMethod] = useState<AuthMethod>('email');
  const [isSignUp, setIsSignUp] = useState(initialMode === 'signup');

  // Form State
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [address, setAddress] = useState(''); // NEW
  const [otp, setOtp] = useState('');
  const [showOtpField, setShowOtpField] = useState(false);

  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'idle', text: string }>({ type: 'idle', text: '' });
  const [debugInfo, setDebugInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  useEffect(() => {
    if (message.text) {
      const timer = setTimeout(() => {
        setMessage({ type: 'idle', text: '' });
        setDebugInfo(null);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [message.text]);

  useEffect(() => {
    setIsSignUp(initialMode === 'signup');
  }, [initialMode]);

  const handleIdentityStitching = async (userId: string) => {
      const anonId = localStorage.getItem('ob_anonymous_id');
      if (anonId) {
          await OB_OS.stitchIdentity(anonId, userId);
      }
      await OB_OS.refreshSession(userId);
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: 'idle', text: '' });

    try {
      if (!supabase) throw new Error('Supabase not configured.');

      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
              data: {
                  full_name: fullName.trim() || null,
                  phone_number: phoneNumber.trim() || null,
                  address: address.trim() || null
              }
          }
        });
        if (error) {
            console.error("[OB_OS] Signup Failure Node:", error);
            throw error;
        }

        if (data.user) {
            await handleIdentityStitching(data.user.id);
            await OB_OS.track('USER_REGISTERED', { userId: data.user.id, anonymousId: localStorage.getItem('ob_anonymous_id') || undefined });
            setMessage({ type: 'success', text: 'Registration Successful! Establishing profile... 🛰️' });
            if (onSuccess) {
                setTimeout(() => onSuccess(data.user!.id), 2000);
            }
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
            console.error("[OB_OS] Signup Failure Node:", error);
            throw error;
        }

        if (data.user) {
            await handleIdentityStitching(data.user.id);
            await OB_OS.track('USER_LOGIN', { userId: data.user.id });
            setMessage({ type: 'success', text: 'Access Granted. Entering Vault... 🛡️' });
            if (onSuccess) {
                setTimeout(() => onSuccess(data.user!.id), 1500);
            }
        }
      }
    } catch (error: unknown) {
      const err = error as AuthError;
      console.error("[OB_OS] Auth Failure:", err);

      let errorText = (err && typeof err === 'object' && 'message' in err) ? err.message : "Uplink Failure";

      if (errorText === 'Failed to fetch') {
          errorText = "Network Error: Cannot reach Supabase. Ensure your local Supabase is running or check your internet. 🛰️";
      }

      if (err && typeof err === 'object' && 'code' in err && (err.code === 'over_email_send_rate_limit' || err.code === 'over_sms_send_rate_limit')) {
          errorText = "Too many attempts! Check your Supabase Dashboard Rate Limits or wait a minute. 🛡️";
          setCooldown(60);
      }

      setMessage({ type: 'error', text: errorText });
      if (err.details || err.code || err.hint) {
          setDebugInfo(JSON.stringify({ code: err.code, details: err.details, hint: err.hint }));
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePhoneOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: 'idle', text: '' });

    try {
        if (!supabase) throw new Error('Supabase not configured.');

        if (!showOtpField) {
            // Step 1: Send OTP
            const { error } = await supabase.auth.signInWithOtp({
                phone: phoneNumber.startsWith('+') ? phoneNumber : `+254${phoneNumber.replace(/^0/, '')}`,
            });
            if (error) {
                console.error("[OB_OS] Signup Failure Node:", error);
                throw error;
            }

            setShowOtpField(true);
            setMessage({ type: 'success', text: 'Verification code sent via SMS. 📱' });
        } else {
            // Step 2: Verify OTP
            const { data, error } = await supabase.auth.verifyOtp({
                phone: phoneNumber.startsWith('+') ? phoneNumber : `+254${phoneNumber.replace(/^0/, '')}`,
                token: otp,
                type: 'sms'
            });
            if (error) {
                console.error("[OB_OS] Signup Failure Node:", error);
                throw error;
            }

            if (data.user) {
                await handleIdentityStitching(data.user.id);
                await OB_OS.track('USER_LOGIN', { userId: data.user.id });
                setMessage({ type: 'success', text: isSignUp ? 'Identity Established! Synchronizing... 🛡️' : 'Access Granted. Entering Vault... 🛡️' });
                if (onSuccess) {
                    setTimeout(() => onSuccess(data.user!.id), 1500);
                }
            }
        }
    } catch (error: unknown) {
        const err = error as AuthError;
        let errorText = (err && typeof err === 'object' && 'message' in err) ? err.message : "Uplink Failure";

        if (errorText === 'Failed to fetch') {
            errorText = "Network Error: Cannot reach Supabase. Ensure your local Supabase is running. 🛰️";
        }

        if (err && typeof err === 'object' && 'code' in err && (err.code === 'over_email_send_rate_limit' || err.code === 'over_sms_send_rate_limit')) {
            errorText = "Too many attempts! Check your Supabase Dashboard Rate Limits or wait a minute. 🛡️";
            setCooldown(60);
        }

        setMessage({ type: 'error', text: errorText });
        if (err.details || err.code || err.hint) {
            setDebugInfo(JSON.stringify({ code: err.code, details: err.details, hint: err.hint }));
        }
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-6 sm:p-10 bg-white rounded-[2rem] sm:rounded-[3rem] border border-slate-100 shadow-2xl space-y-8 sm:space-y-10 animate-in zoom-in-95 duration-500">
      <div className="text-center space-y-3">
          <div className="mx-auto h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-sm border border-primary/10">
              <ShieldCheck size={32} />
          </div>
          <h2 className="text-3xl font-black text-foreground uppercase tracking-tighter leading-none">
            {isSignUp ? 'Join the Grid' : 'Vault Access'}
          </h2>
          <p className="text-[10px] font-black uppercase text-slate-400 tracking-[0.3em]">Online Bar Nairobi</p>
      </div>

      <div className="flex p-1 bg-slate-50 rounded-2xl border border-slate-100">
          <button
            onClick={() => { setAuthMethod('email'); setShowOtpField(false); }}
            className={cn(
                "flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all",
                method === 'email' ? "bg-white text-foreground shadow-sm" : "text-slate-400 hover:text-slate-600"
            )}
          >
              Email Key
          </button>
          <button
            onClick={() => { setAuthMethod('phone'); setShowOtpField(false); }}
            className={cn(
                "flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all",
                method === 'phone' ? "bg-white text-foreground shadow-sm" : "text-slate-400 hover:text-slate-600"
            )}
          >
              Mobile OTP
          </button>
      </div>

      {method === 'email' ? (
          <form onSubmit={handleEmailAuth} className="space-y-6 sm:space-y-8">
            {isSignUp && (
              <div className="space-y-6 animate-in slide-in-from-top-2 duration-500">
                <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase text-slate-400 ml-1 tracking-[0.15em]">Full Identity</label>
                    <div className="relative">
                        <Input value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Full Name" className="h-14 rounded-2xl bg-slate-50 border-slate-100 pl-12 font-bold input-premium" />
                        <Globe className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300" />
                    </div>
                </div>
                <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase text-slate-400 ml-1 tracking-[0.15em]">Mobile Uplink</label>
                    <div className="relative">
                        <Input value={phoneNumber} onChange={e => setPhoneNumber(e.target.value)} placeholder="07XXXXXXXX" className="h-14 rounded-2xl bg-slate-50 border-slate-100 pl-12 font-bold input-premium" />
                        <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300" />
                    </div>
                </div>
                <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase text-slate-400 ml-1 tracking-[0.15em]">Delivery Address</label>
                    <div className="relative">
                        <Input required value={address} onChange={e => setAddress(e.target.value)} placeholder="e.g. Kilimani, Galana Rd" className="h-14 rounded-2xl bg-slate-50 border-slate-100 pl-12 font-bold input-premium" />
                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300" />
                    </div>
                </div>
              </div>
            )}
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase text-slate-400 ml-1 tracking-[0.15em]">Secure Email</label>
              <div className="relative">
                  <Input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="patron@onlinebar.co.ke" className="h-14 rounded-2xl bg-slate-50 border-slate-100 pl-12 font-bold input-premium" />
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300" />
              </div>
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase text-slate-400 ml-1 tracking-[0.15em]">Secret Key</label>
              <div className="relative">
                  <Input type="password" required value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" className="h-14 rounded-2xl bg-slate-50 border-slate-100 pl-12 font-bold input-premium" />
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300" />
              </div>
            </div>
            <Button type="submit" disabled={loading || cooldown > 0} className="w-full h-16 rounded-2xl bg-primary text-white font-black uppercase text-xs tracking-widest shadow-xl shadow-primary/20 btn-premium mt-4">
                {loading ? <Loader2 className="animate-spin" /> : cooldown > 0 ? `Ready in ${cooldown}s` : (isSignUp ? 'Initialize Profile' : 'Enter Vault')}
            </Button>
          </form>
      ) : (
          <form onSubmit={handlePhoneOTP} className="space-y-6 sm:space-y-8">
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-1 tracking-[0.15em]">Mobile Uplink</label>
                <div className="relative">
                    <Input required value={phoneNumber} onChange={e => setPhoneNumber(e.target.value)} placeholder="07XXXXXXXX" className="h-14 rounded-2xl bg-slate-50 border-slate-100 pl-12 font-black text-lg input-premium" disabled={showOtpField} />
                    <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300" />
                </div>
              </div>
              {showOtpField && (
                <div className="space-y-3 animate-in slide-in-from-top-2 duration-500">
                    <label className="text-[10px] font-black uppercase text-primary ml-1 animate-pulse tracking-[0.15em]">Enter 6-Digit Code</label>
                    <div className="relative">
                        <Input required value={otp} onChange={e => setOtp(e.target.value)} placeholder="XXXXXX" maxLength={6} className="h-16 rounded-2xl bg-primary/5 border-primary/20 text-center font-black text-2xl tracking-[0.5em] text-primary input-premium" />
                        <Key className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-primary/30" />
                    </div>
                </div>
              )}
              <Button type="submit" disabled={loading || cooldown > 0} className="w-full h-16 rounded-2xl bg-primary text-white font-black uppercase text-xs tracking-widest shadow-xl shadow-primary/20 btn-premium mt-4">
                  {loading ? <Loader2 className="animate-spin" /> : cooldown > 0 ? `Ready in ${cooldown}s` : (showOtpField ? 'Verify & Enter' : 'Send Access Code')}
              </Button>
              {showOtpField && <button type="button" onClick={() => setShowOtpField(false)} className="w-full text-[9px] font-black uppercase text-slate-400 hover:text-primary transition-colors tracking-widest">Change Phone Number</button>}
          </form>
      )}

      {message.text && (
          <div className="space-y-4 animate-in fade-in zoom-in-95">
              <div className={cn(
                  "p-4 rounded-2xl border text-center",
                  message.type === 'success' ? "bg-emerald-50 border-emerald-100 text-emerald-600" : "bg-rose-50 border-rose-100 text-rose-600"
              )}>
                  <p className="text-[10px] font-black uppercase tracking-widest">{message.text}</p>
              </div>

              {debugInfo && (
                  <div className="p-4 bg-slate-900 rounded-2xl text-left overflow-hidden">
                      <p className="text-[8px] font-black uppercase text-rose-400 mb-2 tracking-widest">Technical Intel</p>
                      <code className="text-[9px] text-slate-300 font-mono break-all">{debugInfo}</code>
                  </div>
              )}
          </div>
      )}

      <div className="pt-6 border-t border-slate-100 space-y-4">
          <div className="relative flex justify-center text-[8px] uppercase font-black tracking-[0.3em] text-slate-300">
              <span className="bg-white px-4">Social Uplink</span>
          </div>

          <button
            type="button"
            onClick={async () => {
                if (!supabase) return;
                setLoading(true);
                const { error } = await supabase.auth.signInWithOAuth({
                  provider: 'google',
                  options: { redirectTo: window.location.origin }
                });
                if (error) setMessage({ type: 'error', text: error.message });
                setLoading(false);
            }}
            className="w-full h-14 bg-white border border-slate-100 rounded-2xl flex items-center justify-center gap-3 hover:bg-slate-50 transition-all group"
          >
            <svg className="h-4 w-4 group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            <span className="text-[10px] font-black uppercase tracking-widest text-foreground">Authenticate with Google</span>
          </button>

          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="w-full text-center text-[10px] font-black uppercase text-slate-400 hover:text-primary transition-colors tracking-widest"
          >
            {isSignUp ? 'Member already? Log In' : 'New Patron? Initialize Identity'}
          </button>
      </div>
    </div>
  );
}
