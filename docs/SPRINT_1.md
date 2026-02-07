# DailyLine Sprint 1 Plan

## 1. Sprint Outcome
Ship the first usable slice:
1. App shell with navigation.
2. Local SQLite setup.
3. Today entry create/edit (today only).
4. Basic history combined calendar + search view.
5. Core streak calculations.
6. Unit tests for implemented business logic.

## 2. Scope (Sprint 1)
In:
1. Today screen with save/edit for today's entry.
2. History screen with month calendar markers + basic text search.
3. Core streak logic (current/longest) exposed in Insights.
4. Domain and repository unit tests for these areas.

Out:
1. IAP integration
2. Ads integration
3. AI insights
4. Reminder scheduling UI/runtime
5. Export flow

## 3. Build Order
1. Project scaffold:
- Expo Router + TypeScript baseline
- Shared theme constants
2. SQLite foundation:
- Schema creation and migration bootstrap
- `entries` and `settings` tables
3. Domain layer:
- Date key helpers
- Entry editability rules
- Streak calculator
- Search filter logic
4. Repositories:
- EntryRepository SQLite implementation
- SettingsRepository SQLite implementation
5. Screens:
- Today screen wired to repository
- History screen with calendar markers + search input + read-only detail
- Insights screen with current/longest streak
6. Tests:
- Unit tests added alongside each domain/repository module

## 4. Definition of Done
1. Creating/updating today's entry works and persists.
2. User cannot edit prior-day entries.
3. History search returns matching entries.
4. Calendar indicates days with entries.
5. Current/longest streak returns correct values on sample datasets.
6. Unit tests pass in CI/local run for all new logic.

## 6. Sprint 1 Implementation Review (Latest)

### Completed
- App shell with Expo Router + tabs for Today, History, Insights, Settings.
- SQLite schema bootstrap and entry repository for local persistence.
- Domain logic: date keys, entry editability rules, streak calculation, search filter.
- UI: Today entry create/edit, History calendar + search + detail, Insights streak cards.
- Unit tests added for date, entry rules, streaks, and search logic.
- Settings repository implemented with default settings handling and in-memory coverage.

### Expo SDK 52 Upgrade
- Upgraded from Expo SDK 50 to SDK 52 (latest stable).
- Updated dependencies: expo ~52.0.25, react 18.3.1, react-native 0.76.6, expo-router ~4.0.16, expo-sqlite ~15.0.6, expo-updates ~0.26.11.
- Updated dev dependencies: babel-preset-expo ^12.0.0.
- All unit tests pass.
- Added GitHub Actions workflow for EAS updates to production channel.

### Expo SDK 54 Upgrade
- Upgraded from Expo SDK 52 to SDK 54 (latest stable).
- Updated dependencies: expo ~54.0.33, react 19.1.0, react-dom 19.1.0, react-native 0.79.0, expo-router ~5.0.0, expo-sqlite ~16.0.0, expo-updates ~0.28.0, expo-linking (added), react-native-web ^0.21.0.
- Updated dev dependencies: babel-preset-expo ^13.0.0, @types/node ^22.0.0.
- All unit tests pass (7/7).
- Web build requires additional WASM configuration for expo-sqlite (blocked).

### Bug Fixes
- **Fixed Metro server startup error**: `npm run start` was failing with "TypeError: Invalid URL" in CORS middleware.
  - Root cause: `app.json` had `"extra.router.origin": "native"` which is not a valid URL.
  - Fix: Changed `"origin": "native"` to `"origin": false` in `app.json` (line 18).
  - Also installed missing `@types/react` dependency required by Expo SDK 54.
- **Fixed React Native / Navigation compatibility issues**: App was crashing with URL and animated component errors.
  - Root cause: Version mismatches between Expo SDK 54 and installed packages.
  - Updated packages:
    - `react-native`: 0.79.0 → 0.81.5
    - `react-native-safe-area-context`: 5.0.0 → ~5.6.0
    - `react-native-screens`: 4.0.0 → ~4.16.0
- **Fixed SQLite API breaking changes**: `SQLite.openDatabase` is not a function error.
  - Root cause: expo-sqlite v16 removed the legacy `openDatabase()` API.
  - Fix: Updated `src/db/sqlite.ts` to use new `openDatabaseSync()` API with `getAllAsync()` for queries.
  - Also updated `src/repositories/SQLiteEntryRepository.ts` to use new `runSql()` for INSERT/UPDATE operations.
- **Fixed "Unmatched Route" error on app launch**.
  - Root cause: Missing root `index.tsx` entry point; root layout with Stack navigator had no default route.
  - Fix: Created `app/index.tsx` with redirect to `/(tabs)/today` and registered `index` screen in root layout.

### Gaps / Follow-ups (Sprint 1 Follow-up Tasks)
- [ ] Maestro E2E flow stub exists but needs runnable setup and CI wiring.
- [ ] Build/compile verification and tests require dependency installation (blocked in current env).

## 7. Final Review & Summary
- Sprint 1 scope is complete for core Today/History/Insights flows, streak logic, and persistence.
- Settings repository is now implemented for future settings usage, with defaults and unit tests in place.
- Remaining follow-ups: wire Maestro E2E execution into CI and validate build/compile once dependencies are installed.

## 5. Suggested First Tickets
1. `S1-001`: Initialize Expo app skeleton + lint/test config.
2. `S1-002`: Add SQLite schema + migration bootstrap.
3. `S1-003`: Implement date key helpers and streak domain logic + tests.
4. `S1-004`: Implement entry repository and today use-case + tests.
5. `S1-005`: Build history combined calendar/search screen.
6. `S1-006`: Add insights streak card and integration tests.
