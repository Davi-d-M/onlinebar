import { supabase } from '../supabaseClient';

/**
 * ONLINE BAR: INTELLIGENCE ENGINE (v2)
 * Handles cross-selling, recommendations, and snack pairings.
 */

export interface PairingSuggestion {
    id: number;
    name: string;
    price: number;
    image_url: string;
    reason: string;
}

/**
 * Suggests snacks based on a beverage category or product.
 */
export async function getSnackPairing(category: string): Promise<PairingSuggestion[]> {
    if (!supabase) return [];

    // Simple Rule-based pairings (can be replaced by ML model later)
    const ruleMap: Record<string, string[]> = {
        'spirits': ['Nuts', 'Crisps', 'Ice'],
        'wine': ['Chocolate', 'Cheese', 'Biscuits'],
        'beer': ['Crisps', 'Biltong', 'Salty Snacks'],
        'mixers': ['Snack Bundles']
    };

    const targetSubCategories = ruleMap[category.toLowerCase()] || ['Trending'];

    const { data } = await supabase
        .from('products')
        .select('*')
        .eq('is_snack', true)
        .in('sub_category', targetSubCategories)
        .eq('status', 'Live')
        .gt('stock', 0)
        .limit(3);

    return (data || []).map(item => ({
        id: item.id,
        name: item.name,
        price: item.price,
        image_url: item.image_url,
        reason: `Perfect with your ${category}`
    }));
}

/**
 * Calculates current "Shift Demand" for the Admin HUD.
 */
export async function getLiveDemandMetrics() {
    if (!supabase) return null;

    const thirtyMinAgo = new Date(Date.now() - 30 * 60000).toISOString();

    const [visitors, orders] = await Promise.all([
        supabase.from('active_visitors').select('session_id', { count: 'exact', head: true }).gt('last_active_at', thirtyMinAgo),
        supabase.from('orders').select('id', { count: 'exact', head: true }).gt('created_at', thirtyMinAgo)
    ]);

    return {
        activeVisitors: visitors.count || 0,
        recentOrders: orders.count || 0,
        intensity: (orders.count || 0) > 5 ? 'HIGH' : 'NORMAL'
    };
}
