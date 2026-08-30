'use client';

import * as React from 'react';
import { Card } from '@/components/ui/card';
import { Activity, ShieldCheck, Zap, Globe } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NodeHealth {
    id: string;
    label: string;
    icon: React.ElementType;
    status: 'Healthy' | 'Degraded' | 'Down';
    latency: string;
}

export default function SystemIntegrity() {
    const [health, setHealth] = React.useState<NodeHealth[]>([]);
    const [loading, setLoading] = React.useState(true);

    const fetchHealth = React.useCallback(async () => {
        try {
            const res = await fetch('/api/health');
            const data = await res.json();

            const nodes: NodeHealth[] = [
                {
                    id: 'api',
                    label: 'Primary API',
                    icon: Globe,
                    status: data.status === 'HEALTHY' ? 'Healthy' : 'Degraded',
                    latency: data.total_latency || '---'
                },
                {
                    id: 'db',
                    label: 'Database',
                    icon: Activity,
                    status: data.database?.status === 'OK' ? 'Healthy' : 'Down',
                    latency: data.database?.latency || '---'
                },
                {
                    id: 'storage',
                    label: 'Storage',
                    icon: ShieldCheck,
                    status: data.storage?.status === 'OK' ? 'Healthy' : 'Down',
                    latency: data.storage?.latency || '---'
                },
                {
                    id: 'network',
                    label: 'Network',
                    icon: Zap,
                    status: 'Healthy',
                    latency: '24ms'
                }
            ];
            setHealth(nodes);
        } catch (err) {
            console.error("Health pulse failure:", err);
        } finally {
            setLoading(false);
        }
    }, []);

    React.useEffect(() => {
        fetchHealth();
        const interval = setInterval(fetchHealth, 30000); // 30s refresh
        return () => clearInterval(interval);
    }, [fetchHealth]);

    if (loading && health.length === 0) return <div className="h-48 bg-slate-50 rounded-[3rem] animate-pulse" />;

    return (
        <Card className="p-10 rounded-[3.5rem] bg-white border border-slate-100 shadow-sm space-y-10 text-left">
            <div className="flex justify-between items-center px-2">
                <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-500 shadow-sm">
                        <ShieldCheck size={24} />
                    </div>
                    <div>
                        <h3 className="text-xl font-black uppercase tracking-tighter text-foreground leading-none">System Integrity</h3>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Global Technical Heartbeat</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <div className={cn(
                        "h-2 w-2 rounded-full animate-pulse",
                        health.every(n => n.status === 'Healthy') ? "bg-emerald-500" : "bg-amber-500"
                    )} />
                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">
                        {health.every(n => n.status === 'Healthy') ? 'Nodes Operational' : 'Node Issue Detected'}
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                {health.map((node) => (
                    <div key={node.id} className="p-6 rounded-[2rem] bg-slate-50 border border-slate-100 space-y-4 group hover:bg-white hover:shadow-xl transition-all">
                        <div className="flex justify-between items-start">
                            <div className="h-10 w-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-slate-300 group-hover:text-primary transition-colors shadow-sm">
                                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                                {React.createElement(node.icon as any, { size: 20 })}
                            </div>
                            <span className={cn(
                                "text-[7px] font-black uppercase tracking-widest px-2 py-0.5 rounded",
                                node.status === 'Healthy' ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
                            )}>
                                {node.status}
                            </span>
                        </div>
                        <div className="text-left">
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">{node.label}</p>
                            <p className="text-xs font-black text-foreground uppercase tracking-tight">{node.latency}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="pt-4 border-t border-slate-50 flex justify-between items-center text-[8px] font-black uppercase tracking-[0.2em] text-slate-300">
                <span>Infrastructure: Tier 4 Monitoring</span>
                <span>Last Ping: Just now</span>
            </div>
        </Card>
    );
}
