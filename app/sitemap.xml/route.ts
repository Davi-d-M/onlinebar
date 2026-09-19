import { supabase } from '@/lib/supabaseClient';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://onlinebar.co.ke';

  // 1. Static Routes
  const staticRoutes = [
    '',
    '/shop',
    '/cart',
    '/profile',
    '/about',
    '/contact',
    '/shipping',
    '/returns',
    '/privacy',
    '/terms',
    '/blog',
    '/track'
  ];

  // 2. Dynamic Product Routes
  let products: { id: number, updated_at: string }[] = [];
  if (supabase) {
    const { data } = await supabase.from('products').select('id, updated_at');
    products = data || [];
  }

  // 3. Dynamic Blog Routes
  let posts: { slug: string, updated_at: string }[] = [];
  if (supabase) {
    const { data } = await supabase
      .from('blog_posts')
      .select('slug, updated_at')
      .eq('is_published', true);
    posts = data || [];
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${staticRoutes.map(route => `
  <url>
    <loc>${baseUrl}${route}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>${route === '' ? '1.0' : '0.8'}</priority>
  </url>`).join('')}
  ${products.map(p => `
  <url>
    <loc>${baseUrl}/shop/${p.id}</loc>
    <lastmod>${new Date(p.updated_at || Date.now()).toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>`).join('')}
  ${posts.map(post => `
  <url>
    <loc>${baseUrl}/blog/${post.slug}</loc>
    <lastmod>${new Date(post.updated_at || Date.now()).toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`).join('')}
</urlset>`;

  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/xml',
    },
  });
}
