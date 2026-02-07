# DailyLine MVP Specification

## 1. Product Summary
DailyLine is a micro-journaling app where users write one short line per day.

Positioning for MVP:
- Local-only storage (no backend, no accounts, no cloud sync)
- Security by architecture (data remains on device)
- Mobile-first experience with React Native + Expo
- Optional React Native Web support for local feature verification

## 2. MVP Goals
1. Let users write today's entry in under 15 seconds.
2. Encourage consistency through streak feedback.
3. Make past entries easy to browse (read-only history).
4. Provide daily reminder notifications at a user-configured time.

## 3. Scope
### 3.1 In Scope
1. Create/edit today's entry only.
2. View historical entries via combined calendar + search view.
3. Streak tracking (current streak, longest streak).
4. Optional mood and tags on entries.
5. Local persistence on device.
6. Local export/backup (file export).
7. Configurable daily reminder time.
8. Premium mode with in-app purchase entitlement.

### 3.2 Explicitly Out of Scope (MVP)
1. Any backend, API, or cloud sync.
2. User authentication/accounts.
3. Privacy controls (PIN, biometric lock, encryption UX controls).
4. Editing or adding entries for prior days.
5. Social features/sharing feed.
6. Rich media attachments.
7. Cross-device premium restore via account login.

## 4. Platform & Tech Direction
- App framework: React Native + Expo
- Primary targets: iOS and Android
- Optional target: React Native Web (for local feature verification only)
- Local data: SQLite (recommended) with a small repository layer
- Notifications: Expo Notifications for local scheduled reminders
- In-app purchases: StoreKit (iOS) and Google Play Billing (Android) via Expo IAP module

## 5. User Experience Requirements
### 5.1 Core UX Principles
1. Default screen is "Today's Line".
2. Minimal friction: fast open, fast write, fast save.
3. Motivating progress cues: streak and consistency visualization.
4. Calm, uncluttered interface.

### 5.2 Primary Screens
1. Today
2. History
3. Insights (streak + simple monthly consistency)
4. Settings

## 6. Functional Requirements
### 6.1 Entry Rules
1. One entry per local calendar day, based on device timezone.
2. User may create and edit only today's entry.
3. Prior-day entries are read-only.
4. If no entry exists for today, show empty compose state.
5. If entry exists for today, show editable existing state.

### 6.2 Entry Fields
- `date` (YYYY-MM-DD, local date key)
- `text` (short journal line)
- `mood` (optional single value)
- `tags` (optional list of strings)
- `createdAt`
- `updatedAt`

### 6.3 History
1. Show entries in reverse chronological order.
2. Allow browsing by date and selecting an entry to read details.
3. Historical entries are not editable.
4. Provide a combined calendar + search experience for finding past entries.
5. Basic search supports text match and date filtering.

### 6.4 Streak Logic
1. Current streak: consecutive days ending today where an entry exists each day.
2. Longest streak: max consecutive-day run in stored entries.
3. Missing a day resets current streak.
4. Streak is derived from entry dates; no manual override.

### 6.5 Reminders
1. User can enable/disable daily reminder.
2. User can set reminder time (hour/minute, local time).
3. App schedules one local notification per day at configured time.
4. If permission is denied, app shows non-blocking guidance in Settings.

### 6.6 Export/Backup
1. User can export all local entries/settings to a JSON file.
2. Export must include schema version for future compatibility.
3. No import required for MVP (optional post-MVP).

### 6.7 Premium Mode (In-App Purchase)
1. App provides a premium entitlement unlocked through in-app purchase.
2. Entitlement state is cached locally and checked on app launch.
3. Premium gating is feature-based and controlled by entitlement checks.
4. App includes "Restore Purchases" action for same-platform recovery where supported.
5. If store check fails temporarily, app keeps last known entitlement and retries later.
6. No backend receipt validation in MVP (store/device-validated only).
7. Premium entitlement removes all in-app ads.

### 6.8 Ads (Free Tier)
1. Free users see unobtrusive ad placements.
2. Ads must not block primary journaling actions (write/save/view history).
3. Ads are hidden immediately when premium entitlement is active.
4. If ad network is unavailable, app remains fully functional and shows empty ad slots or collapses them.
5. No interstitial ads during core journaling flow.

### 6.9 Premium AI Insights Scope (Local-Only)
All AI insight computation runs on-device and uses only local journal data.

1. AI Sentiment Timeline
- Compute sentiment score per entry.
- Show weekly/monthly trend visualization.
- Show period-over-period change summary.

2. Mood Pattern Detection
- Detect recurring mood patterns by day-of-week and time-of-day.
- Surface simple pattern statements (for example, calmer weekends).

3. Trigger and Theme Mining
- Extract recurring themes/topics from entries.
- Correlate themes with sentiment direction where signal is sufficient.

4. Streak Quality Metrics
- Add quality-oriented metrics beyond streak count (for example, consistency score).
- Explain score in plain language to avoid black-box feel.

5. Early Warning Signals
- Detect sustained negative trend windows across recent entries.
- Provide gentle non-clinical prompts for reflection.

6. Weekly AI Reflection
- Generate a short weekly summary from local entries.
- Include key wins, stressors, and suggested reflection prompt.

7. Compare Periods
- Compare current month vs previous month for sentiment and theme deltas.
- Surface concise "up/down/no-change" summaries in Insights.

Constraints:
- No cloud inference or remote model calls.
- No medical/diagnostic claims.
- User can disable AI insights in Settings.

### 6.10 Premium Paywall Mapping (Free vs Premium)
| Area | Feature | Free | Premium |
| --- | --- | --- | --- |
| Today | Create/edit today's line | Yes | Yes |
| Today | Mood and tags on today's entry | Yes | Yes |
| History | Read-only history of entries | Yes | Yes |
| Insights | Current streak + longest streak | Yes | Yes |
| Insights | Monthly consistency count | Yes | Yes |
| Insights | AI sentiment timeline | No (locked preview card) | Yes |
| Insights | Mood pattern detection | No (locked preview card) | Yes |
| Insights | Trigger and theme mining | No (locked preview card) | Yes |
| Insights | Streak quality metrics | No (locked preview card) | Yes |
| Insights | Early warning signals | No (locked preview card) | Yes |
| Insights | Weekly AI reflection | No (locked preview card) | Yes |
| Insights | Compare periods (month vs month) | No (locked preview card) | Yes |
| Settings | Reminder toggle/time | Yes | Yes |
| Settings | Export JSON | Yes | Yes |
| Settings | Restore purchase / manage premium | No | Yes |
| All screens | Ads | Yes (unobtrusive) | No |

Paywall behavior rules:
1. Locked cards show value summary and "Upgrade to Premium" CTA.
2. Free users can see locked feature names but not generated AI outputs.
3. Premium unlock is immediate after entitlement confirmation.
4. If entitlement check is temporarily unavailable, use last known local premium status.
5. AI outputs are never sent off-device for free or premium users.
6. Premium entitlement also acts as "Remove Ads".

## 7. Data Model (Local)
### 7.1 Entry
- `id: string`
- `date: string` (YYYY-MM-DD)
- `text: string`
- `mood?: string | null`
- `tags?: string[]`
- `createdAt: string` (ISO timestamp)
- `updatedAt: string` (ISO timestamp)

### 7.2 UserSettings
- `timezone: string` (IANA, device-default initially)
- `reminderEnabled: boolean`
- `reminderHour: number`
- `reminderMinute: number`
- `theme: "system" | "light" | "dark"` (optional for MVP; default `system`)
- `premiumStatus: "free" | "premium"`
- `aiInsightsEnabled: boolean` (default `true` for premium, user-configurable)

### 7.3 AppMeta
- `schemaVersion: number`
- `lastEntitlementCheckAt?: string` (ISO timestamp)

### 7.4 PurchaseConfig
- `productId: string`
- `platform: "ios" | "android"`
- `type: "non_consumable"` (chosen for MVP)

## 8. Screen-by-Screen Behavior
### 8.1 Today Screen
1. Header shows current date and current streak.
2. Main input captures today's line.
3. Optional mood selector and tags input.
4. Save action creates/updates today's entry.
5. If date rolls over while app is open, screen refreshes to new day state.

### 8.2 History Screen
1. Combined calendar + search layout for past entry discovery.
2. Calendar month view shows which days contain entries.
3. Selecting a date filters corresponding entry list/results.
4. Search input filters entries by basic text match.
5. Optional date filter (single day or month context) narrows search results.
6. Tap item to view full entry details (read-only).
7. No edit controls for non-today entries.

### 8.3 Insights Screen
1. Current streak.
2. Longest streak.
3. Monthly consistency count (days with entries / days in month).

### 8.4 Settings Screen
1. Reminder toggle.
2. Reminder time picker.
3. Notification permission status and link to system settings if blocked.
4. Export data action.
5. Premium section: upgrade CTA, current plan, restore purchases.
6. AI insights toggle and local-processing disclosure.

## 9. Edge Cases
1. Timezone changes: date resolution always follows current device timezone.
2. App opened after midnight without restart: Today screen should recompute date and lock prior day.
3. Duplicate-day protection: database enforces one entry per `date`.
4. Notification schedule updates immediately when reminder settings change.
5. Offline launch after purchase: app uses last known entitlement until next store check.
6. Store unavailable: purchase/restore actions fail gracefully with retry messaging.
7. Sparse data: AI insight modules degrade gracefully when entry count is too low.
8. AI disabled: premium AI modules and cards are hidden without affecting core journaling.

## 10. Acceptance Criteria (MVP)
1. User can create today's entry and later edit it on the same day.
2. User cannot create or edit yesterday/older entries through UI.
3. History displays all saved entries in correct date order.
4. Calendar view correctly marks days with entries in the selected month.
5. Basic search returns matching entries by text and supports date-based narrowing.
6. Current streak and longest streak calculate correctly across at least 30 days of test data.
7. Reminder can be set to a specific time and triggers local notification (device permission granted).
8. Export creates a JSON file containing entries, settings, and schema version.
9. App functions fully offline for all MVP features.
10. User can successfully purchase premium on iOS/Android sandbox environments.
11. Premium features unlock immediately after successful purchase.
12. Restore purchases recovers entitlement on reinstall on same platform where supported.
13. Sentiment timeline renders for users with sufficient entry history.
14. Mood pattern detection produces interpretable day/time patterns when sufficient data exists.
15. Theme mining surfaces recurring topics without network calls.
16. Weekly AI reflection generates on-device from local data only.
17. AI insights can be disabled in Settings.
18. Free users see locked preview cards for premium AI features with working upgrade CTA.
19. Free users see unobtrusive ads without blocking journaling actions.
20. Ads are removed immediately after successful premium purchase or restore.
21. Premium users can compare current month vs previous month sentiment/theme deltas on-device.
22. Core business logic has unit tests with stable, repeatable coverage.
23. Critical user flows are covered by automated E2E tests on mobile builds.

## 11. Implementation Phases
1. Foundation: project setup, navigation, local DB layer, base theme.
2. Journaling Core: Today entry create/edit rules and persistence.
3. History + Insights: read-only history, streak calculations, metrics UI.
4. Reminders + Export: settings, notification scheduling, JSON export.
5. Premium IAP: product config, purchase flow, entitlement cache, restore flow.
6. Premium AI Insights: sentiment, mood patterns, theme mining, streak quality, warnings, weekly reflection, compare periods.
7. QA pass: date boundaries, timezone behavior, offline behavior, store sandbox tests, AI offline checks.

Testing policy for all phases:
1. Every feature change includes updated unit tests in the same PR.
2. Critical user-flow changes include updated or new Maestro E2E coverage in the same PR.
3. No phase is considered complete unless relevant tests are added/updated and passing.

## 12. Monetization Choice (Locked)
Premium uses a lifetime unlock in-app purchase (`non_consumable`) for MVP.

## 13. Testing Strategy
Testing is continuous and integrated into development, not a standalone feature.

### 13.1 Unit Tests (Required)
Unit tests are required for deterministic, non-UI logic:
1. Date/day resolution logic (local date key, day rollover behavior).
2. Streak calculations (current and longest streak across edge cases).
3. Entry rules (one entry per day, non-today read-only constraints).
4. Search/filter logic (text match + date filtering behavior).
5. Premium entitlement state transitions (free -> premium, restore, cached fallback).
6. AI insight aggregations (sentiment trend math, month-over-month compare deltas).

Recommended stack:
- Test runner: Jest
- RN test utilities: `@testing-library/react-native` (for component-level behavior where needed)

### 13.2 E2E Tests (Required)
Automated E2E tests are required for critical user journeys.

Recommended tool:
- Maestro

Minimum E2E scenarios:
1. Create and edit today's entry.
2. Verify prior-day entries are read-only.
3. History calendar marks entry days and search finds matching text.
4. Enable reminder and set reminder time.
5. Purchase premium (sandbox/mock flow), verify unlock state and ads removed.
6. Restore purchases and verify entitlement recovery.
7. Verify premium AI cards are locked for free and unlocked for premium.

### 13.3 CI Expectations
1. Unit tests run on every pull request.
2. At least a smoke subset of Maestro E2E runs on pull request or nightly.
3. Release builds require passing unit tests + E2E smoke suite.
