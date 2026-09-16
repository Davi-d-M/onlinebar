import { supabase } from '../supabaseClient';

/**
 * APEX OS: PRODUCT KNOWLEDGE ENGINE v2
 * Central orchestrator for the Kenya Master Beverage Catalogue.
 * Handles hierarchy, dossiers, and multi-source research data.
 */

export interface SensoryDNA {
    sweetness: number;
    body: number;
    oak: number;
    smoke: number;
    intensity: number;
    acidity: number;
    tannin: number;
    bitterness: number;
}

export interface ProductDossier {
    id: string;
    product_id: number;
    brand_id?: string;
    category_v2_id?: string;
    brand_identity: string;
    producer_name: string;
    country_of_origin: string;
    region_of_origin: string;
    abv_actual: string;
    volume_ml: number;
    sensory_dna: SensoryDNA;
    origin_story: string;
    production_method: string;
    serving_temp: string;
    recommended_glassware: string;
    constituents_statement?: string;
    kenyan_availability_status: 'AVAILABLE' | 'OUT_OF_STOCK' | 'DISCONTINUED';
    source_verification: Record<string, 'MANUFACTURER' | 'EDITORIAL' | 'TECHNICAL' | 'UNKNOWN'>;
    media?: Array<{
        media_type: string;
        title: string;
        source_url: string;
    }>;
}

export interface CategoryNode {
    id: string;
    name: string;
    slug: string;
    parent_id?: string | null;
    children?: CategoryNode[];
}

class ProductKnowledgeEngine {
    private static instance: ProductKnowledgeEngine;

    private constructor() {}

    public static getInstance(): ProductKnowledgeEngine {
        if (!ProductKnowledgeEngine.instance) {
            ProductKnowledgeEngine.instance = new ProductKnowledgeEngine();
        }
        return ProductKnowledgeEngine.instance;
    }

    /**
     * Retrieves the complete dossier for a specific beverage SKU.
     */
    public async getDossier(productId: number): Promise<ProductDossier | null> {
        if (!supabase) return null;

        try {
            const { data: dossier, error } = await supabase
                .from('product_dossiers')
                .select('*, product_media_hub(*)')
                .eq('product_id', productId)
                .single();

            if (error || !dossier) return null;

            return {
                ...dossier,
                media: dossier.product_media_hub
            };

        } catch (err) {
            console.error("Dossier Link Failure:", err);
            return null;
        }
    }

    /**
     * Fetches the entire Category hierarchy for the master catalogue.
     */
    public async getCategoryHierarchy(): Promise<CategoryNode[]> {
        if (!supabase) return [];
        try {
            const { data } = await supabase.from('product_categories_v2').select('*');
            if (!data) return [];

            const nodes: CategoryNode[] = data;
            const map: Record<string, CategoryNode> = {};
            nodes.forEach(node => { map[node.id] = { ...node, children: [] }; });

            const root: CategoryNode[] = [];
            nodes.forEach(node => {
                if (node.parent_id && map[node.parent_id]) {
                    map[node.parent_id].children?.push(map[node.id]);
                } else {
                    root.push(map[node.id]);
                }
            });

            return root;
        } catch { return []; }
    }

    /**
     * Generates a sensory "Signature" label based on the DNA.
     */
    public getSensorySignature(dna: SensoryDNA, category: string): string {
        const isWine = category.toLowerCase().includes('wine');

        if (isWine) {
            if (dna.tannin > 70) return 'Bold & Structured';
            if (dna.acidity > 70) return 'Crisp & Vibrant';
            return 'Balanced & Elegant';
        }

        if (dna.smoke > 60) return 'Smoky & Intense';
        if (dna.oak > 60) return 'Rich & Oaked';
        if (dna.sweetness > 60) return 'Sweet & Smooth';

        return 'Clean & Precise';
    }
}

export const ApexKnowledge = ProductKnowledgeEngine.getInstance();
