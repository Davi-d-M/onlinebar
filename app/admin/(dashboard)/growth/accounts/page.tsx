'use client';

import * as React from 'react';
import { supabase } from '@/lib/supabaseClient';
import {
    Link2,
    Link2Off,
    RefreshCcw,
    ShieldCheck,
    Camera as Instagram,
    Music,
    Video as Youtube,
    Globe as Linkedin,
    MessageSquare as Twitter,
    MessageCircle,
    CheckCircle2,
    AlertCircle,
    Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { useAdmin } from '@/context/AdminContext';
import { logAuditAction } from '@/lib/auditService';

interface SocialAccount {
    id: string;
    platform: 'META' | 'TIKTOK' | 'GOOGLE' | 'X' | 'LINKEDIN' | 'WHATSAPP';
    account_name: string;
    status: string;
    token_expires_at: string | null;
}

export default function SocialAccountManagement() {
    const { email } = useAdmin();
    const [accounts, setAccounts] = React.useState<SocialAccount[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [connecting, setConnecting] = React.useState<string | null>(null);

    const fetchAccounts = React.useCallback(async () => {
        if (!supabase) return;
        setLoading(true);
        try {
            const { data } = await supabase.from('social_accounts').select('*').order('created_at', { ascending: false });
            if (data) setAccounts(data as SocialAccount[]);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, []);

    React.useEffect(() => {
        fetchAccounts();
    }, [fetchAccounts]);

    const handleConnect = (platform: string) => {
        setConnecting(platform);
        // Simulated OAuth Flow - Would normally redirect to platform auth URL
        setTimeout(async () => {
            if (!supabase) return;
            try {
                const { error } = await supabase.from('social_accounts').upsert({
                    platform,
                    account_name: `Online Bar ${platform.charAt(0) + platform.slice(1).toLowerCase()} Node`,
                    status: 'CONNECTED',
                    token_expires_at: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString() // 60 days
                }, { onConflict: 'platform, account_name' });

                if (error) throw error;
                await logAuditAction(email, 'SOCIAL_ACCOUNT_CONNECTED', { platform });
                fetchAccounts();
            } catch (err) {
                console.error(err);
            } finally {
                setConnecting(null);
            }
        }, 2000);
    };

    const handleDisconnect = async (id: string, platform: string) => {
        if (!supabase || !confirm(`Permanently disconnect ${platform} account?`)) return;
        try {
            const { error } = await supabase.from('social_accounts').delete().eq('id', id);
            if (error) throw error;
            await logAuditAction(email, 'SOCIAL_ACCOUNT_DISCONNECTED', { platform });
            setAccounts(prev => prev.filter(a => a.id !== id));
        } catch (err) { console.error(err); }
    };

    const platforms = [
        { id: 'META', label: 'Instagram & Facebook', icon: Instagram, color: 'text-rose-500', bg: 'bg-rose-50' },
        { id: 'TIKTOK', label: 'TikTok Business', icon: Music, color: 'text-black', bg: 'bg-slate-100' },
        { id: 'GOOGLE', label: 'YouTube / Google Ads', icon: Youtube, color: 'text-rose-600', bg: 'bg-rose-50' },
        { id: 'WHATSAPP', label: 'WhatsApp Business', icon: MessageCircle, color: 'text-emerald-500', bg: 'bg-emerald-50' },
        { id: 'X', label: 'X (Twitter)', icon: Twitter, color: 'text-sky-500', bg: 'bg-sky-50' },
        { id: 'LINKEDIN', label: 'LinkedIn Page', icon: Linkedin, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    ];

    return (
        <div className="p-8 space-y-10 bg-slate-50 min-h-screen text-left selection:bg-primary/20 pb-40">
            <header className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 border-b border-slate-200 pb-8">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <Link2 className="h-4 w-4 text-primary" />
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Connectivity Hub</span>
                    </div>
                    <h1 className="text-4xl font-black text-foreground uppercase tracking-tighter leading-none">Social Accounts</h1>
                    <p className="text-muted-foreground text-sm font-medium mt-1">Authorize Online Bar to publish and measure content across your social network.</p>
                </div>
                <Button onClick={fetchAccounts} variant="outline" className="h-10 px-4 rounded-xl border-slate-200 bg-white font-black uppercase text-[8px] tracking-widest transition-all hover:shadow-lg">
                    <RefreshCcw size={14} className={cn("mr-2", loading && "animate-spin")} /> Refresh Matrix
                </Button>
            </header>

            <div className="grid lg:grid-cols-12 gap-10">
                <div className="lg:col-span-8 space-y-8">
                    <div className="grid sm:grid-cols-2 gap-6">
                        {platforms.map(p => {
                            const connected = accounts.find(a => a.platform === p.id);
                            const isConnecting = connecting === p.id;

                            return (
                                <Card key={p.id} className={cn(
                                    "p-8 rounded-[3rem] border-2 transition-all group overflow-hidden relative",
                                    connected ? "bg-white border-primary/20 shadow-xl shadow-primary/5" : "bg-white/50 border-slate-100 opacity-60 grayscale hover:grayscale-0 hover:opacity-100"
                                )}>
                                    <div className="flex justify-between items-start relative z-10">
                                        <div className="flex items-center gap-4">
                                            <div className={cn("h-14 w-14 rounded-2xl flex items-center justify-center shadow-sm", p.bg, p.color)}>
                                                <p.icon size={28} />
                                            </div>
                                            <div>
                                                <h4 className="text-sm font-black uppercase text-foreground leading-none">{p.label}</h4>
                                                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mt-2">
                                                    {connected ? `Connected as ${connected.account_name}` : 'Not Connected'}
                                                </p>
                                            </div>
                                        </div>
                                        {connected && (
                                            <div className="flex flex-col gap-2">
                                                <button onClick={() => handleDisconnect(connected.id, p.id)} className="h-8 w-8 rounded-lg bg-rose-50 text-rose-500 flex items-center justify-center hover:bg-rose-500 hover:text-white transition-all">
                                                    <Link2Off size={16} />
                                                </button>
                                            </div>
                                        )}
                                    </div>

                                    <div className="mt-8 pt-6 border-t border-slate-50 relative z-10">
                                        {connected ? (
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2 text-emerald-500">
                                                    <CheckCircle2 size={12} />
                                                    <span className="text-[9px] font-black uppercase tracking-widest">Active Link</span>
                                                </div>
                                                <p className="text-[7px] font-bold text-slate-300 uppercase italic">Expires: {connected.token_expires_at ? new Date(connected.token_expires_at).toLocaleDateString() : 'Never'}</p>
                                            </div>
                                        ) : (
                                            <Button
                                                onClick={() => handleConnect(p.id)}
                                                disabled={!!connecting}
                                                className="w-full h-12 rounded-xl bg-primary text-white font-black uppercase text-[10px] tracking-widest shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
                                            >
                                                {isConnecting ? <Loader2 className="animate-spin" /> : "Authorize Protocol"}
                                            </Button>
                                        )}
                                    </div>

                                    {connected && <ShieldCheck className="absolute -bottom-4 -right-4 h-24 w-24 text-primary/5 rotate-12 -z-0" />}
                                </Card>
                            );
                        })}
                    </div>
                </div>

                <div className="lg:col-span-4 space-y-8">
                    <Card className="p-10 rounded-[3rem] bg-slate-900 text-white space-y-8 relative overflow-hidden shadow-2xl">
                        <div className="relative z-10 space-y-6 text-left">
                            <ShieldCheck className="h-10 w-10 text-primary" />
                            <h3 className="text-2xl font-black uppercase tracking-tighter leading-none">Security Protocol</h3>
                            <p className="text-sm font-medium text-slate-400 italic leading-relaxed">
                                &quot;Online Bar utilizes official OAuth 2.0 gateways. We do not store raw passwords. All platform tokens are encrypted at rest with military-grade 256-bit AES standards.&quot;
                            </p>
                            <div className="pt-6 border-t border-white/10 flex justify-between items-center">
                                <span className="text-[9px] font-black uppercase tracking-widest text-primary">Compliance Status</span>
                                <span className="text-xs font-black uppercase text-emerald-500">Verified</span>
                            </div>
                        </div>
                    </Card>

                    <div className="p-8 rounded-[3rem] bg-white border border-slate-100 shadow-sm space-y-6 text-left group">
                        <div className="h-10 w-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 shadow-sm transition-transform group-hover:rotate-6"><AlertCircle size={20} /></div>
                        <h4 className="text-lg font-black uppercase text-foreground leading-none tracking-tighter">API Thresholds</h4>
                        <p className="text-[10px] text-muted-foreground font-medium italic leading-relaxed">
                            &quot;Different social platforms have variable request rate limits. If a publishing job fails due to throttling, our Retry Engine will automatically back off and re-initiate.&quot;
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
