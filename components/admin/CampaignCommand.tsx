'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Rocket, Send, Camera, Share2 as Facebook, MessageCircle, Loader2, Sparkles, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { launchCampaign } from '@/lib/engines/marketingEngine';

export default function CampaignCommand() {
    const [title, setTitle] = useState('');
    const [message, setMessage] = useState('');
    const [channels, setChannels] = useState<string[]>(['WHATSAPP', 'INSTAGRAM']);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const toggleChannel = (c: string) => {
        setChannels(prev => prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c]);
    };

    const handleLaunch = async () => {
        if (!title || !message) return;
        setLoading(true);
        try {
            await launchCampaign({
                title,
                message,
                channels: channels as ('WHATSAPP' | 'INSTAGRAM' | 'FACEBOOK')[]
            });
            setSuccess(true);
            setTimeout(() => setSuccess(false), 5000);
            setTitle('');
            setMessage('');
        } catch (err) {
            console.error(err);
            alert("Mission Failed. Check satellite logs.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className="p-10 rounded-[3.5rem] bg-white border border-slate-100 shadow-2xl relative overflow-hidden group text-left">
            <div className="relative z-10 space-y-10">
                <header className="flex justify-between items-start">
                    <div className="space-y-2">
                        <div className="flex items-center gap-3">
                            <Rocket className="h-6 w-6 text-primary animate-pulse" />
                            <h2 className="text-3xl font-black uppercase tracking-tighter text-foreground leading-none">Campaign Command</h2>
                        </div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">Multi-Channel Outreach Engine</p>
                    </div>
                    {success && (
                        <div className="px-4 py-2 bg-emerald-50 text-emerald-600 rounded-xl text-[9px] font-black uppercase flex items-center gap-2 animate-in slide-in-from-top-2">
                            <CheckCircle2 size={14} /> Mission Launched
                        </div>
                    )}
                </header>

                <div className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-[9px] font-black uppercase text-slate-400 ml-1">Mission Headline (Campaign Title)</label>
                        <Input
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                            className="h-14 rounded-2xl bg-slate-50 border-slate-100 font-bold text-foreground"
                            placeholder="e.g. Weekend Gin Festival"
                        />
                    </div>

                    <div className="space-y-2">
                        <div className="flex justify-between items-center px-1">
                            <label className="text-[9px] font-black uppercase text-slate-400">Core Content (Base Message)</label>
                            <button className="text-[8px] font-black text-primary uppercase flex items-center gap-1 hover:opacity-70">
                                <Sparkles size={10} /> AI Polish
                            </button>
                        </div>
                        <Textarea
                            value={message}
                            onChange={e => setMessage(e.target.value)}
                            className="min-h-[120px] rounded-3xl bg-slate-50 border-slate-100 font-medium text-slate-600 resize-none p-6"
                            placeholder="Draft your viral beverage transmission here..."
                        />
                    </div>

                    <div className="space-y-4">
                        <label className="text-[9px] font-black uppercase text-slate-400 ml-1">Select Deployment Channels</label>
                        <div className="grid grid-cols-3 gap-3">
                            {[
                                { id: 'WHATSAPP', label: 'WhatsApp', icon: MessageCircle, color: 'emerald' },
                                { id: 'INSTAGRAM', label: 'Instagram', icon: Camera, color: 'primary' },
                                { id: 'FACEBOOK', label: 'Facebook', icon: Facebook, color: 'indigo' },
                            ].map(ch => (
                                <button
                                    key={ch.id}
                                    onClick={() => toggleChannel(ch.id)}
                                    className={cn(
                                        "p-6 rounded-[2rem] border-2 transition-all flex flex-col items-center gap-3 group/ch",
                                        channels.includes(ch.id)
                                            ? `bg-${ch.color}-50 border-${ch.color}-500/20 text-${ch.color}-600 shadow-xl shadow-${ch.color}-500/10`
                                            : "bg-white border-slate-100 text-slate-300 hover:border-slate-200"
                                    )}
                                >
                                    <ch.icon className={cn("h-6 w-6", channels.includes(ch.id) ? "" : "group-hover/ch:text-slate-400")} />
                                    <span className="text-[9px] font-black uppercase tracking-widest">{ch.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <Button
                    onClick={handleLaunch}
                    disabled={loading || !title || !message}
                    className="w-full h-18 rounded-[2rem] bg-primary text-white font-black uppercase text-xs tracking-[0.2em] shadow-xl shadow-primary/20 active:scale-95 transition-all flex items-center justify-center gap-4 group/btn"
                >
                    {loading ? (
                        <Loader2 className="animate-spin" />
                    ) : (
                        <>
                            <Send className="h-5 w-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                            Launch Global Campaign
                        </>
                    )}
                </Button>
            </div>

            {/* Decorative Background */}
            <Rocket className="absolute -bottom-20 -right-20 h-64 w-64 text-slate-50 -z-0 rotate-12" />
        </Card>
    );
}
