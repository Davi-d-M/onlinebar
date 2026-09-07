import { supabase } from '../supabaseClient';
import { v4 as uuidv4 } from 'uuid';

/**
 * ONLINE BAR: TRUST SERVICE
 * Manages the Product Passport system and anti-counterfeit logic.
 */

export interface BottlePassport {
    id: string;
    product_name: string;
    batch_number: string;
    manufactured_at: string;
    authorized_distributor: string;
    current_status: 'Verified' | 'Flagged' | 'Compromised';
    scan_count: number;
    last_scan_city?: string;
}

/**
 * Verifies a bottle ID and checks for scan anomalies.
 */
export async function verifyBottle(bottleId: string, metadata: { userId?: string, ip: string, city: string, deviceInfo: string }) {
    if (!supabase) return { valid: false, error: 'System Offline' };

    try {
        // 1. Fetch Passport
        const { data: passport, error: fetchError } = await supabase
            .from('bottle_passports')
            .select('*, products(name)')
            .eq('id', bottleId)
            .single();

        if (fetchError || !passport) {
            return { valid: false, error: 'Identifier could not be verified in the Online Bar registry.' };
        }

        // 2. Check for Anomaly (Simultaneous scans in different cities)
        const { data: recentScans } = await supabase
            .from('verification_scans')
            .select('city_coarse, timestamp')
            .eq('bottle_id', bottleId)
            .order('timestamp', { ascending: false })
            .limit(1);

        let isAnomaly = false;
        let anomalyReason = '';

        if (recentScans && recentScans.length > 0) {
            const lastScan = recentScans[0];
            const timeDiffMin = (Date.now() - new Date(lastScan.timestamp).getTime()) / 60000;

            if (lastScan.city_coarse !== metadata.city && timeDiffMin < 60) {
                isAnomaly = true;
                anomalyReason = `Detected scan in ${metadata.city} only ${Math.round(timeDiffMin)}m after scan in ${lastScan.city_coarse}. Physical duplication suspected.`;
            }
        }

        // 3. Log Scan
        await supabase.from('verification_scans').insert([{
            bottle_id: bottleId,
            user_id: metadata.userId,
            ip_address: metadata.ip,
            city_coarse: metadata.city,
            device_info: metadata.deviceInfo || 'Authorized Terminal',
            is_anomaly: isAnomaly,
            anomaly_reason: anomalyReason
        }]);

        // 4. Create Alert if Anomaly
        if (isAnomaly) {
            await supabase.from('trust_alerts').insert([{
                bottle_id: bottleId,
                severity: 'Critical',
                description: anomalyReason
            }]);
        }

        // 5. Fetch Full History
        const { data: events } = await supabase
            .from('bottle_events')
            .select('*')
            .eq('bottle_id', bottleId)
            .order('timestamp', { ascending: true });

        return {
            valid: true,
            isAnomaly,
            passport: {
                ...passport,
                product_name: passport.products.name
            },
            history: events || []
        };

    } catch (err) {
        console.error("Trust Verification Error:", err);
        return { valid: false, error: 'Verification sequence interrupted.' };
    }
}

/**
 * Initializes a new bottle passport in the registry.
 */
export async function registerBottle(productId: number, batch: string, manufacturer: string, distributor: string) {
    if (!supabase) return null;

    const bottleId = `OB-KE-${uuidv4().substring(0, 8).toUpperCase()}`;

    const { data, error } = await supabase.from('bottle_passports').insert([{
        id: bottleId,
        product_id: productId,
        batch_number: batch,
        origin_manufacturer: manufacturer,
        authorized_distributor: distributor,
        manufactured_at: new Date().toISOString()
    }]).select().single();

    if (error) throw error;

    // Log Initial Event
    await supabase.from('bottle_events').insert([{
        bottle_id: bottleId,
        event_type: 'MANUFACTURED',
        location_label: manufacturer,
        actor_label: 'Factory Node'
    }]);

    return data;
}
