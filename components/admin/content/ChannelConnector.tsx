'use client';

import * as React from 'react';
import { supabase } from '@/lib/supabaseClient';
import {
    Link2,
    Link2Off,
    RefreshCcw,
    Camera as Instagram,
    MessageCircle,
    Music,
    CheckCircle2,
    Loader2,
    Globe
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface SocialAccount {
    id: string;
    platform: string;
    account_name: string;
    status: string;
    expires_at: string | null;
}

export default function ChannelConnector() {
    const [accounts, setAccounts] = React.useState<SocialAccount[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [connecting, setConnecting] = React.useState<string | null>(null);

    const fetchAccounts = React.useCallback(async () => {
        if (!supabase) return;
        setLoading(true);
        try {
            const { data } = await supabase.from('social_accounts').select('*').order('platform');
            if (data) setAccounts(data as SocialAccount[]);
        } finally {
            setLoading(false);
        }
    }, []);

    React.useEffect(() => {
        fetchAccounts();
    }, [fetchAccounts]);

    const handleConnect = (platform: string) => {
        setConnecting(platform);
        // Neural Simulation: OAuth Sequence
        setTimeout(async () => {
            if (!supabase) return;
            try {
                await supabase.from('social_accounts').upsert({
                    platform,
                    account_name: `Online Bar ${platform.charAt(0) + platform.slice(1).toLowerCase()} Node`,
                    status: 'CONNECTED',
                    connected_at: new Date().toISOString()
                }, { onConflict: 'platform, account_name' });
                fetchAccounts();
            } finally { setConnecting(null); }
        }, 2000);
    };

    const platforms = [
        { id: 'INSTAGRAM', label: 'Instagram', icon: Instagram, color: 'text-rose-500', bg: 'bg-rose-50' },
        { id: 'TIKTOK', label: 'TikTok', icon: Music, color: 'text-black', bg: 'bg-slate-100' },
        { id: 'WHATSAPP', label: 'WhatsApp', icon: MessageCircle, color: 'text-emerald-500', bg: 'bg-emerald-50' },
        { id: 'X', label: 'X (Twitter)', icon: Globe, color: 'text-sky-500', bg: 'bg-sky-50' },
    ];

    return (
        <Card className="p-8 rounded-[3rem] bg-white border border-slate-100 shadow-sm space-y-8 text-left">
            <header className="flex justify-between items-center px-2">
                <div className="flex items-center gap-3">
                    <Link2 className="h-5 w-5 text-primary" />
                    <h3 className="text-xl font-black uppercase tracking-tighter text-foreground">Channel Links</h3>
                </div>
                <button onClick={fetchAccounts} className="text-slate-300 hover:text-primary transition-colors">
                    <RefreshCcw size={16} className={cn(loading && "animate-spin")} />
                </button>
            </header>

            <div className="grid gap-4">
                {platforms.map(p => {
                    const connected = accounts.find(a => a.platform === p.id);
                    return (
                        <div key={p.id} className={cn(
                            "p-5 rounded-2xl border transition-all flex items-center justify-between group",
                            connected ? "bg-white border-slate-100 shadow-sm" : "bg-slate-50 border-transparent opacity-60 grayscale"
                        )}>
                            <div className="flex items-center gap-4">
                                <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center shadow-inner", p.bg, p.color)}>
                                    <p.icon size={20} />
                                </div>
                                <div className="text-left">
                                    <p className="text-[11px] font-black uppercase text-foreground leading-none">{p.label}</p>
                                    <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                                        {connected ? `Verified: ${connected.account_name}` : 'Awaiting Connection'}
                                    </p>
                                </div>
                            </div>

                            {connected ? (
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-1.5 text-emerald-500">
                                        <CheckCircle2 size={12} />
                                        <span className="text-[9px] font-black uppercase">Active</span>
                                    </div>
                                    <button className="h-8 w-8 rounded-lg bg-rose-50 text-rose-500 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><Link2Off size={14} /></button>
                                </div>
                            ) : (
                                <Button
                                    onClick={() => handleConnect(p.id)}
                                    disabled={!!connecting}
                                    className="h-9 px-4 rounded-xl bg-primary text-white font-black uppercase text-[8px] tracking-widest shadow-lg shadow-primary/20 active:scale-95 transition-all"
                                >
                                    {connecting === p.id ? <Loader2 size={14} className="animate-spin" /> : 'Connect'}
                                </Button>
                            )}
                        </div>
                    );
                })}
            </div>
        </Card>
    );
}
