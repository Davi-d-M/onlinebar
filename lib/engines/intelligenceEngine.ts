import { supabase } from '../supabaseClient';

/**
 * ONLINE BAR: INTELLIGENCE ENGINE
 * Predictive analytics for logistics and operations.
 */

/**
 * Calculates the predicted preparation time for a merchant based on historical data.
 */
export async function predictPrepTime(merchantId: string): Promise<number> {
    if (!supabase) return 10; // Default 10 mins

    try {
        const { data } = await supabase
            .from('delivery_statistics')
            .select('prep_time_min, orders!inner(supplier_id)')
            .eq('orders.supplier_id', merchantId)
            .not('prep_time_min', 'is', null)
            .order('delivered_at', { ascending: false })
            .limit(20);

        if (!data || data.length === 0) return 12; // Base baseline

        const average = data.reduce((sum, d) => sum + (d.prep_time_min || 0), 0) / data.length;
        return Math.round(average);
    } catch (err) {
        console.error("Prep Prediction Failed:", err);
        return 15;
    }
}

/**
 * Identifies high-demand zones for Pre-Dispatch protocol.
 */
export async function identifyHotspots() {
    if (!supabase) return [];

    try {
        const { data } = await supabase
            .from('active_visitors')
            .select('latitude, longitude')
            .not('latitude', 'is', null);

        // Simple clustering logic or count by rounded coords
        const zones: Record<string, number> = {};
        data?.forEach(v => {
            const key = `${v.latitude.toFixed(2)},${v.longitude.toFixed(2)}`;
            zones[key] = (zones[key] || 0) + 1;
        });

        return Object.entries(zones)
            .filter(([, count]) => count >= 3)
            .map(([coords]) => {
                const [lat, lng] = coords.split(',').map(Number);
                return { lat, lng };
            });
    } catch (err) {
        console.error("Hotspot ID Failed:", err);
        return [];
    }
}
