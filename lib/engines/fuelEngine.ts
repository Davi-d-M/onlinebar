/**
 * APEX OS: FUEL CONSUMPTION ENGINE
 * Sophisticated model to estimate and audit vehicle operating costs.
 */

interface FuelModelInput {
    distanceKm: number;
    baseKmPerLitre: number;
    trafficFactor: number;
    loadFactor: number;
    fuelPricePerLitre: number;
}

export interface FuelEstimate {
    litres: number;
    costKsh: number;
    efficiency: number;
}

class FuelEngine {
    private static instance: FuelEngine;

    private constructor() {}

    public static getInstance(): FuelEngine {
        if (!FuelEngine.instance) {
            FuelEngine.instance = new FuelEngine();
        }
        return FuelEngine.instance;
    }

    /**
     * Estimates fuel requirements based on vehicle profile and mission context.
     */
    public calculateEstimate(input: FuelModelInput): FuelEstimate {
        // Effective efficiency decreases as factors increase
        const effectiveEfficiency = input.baseKmPerLitre / (input.trafficFactor * input.loadFactor);

        const litres = input.distanceKm / effectiveEfficiency;
        const costKsh = litres * input.fuelPricePerLitre;

        return {
            litres: Number(litres.toFixed(3)),
            costKsh: Math.round(costKsh),
            efficiency: Number(effectiveEfficiency.toFixed(2))
        };
    }

    /**
     * Calibrates the vehicle model using observed historical data.
     * actualEfficiency = actualKm / actualLitres
     */
    public calibrateProfile(previousEstimate: number, observedActual: number): number {
        // Simple moving average or weighted correction
        return (previousEstimate * 0.7) + (observedActual * 0.3);
    }
}

export const ApexFuel = FuelEngine.getInstance();
