# DailyLine Sprint 3 Plan

**Status:** Planned (created February 8, 2026)

## 1. Planning Context (MVP + Current State Review)
From `MVP_SPEC.md` and shipped sprint docs:
1. Sprint 1/1B/2 delivered journaling core, UI polish, reminders, and export.
2. Premium monetization requirements are still open: purchase flow, entitlement cache, restore purchases, and ads removal behavior.
3. E2E coverage is below MVP expectation (single Maestro stub, not CI-enforced).

Sprint 3 maps to MVP Implementation Phase 5 and monetization acceptance criteria.

## 2. Sprint Outcome
Ship the monetization slice with stable entitlement behavior:
1. Premium purchase flow works on iOS/Android sandbox paths.
2. Entitlement is cached locally and restored on app launch and restore action.
3. Ads display only for free users and disappear immediately on premium unlock.
4. Premium-related critical flows are covered by unit + E2E smoke tests.

## 3. Scope (Sprint 3)
In:
1. IAP service integration for one non-consumable lifetime product.
2. Entitlement repository and caching (`free` / `premium` / `unknown`) with last-check timestamp.
3. Settings premium section: upgrade CTA, current plan state, restore purchases action.
4. Feature access and paywall mapping service aligned to `docs/FEATURE_FLAGS.md`.
5. Ad wrapper integration (unobtrusive placements) with entitlement-based hide/show behavior.
6. Error handling for store unavailability and retry-safe UX messaging.
7. Unit tests for entitlement transitions and feature access behavior.
8. Maestro flows for purchase/restore/ads-removal behavior (smoke subset runnable in CI/nightly).

Out:
1. Premium AI insights generation (Sprint 4).
2. Any backend receipt validation or account-based restore.
3. Import flow for exported data.

## 4. Build Order
1. Add purchase config constants and IAP service wrapper.
2. Add entitlement repository + persistence and app-launch refresh behavior.
3. Implement `FeatureAccessService` and wire key gates (premium + ads) to screens.
4. Build Settings premium UI (upgrade + restore + status states).
5. Add ad placement wrapper and entitlement-based hide logic.
6. Add tests for entitlement state transitions and gate behavior.
7. Add Maestro purchase/restore/ads smoke flows and CI wiring.

## 5. Definition of Done
1. Premium purchase succeeds in sandbox/mock test path and updates entitlement state.
2. Restore purchase recovers entitlement for same-platform reinstall scenarios.
3. Last known entitlement is used if store check is temporarily unavailable.
4. Free users see ads; premium users do not; journaling flows remain non-blocked.
5. Free users see locked premium AI preview card placeholders (no AI outputs yet).
6. Unit tests cover entitlement transitions and gate matrix.
7. E2E smoke includes purchase or mocked unlock, restore, and ad-removal assertion.
8. PR CI runs unit tests; E2E smoke runs on PR or nightly.

## 6. Suggested Tickets
1. `S3-001`: Add IAP product config and purchase service wrapper.
2. `S3-002`: Implement entitlement repository and cached-state fallback.
3. `S3-003`: Implement `FeatureAccessService` and gate matrix tests.
4. `S3-004`: Build Settings premium section with upgrade + restore actions.
5. `S3-005`: Integrate ad wrapper and entitlement-driven ad removal.
6. `S3-006`: Add unit tests for entitlement transitions + gate behavior.
7. `S3-007`: Add Maestro purchase/restore/ads smoke flows.
8. `S3-008`: Wire CI E2E smoke execution.

## 7. Risks and Controls
1. Risk: Store/SDK instability delays validation.
- Control: isolate store calls behind service adapter and support mockable test mode.
2. Risk: Entitlement race conditions cause flicker or incorrect access.
- Control: treat `unknown` as `free` for premium gates until resolved.
3. Risk: Ads affect primary journaling flow.
- Control: enforce placement rules and no interstitials in Today/History write/read paths.
4. Risk: E2E purchase flows are flaky in CI.
- Control: define deterministic smoke path with mocked entitlement where full sandbox cannot run.

## 8. Sprint 3 Planning Review Summary
1. Reviewed `MVP_SPEC.md` implementation phases 5 and acceptance criteria 10-12, 18-20, 23.
2. Reviewed `docs/SPRINT_1.md`, `docs/SPRINT_1B.md`, `docs/SPRINT_2.md` to avoid overlap.
3. Verified current repo does not yet implement IAP, entitlement management, or ads integration.


## 9. Planning Status Update (February 8, 2026)
1. Added `docs/SPRINT_BACKLOG.md` with prioritized Sprint 3 and Sprint 4 board sequencing.
2. Implemented `S3-001` scaffold in `src/services/iap/` (status: done for planning/architecture slice):
- Lifetime premium product config.
- Pluggable IAP client interface with unavailable fallback.
- Service wrapper for product lookup, purchase, and restore operations.
- Unit tests for config and service behavior.
