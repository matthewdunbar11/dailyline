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

### Gaps / Follow-ups
- Settings repository/table usage not implemented yet (only schema exists).
- Maestro E2E flow stub exists but needs runnable setup and CI wiring.
- Build/compile verification and tests require dependency installation (blocked in current env).

## 5. Suggested First Tickets
1. `S1-001`: Initialize Expo app skeleton + lint/test config.
2. `S1-002`: Add SQLite schema + migration bootstrap.
3. `S1-003`: Implement date key helpers and streak domain logic + tests.
4. `S1-004`: Implement entry repository and today use-case + tests.
5. `S1-005`: Build history combined calendar/search screen.
6. `S1-006`: Add insights streak card and integration tests.
