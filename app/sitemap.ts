import { MetadataRoute } from 'next';
import { supabase } from '@/lib/supabaseClient';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
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
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: route === '' ? 1 : 0.8,
  }));

  // 2. Dynamic Product Routes
  let productRoutes: MetadataRoute.Sitemap = [];
  if (supabase) {
    const { data: products } = await supabase.from('products').select('id, updated_at');
    if (products) {
      productRoutes = products.map((p) => ({
        url: `${baseUrl}/shop/${p.id}`,
        lastModified: new Date(p.updated_at || Date.now()),
        changeFrequency: 'weekly' as const,
        priority: 0.9,
      }));
    }
  }

  // 3. Dynamic Blog Routes
  let blogRoutes: MetadataRoute.Sitemap = [];
  if (supabase) {
    const { data: posts } = await supabase
      .from('blog_posts')
      .select('slug, updated_at')
      .eq('is_published', true);
    if (posts) {
      blogRoutes = posts.map((post) => ({
        url: `${baseUrl}/blog/${post.slug}`,
        lastModified: new Date(post.updated_at || Date.now()),
        changeFrequency: 'weekly' as const,
        priority: 0.7,
      }));
    }
  }

  // 4. Dynamic Category Routes (Optional based on your category list)
  const categories = ['wine', 'spirits', 'snacks', 'beer', 'mixers'];
  const categoryRoutes = categories.map(cat => ({
    url: `${baseUrl}/shop?category=${cat}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.6
  }));

  return [...staticRoutes, ...productRoutes, ...blogRoutes, ...categoryRoutes];
}
