'use client';

import * as React from 'react';
import {
    Flame,
    MapPin,
    Clock,
    Share2,
    Navigation,
    TrendingUp
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { Button } from '@/components/ui/button';

export interface BuzzStory {
    id: string;
    title: string;
    description: string;
    area_zone: string;
    category: string;
    status: string;
    trend_score: number;
    latitude: number;
    longitude: number;
    media: Array<{ type: 'IMAGE' | 'VIDEO', url: string }>;
    distance?: string;
    starts_at: string;
}

export default function BuzzStoryCard({ story }: { story: BuzzStory }) {
    const cover = story.media[0];

    return (
        <div className="relative aspect-[9/16] w-full max-w-sm rounded-[3rem] bg-white border border-slate-100 overflow-hidden group shadow-2xl animate-in zoom-in-95 duration-500">

            {/* Background Media */}
            <div className="absolute inset-0">
                {cover.type === 'VIDEO' ? (
                    <video
                        src={cover.url}
                        autoPlay
                        muted
                        loop
                        playsInline
                        className="h-full w-full object-cover opacity-60"
                    />
                ) : (
                    <Image
                        src={cover.url}
                        alt={story.title}
                        fill
                        className="object-cover opacity-60 transition-transform duration-[2s] group-hover:scale-110"
                    />
                )}
                {/* Gradient Overlays */}
                <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/90" />
            </div>

            {/* Top HUD: Badges & Status */}
            <div className="absolute top-8 left-8 right-8 flex justify-between items-start z-20">
                <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-rose-500 rounded-full text-[8px] font-black uppercase text-white shadow-xl animate-pulse">
                        <Flame size={10} fill="currentColor" /> LIVE BUZZ
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-white/10 backdrop-blur-md rounded-full text-[8px] font-black uppercase text-white border border-white/10">
                        <TrendingUp size={10} className="text-primary" /> {story.trend_score} TREND_SCORE
                    </div>
                </div>
                <button
                    onClick={() => {
                        if (navigator.share) {
                            navigator.share({
                                title: story.title,
                                text: story.description,
                                url: window.location.origin + `/buzz?id=${story.id}`
                            });
                        } else {
                            navigator.clipboard.writeText(window.location.origin + `/buzz?id=${story.id}`);
                            alert("Mission Link captured! 🛰️");
                        }
                    }}
                    className="h-10 w-10 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-primary transition-all active:scale-95"
                >
                    <Share2 size={16} />
                </button>
            </div>

            {/* Bottom Content Area */}
            <div className="absolute bottom-8 left-8 right-8 space-y-6 z-20 text-left">
                <div className="space-y-2">
                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">{story.category}</p>
                    <h3 className="text-3xl font-black text-white uppercase tracking-tighter leading-tight text-balance">{story.title}</h3>
                    <div className="flex items-center gap-4 text-[10px] font-black uppercase text-slate-300 tracking-widest pt-2">
                        <span className="flex items-center gap-1.5"><MapPin size={12} className="text-primary" /> {story.area_zone}</span>
                        <div className="h-1 w-1 rounded-full bg-white/20" />
                        <span className="flex items-center gap-1.5"><Clock size={12} className="text-primary" /> Tonight</span>
                    </div>
                </div>

                <p className="text-xs font-medium text-slate-400 line-clamp-2 italic leading-relaxed text-pretty">
                    &quot;{story.description}&quot;
                </p>

                {/* Proximity Node */}
                {story.distance && (
                    <div className="flex items-center gap-3 p-4 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10">
                        <div className="h-8 w-8 rounded-xl bg-primary/20 flex items-center justify-center text-primary shadow-sm"><Navigation size={14} fill="currentColor" /></div>
                        <div>
                            <p className="text-[8px] font-black uppercase text-slate-500 tracking-widest leading-none mb-1">Near You</p>
                            <p className="text-xs font-black text-white uppercase">{story.distance} from your terminal</p>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-2 gap-3 pt-2">
                    <Button
                        onClick={() => window.location.href = `/buzz?id=${story.id}`}
                        className="h-14 rounded-2xl bg-white text-slate-900 font-black uppercase text-[9px] tracking-widest shadow-xl hover:bg-primary hover:text-white transition-all active:scale-95"
                    >
                        View Details
                    </Button>
                    <Button
                        variant="outline"
                        onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${story.latitude},${story.longitude}`, '_blank')}
                        className="h-14 rounded-2xl border-white/10 bg-white/5 text-white font-black uppercase text-[9px] tracking-widest hover:bg-white/10 transition-all flex items-center justify-center gap-2 active:scale-95"
                    >
                        <Navigation size={14} /> Navigate
                    </Button>
                </div>
            </div>

            {/* Background Story Lines */}
            <div className="absolute top-4 left-8 right-8 flex gap-1 z-20">
                {story.media.map((_, i) => (
                    <div key={i} className="h-1 flex-1 bg-white/10 rounded-full overflow-hidden">
                        <div className={cn(
                            "h-full bg-white transition-all duration-[5s] linear",
                            i === 0 ? "w-full" : "w-0"
                        )} />
                    </div>
                ))}
            </div>

        </div>
    );
}
