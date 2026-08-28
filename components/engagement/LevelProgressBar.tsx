'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface LevelProgressBarProps {
    xp: number;
    level: number;
    className?: string;
}

export function LevelProgressBar({ xp, level, className }: LevelProgressBarProps) {
    // Level formula: Level = floor(sqrt(xp / 100)) + 1
    // To find XP required for current level: 100 * (level - 1)^2
    // To find XP required for next level: 100 * (level)^2

    const currentLevelStartXP = 100 * Math.pow(level - 1, 2);
    const nextLevelXP = 100 * Math.pow(level, 2);
    const xpInCurrentLevel = xp - currentLevelStartXP;
    const totalRequiredInLevel = nextLevelXP - currentLevelStartXP;

    const percentage = Math.min(100, Math.max(0, (xpInCurrentLevel / totalRequiredInLevel) * 100));
    const xpRemaining = nextLevelXP - xp;

    return (
        <div className={cn("space-y-3", className)}>
            <div className="flex justify-between items-end">
                <div className="space-y-1">
                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Progression</p>
                    <p className="text-sm font-black text-foreground uppercase tracking-tight">
                        {Math.floor(percentage)}% to Level {level + 1}
                    </p>
                </div>
                <p className="text-[10px] font-bold text-primary uppercase">
                    {xpRemaining} XP Left
                </p>
            </div>

            <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-200 p-1 shadow-inner">
                <div
                    className="h-full bg-gradient-to-r from-primary to-amber-400 rounded-full transition-all duration-1000 ease-out shadow-lg"
                    style={{ width: `${percentage}%` }}
                />
            </div>

            <div className="flex justify-between text-[8px] font-black text-slate-300 uppercase tracking-widest px-1">
                <span>Lvl {level}</span>
                <span>Lvl {level + 1}</span>
            </div>
        </div>
    );
}
