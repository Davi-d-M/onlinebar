'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    Home,
    Search,
    Package,
    User,
    Flame
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCart } from '@/context/CartContext';

const NAV_ITEMS = [
    { label: 'Home', icon: Home, href: '/' },
    { label: 'Shop', icon: Search, href: '/shop' },
    { label: 'Buzz', icon: Flame, href: '/buzz' },
    { label: 'Orders', icon: Package, href: '/profile#orders' },
    { label: 'My Bar', icon: User, href: '/profile' }
];

export default function MobileBottomNav() {
    const pathname = usePathname();
    const { cart } = useCart();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

    // Only show on mobile, and hide on admin pages
    if (pathname?.startsWith('/admin')) return null;

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-[1000] lg:hidden bg-white/80 backdrop-blur-xl border-t border-slate-100 pb-safe-area-inset-bottom animate-in slide-in-from-bottom-full duration-500">
            <div className="flex justify-around items-center h-20 px-4">
                {NAV_ITEMS.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;

                    return (
                        <Link
                            key={item.label}
                            href={item.href}
                            className="relative flex flex-col items-center justify-center w-full h-full group"
                        >
                            <div className={cn(
                                "flex flex-col items-center gap-1 transition-all duration-300",
                                isActive ? "text-primary scale-110" : "text-slate-400 group-active:scale-95"
                            )}>
                                <div className="relative">
                                    <Icon className={cn("h-6 w-6", isActive && "fill-current")} />
                                    {item.label === 'Orders' && (
                                        <div className="absolute -top-1 -right-1 h-2 w-2 bg-primary rounded-full animate-pulse" />
                                    )}
                                </div>
                                <span className="text-[10px] font-black uppercase tracking-tighter">{item.label}</span>
                            </div>

                            {/* Active Indicator Bar */}
                            {isActive && (
                                <div className="absolute top-0 h-1 w-8 bg-primary rounded-b-full shadow-[0_4px_10px_rgba(245,160,0,0.4)]" />
                            )}
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}
