# DailyLine Sprint 4 Plan

**Status:** Planned (updated February 8, 2026)

## 1. Planning Context (MVP + Current State Review)
From `MVP_SPEC.md`, current code, and prior sprint docs:
1. Core journaling, reminder, and export features are implemented.
2. Sprint 3 is planned to deliver IAP entitlement, restore purchases, and ads behavior.
3. MVP AI insight requirements are still open and require local-only computation with premium gating.

Sprint 4 maps to MVP Implementation Phase 6 and focuses on premium AI insights once Sprint 3 gates are in place.

## 2. Sprint Outcome
Ship premium AI insights that run fully on-device and respect entitlement and AI toggle controls:
1. Deliver MVP AI insight cards and deterministic local calculations.
2. Use Sprint 3 feature access gates for free locked vs premium unlocked behavior.
3. Expand unit and E2E coverage for AI gating and AI output stability.
4. Close MVP acceptance criteria around AI behavior and local-processing constraints.

## 3. Scope (Sprint 4)
In:
1. AI insight domain modules (local-only): sentiment timeline, mood patterns, theme mining, streak quality, early-warning trend detection, weekly reflection summary, compare periods.
2. Insights UI upgrades with locked preview cards for free users and full AI cards for premium users.
3. Settings wiring for `aiInsightsEnabled` toggle behavior and local-processing disclosure.
4. Sparse-data handling and non-clinical wording safeguards.
5. Unit tests for AI aggregation logic and period-over-period calculations.
6. Maestro E2E scenarios for free locked cards, premium unlocked cards, and AI toggle behavior.

Out:
1. Cloud inference, backend services, or account-linked AI processing.
2. Large visual redesign unrelated to AI insights.
3. Import/restore backup flow.

## 4. Dependencies / Prerequisites
Sprint 4 depends on Sprint 3 delivering:
1. Entitlement source of truth (`free` / `premium` / `unknown`) with cached fallback.
2. `FeatureAccessService` for feature gating and paywall behavior.
3. Settings premium section with upgrade/restore actions.

If Sprint 3 is partially complete, Sprint 4 starts with a short stabilization lane before AI rollout.

## 5. Build Order
1. Implement AI domain modules with deterministic inputs/outputs.
2. Add AI card state models (locked, unlocked, insufficient-data, disabled).
3. Wire AI cards into `app/(tabs)/insights.tsx` using Sprint 3 gating.
4. Add Settings AI toggle and disclosure text behavior.
5. Add unit tests for AI calculations and edge handling.
6. Add Maestro flows:
- Free user sees locked AI cards.
- Premium user sees unlocked AI cards.
- `aiInsightsEnabled = false` hides AI cards while core streak cards remain.
7. Extend CI E2E smoke coverage for AI gating scenarios.

## 6. Definition of Done
1. AI outputs are generated locally only, with no network dependency.
2. Free users see locked AI preview cards and upgrade CTA without generated AI output.
3. Premium users see AI outputs immediately when entitlement is premium.
4. `aiInsightsEnabled = false` suppresses AI cards and does not affect core streak metrics.
5. Sparse data produces clear fallback copy instead of misleading insights.
6. Unit tests cover AI aggregation math, compare-period deltas, and edge thresholds.
7. E2E smoke validates locked/unlocked/toggle states.

## 7. Suggested Tickets
1. `S4-001`: Implement sentiment timeline aggregation + tests.
2. `S4-002`: Implement mood pattern and theme mining modules + tests.
3. `S4-003`: Implement streak quality, early-warning, and weekly reflection modules + tests.
4. `S4-004`: Build Insights AI cards with locked/unlocked/insufficient-data states.
5. `S4-005`: Wire Settings AI toggle and disclosure behavior.
6. `S4-006`: Add Maestro AI gating/toggle flows.
7. `S4-007`: Expand CI E2E smoke for AI scenarios.

## 8. Risks and Controls
1. Risk: AI outputs are noisy with limited entry history.
- Control: define minimum-data thresholds and explicit fallback messaging.
2. Risk: Locale/timezone boundaries skew trend windows.
- Control: normalize date buckets using existing date-key helpers and add boundary tests.
3. Risk: Gate drift between screens causes inconsistent lock states.
- Control: use Sprint 3 `FeatureAccessService` as single gate source.
4. Risk: E2E instability slows releases.
- Control: maintain deterministic smoke subset and run broader suite nightly.

## 9. Sprint 4 Planning Review Summary
1. Reviewed MVP AI acceptance criteria (13-17, 21, 23) and phase ordering.
2. Reviewed Sprint 1/1B/2 outputs and Sprint 3 planned outputs for dependency alignment.
3. Confirmed AI modules and premium AI cards are not yet implemented in current repo state.

