import React from 'react';
import { cn } from '@/lib/utils';
import { Shield, Crown, Gem, Star, Trophy, Rocket } from 'lucide-react';

interface LevelBadgeProps {
    level: number;
    title: string;
    className?: string;
}

const CONFIG: Record<string, { color: string, bg: string, icon: React.ElementType }> = {
    'Newcomer': { color: 'text-slate-400', bg: 'bg-slate-100', icon: Star },
    'Regular': { color: 'text-emerald-500', bg: 'bg-emerald-50', icon: Shield },
    'Insider': { color: 'text-indigo-500', bg: 'bg-indigo-50', icon: Rocket },
    'VIP': { color: 'text-primary', bg: 'bg-primary/10', icon: Crown },
    'Elite': { color: 'text-purple-500', bg: 'bg-purple-50', icon: Gem },
    'Legend': { color: 'text-amber-500', bg: 'bg-amber-50', icon: Trophy },
};

export function LevelBadge({ level, title, className }: LevelBadgeProps) {
    const config = CONFIG[title] || CONFIG['Newcomer'];
    const Icon = config.icon;

    return (
        <div className={cn(
            "inline-flex items-center gap-2 px-3 py-1 rounded-full border border-transparent transition-all hover:scale-105",
            config.bg,
            className
        )}>
            <div className={cn("h-4 w-4 flex items-center justify-center", config.color)}>
                <Icon size={12} strokeWidth={3} />
            </div>
            <span className={cn("text-[9px] font-black uppercase tracking-widest", config.color)}>
                Lvl {level} • {title}
            </span>
        </div>
    );
}
