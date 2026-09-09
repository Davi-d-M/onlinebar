import ProductList from "@/components/home/ProductList";
import DynamicHero from "@/components/home/DynamicHero";
import PromotionalBanner from "@/components/home/PromotionalBanner";
import PersonalizedFeed from "@/components/home/PersonalizedFeed";
import EngagementDashboard from "@/components/engagement/EngagementDashboard";
import LiveCityPulse from "@/components/engagement/LiveCityPulse";
import SnackCrossSell from "@/components/engagement/SnackCrossSell";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, Utensils, ArrowRight, GlassWater } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { getCachedHomeData } from "@/lib/cachedData";
import { type StoreSettings } from "@/lib/useSettings";

export const revalidate = 300; // Shared with cache

interface Post {
  slug: string;
  image_url: string;
  title: string;
  excerpt: string;
}

interface Product {
  id: number;
  name: string;
  price: number;
  old_price?: number;
  description?: string;
  image_url?: string;
  image?: string;
  rating?: number;
  category?: string;
  stock?: number;
  sizes?: string[];
  is_new?: boolean;
}

export default async function Home() {
  // 1. Fetch All Data in Parallel on Server (Shared Cache)
  const [postsRes, productsRes, settingsRes] = await getCachedHomeData();

  const posts = (postsRes.data || []) as Post[];
  const initialProducts = (productsRes.data || []) as Product[];

  // Process Settings
  const settingsData = settingsRes.data || [];
  const settings = {} as StoreSettings;
  settingsData.forEach(item => {
      (settings as unknown as Record<string, unknown>)[item.key] = item.value;
  });

  return (
    <div className="bg-white min-h-screen text-left">

      {/* 1. Premium Hero Section */}
      <section id="hero-section">
          <DynamicHero initialSettings={settings} />
      </section>

      {/* 1.5 Engagement Hub (Personalized) */}
      <section id="engagement-hub">
          <EngagementDashboard />
      </section>

      {/* 2. Flash Sale Banner */}
      <section id="promo-banner">
          <PromotionalBanner />
      </section>

      {/* 2.5 Live City Intelligence */}
      <section id="city-pulse">
          <LiveCityPulse />
      </section>

      {/* 2.6 Dedicated Snack & Essentials Hub */}
      <section id="goods-hub-entry" className="max-w-7xl mx-auto px-4 mb-24 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-8">
              <Link href="/shop/snacks" className="group">
                  <Card className="p-10 rounded-[4rem] bg-primary text-black border-none shadow-2xl relative overflow-hidden group-hover:scale-[1.01] transition-all duration-700">
                      <div className="relative z-10 space-y-4">
                          <div className="inline-flex items-center gap-2 px-3 py-1 bg-black/10 rounded-full text-[10px] font-black uppercase tracking-widest border border-black/10">
                              <Utensils className="h-3 w-3" /> New Sector
                          </div>
                          <h2 className="text-4xl font-serif font-black uppercase tracking-tighter leading-none">The Snack <span className="text-white italic">Hub.</span></h2>
                          <p className="text-sm font-medium opacity-70 italic max-w-xs leading-relaxed">Gourmet pairings curated for your evening selection.</p>
                          <Button className="h-12 px-8 rounded-2xl bg-black text-white font-black uppercase text-[10px] tracking-widest hover:bg-white hover:text-black transition-all shadow-xl active:scale-95">
                              Explore Snacks <ArrowRight className="ml-2 h-4 w-4" />
                          </Button>
                      </div>
                      <Utensils className="absolute -bottom-10 -right-10 h-64 w-64 text-black/5 rotate-12 -z-0" />
                  </Card>
              </Link>

              <Link href="/shop/category/essentials" className="group">
                  <Card className="p-10 rounded-[4rem] bg-black text-white border-none shadow-2xl relative overflow-hidden group-hover:scale-[1.01] transition-all duration-700">
                      <div className="relative z-10 space-y-4">
                          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full text-[10px] font-black uppercase tracking-widest border border-white/10">
                              <GlassWater className="h-3 w-3 text-primary" /> Premium Goods
                          </div>
                          <h2 className="text-4xl font-serif font-black uppercase tracking-tighter leading-none">Bar <span className="text-primary italic">Essentials.</span></h2>
                          <p className="text-sm font-medium opacity-60 italic max-w-xs leading-relaxed">Luxury glassware, tools & gifting kits.</p>
                          <Button className="h-12 px-8 rounded-2xl bg-primary text-black font-black uppercase text-[10px] tracking-widest hover:bg-white transition-all shadow-xl active:scale-95">
                              Shop Essentials <ArrowRight className="ml-2 h-4 w-4" />
                          </Button>
                      </div>
                      <GlassWater className="absolute -bottom-10 -left-10 h-64 w-64 text-white/5 rotate-12 -z-0" />
                  </Card>
              </Link>
          </div>
      </section>

      {/* 3. Collections Feed */}
      <section id="catalog-section" className="max-w-7xl mx-auto px-4 py-24 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-16 border-b border-slate-100 pb-10">
          <div className="space-y-4">
            <Badge className="bg-primary/10 text-primary hover:bg-primary/10 border-none font-black uppercase tracking-widest text-[10px] px-3 py-1.5 rounded-full">
                Bar Menu
            </Badge>
            <h2 className="text-4xl font-black tracking-tighter text-foreground uppercase leading-none">Premium Spirits & Snacks</h2>
            <p className="text-slate-500 font-medium text-lg max-w-2xl leading-relaxed">
              Curated selection of fine wines, premium spirits, and gourmet snacks for your late-night cravings. Delivered chilled to your doorstep.
            </p>
          </div>
          <div className="hidden md:block">
              <span className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-300">Nairobi Selection — 2026 Batch</span>
          </div>
        </div>

        {/* 4. Product Grid & Filter Tabs */}
        <ProductList initialProducts={initialProducts} />

        <div className="mt-24">
            <SnackCrossSell />
        </div>
      </section>

      {/* 5. Personalized Feed (Memory) */}
      <section id="personalized-feed">
          <PersonalizedFeed />
      </section>

      {/* 6. Blog Teaser Section */}
      <section id="blog-section" className="bg-slate-50 py-24 border-y border-slate-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-end mb-12">
                  <div className="space-y-3">
                      <Badge className="bg-primary/5 text-primary border-none font-black uppercase text-[9px] px-3 py-1 rounded-full">Mixology Hub</Badge>
                      <h2 className="text-4xl font-black text-foreground uppercase tracking-tighter leading-none">Expert Guides</h2>
                  </div>
                  <Link href="/blog" className="text-[10px] font-black text-primary underline underline-offset-4 uppercase tracking-widest hover:text-foreground">Explore Mixology</Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {posts.length > 0 ? posts.map((post) => (
                      <Link key={post.slug} href={`/blog/${post.slug}`} className="group relative rounded-[2.5rem] overflow-hidden bg-slate-100 aspect-[16/9] shadow-2xl transition-all hover:-translate-y-2 border border-slate-200">
                          <div className="w-full h-full flex items-center justify-center bg-slate-50 text-slate-300 overflow-hidden relative">
                              <Image
                                src={post.image_url || '/placeholder.jpg'}
                                alt={post.title}
                                fill
                                className="object-cover group-hover:scale-110 transition-transform duration-700"
                              />
                          </div>
                          <div className="absolute inset-0 p-8 flex flex-col justify-end bg-gradient-to-t from-white/90 to-transparent">
                              <h3 className="text-2xl font-black text-foreground uppercase tracking-tight mb-2">{post.title}</h3>
                              <p className="text-slate-600 text-sm font-medium line-clamp-1">{post.excerpt}</p>
                          </div>
                      </Link>
                  )) : (
                      <div className="col-span-full py-16 text-center bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-100">
                          <BookOpen className="h-10 w-10 text-slate-200 mx-auto mb-4" />
                          <p className="text-slate-400 font-black uppercase text-[10px] tracking-widest italic">Awaiting beverage artifacts from the library...</p>
                      </div>
                  )}
              </div>
          </div>
      </section>

      {/* 6. Fast Power CTA */}
      <section id="cta-section" className="bg-slate-50 py-32 overflow-hidden relative border-t border-slate-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
              <h2 className="text-5xl lg:text-8xl font-black text-foreground uppercase tracking-tighter mb-8 leading-[0.85]">
                  Need a Cold <br /><span className="text-primary italic">One?</span>
              </h2>
              <p className="text-slate-500 text-xl font-medium max-w-2xl mx-auto mb-12 leading-relaxed">
                  Our authentic beverage kits delivered chilled in record time. Verified, genuine, and ready for your celebration.
              </p>
              <div className="flex justify-center">
                  <Badge variant="outline" className="border-slate-200 text-slate-400 font-black uppercase tracking-[0.2em] text-[11px] py-3 px-8 rounded-full animate-pulse">
                      Nairobi Instant Dispatch Active
                  </Badge>
              </div>
          </div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[500px] bg-primary/10 rounded-full blur-[150px] -z-0"></div>
      </section>

    </div>
  );
}
