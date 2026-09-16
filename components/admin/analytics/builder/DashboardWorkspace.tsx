'use client';

import * as React from 'react';
import { supabase } from '@/lib/supabaseClient';
import {
    Plus,
    Settings2,
    Save,
    Trash2,
    Layout,
    BarChart3,
    Loader2,
    Edit3
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import IntelWidget from './IntelWidget';
import WidgetEditor from './WidgetEditor';

interface Dashboard {
    id: string;
    name: string;
    slug: string;
    description: string;
}

interface Widget {
    id: string;
    title: string;
    type: string;
    data_source: string;
    config: Record<string, unknown>;
    layout_x: number;
    layout_y: number;
    layout_w: number;
    layout_h: number;
}

export default function DashboardWorkspace({ slug }: { slug: string }) {
    const [dashboard, setDashboard] = React.useState<Dashboard | null>(null);
    const [widgets, setWidgets] = React.useState<Widget[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [editMode, setEditMode] = React.useState(false);
    const [editingWidget, setEditingWidget] = React.useState<Widget | null>(null);

    const fetchData = React.useCallback(async () => {
        if (!supabase) return;
        setLoading(true);
        try {
            const { data: dash } = await supabase.from('intel_dashboards').select('*').eq('slug', slug).single();
            if (dash) {
                setDashboard(dash);
                const { data: wids } = await supabase.from('intel_widgets').select('*').eq('dashboard_id', dash.id).order('layout_y', { ascending: true });
                if (wids) setWidgets(wids as Widget[]);
            }
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    }, [slug]);

    React.useEffect(() => {
        fetchData();
    }, [fetchData]);

    const addWidget = () => {
        const newWid: Partial<Widget> = {
            title: 'New Metric',
            type: 'KPI',
            data_source: 'TOTAL_REVENUE',
            config: {},
            layout_w: 4,
            layout_h: 2
        };
        setEditingWidget(newWid as Widget);
    };

    const handleDeleteWidget = async (widgetId: string) => {
        if (!supabase || !window.confirm("Are you sure you want to remove this Intelligence Node?")) return;
        try {
            const { error } = await supabase.from('intel_widgets').delete().eq('id', widgetId);
            if (error) throw error;
            fetchData();
        } catch (err) {
            console.error("Widget Deletion Failure:", err);
            alert("Uplink Failure: Could not expunge widget.");
        }
    };

    if (loading) return (
        <div className="py-40 flex flex-col items-center gap-6">
            <Loader2 className="h-10 w-10 text-primary animate-spin" />
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-300">Establishing Workspace Connection...</p>
        </div>
    );

    return (
        <div className="space-y-10 animate-in fade-in duration-700">
            {/* WORKSPACE HEADER */}
            <header className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 border-b border-slate-200 pb-8">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <Layout className="h-4 w-4 text-primary" />
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Intelligence Workspace</span>
                    </div>
                    <h1 className="text-4xl font-black text-foreground uppercase tracking-tighter leading-none">{dashboard?.name}</h1>
                    <p className="text-muted-foreground text-sm font-medium mt-1">{dashboard?.description}</p>
                </div>
                <div className="flex gap-4">
                    <Button
                        onClick={() => setEditMode(!editMode)}
                        variant="outline"
                        className={cn(
                            "h-12 px-6 rounded-xl font-black uppercase text-[10px] tracking-widest transition-all",
                            editMode ? "bg-primary text-white border-primary shadow-lg shadow-primary/20" : "bg-white border-slate-200 hover:bg-slate-50"
                        )}
                    >
                        {editMode ? <><Save className="mr-2 h-4 w-4" /> Exit Edit Mode</> : <><Edit3 className="mr-2 h-4 w-4" /> Customize Dashboard</>}
                    </Button>
                    {editMode && (
                        <Button onClick={addWidget} className="h-12 px-8 rounded-xl bg-primary text-white font-black uppercase text-[10px] tracking-widest shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all">
                            <Plus className="h-4 w-4 mr-2" /> Add Widget
                        </Button>
                    )}
                </div>
            </header>

            {/* WIDGET GRID (12 COLUMN) */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                {widgets.length === 0 && !editMode ? (
                    <div className="col-span-12 py-40 text-center opacity-20 border-2 border-dashed border-slate-200 rounded-[4rem]">
                        <BarChart3 size={64} className="mx-auto mb-6" />
                        <p className="text-xl font-black uppercase tracking-widest">Workspace Empty. Switch to Edit Mode to begin.</p>
                    </div>
                ) : widgets.map((widget) => (
                    <div
                        key={widget.id}
                        className={cn(
                            "relative group",
                            `md:col-span-${widget.layout_w || 4}`,
                            `row-span-${widget.layout_h || 2}`
                        )}
                    >
                        <IntelWidget widget={widget} />

                        {editMode && (
                            <div className="absolute -top-3 -right-3 z-30 flex gap-2 animate-in zoom-in-50 duration-300">
                                <button
                                    onClick={() => setEditingWidget(widget)}
                                    className="h-8 w-8 rounded-full bg-white border border-slate-100 shadow-xl flex items-center justify-center text-primary hover:scale-110 transition-transform"
                                >
                                    <Settings2 size={14} />
                                </button>
                                <button
                                    onClick={() => handleDeleteWidget(widget.id)}
                                    className="h-8 w-8 rounded-full bg-white border border-slate-100 shadow-xl flex items-center justify-center text-rose-500 hover:scale-110 transition-transform"
                                >
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* EDITOR MODAL */}
            {editingWidget && (
                <WidgetEditor
                    widget={editingWidget}
                    dashboardId={dashboard?.id || ''}
                    onClose={() => setEditingWidget(null)}
                    onSave={() => {
                        setEditingWidget(null);
                        fetchData();
                    }}
                />
            )}
        </div>
    );
}
