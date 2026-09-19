'use client';

import * as React from 'react';
import dynamic from 'next/dynamic';
import { supabase } from '@/lib/supabaseClient';
import { Loader2, ShieldAlert } from 'lucide-react';

/**
 * ONLINE BAR OS: MASTER WIDGET REGISTRY
 * Dynamically orchestrates UI nodes based on Admin orchestration.
 */

// 1. Dynamic Node Imports (High Performance)
const HeroWidget = dynamic(() => import('@/components/home/hero/NeuralHero'), { loading: () => <div className="h-[60dvh] bg-slate-50 animate-pulse" /> });
const TrendingWidget = dynamic(() => import('@/components/home/ProductList'), { loading: () => <div className="h-96 bg-slate-50 animate-pulse" /> });
const BuzzWidget = dynamic(() => import('@/components/buzz/BuzzHUD'), { loading: () => <div className="h-64 bg-slate-50 animate-pulse" /> });
const ConciergeWidget = dynamic(() => import('@/components/widgets/concierge/BuildMyNightWidget'), { loading: () => <div className="h-96 bg-slate-50 animate-pulse" /> });
const PersonalizedWidget = dynamic(() => import('@/components/home/PersonalizedFeed'), { loading: () => <div className="h-96 bg-slate-50 animate-pulse" /> });
const PerfectServeWidget = dynamic(() => import('@/components/product/PerfectServeWidget'), { loading: () => <div className="h-64 bg-slate-50 animate-pulse" /> });
const MobileWidgetStats = dynamic(() => import('@/components/admin/experience/MobileWidgetStats'), { loading: () => <div className="h-64 bg-slate-50 animate-pulse" /> });
const SommelierWidget = dynamic(() => import('@/components/widgets/SommelierWidget'), { loading: () => <div className="h-96 bg-slate-50 animate-pulse" /> });

interface WidgetNode {
    id: string;
    widget_key: string;
    rank: number;
    config: Record<string, unknown>;
}

export default function WidgetRegistry({ pageRoute = '/' }: { pageRoute?: string }) {
    const [widgets, setWidgets] = React.useState<WidgetNode[]>([]);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        async function fetchRegistry() {
            if (!supabase) return;
            try {
                const { data } = await supabase
                    .from('system_widgets')
                    .select('*')
                    .eq('page_route', pageRoute)
                    .order('rank', { ascending: true });

                if (data) setWidgets(data as WidgetNode[]);
            } catch (err) {
                console.error("Widget Registry Link Failure:", err);
            } finally {
                setLoading(false);
            }
        }
        fetchRegistry();
    }, [pageRoute]);

    if (loading) return (
        <div className="py-40 flex flex-col items-center gap-6">
            <Loader2 className="h-10 w-10 text-primary animate-spin" />
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-300">Synchronizing Interface Nodes...</p>
        </div>
    );

    return (
        <div className="space-y-24 sm:space-y-32">
            {widgets.map((widget) => (
                <WidgetIntersectionNode key={widget.id} widget={widget} />
            ))}
        </div>
    );
}

function WidgetIntersectionNode({ widget }: { widget: WidgetNode }) {
    const [isVisible, setIsVisible] = React.useState(false);
    const nodeRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                    observer.disconnect();
                }
            },
            { rootMargin: '200px' } // Load 200px before reaching viewport
        );

        if (nodeRef.current) observer.observe(nodeRef.current);
        return () => observer.disconnect();
    }, []);

    return (
        <div ref={nodeRef} className="animate-in fade-in slide-in-from-bottom-8 duration-1000">
            {isVisible ? renderWidget(widget.widget_key, widget.config) : <div className="h-96 bg-slate-50/50 rounded-[3rem]" />}
        </div>
    );
}

function renderWidget(key: string, _config: Record<string, unknown>) { // eslint-disable-line @typescript-eslint/no-unused-vars
    switch (key) {
        case 'HERO_WIDGET':
            return <HeroWidget />;
        case 'TRENDING_WIDGET':
            return <section id="catalog-section" className="max-w-7xl mx-auto px-6 sm:px-12 lg:px-20"><TrendingWidget /></section>;
        case 'CITY_PULSE_WIDGET':
            return <section id="city-pulse" className="max-w-7xl mx-auto px-6 sm:px-12 lg:px-20"><BuzzWidget /></section>;
        case 'CONCIERGE_WIDGET':
            return <ConciergeWidget />;
        case 'PERSONALIZED_WIDGET':
            return <PersonalizedWidget />;
        case 'PERFECT_SERVE_WIDGET':
            return <section className="max-w-7xl mx-auto px-6 sm:px-12 lg:px-20"><PerfectServeWidget /></section>;
        case 'MOBILE_WIDGET_STATS':
            return <MobileWidgetStats />;
        case 'SOMMELIER_WIDGET':
            return <SommelierWidget />;
        default:
            return (
                <div className="p-10 border-2 border-dashed border-slate-100 rounded-[3rem] text-center opacity-20">
                    <ShieldAlert className="mx-auto mb-4" />
                    <p className="text-[10px] font-black uppercase tracking-widest">Node {key} Offline</p>
                </div>
            );
    }
}
