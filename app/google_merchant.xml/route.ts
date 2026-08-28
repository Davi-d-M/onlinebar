import { supabase } from '@/lib/supabaseClient';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

interface Product {
  id: number;
  name: string;
  description: string | null;
  image_url: string;
  stock: number;
  price: number;
  brand?: string | null;
}

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://onlinebar.co.ke';

  let products: Product[] = [];
  if (supabase) {
    const { data } = await supabase
        .from('products')
        .select('id, name, description, image_url, stock, price, brand');
    products = (data || []) as Product[];
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss xmlns:g="http://base.google.com/ns/1.0" version="2.0">
  <channel>
    <title>Online Bar | Premium Drinks Nairobi</title>
    <link>${baseUrl}</link>
    <description>Authentic wine, spirits, and late-night snacks delivered chilled in Nairobi.</description>
    ${products?.map(product => `
    <item>
      <g:id>${product.id}</g:id>
      <g:title>${product.name}</g:title>
      <g:description>${product.description?.replace(/<[^>]*>?/gm, '') || 'Premium beverage essential'}</g:description>
      <g:link>${baseUrl}/product/${product.id}</g:link>
      <g:image_link>${product.image_url}</g:image_link>
      <g:condition>new</g:condition>
      <g:availability>${product.stock > 0 ? 'in_stock' : 'out_of_stock'}</g:availability>
      <g:price>${product.price} KES</g:price>
      <g:brand>${product.brand || 'Online Bar'}</g:brand>
      <g:google_product_category>Food, Beverages &amp; Tobacco &gt; Beverages &gt; Alcoholic Beverages</g:google_product_category>
    </item>`).join('')}
  </channel>
</rss>`;

  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/xml',
    },
  });
}
