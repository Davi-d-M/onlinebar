# Implementation Plan - Apex OS Delivery & Dispatch Intelligence 🏍️📦🚀

This plan establishes "Apex OS," a professional-grade dispatch brain that optimizes motorcycle fleet operations using real-time routing, traffic-aware ETAs, and smart fuel models.

## User Review Required

> [!IMPORTANT]
> **Google Routes API**: This system requires a `GOOGLE_MAPS_API_KEY` with the "Routes API" and "Distance Matrix API" enabled. The `TWO_WHEELER` travel mode is used for motorcycle-specific routing.
> **Coordinates**: Orders must capture precision GPS coordinates for both the pickup (cellar) and the customer terminal for the routing engine to function.

## Proposed Changes

### 🗄️ 1. Database: Dispatch & Fleet Schema

#### [NEW] `supabase/migrations/20260918_apex_dispatch_core.sql`
- **`rider_vehicles`**: Detailed motorcycle profiles (Make, Model, Tank Capacity, Average Km/L).
- **`delivery_routes`**: Persistent storage for road geometry (encoded polylines) and traffic-aware performance data.
- **`dispatch_intelligence_logs`**: Audit trail of the dispatch scoring algorithm's decisions.

---

### ⚙️ 2. The Apex Dispatch Engine

#### [NEW] `lib/engines/routingEngine.ts`
- **Google Routes Node**: Server-side wrapper for `computeRoutes` with `TRAFFIC_AWARE_OPTIMAL` support.
- **Route Normalization**: Converts provider-specific responses into the standardized `ApexRoute` object.

#### [NEW] `lib/engines/dispatchEngine.ts`
- **Route Matrix Node**: Compares multiple riders against a destination using Google's `computeRouteMatrix`.
- **Dynamic Dispatch Scorer**: Implements a weighted scoring algorithm (ETA, Distance, Workload, Reliability).

#### [NEW] `lib/engines/fuelEngine.ts`
- **Consumption Model**: Estimates fuel usage (Litres & KSh) based on distance, traffic factor, and vehicle efficiency.

---

### 📱 3. Terminal & Admin Integration

#### [MODIFY] [LiveDispatchMap.tsx](file:///C:/Users/hp/AndroidStudioProjects/onbar/components/admin/dispatch/LiveDispatchMap.tsx)
- Add support for rendering **Encoded Polylines** on the map to visualize the rider's planned path.
- Display "Route Confidence" and "Traffic Density" overlays.

#### [NEW] `app/api/dispatch/route-matrix/route.ts`
- API endpoint for high-speed multi-rider comparison.

---

## Verification Plan

### Automated Tests
- `npm run build`: Verify 100% route success.
- Score Test: Verify that a rider with a 5-minute ETA wins over a rider with a 15-minute ETA (all other factors being equal).

### Manual Verification
1.  **Route Calculation**: Place a test order and verify that Apex OS generates a road-aware distance (e.g., 8.4km) rather than a straight line.
2.  **Rider Match**: Simulate 3 active riders and verify that the "Best Rider" is selected based on the dispatch score.
3.  **Fuel Audit**: Complete a delivery and verify that the estimated fuel cost (e.g., ~KSh 40) is logged in the route analytics.
