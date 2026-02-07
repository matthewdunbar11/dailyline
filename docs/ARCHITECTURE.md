# DailyLine Architecture (v1)

## 1. Goals
1. Local-only app (no backend, no auth, no cloud sync).
2. Mobile-first React Native + Expo architecture.
3. Deterministic business logic with strong unit test coverage.
4. Premium gating and ads controlled by a single entitlement source.

## 2. Stack
1. Runtime/UI: Expo + React Native + TypeScript
2. Navigation: Expo Router
3. Storage: Expo SQLite
4. Notifications: `expo-notifications`
5. In-app purchase: Expo IAP module (StoreKit/Play Billing)
6. Ads: platform ad SDK wrapper (free tier only)
7. Unit tests: Jest
8. E2E tests: Maestro

## 3. Module Boundaries
`src/app/`
- Route/screens only (no business logic).

`src/features/journal/`
- Today entry use-cases (create/edit today's line, read-only history behavior).

`src/features/history/`
- Combined calendar + search orchestration.

`src/features/insights/`
- Streak calculations and premium AI insight orchestration.

`src/features/premium/`
- Entitlement checks, paywall mapping helpers, remove-ads behavior.

`src/features/settings/`
- Reminder settings, AI toggle, export action wiring.

`src/data/`
- Repository interfaces + SQLite implementations.

`src/domain/`
- Pure business logic and value objects (date keys, streak math, search filters).

`src/services/`
- Notifications, ads, IAP, export adapters.

`src/lib/`
- Shared utilities, date helpers, constants.

## 4. Repository Interfaces (Core)
`EntryRepository`
1. `getByDate(dateKey)`
2. `upsertToday(entryInput, now)`
3. `listByDateRange(startDateKey, endDateKey)`
4. `search({ text?, dateKey?, monthKey? })`

`SettingsRepository`
1. `getSettings()`
2. `updateSettings(patch)`

`EntitlementRepository`
1. `getEntitlement()`
2. `setEntitlement(status, checkedAt)`

`InsightsRepository`
1. `getStreakStats()`
2. `getMonthlyConsistency(monthKey)`
3. `getSentimentTimeline(range)`

## 5. Data & Rules
1. `entries.date` is unique (one entry/day).
2. Date key format is `YYYY-MM-DD` in device local timezone.
3. Only today can be created/edited.
4. Historical entries are read-only in UI and domain rules.
5. Premium entitlement controls both AI features and ad removal.

## 6. Cross-Cutting Concerns
1. Feature gating:
- Use a single `FeatureAccess` helper to avoid gate drift across screens.
2. Offline behavior:
- Core features always function without network.
3. Error handling:
- Fail closed for premium features (show locked state if uncertain).
- Fail open for core journaling (never block entry write/read flows).

## 7. Testing Strategy (Integrated)
1. Keep domain logic pure and unit-testable.
2. Write tests in same PR as implementation changes.
3. Cover critical flows with Maestro (create entry, history/search, premium unlock).
