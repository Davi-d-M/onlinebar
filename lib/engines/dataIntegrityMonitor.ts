import { supabase } from '../supabaseClient';

/**
 * ONLINE BAR: DATA INTEGRITY MONITOR
 * Autonomous script to identify and flag data quality issues.
 */

export async function runIntegrityCheck() {
    if (!supabase) return;

    try {
        const issues = [];

        // 1. Check for Orphaned Orders (No order_items)
        const { data: orphanedOrders } = await supabase
            .from('orders')
            .select('id')
            .not('id', 'in', (await supabase.from('order_items').select('order_id')).data?.map(i => i.order_id) || []);

        if (orphanedOrders && orphanedOrders.length > 0) {
            issues.push({
                issue_type: 'ORPHANED_ORDER',
                severity: 'Warning',
                description: `Found ${orphanedOrders.length} orders with zero items logged.`,
                affected_count: orphanedOrders.length
            });
        }

        // 2. Check for Missing IDs in Analytics
        const { count: missingIdEvents } = await supabase
            .from('analytics_events')
            .select('*', { count: 'exact', head: true })
            .is('user_id', null)
            .is('anonymous_id', null);

        if (missingIdEvents && missingIdEvents > 0) {
            issues.push({
                issue_type: 'MISSING_ID',
                severity: 'Critical',
                description: `Found ${missingIdEvents} analytics events with no user or guest ID.`,
                affected_count: missingIdEvents
            });
        }

        // 3. Check for Duplicate Events (Simple same type/user/time check)
        // This would normally be a more complex query

        // Commit Issues to Data Quality Alerts table
        if (issues.length > 0) {
            await supabase.from('data_quality_alerts').upsert(issues);
            console.log(`[DATA_QUALITY] Integrity check complete. Found ${issues.length} potential issues.`);
        }

    } catch (err) {
        console.error("Data Integrity Check Failed:", err);
    }
}
