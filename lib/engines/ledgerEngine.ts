import { supabase } from '../supabaseClient';

/**
 * ONLINE BAR: LEDGER ENGINE
 * Processes mathematical movements of money between accounts.
 */

interface LedgerEntry {
    accountId: string;
    amount: number;
}

/**
 * Executes a atomic double-entry transaction
 */
export async function recordTransaction(
    referenceType: 'ORDER' | 'WITHDRAWAL' | 'REFUND' | 'ADJUSTMENT',
    referenceId: string,
    description: string,
    entries: LedgerEntry[],
    metadata: Record<string, unknown> = {}
) {
    if (!supabase) return;

    // 1. Integrity Check: Sum must be ZERO (Double-Entry rule)
    // Actually, in our "positive/negative" simplified model, the sum should be zero
    // e.g., +1000 from customer, -800 to merchant, -150 to rider, -50 to platform fees = 0
    const balanceCheck = entries.reduce((sum, e) => sum + e.amount, 0);
    if (Math.abs(balanceCheck) > 0.01) {
        throw new Error(`🛑 Ledger Integrity Violation: Transaction sum is ${balanceCheck}, not zero.`);
    }

    // 2. Create Transaction Header
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

    // 3. Create Entries
    const { error: entriesError } = await supabase
        .from('ledger_entries')
        .insert(entries.map(e => ({
            transaction_id: tx.id,
            account_id: e.accountId,
            amount: e.amount
        })));

    if (entriesError) throw entriesError;

    return tx.id;
}

/**
 * Automated Order Settlement
 * Splits order total into Platform, Merchant, and Rider accounts.
 */
export async function settleOrder(orderId: number, totalAmount: number, merchantId: string, riderPhone: string) {
    const PLATFORM_FEE_PCT = 0.10; // 10%
    const PAYMENT_FEE_PCT = 0.03;  // 3% (Estimated)
    const RIDER_FIXED_FEE = 150;   // KSh 150

    const paymentFees = totalAmount * PAYMENT_FEE_PCT;
    const platformCut = (totalAmount * PLATFORM_FEE_PCT) - paymentFees;
    const merchantShare = totalAmount - platformCut - RIDER_FIXED_FEE - paymentFees;

    await recordTransaction(
        'ORDER',
        orderId.toString(),
        `Order settlement for #${orderId}`,
        [
            { accountId: 'CUSTOMER_PAYMENT_CLEARING', amount: totalAmount }, // Total inflow
            { accountId: `MERCHANT_PAYABLE_${merchantId}`, amount: -merchantShare }, // Out to merchant
            { accountId: `RIDER_WALLET_${riderPhone}`, amount: -RIDER_FIXED_FEE }, // Out to rider
            { accountId: 'PLATFORM_REVENUE', amount: -platformCut }, // Remaining to platform
            { accountId: 'PAYMENT_GATEWAY_FEES', amount: -paymentFees } // Out to provider
        ]
    );
}
