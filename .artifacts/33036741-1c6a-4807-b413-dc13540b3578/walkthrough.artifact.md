# Behavioral Tracking & Funnel Hardening Walkthrough

I have identified and resolved the issues preventing user journey data from being recorded in the database. The "Nairobi Bar Funnel" dashboard should now begin populating as users interact with the store.

## Changes Made

### 1. Database Layer (Supabase RLS Policies)
- **Problem**: Row Level Security (RLS) was active on analytics tables but lacked policies to allow guest users to insert data. This caused all client-side tracking calls to fail silently for non-logged-in users.
- **Solution**: Created a new migration (`tracking_hardening.sql`) that adds `INSERT` policies for both `anon` and `authenticated` roles on all critical tracking tables:
    - `analytics_events`
    - `customer_sessions` (also granted `UPDATE` for session syncing)
    - `session_forensics`
    - `onboarding_funnel_log`
    - `performance_telemetry`

### 2. Session Synchronization
- **Fix**: Updated the `OnlineBarOS.ts` controller to correctly map the `session_id` when inserting analytics events. Previously, events were being recorded without a session link, making it impossible to build a cohesive funnel view.

### 3. Application Robustness
- **OnlineBarOS**: Improved the `track` method with non-blocking logic and defensive error handling. A failure in one tracking node (e.g., forensics) will no longer interrupt the primary analytics flow.
- **AnalyticsTracker**: Added safety checks for `document`, `window`, and `sessionStorage` to ensure the tracker remains stable during SSR (Server-Side Rendering) or restricted browser environments.

## Verification

### Data Flow Strategy
> [!IMPORTANT]
> Because tracking relies on client-side events, you must browse the site as a user to generate data.
> 1. Visit the homepage (generates **Awareness**).
> 2. View a specific bottle (generates **Consideration**).
> 3. Enter the checkout page (generates **Intent**).

### How to Check Results
1.  **Wait for Cache**: The funnel API has a 5-minute cache (`revalidate = 300`). After browsing, wait a few minutes for the admin dashboard to refresh.
2.  **Verify via SQL**: You can check if data is landing by running this in Supabase Studio:
    ```sql
    SELECT event_name, session_id, count(*) FROM analytics_events GROUP BY 1, 2;
    ```

> [!TIP]
> I also fixed a bug where `session_id` was being generated but not stored in the actual event rows. Funnel reconstruction will now be much more accurate.
