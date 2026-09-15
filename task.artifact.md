# Tasks - Apex OS Delivery & Dispatch Intelligence 🏍️📦🚀

## Phase 1: Fleet Infrastructure
- [x] Create `supabase/migrations/20260918_apex_dispatch_core.sql`
- [x] Add coordinate columns to `orders` and `profiles`
- [x] Establish `rider_vehicles` and `fuel_logs` tables

## Phase 2: Routing Engine (Google Nodes)
- [x] Implement `lib/engines/routingEngine.ts` (Google Routes API)
- [x] Build `lib/utils/geocoding.ts` for address-to-coordinate conversion
- [x] Implement `ApexRoute` standard normalization

## Phase 3: Dispatch & Scorer
- [x] Implement `lib/engines/dispatchEngine.ts` (Weighted Scorer)
- [x] Implement `computeRouteMatrix` integration (Rank candidates)
- [x] Build `lib/engines/fuelEngine.ts` (Efficiency Model)

## Phase 4: Admin Visuals
- [x] Update `LiveDispatchMap.tsx` with Polyline rendering support
- [x] Add Route Confidence HUD to the Dispatch dashboard
- [x] Create `/api/dispatch/calculate` endpoint

## Phase 5: Verification & Calibration
- [x] Run `npm run lint` and `npm run build`
- [x] Calibrate dispatch weights (ETA vs. Workload)
- [x] Push to GitHub
