import { supabase } from '../supabaseClient';

/**
 * APEX OS: ROUTING ENGINE
 * Orchestrates communication with professional routing providers (Google Routes API).
 */

export interface ApexLatLng {
    latitude: number;
    longitude: number;
}

export interface ApexRoute {
    provider: 'google' | 'mapbox';
    distanceMeters: number;
    distanceKm: number;
    durationSeconds: number;
    durationMinutes: number;
    encodedPolyline: string;
    trafficAware: boolean;
    confidence: number;
    alternatives: {
        distanceMeters: number;
        durationSeconds: number;
        encodedPolyline: string;
    }[];
    calculatedAt: string;
}

class RoutingEngine {
    private static instance: RoutingEngine;
    private apiKey: string | undefined;

    private constructor() {
        this.apiKey = process.env.GOOGLE_MAPS_API_KEY;
    }

    public static getInstance(): RoutingEngine {
        if (!RoutingEngine.instance) {
            RoutingEngine.instance = new RoutingEngine();
        }
        return RoutingEngine.instance;
    }

    /**
     * Computes the fastest motorcycle route between two points.
     */
    public async computeFastestRoute(origin: ApexLatLng, destination: ApexLatLng): Promise<ApexRoute> {
        if (!this.apiKey) {
            throw new Error("APEX_OS_ROUTING: GOOGLE_MAPS_API_KEY is missing from environment.");
        }

        try {
            const response = await fetch(
                "https://routes.googleapis.com/directions/v2:computeRoutes",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "X-Goog-Api-Key": this.apiKey,
                        "X-Goog-FieldMask": "routes.distanceMeters,routes.duration,routes.polyline.encodedPolyline,routes.optimizedIntermediateWaypointIndex"
                    },
                    body: JSON.stringify({
                        origin: {
                            location: { latLng: { latitude: origin.latitude, longitude: origin.longitude } }
                        },
                        destination: {
                            location: { latLng: { latitude: destination.latitude, longitude: destination.longitude } }
                        },
                        travelMode: "TWO_WHEELER",
                        routingPreference: "TRAFFIC_AWARE_OPTIMAL",
                        computeAlternativeRoutes: true,
                        units: "METRIC"
                    })
                }
            );

            if (!response.ok) {
                const error = await response.text();
                throw new Error(`PROVIDER_FAILURE: ${error}`);
            }

            const data = await response.json();
            if (!data.routes || data.routes.length === 0) {
                throw new Error("NO_ROUTE_FOUND: No viable road path identified.");
            }

            return this.normalizeRoute(data.routes[0]);

        } catch (err) {
            console.error("❌ [ROUTING_ENGINE] Route calculation failed:", err);
            throw err;
        }
    }

    private normalizeRoute(googleRoute: { distanceMeters: number, duration: string, polyline: { encodedPolyline: string } }): ApexRoute {
        const distanceMeters = googleRoute.distanceMeters ?? 0;
        const durationSeconds = parseInt(String(googleRoute.duration ?? "0s").replace("s", ""));

        return {
            provider: 'google',
            distanceMeters,
            distanceKm: distanceMeters / 1000,
            durationSeconds,
            durationMinutes: durationSeconds / 60,
            encodedPolyline: googleRoute.polyline?.encodedPolyline ?? "",
            trafficAware: true,
            confidence: 90, // Baseline for TRAFFIC_AWARE_OPTIMAL
            alternatives: [],
            calculatedAt: new Date().toISOString()
        };
    }

    /**
     * Persists a calculated route to the database for performance tracking.
     */
    public async logRoute(orderId: number, riderPhone: string | null, route: ApexRoute) {
        if (!supabase) return;

        await supabase.from('delivery_routes').insert([{
            order_id: orderId,
            rider_phone: riderPhone,
            distance_meters: route.distanceMeters,
            duration_seconds: route.durationSeconds,
            encoded_polyline: route.encodedPolyline,
            route_confidence: route.confidence,
            planned_at: route.calculatedAt
        }]);
    }
}

export const ApexRouter = RoutingEngine.getInstance();
