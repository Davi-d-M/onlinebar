import { supabase } from '../supabaseClient';
import { ApexLatLng, ApexRouter } from './routingEngine';
import { ApexFuel } from './fuelEngine';

/**
 * APEX OS: DISPATCH ENGINE
 * The central brain for automated rider selection and mission orchestration.
 */

export interface DispatchCandidate {
    riderPhone: string;
    riderName: string;
    etaMinutes: number;
    distanceKm: number;
    status: string;
    activeOrders: number;
    rating: number;
    reliabilityScore: number;
    estimatedFuelCost: number;
    score?: number;
}

class DispatchEngine {
    private static instance: DispatchEngine;

    private constructor() {}

    public static getInstance(): DispatchEngine {
        if (!DispatchEngine.instance) {
            DispatchEngine.instance = new DispatchEngine();
        }
        return DispatchEngine.instance;
    }

    /**
     * Orchestrates the high-speed search for the best rider node.
     */
    public async findOptimalRider(orderId: number, destination: ApexLatLng): Promise<DispatchCandidate | null> {
        if (!supabase) return null;

        // 0. Fetch Order Context (Hub Source)
        const { data: order } = await supabase.from('orders').select('hub_id').eq('id', orderId).single();
        const hubId = order?.hub_id;

        // 1. Fetch Hub Location
        let hubLoc: ApexLatLng = { latitude: -1.2841, longitude: 36.8155 }; // Default Nairobi
        if (hubId) {
            const { data: hub } = await supabase.from('hubs').select('latitude, longitude').eq('id', hubId).single();
            if (hub) hubLoc = { latitude: Number(hub.latitude), longitude: Number(hub.longitude) };
        }

        // 1.5 Fetch Candidates (Online Riders)
        const { data: onlineRiders } = await supabase
            .from('rider_status')
            .select(`
                *,
                rider_vehicles(*)
            `)
            .neq('status', 'Offline')
            .limit(20);

        if (!onlineRiders || onlineRiders.length === 0) return null;

        // 2. Compute Route Matrix (High Speed Comparison)
        const candidates = await this.rankCandidates(onlineRiders, destination, hubLoc);

        // 3. Log Dispatch Logic for Audit
        const winner = candidates[0];
        await supabase.from('dispatch_intelligence_logs').insert([{
            order_id: orderId,
            candidates: candidates,
            selected_rider_phone: winner.riderPhone,
            selection_reason: `Best Apex Score: ${winner.score?.toFixed(2)}`
        }]);

        return winner;
    }

    /**
     * Identifies pending orders that can be batched for a single rider node.
     */
    public async identifyBatchOpportunities() {
        if (!supabase) return [];

        const { data: pending } = await supabase
            .from('orders')
            .select('id, customer_lat, customer_lng, area_zone, created_at')
            .eq('status', 'Pending')
            .is('batch_id', null)
            .order('created_at', { ascending: true });

        if (!pending || pending.length < 2) return [];

        const batches: Array<{ ids: number[], area: string }> = [];
        const processed = new Set<number>();

        for (let i = 0; i < pending.length; i++) {
            if (processed.has(pending[i].id)) continue;

            const cluster = [pending[i].id];
            const area = pending[i].area_zone;

            for (let j = i + 1; j < pending.length; j++) {
                if (processed.has(pending[j].id)) continue;

                // Neural Distance Check (< 1.5km proximity)
                const dist = this.calculateStraightDistance(
                    { lat: Number(pending[i].customer_lat), lng: Number(pending[i].customer_lng) },
                    { lat: Number(pending[j].customer_lat), lng: Number(pending[j].customer_lng) }
                );

                if (dist < 1.5) {
                    cluster.push(pending[j].id);
                    processed.add(pending[j].id);
                    if (cluster.length >= 3) break; // Cap at 3 per batch
                }
            }

            if (cluster.length > 1) {
                batches.push({ ids: cluster, area });
                processed.add(pending[i].id);
            }
        }

        return batches;
    }

    private calculateStraightDistance(p1: { lat: number, lng: number }, p2: { lat: number, lng: number }): number {
        const R = 6371; // Earth radius in km
        const dLat = (p2.lat - p1.lat) * Math.PI / 180;
        const dLng = (p2.lng - p1.lng) * Math.PI / 180;
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                  Math.cos(p1.lat * Math.PI / 180) * Math.cos(p2.lat * Math.PI / 180) *
                  Math.sin(dLng / 2) * Math.sin(dLng / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }

    private async rankCandidates(riders: Array<{
        rider_phone: string,
        rider_name: string,
        lat: number,
        lng: number,
        status: string,
        rating: number,
        acceptance_rate: number,
        rider_vehicles: Array<{ avg_km_per_l: number, traffic_factor: number, load_factor: number, fuel_price_l: number }>
    }>, destination: ApexLatLng, hubLoc: ApexLatLng): Promise<DispatchCandidate[]> {
        const results: DispatchCandidate[] = [];

        for (const rider of riders) {
            try {
                // 1. Calculate Rider -> Hub (Pickup leg)
                const pickupRoute = await ApexRouter.computeFastestRoute(
                    { latitude: rider.lat || -1.2841, longitude: rider.lng || 36.8155 },
                    hubLoc
                );

                // 2. Calculate Hub -> Customer (Delivery leg)
                const deliveryRoute = await ApexRouter.computeFastestRoute(hubLoc, destination);

                const totalDistKm = pickupRoute.distanceKm + deliveryRoute.distanceKm;
                const totalDurationMin = pickupRoute.durationMinutes + deliveryRoute.durationMinutes;

                const vehicle = rider.rider_vehicles?.[0] || { avg_km_per_l: 40, traffic_factor: 1.15, load_factor: 1.05, fuel_price_l: 190 };
                const fuel = ApexFuel.calculateEstimate({
                    distanceKm: totalDistKm,
                    baseKmPerLitre: vehicle.avg_km_per_l,
                    trafficFactor: vehicle.traffic_factor,
                    loadFactor: vehicle.load_factor,
                    fuelPricePerLitre: vehicle.fuel_price_l
                });

                const candidate: DispatchCandidate = {
                    riderPhone: rider.rider_phone,
                    riderName: rider.rider_name,
                    etaMinutes: totalDurationMin,
                    distanceKm: totalDistKm,
                    status: rider.status,
                    activeOrders: 0, // Should be fetched from active missions
                    rating: rider.rating || 5.0,
                    reliabilityScore: rider.acceptance_rate / 20 || 5.0, // Normalize to 5
                    estimatedFuelCost: fuel.costKsh
                };

                candidate.score = this.calculateApexScore(candidate);
                results.push(candidate);

            } catch (err) {
                console.warn(`⚠️ [DISPATCH] Skipping rider ${rider.rider_name}: ${err}`);
            }
        }

        return results.sort((a, b) => (a.score || 0) - (b.score || 0));
    }

    /**
     * The Proprietary Apex Dispatch Algorithm
     * Lower score = Higher Suitability
     */
    private calculateApexScore(r: DispatchCandidate): number {
        let score = 0;

        score += r.etaMinutes * 5;      // ⚡ ETA is highest priority
        score += r.distanceKm * 2;      // 📏 Road distance
        score += r.activeOrders * 15;   // 📊 Workload (High penalty)
        score += r.estimatedFuelCost * 0.1; // 💰 Operating cost

        score += (5 - r.reliabilityScore) * 20; // 🤝 Trust penalty
        score += (5 - r.rating) * 10;           // ⭐ Rating penalty

        return score;
    }
}

export const DispatchControl = DispatchEngine.getInstance();
