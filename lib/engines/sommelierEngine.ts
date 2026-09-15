import { supabase } from '../supabaseClient';

/**
 * APEX OS: NEURAL SOMMELIER ENGINE
 * Generates intelligent product pairings based on Taste DNA and category archetypes.
 */

export interface PairingNode {
    id: number;
    name: string;
    price: number;
    image_url: string;
    reason: string;
}

class SommelierEngine {
    private static instance: SommelierEngine;

    private constructor() {}

    public static getInstance(): SommelierEngine {
        if (!SommelierEngine.instance) {
            SommelierEngine.instance = new SommelierEngine();
        }
        return SommelierEngine.instance;
    }

    /**
     * Identifies the perfect pairings for a specific bottle.
     */
    public async getPerfectPairings(productId: number, category: string): Promise<PairingNode[]> {
        if (!supabase) return [];

        try {
            // Archetype Pairing Logic
            let pairingCategory = 'snacks';
            let reason = 'Perfect with chilled appetizers.';

            if (category.toLowerCase().includes('whiskey')) {
                pairingCategory = 'snacks';
                reason = 'Enhances smoky oak notes.';
            } else if (category.toLowerCase().includes('wine')) {
                pairingCategory = 'snacks'; // Or 'cheese' if you add it
                reason = 'Balances acidity & tannins.';
            } else if (category.toLowerCase().includes('gin')) {
                pairingCategory = 'mixers';
                reason = 'The essential botanical uplift.';
            }

            const { data: suggestions } = await supabase
                .from('products')
                .select('id, name, price, image_url')
                .ilike('category', `%${pairingCategory}%`)
                .limit(2);

            if (!suggestions) return [];

            return suggestions.map(s => ({
                id: s.id,
                name: s.name,
                price: s.price,
                image_url: s.image_url,
                reason
            }));

        } catch (err) {
            console.error("Sommelier Node Link Failure:", err);
            return [];
        }
    }
}

export const NeuralSommelier = SommelierEngine.getInstance();
