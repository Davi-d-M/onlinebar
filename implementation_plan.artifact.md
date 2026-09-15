# Implementation Plan - Content Command Center 📣🔌👀

This plan establishes a unified "Content Command Center" for the Online Bar OS, allowing for professional multi-channel publishing, live previews, and automated scheduling while completing the "Gold on White" aesthetic overhaul.

## User Review Required

> [!IMPORTANT]
> **Unified Adapters**: All social platforms (Meta, TikTok, X, etc.) will be managed through a single server-side `SocialPublisher` engine. Credentials will be encrypted at rest and never exposed to the client.
> **External Deletion**: The system will attempt to delete posts from external platforms where the API supports it. If unsupported, the UI will provide manual instructions.
> **Aesthetic Purge**: I am completing the removal of all `bg-slate-900` and dark background nodes. The system will pivot to a clean, light-filled layout.

## Proposed Changes

### 🗄️ 1. Database: Social Grid Schema

#### [NEW] `supabase/migrations/20260922_content_command_core.sql`
- **`social_accounts`**: Tracks connected profiles (platform, status, account metadata).
- **`content_master`**: The source of truth for a post (Title, Base Narrative, Master Assets).
- **`content_platform_variants`**: Platform-specific adaptations (IG Caption, TikTok Hook, X Thread).
- **`publishing_queue`**: Job queue for the server-side worker.
- **`content_audit_log`**: Traceability for all create/edit/delete actions.

---

### 🏛️ 2. Core: Universal Social Adapter

#### [NEW] `lib/engines/contentCommandEngine.ts`
- Orchestrates the creation of Master Content and its platform-specific variants.
- Handles soft-deletes and external sync protocols.

#### [NEW] `lib/adapters/social/`
- Modular adapters for **TikTok**, **YouTube**, **X**, **Snapchat**, **LinkedIn**, and **Pinterest**.
- Each adapter implements the `BaseSocialAdapter` interface (connect, publish, delete, getMetrics).

---

### 📱 3. UI/UX: Content Command Hub

#### [NEW] `app/admin/(dashboard)/content/page.tsx`
- The central dashboard for creating and managing all platform content.

#### [NEW] `components/admin/content/PreviewStudio.tsx`
- Real-time "Look & Feel" simulation for every connected channel.

#### [NEW] `components/admin/content/ChannelConnector.tsx`
- A single hub to manage OAuth connections and integration health.

---

### 🎨 4. Aesthetic Finalization (Gold on White)

#### [MODIFY] Global Sweep
- Replace remaining `bg-slate-900` instances in Admin Pulse, Operations, and Affiliate dashboards.
- Ensure 100% border consistency (`border-slate-100`) for cards on light backgrounds.

---

## Verification Plan

### Automated Tests
- `npm run build`: Verify 100% route success.
- Adapter Test: Verify that a `POST` to the TikTok adapter correctly initializes the state machine.

### Manual Verification
1.  **Creation Flow**: Create a "Master Post," adapt it for IG and X, and verify both variants appear in the "Preview Studio."
2.  **Deletion Sync**: Delete a post and verify it is removed from the local grid and queued for external deletion.
3.  **Aesthetic Audit**: Confirm zero dark-background nodes across the entire Admin Control Tower.
