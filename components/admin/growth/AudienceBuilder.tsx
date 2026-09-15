'use client';

import * as React from 'react';
import { Card } from '@/components/ui/card';
import {
    Users,
    Plus,
    Trash2,
    Save,
    Zap,
    Target,
    BarChart3
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/lib/supabaseClient';

interface Rule {
    id: string;
    field: string;
    operator: 'gt' | 'lt' | 'eq' | 'contains';
    value: string;
}

export default function AudienceBuilder() {
    const [name, setName] = React.useState('');
    const [rules, setRules] = React.useState<Rule[]>([
        { id: '1', field: 'lifetime_value', operator: 'gt', value: '10000' }
    ]);
    const [estimatedReach, setEstimatedReach] = React.useState(0);
    const [calculating, setCalculating] = React.useState(false);

    const addRule = () => {
        setRules([...rules, { id: Math.random().toString(), field: 'category_affinity', operator: 'eq', value: '' }]);
    };

    const removeRule = (id: string) => {
        setRules(rules.filter(r => r.id !== id));
    };

    const calculateReach = () => {
        setCalculating(true);
        // Simulated neural reach calculation
        setTimeout(() => {
            setEstimatedReach(Math.floor(Math.random() * 500) + 50);
            setCalculating(false);
        }, 1500);
    };

    const handleSave = async () => {
        if (!name || !supabase) return;
        try {
            const { error } = await supabase.from('audience_segments').insert([{
                name,
                rule_logic: rules,
                estimated_reach: estimatedReach
            }]);
            if (!error) {
                alert("Neural Segment established. 🚀");
                setName('');
            }
        } catch (err) { console.error(err); }
    };

    return (
        <Card className="p-10 rounded-[3.5rem] bg-white border border-slate-100 shadow-sm space-y-10 text-left">
            <header className="flex justify-between items-center border-b border-slate-50 pb-8">
                <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 shadow-inner group-hover:rotate-6 transition-transform">
                        <Users size={24} />
                    </div>
                    <div>
                        <h2 className="text-2xl font-black uppercase tracking-tighter text-foreground leading-none">Audience Builder</h2>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1 italic">Neural Segmentation Node</p>
                    </div>
                </div>
                <div className="text-right">
                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Est. Reach</p>
                    <p className="text-3xl font-black text-indigo-600 tracking-tighter">{estimatedReach.toLocaleString()}</p>
                </div>
            </header>

            <div className="space-y-6">
                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Segment Identity</label>
                    <Input
                        value={name}
                        onChange={e => setName(e.target.value)}
                        placeholder="e.g. Dormant High-Spenders"
                        className="h-14 rounded-2xl bg-slate-50 border-slate-100 font-bold"
                    />
                </div>

                <div className="space-y-4">
                    <div className="flex justify-between items-center px-1">
                        <label className="text-[10px] font-black uppercase text-slate-400">Logic Protocol (Rules)</label>
                        <button onClick={addRule} className="text-[9px] font-black text-indigo-600 uppercase flex items-center gap-1 hover:opacity-70"><Plus size={12} /> Add Condition</button>
                    </div>

                    <div className="space-y-3">
                        {rules.map((rule) => (
                            <div key={rule.id} className="flex gap-3 animate-in slide-in-from-left-2 duration-300">
                                <select className="h-12 flex-1 rounded-xl bg-slate-50 border border-slate-100 px-4 text-[10px] font-black uppercase outline-none focus:ring-2 focus:ring-indigo-500/20">
                                    <option value="lifetime_value">Lifetime Value</option>
                                    <option value="last_order_days">Recency (Days)</option>
                                    <option value="category_affinity">Category Affinity</option>
                                    <option value="membership_tier">Membership Tier</option>
                                </select>
                                <select className="h-12 w-32 rounded-xl bg-slate-50 border border-slate-100 px-4 text-[10px] font-black uppercase outline-none focus:ring-2 focus:ring-indigo-500/20">
                                    <option value="gt">Greater Than</option>
                                    <option value="lt">Less Than</option>
                                    <option value="eq">Equals</option>
                                </select>
                                <Input
                                    placeholder="Value"
                                    className="h-12 w-40 rounded-xl bg-white border-slate-100 font-bold"
                                />
                                <button onClick={() => removeRule(rule.id)} className="h-12 w-12 rounded-xl bg-slate-50 text-slate-300 hover:text-rose-500 hover:bg-rose-50 transition-all flex items-center justify-center border border-slate-100">
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="pt-8 border-t border-slate-50 flex gap-4">
                <Button
                    onClick={calculateReach}
                    disabled={calculating}
                    variant="outline"
                    className="flex-1 h-14 rounded-2xl border-slate-200 text-foreground font-black uppercase text-[10px] tracking-widest active:scale-95"
                >
                    {calculating ? <BarChart3 className="animate-spin mr-2" /> : <><RefreshCcw className="mr-2" size={14} /> Calculate Reach</>}
                </Button>
                <Button
                    onClick={handleSave}
                    disabled={!name || estimatedReach === 0}
                    className="flex-[2] h-14 rounded-2xl bg-indigo-600 text-white font-black uppercase text-[10px] tracking-widest shadow-xl shadow-indigo-500/10 hover:scale-[1.02] active:scale-95 transition-all"
                >
                    <Save size={16} className="mr-2" /> Commit Segment to Registry
                </Button>
            </div>

            <div className="p-6 bg-indigo-50 border border-indigo-100 rounded-3xl relative overflow-hidden">
                <div className="relative z-10 space-y-2">
                    <div className="flex items-center gap-2">
                        <Target size={14} className="text-indigo-600" />
                        <span className="text-[10px] font-black uppercase text-indigo-700">Precision Targeting</span>
                    </div>
                    <p className="text-[10px] font-medium text-indigo-600 italic">
                        &quot;Higher segment precision results in 18% lower unsubscribe rates. Aim for audiences smaller than 500 patrons for tactical drop campaigns.&quot;
                    </p>
                </div>
                <Zap size={48} className="absolute -bottom-6 -right-6 text-indigo-200 opacity-20 rotate-12" />
            </div>
        </Card>
    );
}

function RefreshCcw(props: React.SVGProps<SVGSVGElement> & { size?: number }) {
  const { size = 24, ...rest } = props;
  return (
    <svg
      {...rest}
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
      <path d="M3 3v5h5" />
      <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
      <path d="M16 16h5v5" />
    </svg>
  )
}
