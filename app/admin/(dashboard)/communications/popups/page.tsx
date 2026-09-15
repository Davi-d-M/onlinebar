'use client';

import * as React from 'react';
import { supabase } from '@/lib/supabaseClient';
import {
    Bell,
    Plus,
    Eye,
    Zap,
    Loader2,
    Clock,
    Layout,
    Settings2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import ExperienceToast from '@/components/layout/ExperienceToast';

interface Template {
    id: string;
    name: string;
    event_type: string;
    title: string;
    message: string;
    icon: string;
    style: string;
    duration: number;
    priority: string;
    is_active: boolean;
}

interface AuditLog {
    id: string;
    order_id: number | null;
    status: string;
    created_at: string;
    notification_templates: { name: string } | null;
}

export default function PopupManager() {
    const [templates, setTemplates] = React.useState<Template[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [editing, setEditing] = React.useState<Template | null>(null);
    const [preview, setPreview] = React.useState<boolean>(false);
    const [auditLog, setAuditLog] = React.useState<AuditLog[]>([]);

    const fetchTemplates = React.useCallback(async () => {
        if (!supabase) return;
        setLoading(true);
        try {
            const { data } = await supabase.from('notification_templates').select('*').order('name');
            if (data) setTemplates(data as Template[]);

            // Fetch recent audit logs
            const { data: logs } = await supabase
                .from('notifications_log')
                .select(`
                    *,
                    notification_templates(name)
                `)
                .order('created_at', { ascending: false })
                .limit(5);
            if (logs) setAuditLog(logs);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    }, []);

    React.useEffect(() => {
        fetchTemplates();
    }, [fetchTemplates]);

    const handleSave = async () => {
        if (!editing || !supabase) return;
        setLoading(true);
        try {
            const { error } = await supabase.from('notification_templates').upsert(editing);
            if (!error) {
                setEditing(null);
                fetchTemplates();
            }
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    const toggleActive = async (id: string, current: boolean) => {
        if (!supabase) return;
        await supabase.from('notification_templates').update({ is_active: !current }).eq('id', id);
        fetchTemplates();
    };

    return (
        <div className="p-8 space-y-10 bg-slate-50 min-h-screen text-left selection:bg-primary/20 pb-40">
            <header className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 border-b border-slate-200 pb-8">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <Bell className="h-4 w-4 text-primary" />
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Experience Orchestration</span>
                    </div>
                    <h1 className="text-4xl font-black text-foreground uppercase tracking-tighter leading-none">Popup Manager</h1>
                    <p className="text-muted-foreground text-sm font-medium mt-1">Configure and live-preview high-fidelity transactional alerts.</p>
                </div>
                <Button onClick={() => setEditing({ id: '', name: '', event_type: 'CUSTOM', title: 'New Alert', message: '', icon: 'Bell', style: 'info', duration: 7, priority: 'NORMAL', is_active: true } as Template)} className="rounded-xl h-12 px-8 bg-primary text-white font-black uppercase text-[10px] tracking-widest shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all">
                    <Plus className="h-4 w-4 mr-2" /> Design New Template
                </Button>
            </header>

            <div className="grid lg:grid-cols-12 gap-10">

                {/* TEMPLATE LIBRARY */}
                <div className="lg:col-span-8 space-y-6">
                    <div className="flex items-center justify-between px-4">
                        <h2 className="text-xl font-black uppercase tracking-tighter text-foreground">Template Library</h2>
                        <span className="text-[10px] font-black uppercase text-slate-400 bg-white px-3 py-1 rounded-full border border-slate-100">{templates.length} Active Nodes</span>
                    </div>

                    <div className="grid gap-4">
                        {loading && templates.length === 0 ? (
                            <div className="p-20 text-center bg-white rounded-[3rem] border border-slate-100 animate-pulse flex flex-col items-center gap-4">
                                <Loader2 className="h-8 w-8 text-primary animate-spin" />
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-300">Synchronizing Template Grid...</p>
                            </div>
                        ) : templates.map(t => (
                            <Card key={t.id} className={cn(
                                "p-6 rounded-[2.5rem] border transition-all hover:shadow-xl relative overflow-hidden group",
                                t.is_active ? "bg-white border-slate-100" : "bg-slate-50 border-dashed border-slate-200 opacity-60 grayscale"
                            )}>
                                <div className="flex items-center justify-between relative z-10">
                                    <div className="flex items-center gap-6">
                                        <div className={cn(
                                            "h-14 w-14 rounded-2xl flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform",
                                            t.style === 'success' ? "bg-emerald-50 text-emerald-500" :
                                            t.style === 'error' ? "bg-rose-50 text-rose-500" :
                                            "bg-primary/5 text-primary"
                                        )}>
                                            <Bell size={28} />
                                        </div>
                                        <div className="text-left">
                                            <div className="flex items-center gap-3 mb-1">
                                                <span className="text-[10px] font-black uppercase text-primary tracking-widest">{t.event_type}</span>
                                                <div className="h-1 w-1 rounded-full bg-slate-200" />
                                                <span className="text-[8px] font-black uppercase text-slate-400">Priority: {t.priority}</span>
                                            </div>
                                            <h3 className="text-xl font-black uppercase tracking-tight text-foreground">{t.name}</h3>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4">
                                        <Button variant="ghost" size="icon" onClick={() => setEditing(t)} className="h-10 w-10 rounded-xl hover:bg-slate-50"><Settings2 size={18} /></Button>
                                        <button
                                            onClick={() => toggleActive(t.id, t.is_active)}
                                            className={cn(
                                                "w-12 h-6 rounded-full transition-all relative p-1 flex items-center shadow-inner",
                                                t.is_active ? "bg-emerald-500" : "bg-slate-200"
                                            )}
                                        >
                                            <div className={cn(
                                                "h-4 w-4 rounded-full bg-white shadow-sm transition-all",
                                                t.is_active ? "translate-x-6" : "translate-x-0"
                                            )} />
                                        </button>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                </div>

                {/* STUDIO / EDITOR */}
                <div className="lg:col-span-4">
                    {editing ? (
                        <Card className="p-10 rounded-[3rem] bg-white border border-primary/20 shadow-2xl space-y-8 animate-in slide-in-from-right-4 duration-500 sticky top-10">
                            <div className="flex items-center justify-between">
                                <h3 className="text-xl font-black uppercase tracking-tighter text-foreground">Template Studio</h3>
                                <button onClick={() => setEditing(null)} className="text-[10px] font-black text-slate-400 uppercase hover:text-primary underline">Discard</button>
                            </div>

                            <div className="space-y-6 text-left">
                                <div className="space-y-2">
                                    <label className="text-[9px] font-black uppercase text-slate-400 ml-1">Template Name</label>
                                    <Input value={editing.name} onChange={e => setEditing({...editing, name: e.target.value})} className="h-12 rounded-xl bg-slate-50 border-slate-100 font-bold" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[9px] font-black uppercase text-slate-400 ml-1">Alert Title</label>
                                    <Input value={editing.title} onChange={e => setEditing({...editing, title: e.target.value})} className="h-12 rounded-xl bg-slate-50 border-slate-100 font-bold" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[9px] font-black uppercase text-slate-400 ml-1">Message Protocol (Use {"{{order_id}}"})</label>
                                    <Textarea value={editing.message} onChange={e => setEditing({...editing, message: e.target.value})} className="min-h-[100px] rounded-2xl bg-slate-50 border-slate-100 p-4 font-medium text-sm leading-relaxed" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[9px] font-black uppercase text-slate-400 ml-1">Visual Style</label>
                                        <select value={editing.style} onChange={e => setEditing({...editing, style: e.target.value})} className="w-full h-12 rounded-xl bg-slate-50 border border-slate-100 px-4 text-[10px] font-black uppercase outline-none">
                                            <option value="success">Success (Emerald)</option>
                                            <option value="info">Info (Blue)</option>
                                            <option value="warning">Warning (Amber)</option>
                                            <option value="error">Error (Rose)</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[9px] font-black uppercase text-slate-400 ml-1">Priority</label>
                                        <select value={editing.priority} onChange={e => setEditing({...editing, priority: e.target.value})} className="w-full h-12 rounded-xl bg-slate-50 border border-slate-100 px-4 text-[10px] font-black uppercase outline-none">
                                            <option value="CRITICAL">Critical</option>
                                            <option value="HIGH">High</option>
                                            <option value="NORMAL">Normal</option>
                                            <option value="LOW">Low</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-6 border-t border-slate-50 space-y-4">
                                <Button onClick={() => setPreview(true)} variant="outline" className="w-full h-14 rounded-2xl border-slate-200 text-foreground font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-2">
                                    <Eye size={16} /> Inspect Live Preview
                                </Button>
                                <Button onClick={handleSave} className="w-full h-14 rounded-2xl bg-primary text-white font-black uppercase text-[10px] tracking-widest shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all">
                                    Establish Template Node
                                </Button>
                            </div>
                        </Card>
                    ) : (
                        <div className="space-y-8">
                            <Card className="p-10 rounded-[3rem] bg-white border border-slate-100 shadow-sm space-y-6 relative overflow-hidden group hover:border-primary/20 transition-all">
                                <div className="relative z-10 space-y-4 text-left">
                                    <Zap className="h-10 w-10 text-primary" />
                                    <h3 className="text-2xl font-black uppercase tracking-tighter leading-none text-foreground">Intelligence Rule</h3>
                                    <p className="text-sm font-medium text-slate-500 italic leading-relaxed">
                                        &quot;Transactional alerts are deterministic. Marketing popups should be limited to 1 per session to maintain peak hospitality UX.&quot;
                                    </p>
                                </div>
                                <Layout className="absolute -bottom-10 -right-10 h-48 w-48 text-primary/5 rotate-12" />
                            </Card>

                            <div className="p-8 rounded-[3rem] bg-white border border-slate-100 shadow-sm space-y-6 text-left group">
                        <div className="flex items-center gap-3 text-indigo-600">
                            <Clock size={20} />
                            <h4 className="text-lg font-black uppercase tracking-tighter">Recent Dispatches</h4>
                        </div>
                        <div className="space-y-3">
                            {auditLog.length > 0 ? auditLog.map(log => (
                                <div key={log.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                                    <div className="flex justify-between items-start mb-1">
                                        <p className="text-[9px] font-black uppercase text-foreground truncate max-w-[150px]">{log.notification_templates?.name || 'Unknown'}</p>
                                        <span className="text-[7px] font-bold text-slate-400 uppercase">{new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                    </div>
                                    <p className="text-[8px] font-medium text-slate-400 uppercase tracking-widest">Order #{String(log.order_id || 'SYSTEM')}</p>
                                </div>
                            )) : (
                                <p className="text-[9px] font-black uppercase text-slate-300 text-center py-4 italic">No recent dispatches detected.</p>
                            )}
                        </div>
                    </div>
                        </div>
                    )}
                </div>
            </div>

            {/* PREVIEW OVERLAY */}
            {preview && editing && (
                <div className="fixed inset-0 z-[3000] flex items-center justify-center p-6 bg-slate-900/10 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="relative w-full max-w-lg">
                        <ExperienceToast
                            id="preview"
                            title={editing.title}
                            message={editing.message.replace('{{order_id}}', 'OB-10482')}
                            style={editing.style}
                            icon={editing.icon}
                            duration={editing.duration}
                            onClose={() => setPreview(false)}
                        />
                        <p className="mt-8 text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 text-center animate-pulse">Live Visual Inspection Node</p>
                    </div>
                </div>
            )}
        </div>
    );
}
