'use client';

import * as React from 'react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { BookOpen, MapPin, Factory, Sparkles, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
    story?: string;
    origin?: string;
    production?: string;
    brandName?: string;
}

export default function DossierEditorialHub({ story, origin, production, brandName }: Props) {
    const [activeTab, setActiveTab] = React.useState<'story' | 'origin' | 'production'>('story');

    const tabs = [
        { id: 'story', label: 'The Story', icon: BookOpen, content: story },
        { id: 'origin', label: 'The Origin', icon: MapPin, content: origin },
        { id: 'production', label: 'How it\'s Made', icon: Factory, content: production },
    ];

    const currentTab = tabs.find(t => t.id === activeTab);

    return (
        <Card className="rounded-[3.5rem] bg-white border border-slate-100 shadow-sm overflow-hidden flex flex-col min-h-[600px] text-left">
            {/* Header / Tabs */}
            <div className="bg-slate-50 p-8 border-b border-slate-100">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div className="space-y-1">
                        <h3 className="text-xl font-black uppercase tracking-tighter text-foreground leading-none">About the Bottle</h3>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{brandName || 'Reserve Collection'}</p>
                    </div>
                    <nav className="flex gap-2 p-1 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-x-auto no-scrollbar max-w-full">
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={cn(
                                    "flex items-center gap-2 px-6 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all whitespace-nowrap",
                                    activeTab === tab.id ? "bg-primary text-white shadow-lg shadow-primary/20" : "text-slate-400 hover:text-foreground"
                                )}
                            >
                                <tab.icon size={14} />
                                {tab.label}
                            </button>
                        ))}
                    </nav>
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 p-10 md:p-16 space-y-12 relative overflow-hidden">
                <div className="relative z-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-sm">
                            {currentTab?.icon && <currentTab.icon size={20} />}
                        </div>
                        <h4 className="text-2xl font-black uppercase tracking-tight text-foreground">{currentTab?.label}</h4>
                    </div>

                    <div className="prose prose-slate max-w-none">
                        <p className="text-lg font-medium text-slate-600 leading-relaxed italic pr-12 first-letter:text-5xl first-letter:font-black first-letter:text-primary first-letter:mr-3 first-letter:float-left">
                            {currentTab?.content || "Information not publicly disclosed by the producer. Our researchers are currently auditing this node."}
                        </p>
                    </div>
                </div>

                {/* Decorative Pattern */}
                <Sparkles className="absolute -bottom-20 -right-20 h-80 w-80 text-primary/5 rotate-12 -z-0" />
            </div>

            {/* Footer CTA */}
            <div className="p-10 border-t border-slate-50 bg-slate-50/50 flex justify-between items-center">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Verified by Online Bar Editorial Node</p>
                <Button variant="ghost" className="text-[10px] font-black uppercase tracking-widest text-primary hover:bg-primary/5 p-0 h-auto flex items-center gap-2">
                    Explore App Appellation <ChevronRight size={14} />
                </Button>
            </div>
        </Card>
    );
}
