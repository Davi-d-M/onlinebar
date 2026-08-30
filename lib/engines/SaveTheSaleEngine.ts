import { supabase } from '../supabaseClient';

/**
 * ONLINE BAR: SAVE THE SALE ENGINE
 * Proactively handles OOS and delays to protect customer experience.
 */

export async function handleOutOfStock(productId: number) {
    if (!supabase) return null;

    try {
        // 1. Fetch the OOS product to get its category
        const { data: oosProduct } = await supabase
            .from('products')
            .select('category, sub_category, price')
            .eq('id', productId)
            .single();

        if (!oosProduct) return null;

        // 2. Find Chilled Alternatives (Same category, in stock, similar price)
        const { data: alternatives } = await supabase
            .from('products')
            .select('*')
            .eq('category', oosProduct.category)
            .gt('stock', 0)
            .neq('id', productId)
            .order('price', { ascending: true })
            .limit(3);

        if (alternatives && alternatives.length > 0) {
            console.log(`🚨 [SAVE_THE_SALE] OOS detected for ${productId}. Offering ${alternatives.length} alternatives.`);
            return {
                type: 'OOS_RECOVERY',
                original_id: productId,
                suggestions: alternatives,
                message: "This bottle just left the cellar! Would you like a chilled alternative instead?"
            };
        }

        return null;
    } catch (err) {
        console.error("Save the Sale Error:", err);
        return null;
    }
}

export async function detectDispatchDelay(orderId: number) {
    // 1. Check mission timeline
    // 2. If delayed > 15m from prep complete, pre-draft apology
    console.log(`📡 [SAVE_THE_SALE] Monitoring delay for order #${orderId}`);
}
