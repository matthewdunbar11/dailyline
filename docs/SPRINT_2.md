# DailyLine Sprint 2 Plan

## 1. Sprint Outcome
Ship the next MVP slice focused on retention and reliability:
1. Settings-driven daily reminders with local notifications.
2. Export/backup of local data to JSON.
3. E2E automation wired for core flows.
4. Build/compile verification for mobile targets.

## 2. Scope (Sprint 2)
In:
1. Settings screen reminder toggle + time picker, with persistence.
2. Local notification scheduling + permission handling UX.
3. Export flow that writes JSON containing entries/settings/schema version.
4. Maestro E2E automation for core journaling flows (today entry, history search).
5. Build verification for iOS/Android and CI smoke checks.

Out:
1. In-app purchases and premium entitlement flow.
2. Ads integration.
3. AI insights.
4. Import/restore from export file.

## 3. Build Order
1. Settings UI + settings repository wiring for reminders/export.
2. Notification scheduling service with permission prompts and error states.
3. Export service and file sharing UX (platform-appropriate).
4. Update domain tests for reminder/export logic.
5. Maestro E2E coverage for core journaling + reminder toggle.
6. CI updates to run unit tests + E2E smoke suite.

## 4. Definition of Done
1. Reminder can be enabled/disabled and scheduled at a user-selected time.
2. Permission-denied state shows guidance without blocking app use.
3. Export produces a JSON file with schema version, entries, and settings.
4. E2E tests cover create/edit today entry, history search, reminder toggle.
5. Unit tests for reminder scheduling and export data formatting pass.
6. Mobile build/compile verification passes for iOS/Android targets.

## 5. Suggested Tickets
1. `S2-001`: Build reminder settings UI + persistence.
2. `S2-002`: Implement notification scheduling + permission UX.
3. `S2-003`: Implement export/backup service and share flow.
4. `S2-004`: Add unit tests for reminder/export logic.
5. `S2-005`: Add Maestro E2E coverage for core flows.
6. `S2-006`: Wire CI to run unit + E2E smoke checks.

## 6. Sprint 2 Implementation Review (Latest)

### Completed
- TBD

### Gaps / Follow-ups
- TBD

## 7. Final Review & Summary
- TBD
