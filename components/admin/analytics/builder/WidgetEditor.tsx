'use client';

import * as React from 'react';
import {
    X,
    Save,
    Loader2,
    Settings
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { supabase } from '@/lib/supabaseClient';

interface Widget {
    id: string;
    title: string;
    type: string;
    data_source: string;
    config: Record<string, unknown>;
    layout_w: number;
    layout_h: number;
}

interface EditorProps {
    widget: Widget;
    dashboardId: string;
    onClose: () => void;
    onSave: () => void;
}

export default function WidgetEditor({ widget, dashboardId, onClose, onSave }: EditorProps) {
    const [form, setForm] = React.useState<Widget>({ ...widget });
    const [loading, setLoading] = React.useState(false);
    const [metrics, setMetrics] = React.useState<Array<{ metric_key: string, label: string }>>([]);

    React.useEffect(() => {
        async function fetchMetrics() {
            if (!supabase) return;
            const { data } = await supabase.from('intel_metrics_catalog').select('*').order('label');
            if (data) setMetrics(data as Array<{ metric_key: string, label: string }>);
        }
        fetchMetrics();
    }, []);

    const handleSave = async () => {
        if (!supabase) return;
        setLoading(true);
        try {
            const payload = {
                ...form,
                dashboard_id: dashboardId,
                updated_at: new Date().toISOString()
            };

            let res;
            if (form.id) {
                res = await supabase.from('intel_widgets').update(payload).eq('id', form.id);
            } else {
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                const { id, ...newPayload } = payload;
                res = await supabase.from('intel_widgets').insert([newPayload]);
            }

            if (res.error) throw res.error;
            onSave();
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[1000] flex items-center justify-end bg-slate-900/10 backdrop-blur-md animate-in fade-in duration-300">
            <Card className="h-full w-full max-w-xl bg-white rounded-l-[4rem] border-none shadow-2xl flex flex-col animate-in slide-in-from-right-full duration-500 overflow-hidden text-left">

                <div className="p-10 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-2xl bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/20"><Settings size={24} /></div>
                        <div>
                            <h2 className="text-3xl font-black uppercase tracking-tighter text-foreground leading-none">Widget Studio</h2>
                            <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mt-1">Configure Intelligence Node</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="h-12 w-12 rounded-full hover:bg-white flex items-center justify-center transition-all shadow-sm border border-slate-100"><X size={24} /></button>
                </div>

                <div className="flex-1 overflow-y-auto p-10 space-y-12 no-scrollbar">
                    <section className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Widget Title</label>
                            <Input
                                value={form.title}
                                onChange={e => setForm({...form, title: e.target.value})}
                                className="h-14 rounded-2xl bg-slate-50 border-slate-100 font-bold"
                            />
                        </div>

                        <div className="grid sm:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Display Type</label>
                                <select
                                    value={form.type}
                                    onChange={e => setForm({...form, type: e.target.value})}
                                    className="w-full h-14 rounded-2xl bg-slate-50 border border-slate-100 px-6 font-black text-[10px] uppercase outline-none focus:ring-4 focus:ring-primary/5 transition-all"
                                >
                                    <option value="KPI">🔢 KPI Number</option>
                                    <option value="CHART_BAR">📊 Bar Chart</option>
                                    <option value="CHART_LINE">📈 Line Chart</option>
                                    <option value="CHART_PIE">🥧 Pie Chart</option>
                                    <option value="TABLE">📋 Data Table</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Primary Metric</label>
                                <select
                                    value={form.data_source}
                                    onChange={e => setForm({...form, data_source: e.target.value})}
                                    className="w-full h-14 rounded-2xl bg-slate-50 border border-slate-100 px-6 font-black text-[10px] uppercase outline-none focus:ring-4 focus:ring-primary/5 transition-all"
                                >
                                    {metrics.map(m => <option key={m.metric_key} value={m.metric_key}>{m.label}</option>)}
                                </select>
                            </div>
                        </div>
                    </section>

                    <section className="space-y-8">
                        <div className="flex items-center gap-3 border-l-4 border-primary pl-4">
                            <h3 className="text-xl font-black uppercase tracking-tight">Layout Control</h3>
                        </div>
                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Grid Width (1-12)</label>
                                <Input
                                    type="number"
                                    min="1"
                                    max="12"
                                    value={form.layout_w}
                                    onChange={e => setForm({...form, layout_w: parseInt(e.target.value)})}
                                    className="h-14 rounded-2xl bg-slate-50 border-slate-100 font-bold"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Vertical Span</label>
                                <Input
                                    type="number"
                                    min="1"
                                    max="6"
                                    value={form.layout_h}
                                    onChange={e => setForm({...form, layout_h: parseInt(e.target.value)})}
                                    className="h-14 rounded-2xl bg-slate-50 border-slate-100 font-bold"
                                />
                            </div>
                        </div>
                    </section>
                </div>

                <div className="p-10 border-t border-slate-100 bg-slate-50/50 flex gap-4">
                    <Button
                        onClick={onClose}
                        variant="outline"
                        className="flex-1 h-16 rounded-2xl border-slate-200 text-slate-400 font-black uppercase text-xs tracking-[0.2em]"
                    >
                        Discard
                    </Button>
                    <Button
                        onClick={handleSave}
                        disabled={loading}
                        className="flex-[2] h-16 rounded-2xl bg-primary text-white font-black uppercase text-xs tracking-[0.2em] shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all"
                    >
                        {loading ? <Loader2 className="animate-spin mr-2" /> : <><Save size={20} className="mr-2" /> Establish Node</>}
                    </Button>
                </div>

            </Card>
        </div>
    );
}
