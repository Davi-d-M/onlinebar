import { supabase } from '../supabaseClient';

/**
 * ONLINE BAR: FINANCE ENGINE
 * Handles double-entry accounting, tax calculation, and inventory valuation.
 */

interface Entry {
    accountCode: string;
    amount: number; // Positive = Credit, Negative = Debit
}

/**
 * Executes a strictly balanced double-entry transaction.
 * Sum of all entries MUST be zero.
 */
export async function recordDoubleEntry(
    referenceType: 'ORDER' | 'PO' | 'PAYMENT' | 'EXPENSE' | 'ADJUSTMENT',
    referenceId: string,
    description: string,
    entries: Entry[],
    metadata: Record<string, unknown> = {}
) {
    if (!supabase) return;

    // 1. Balance Check
    const sum = entries.reduce((s, e) => s + e.amount, 0);
    if (Math.abs(sum) > 0.001) {
        throw new Error(`🛑 Finance OS: Integrity Violation. Transaction sum is ${sum}, not zero.`);
    }

    // 2. Transaction Hub
    const { data: tx, error: txError } = await supabase
        .from('ledger_transactions')
        .insert([{
            reference_type: referenceType,
            reference_id: referenceId,
            description,
            metadata
        }])
        .select()
        .single();

    if (txError) throw txError;

    // 3. Entries Relay
    // Map account codes to the existing account IDs in ledger_accounts or just use codes as IDs
    // For this hardened OS, we assume account codes ARE the IDs for simplicity and speed.
    const { error: entriesError } = await supabase
        .from('ledger_entries')
        .insert(entries.map(e => ({
            transaction_id: tx.id,
            account_id: e.accountCode, // Using codes as identifiers
            amount: e.amount
        })));

    if (entriesError) throw entriesError;

    return tx.id;
}

/**
 * Calculates VAT and Excise based on current active configuration.
 */
export async function calculateOrderTaxes(netAmount: number, category: string) {
    if (!supabase) return { vat: 0, excise: 0 };

    const { data: configs } = await supabase
        .from('tax_configurations')
        .select('*')
        .eq('is_active', true);

    const vatRate = configs?.find(c => c.tax_name === 'VAT')?.rate_percent || 16;
    const vat = netAmount * (vatRate / 100);

    // Dynamic Excise (e.g. Wine vs Spirit)
    const exciseKey = `EXCISE_${category.toUpperCase()}`;
    const exciseRate = configs?.find(c => c.tax_name === exciseKey)?.rate_percent || 0;
    const excise = netAmount * (exciseRate / 100);

    return { vat, excise, total: netAmount + vat + excise };
}

/**
 * Inventory Valuation: Weighted Average Costing (WAC)
 * Triggered on new stock arrival (Purchase).
 */
export async function updateWeightedAverageCost(productId: number, newQty: number, newUnitCost: number) {
    if (!supabase) return;

    const { data: product } = await supabase
        .from('products')
        .select('stock, cost_price')
        .eq('id', productId)
        .single();

    if (!product) return;

    const currentQty = product.stock || 0;
    const currentWAC = product.cost_price || 0;

    const totalQty = currentQty + newQty;
    const totalCost = (currentQty * currentWAC) + (newQty * newUnitCost);
    const updatedWAC = totalQty > 0 ? totalCost / totalQty : newUnitCost;

    await supabase
        .from('products')
        .update({ cost_price: updatedWAC })
        .eq('id', productId);
}
