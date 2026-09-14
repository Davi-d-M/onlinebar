# Implementation Plan - Omni-Channel Publishing Engine (Content Command) 🚀📲🍸

This plan establishes a professional-grade, multi-platform content orchestration system. It allows the Online Bar to create content once and publish/schedule it across Facebook, Instagram, TikTok, YouTube, LinkedIn, X, and WhatsApp, while maintaining a strict **Compliance Gate** for Kenyan alcohol advertising regulations.

## User Review Required

> [!CAUTION]
> **Compliance Protocol**: All scheduled and automated posts will enter a `PENDING_REVIEW` state by default. You must manually verify them in the Admin panel to comply with Kenyan (NACADA) alcohol advertising rules.
> **API Permissions**: Direct publishing to platforms like TikTok and YouTube requires your developer accounts to pass an official audit for public visibility.

## Proposed Changes

### 🧱 1. Content Command Studio (Refinement)

#### [MODIFY] [content/page.tsx](file:///C:/Users/hp/AndroidStudioProjects/onbar/app/admin/(dashboard)/growth/content/page.tsx)
- **Multimedia Uploader**: Add support for multiple image/video URLs.
- **AI Adaptation Engine**: Integrate actual prompt generation logic for platform-specific captions (IG Reels vs. WhatsApp Status).
- **Persistence**: Save the `master_content` and its `content_variants` to Supabase upon creation.

---

### 📅 2. Tactical Content Calendar

#### [MODIFY] [calendar/page.tsx](file:///C:/Users/hp/AndroidStudioProjects/onbar/app/admin/(dashboard)/growth/calendar/page.tsx)
- **Real-time Sync**: Fetch actual scheduled items from the `publishing_queue` table.
- **Interactive Nodes**: Allow clicking on a calendar day to see/edit/publish posts for that specific date.

---

### ⚙️ 3. Backend: The Publishing Orchestrator

#### [MODIFY] [socialPublisher.ts](file:///C:/Users/hp/AndroidStudioProjects/onbar/lib/engines/socialPublisher.ts)
- **Meta Adapter**: Detailed logic for Instagram Container and Media Publish endpoints.
- **TikTok/X Adapters**: Placeholder structure for these specialized APIs.
- **Status Reconciliation**: Logic to update the `social_metrics` table after a post goes live.

---

### 🏛️ 4. Connected Channels & Accounts

#### [MODIFY] [accounts/page.tsx](file:///C:/Users/hp/AndroidStudioProjects/onbar/app/admin/(dashboard)/growth/accounts/page.tsx)
- **Token Management**: UI to view token expiration and trigger re-authorization.
- **Link Status**: Real-time "Health Check" for social API connections.

---

## Verification Plan

### Automated Tests
- `npm run build`: Verify 100% route success.
- Schema Integrity: Ensure all variants are correctly linked to their master content record.

### Manual Verification
1.  **Campaign Creation**: Create a "Weekend Drop" master post and verify 3 platform-specific variants are generated.
2.  **Scheduling**: Set a post for tomorrow and verify it appears in the **Content Calendar**.
3.  **Account Link**: Connect a test Meta account and verify the "Active Link" status appears with an expiration date.
