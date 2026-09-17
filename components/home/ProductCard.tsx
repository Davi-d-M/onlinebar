"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useCart } from "@/context/CartContext";
import { cn, formatPrice, normalizeImage } from "@/lib/utils";
import { Check, Eye, Heart, ShoppingCart, X, ArrowUpDown, MessageSquare, TrendingUp, Lock } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import RestockNotifyButton from "@/components/product/RestockNotifyButton";
import { useWishlist } from "@/context/WishlistContext";
import { useSettings } from "@/lib/useSettings";
import { supabase } from "@/lib/supabaseClient";
import { useInteractionTracking } from "@/lib/utils/useInteractionTracking";

interface Product {
  id: number;
  image?: string;
  image_url?: string;
  name: string;
  price: number;
  old_price?: number;
  category?: string;
  stock?: number;
  sizes?: string[];
  description?: string;
  is_new?: boolean;
  order_count?: number;
  min_loyalty_tier?: string; // e.g. 'Explorer', 'Silver', 'Gold', 'Diamond'
  wholesale_price?: number;
  wholesale_min_qty?: number;
}

declare global {
  interface Window {
    fbq?: (action: string, eventName: string, params?: Record<string, unknown>) => void;
  }
}

const TIER_RANK: Record<string, number> = {
    'Explorer': 0,
    'Silver': 1,
    'Gold': 2,
    'Diamond': 3,
    'Legend': 4
};

export default function ProductCard({ product }: { product: Product }) {
  const [imageError, setImageError] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [justAdded, setJustAdded] = useState(false);
  const [showQuickView, setShowQuickView] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState<string>("");
  const [userTier, setUserTier] = useState('Explorer');

  const { addToCart, toggleCompare, compareList } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { settings } = useSettings();
  const { trackClick } = useInteractionTracking();

  useEffect(() => {
      async function checkTier() {
          if (!supabase) return;
          const { data: { session } } = await supabase.auth.getSession();
          if (session) {
              const { data } = await supabase.from('profiles').select('loyalty_points').eq('id', session.user.id).maybeSingle();
              if (data) {
                  const pts = data.loyalty_points || 0;
                  if (pts >= 5000) setUserTier('Legend');
                  else if (pts >= 2000) setUserTier('Diamond');
                  else if (pts >= 1000) setUserTier('Gold');
                  else if (pts >= 500) setUserTier('Silver');
              }
          }
      }
      checkTier();
  }, []);

  const imageUrl = normalizeImage(product.image || product.image_url);
  const isSale = product.old_price && Number(product.old_price) > Number(product.price);
  const isComparing = compareList.some(p => p.id === product.id);

  const minTier = product.min_loyalty_tier || 'Explorer';
  const isLocked = TIER_RANK[userTier] < TIER_RANK[minTier];

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isLocked) return;

    // Use first available variant if none selected (Non-blocking flow)
    const variant = selectedVariant || (product.sizes && product.sizes.length > 0 ? product.sizes[0] : undefined);

    setIsAdding(true);
    // await new Promise((resolve) => setTimeout(resolve, 300));

    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      base_price: product.price,
      image: imageUrl,
      quantity: 1,
      category: product.category,
      size: variant,
      wholesale_price: product.wholesale_price,
      wholesale_min_qty: product.wholesale_min_qty
    });

    setIsAdding(false);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 2000);
  };

  const handleToggleLike = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isInWishlist(product.id)) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist({
        id: product.id,
        name: product.name,
        price: product.price,
        image: imageUrl,
        category: product.category
      });
    }
  };

  return (
    <>
      <Card className="group overflow-hidden bg-white border-slate-100 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 rounded-[2rem] text-left relative">
      <div className="relative overflow-hidden aspect-square bg-slate-50 flex items-center justify-center p-3 sm:p-6">

        {/* Premium Locked Overlay */}
        {isLocked && (
            <div className="absolute inset-0 z-30 bg-white/60 backdrop-blur-[2px] flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-500">
                <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-4 shadow-sm animate-bounce">
                    <Lock size={24} />
                </div>
                <p className="text-[10px] font-black uppercase text-foreground tracking-widest leading-none">Bar VIP Exclusive</p>
                <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-2">Required: {minTier} Rank</p>
                <Link href="/rewards" className="mt-4">
                    <Button size="sm" className="h-8 rounded-lg bg-primary text-white font-black uppercase text-[8px] tracking-widest">Join the VIP Club</Button>
                </Link>
            </div>
        )}

        {/* Badges */}
        <div className="absolute top-2 left-2 sm:top-4 sm:left-4 z-20 flex flex-col gap-1 sm:gap-2">
            {isSale && (
                <span className="bg-rose-500 text-white text-[8px] sm:text-[10px] font-black px-2 py-0.5 sm:px-3 sm:py-1 rounded-full uppercase tracking-widest shadow-lg shadow-rose-500/30">Sale</span>
            )}
            {product.is_new && (
                <span className="bg-primary text-white text-[8px] sm:text-[10px] font-black px-2 py-0.5 sm:px-3 sm:py-1 rounded-full uppercase tracking-widest shadow-lg shadow-primary/30">New</span>
            )}
            {product.category && (
                <span className="bg-slate-100 text-slate-400 text-[7px] sm:text-[8px] font-black px-1.5 py-0.5 rounded uppercase tracking-[0.1em] border border-slate-200">
                    {product.category.includes('Wine') ? 'Vintages' :
                     product.category.includes('Whiskey') ? 'Premium Spirit' :
                     product.category.includes('Beer') ? 'Chilled Beer' :
                     product.category.includes('Snack') ? 'Late Night' : 'Bar Selection'}
                </span>
            )}
            {product.order_count !== undefined && product.order_count > 10 && (
                <span className="bg-amber-500 text-white text-[8px] sm:text-[10px] font-black px-2 py-0.5 sm:px-3 sm:py-1 rounded-full uppercase tracking-widest shadow-lg shadow-amber-500/30 flex items-center gap-1">
                    <TrendingUp className="h-2 w-2 sm:h-3 sm:w-3" /> Trending
                </span>
            )}
            {product.stock !== undefined && product.stock > 0 && product.stock < 5 && (
                <span className="bg-primary text-white text-[7px] sm:text-[9px] font-black px-2 py-0.5 sm:px-3 sm:py-1 rounded-full uppercase tracking-widest animate-pulse border border-white/20">Limited Stock</span>
            )}
        </div>

        <Button
          variant="ghost"
          size="icon"
          disabled={isLocked}
          className={cn(
            "absolute top-2 right-2 sm:top-4 sm:right-4 z-20 opacity-0 group-hover:opacity-100 transition-all duration-300 bg-white shadow-xl hover:bg-white rounded-full h-8 w-8 sm:h-10 sm:w-10",
            isInWishlist(product.id) && "opacity-100 text-rose-500",
            isLocked && "hidden"
          )}
          onClick={(e) => {
              handleToggleLike(e);
              trackClick('wishlist-btn', 'Toggle Wishlist', { productId: product.id, name: product.name });
          }}
        >
          <Heart className={cn("h-3 w-3 sm:h-4 sm:w-4", isInWishlist(product.id) && "fill-current")} />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          disabled={isLocked}
          className={cn(
            "absolute top-12 right-2 sm:top-16 sm:right-4 z-20 opacity-0 group-hover:opacity-100 transition-all duration-300 bg-white shadow-xl hover:bg-white rounded-full text-slate-400 hover:text-indigo-600 h-8 w-8 sm:h-10 sm:w-10",
            isComparing && "opacity-100 text-indigo-600 ring-2 ring-indigo-500",
            isLocked && "hidden"
          )}
          onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              toggleCompare(product);
              trackClick('compare-btn', 'Toggle Compare', { productId: product.id });
          }}
          title="Compare with other bottles"
        >
          <ArrowUpDown className="h-3 w-3 sm:h-4 sm:w-4" />
        </Button>

        <Link href={`/shop/${product.id}`} className="block relative w-full h-full">
            {!imageError ? (
              <Image
                src={imageUrl}
                alt={product.name}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className="object-contain transition-transform duration-700 group-hover:scale-110 p-4"
                onError={() => setImageError(true)}
                priority={product.is_new}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-300">
                <X className="h-12 w-12" />
              </div>
            )}

          <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center">
            <Button
              size="sm"
              className="bg-white text-foreground hover:bg-slate-50 font-black uppercase text-[10px] tracking-widest px-6 py-5 rounded-2xl shadow-2xl border-none scale-90 group-hover:scale-100 transition-transform duration-300"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setShowQuickView(true);
                trackClick('quick-look-btn', 'Quick Look', { productId: product.id });

                // Meta Tracking: ViewContent
                if (typeof window !== 'undefined' && window.fbq) {
                    window.fbq('track', 'ViewContent', {
                        content_name: product.name,
                        content_ids: [product.id],
                        content_type: 'product',
                        value: product.price,
                        currency: 'KES'
                    });
                }
              }}
            >
              <Eye className="h-4 w-4 mr-2" />
              Quick Look
            </Button>
          </div>
        </Link>
      </div>

      <CardContent className="p-3.5 sm:p-6 flex flex-col flex-1 text-left">
        <Link href={`/shop/${product.id}`} className="mb-2 block min-h-[2.4rem] sm:min-h-[3rem]">
          <h2 className="font-black text-foreground text-[11px] sm:text-sm uppercase tracking-tight line-clamp-2 group-hover:text-primary transition-colors leading-[1.2] text-balance word-spacing-tight">
            {product.name}
          </h2>
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-1.5 sm:gap-2 border-b border-slate-50 pb-3 sm:pb-4 min-h-[2.8rem] sm:min-h-[3.5rem]">
          <div className="flex flex-col justify-end">
              {isSale && <span className="text-[9px] sm:text-[10px] font-bold text-slate-400 line-through leading-none mb-1">{formatPrice(Number(product.old_price))}</span>}
              <span className="text-[15px] sm:text-xl font-black text-primary leading-none tracking-tighter">
                {formatPrice(product.price)}
              </span>
          </div>
          <div className="flex items-end">
            {product.stock !== undefined && (
                <span
                className={cn(
                    "text-[8px] sm:text-[9px] font-black uppercase tracking-widest px-2 py-0.5 sm:px-2 sm:py-1 rounded-lg w-fit border shadow-sm transition-colors",
                    product.stock > 0 ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100'
                )}
                >
                {product.stock > 0 ? 'Available' : 'Restocking'}
                </span>
            )}
          </div>
        </div>

        <div className="mt-4 flex flex-col gap-2">
            {product.stock !== undefined && product.stock === 0 ? (
                <div className="h-11 sm:h-14">
                    <RestockNotifyButton productId={product.id} productName={product.name} />
                </div>
            ) : (
                <>
                    <Button
                    className={cn(
                        'w-full h-11 sm:h-14 transition-all duration-300 rounded-xl sm:rounded-2xl font-black uppercase text-[10px] sm:text-xs tracking-widest shadow-xl active:scale-95',
                        isLocked ? 'bg-slate-50 text-slate-300 cursor-not-allowed border border-slate-100 shadow-none' :
                        justAdded
                        ? 'bg-emerald-500 text-white hover:bg-emerald-600'
                        : 'bg-primary text-white hover:bg-primary/90 shadow-primary/20'
                    )}
                    onClick={handleAddToCart}
                    disabled={isAdding || isLocked}
                    >
                    {isLocked ? (
                        <div className="flex items-center gap-2">
                            <Lock className="h-3 w-3 sm:h-4 sm:w-4" /> VIP Lock
                        </div>
                    ) : isAdding ? (
                        <div className="flex items-center gap-2">
                        <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                        ...
                        </div>
                    ) : justAdded ? (
                        <div className="flex items-center gap-2">
                        <Check className="h-3 w-3 sm:h-4 sm:h-4" />
                        Added
                        </div>
                    ) : (
                        <div className="flex items-center gap-2">
                        <ShoppingCart className="h-4 w-4" />
                        Add to Bag
                        </div>
                    )}
                    </Button>

                    <Button
                        variant="outline"
                        className="w-full h-10 sm:h-12 rounded-xl sm:rounded-2xl border-slate-100 text-slate-500 hover:bg-slate-50 hover:text-primary font-black uppercase text-[8px] sm:text-[10px] tracking-widest transition-all"
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            trackClick('whatsapp-buy-btn', 'WhatsApp Buy', { productId: product.id });
                            const message = `Hello Online Bar! I want to order:\n\n*Product:* ${product.name}\n*Price:* ${formatPrice(product.price)}\n\nIs this available for dispatch?`;
                            window.open(`https://wa.me/${settings.contact.whatsapp}?text=${encodeURIComponent(message)}`, '_blank');
                        }}
                    >
                        <MessageSquare className="h-3 w-3 mr-2" /> WhatsApp Order
                    </Button>
                </>
            )}
        </div>
      </CardContent>
    </Card>

    {/* Quick View Modal */}
    {showQuickView && (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-500/10 backdrop-blur-md p-4" onClick={() => setShowQuickView(false)}>
        <Card className="max-w-3xl w-full bg-white max-h-[90dvh] overflow-y-auto rounded-[2.5rem] border-none shadow-2xl p-0" onClick={e => e.stopPropagation()}>
          <div className="flex items-center justify-between p-6 border-b border-slate-50">
            <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Product Preview</h2>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full hover:bg-slate-100"
              onClick={() => {
                setShowQuickView(false);
                setSelectedVariant("");
              }}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          <CardContent className="p-8 space-y-8 text-left">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 text-left">
              {/* Product Image */}
              <div className="aspect-square overflow-hidden rounded-3xl bg-slate-50 flex items-center justify-center p-8 border border-slate-100 relative">
                {!imageError ? (
                  <Image
                    src={imageUrl}
                    alt={product.name}
                    fill
                    className="object-contain hover:scale-110 transition-transform duration-500 p-8"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-300 font-black">IMAGE MISSING</div>
                )}
              </div>

              {/* Product Details */}
              <div className="space-y-6 text-left">
                <div>
                  <h1 className="text-3xl font-black text-foreground mb-2 uppercase tracking-tight">
                    {product.name}
                  </h1>
                  <div className="flex items-baseline gap-3">
                    <p className="text-3xl font-black text-primary">
                        {formatPrice(product.price)}
                    </p>
                    {isSale && <p className="text-lg font-bold text-slate-300 line-through">{formatPrice(Number(product.old_price))}</p>}
                  </div>
                </div>

                {/* Description */}
                {product.description && (
                  <div className="border-l-4 border-primary/20 pl-4 py-1">
                    <p className="text-slate-500 text-sm font-medium leading-relaxed italic">
                      {product.description}
                    </p>
                  </div>
                )}

                {/* Variants */}
                {product.sizes && Array.isArray(product.sizes) && product.sizes.length > 0 && (
                  <div>
                    <p className="font-black text-[10px] uppercase tracking-widest text-slate-400 mb-3">
                      Available Options:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {product.sizes.map((size) => (
                        <button
                          key={size}
                          onClick={() => setSelectedVariant(size)}
                          className={cn(
                            "px-5 py-2.5 rounded-xl border text-xs font-black uppercase transition-all duration-200",
                            selectedVariant === size
                              ? 'bg-primary text-white border-primary shadow-lg shadow-primary/30 scale-105'
                              : 'border-slate-100 text-slate-600 hover:border-slate-300 bg-white'
                          )}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="space-y-4 pt-6">
                  <Button
                    className={cn(
                      'w-full h-16 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl active:scale-95 transition-all',
                      justAdded
                        ? 'bg-emerald-500 text-white hover:bg-emerald-600'
                        : 'bg-primary text-white hover:bg-primary/90 shadow-primary/20'
                    )}
                    onClick={handleAddToCart}
                    disabled={isAdding || (product.stock !== undefined && product.stock === 0)}
                  >
                    {isAdding ? 'Syncing...' : justAdded ? 'Added to Bag!' : 'Add to Bag'}
                  </Button>

                  <div className="grid grid-cols-3 gap-3 text-center text-[9px] font-black uppercase tracking-tighter text-slate-400 pt-4">
                      <div className="p-2 bg-slate-50 rounded-xl">Chilled Delivery</div>
                      <div className="p-2 bg-slate-50 rounded-xl">Genuine Spirits</div>
                      <div className="p-2 bg-slate-50 rounded-xl">Secure Pay</div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )}
    </>
  );
}
