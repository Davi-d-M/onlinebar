import { supabase } from '../supabaseClient';
import { recordDoubleEntry } from './financeEngine';

/**
 * ONLINE BAR: AFFILIATE ENGINE
 * Manages attributions, commissions, and partner payouts.
 */

export interface AffiliateCommissionRule {
    category: string;
    rate_percent: number;
}

const DEFAULT_COMMISSION_RATE = 5; // 5% base

/**
 * Attributes an order to an affiliate and records pending commission.
 */
export async function attributeAffiliateOrder(orderId: number, referralCode: string, totalAmount: number) {
    if (!supabase) return;

    try {
        // 1. Identify Affiliate
        const { data: affiliate } = await supabase
            .from('profiles')
            .select('id, referral_code')
            .eq('referral_code', referralCode)
            .single();

        if (!affiliate) return;

        // 2. Check if user is registered as a verified affiliate
        const { data: affStatus } = await supabase
            .from('affiliates')
            .select('verification_status, commission_rate_override')
            .eq('id', affiliate.id)
            .single();

        if (!affStatus || affStatus.verification_status !== 'Verified') return;

        // 3. Calculate Commission
        const rate = affStatus.commission_rate_override || DEFAULT_COMMISSION_RATE;
        const commissionAmount = (totalAmount * rate) / 100;

        // 4. Log to Affiliate Ledger (Pending)
        const { error } = await supabase
            .from('affiliate_ledger')
            .insert([{
                affiliate_id: affiliate.id,
                entry_type: 'COMMISSION',
                status: 'Pending',
                amount: commissionAmount,
                reference_id: `ORDER-${orderId}`,
                description: `Commission for Order #${orderId}`
            }]);

        if (error) throw error;

        // 5. Online Bar OS: Record Double-Entry in Master Ledger
        // Debit: Affiliate Commission Expense, Credit: Affiliate Payable
        await recordDoubleEntry(
            'ORDER',
            `AFF-${orderId}`,
            `Affiliate commission established for Order #${orderId}`,
            [
                { accountCode: '6100', amount: -commissionAmount }, // Expense (Debit)
                { accountCode: '2000', amount: commissionAmount }   // Payable (Credit)
            ]
        );

    } catch (err) {
        console.error("🛑 [AFFILIATE_ENGINE] Attribution Failed:", err);
    }
}

/**
 * Processes a payout request for an affiliate.
 */
export async function requestAffiliatePayout(affiliateId: string, amount: number) {
    if (!supabase) return;

    try {
        // 1. Verify Available Balance
        const { data: summary } = await supabase
            .from('affiliate_performance_summary')
            .select('available_earnings')
            .eq('affiliate_id', affiliateId)
            .single();

        if (!summary || (summary.available_earnings || 0) < amount) {
            throw new Error("Insufficient available earnings for payout.");
        }

        // 2. Record Payout in Ledger (Pending)
        const { error } = await supabase
            .from('affiliate_ledger')
            .insert([{
                affiliate_id: affiliateId,
                entry_type: 'PAYOUT',
                status: 'Pending',
                amount: -amount, // Negative as it's an outflow
                description: "Affiliate Payout Request"
            }]);

        if (error) throw error;

    } catch (err) {
        console.error("🛑 [AFFILIATE_ENGINE] Payout Request Failed:", err);
        throw err;
    }
}
