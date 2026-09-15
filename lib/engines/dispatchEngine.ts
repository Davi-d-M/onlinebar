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

        // 1. Fetch Candidates (Online Riders)
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
        // For now, we simulate or call Google Route Matrix if API KEY present
        const candidates = await this.rankCandidates(onlineRiders, destination);

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

    private async rankCandidates(riders: Array<{
        rider_phone: string,
        rider_name: string,
        lat: number,
        lng: number,
        status: string,
        rating: number,
        acceptance_rate: number,
        rider_vehicles: Array<{ avg_km_per_l: number, traffic_factor: number, load_factor: number, fuel_price_l: number }>
    }>, destination: ApexLatLng): Promise<DispatchCandidate[]> {
        const results: DispatchCandidate[] = [];

        for (const rider of riders) {
            try {
                // Simplified: Fetch direct route for each candidate (Route Matrix API would be more efficient for >5 riders)
                const route = await ApexRouter.computeFastestRoute(
                    { latitude: rider.lat || -1.2841, longitude: rider.lng || 36.8155 },
                    destination
                );

                const vehicle = rider.rider_vehicles?.[0] || { avg_km_per_l: 40, traffic_factor: 1.15, load_factor: 1.05, fuel_price_l: 190 };
                const fuel = ApexFuel.calculateEstimate({
                    distanceKm: route.distanceKm,
                    baseKmPerLitre: vehicle.avg_km_per_l,
                    trafficFactor: vehicle.traffic_factor,
                    loadFactor: vehicle.load_factor,
                    fuelPricePerLitre: vehicle.fuel_price_l
                });

                const candidate: DispatchCandidate = {
                    riderPhone: rider.rider_phone,
                    riderName: rider.rider_name,
                    etaMinutes: route.durationMinutes,
                    distanceKm: route.distanceKm,
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
