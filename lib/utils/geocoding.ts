/**
 * APEX OS: GEOCODING UTILITY
 * Converts physical addresses into precision GPS coordinates for dispatch.
 */

import { ApexLatLng } from "../engines/routingEngine";

export async function geocodeAddress(address: string): Promise<ApexLatLng | null> {
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    if (!apiKey) return null;

    try {
        const response = await fetch(
            `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${apiKey}`
        );

        if (!response.ok) return null;

        const data = await response.json();
        if (data.status === "OK" && data.results.length > 0) {
            const loc = data.results[0].geometry.location;
            return {
                latitude: loc.lat,
                longitude: loc.lng
            };
        }
    } catch (err) {
        console.error("❌ [GEOCODING] Failed to resolve address:", err);
    }

    return null;
}
