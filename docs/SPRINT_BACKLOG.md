# DailyLine Sprint Backlog Board

**Last Updated:** February 8, 2026

## Board Columns
1. `Now`: Blockers and prerequisites for the current sprint.
2. `Next`: Ready after current sprint checkpoints pass.
3. `Later`: Explicitly sequenced after dependency completion.

## Sprint 3 Backlog (Monetization)
| Priority | Ticket | Description | Dependency | Column | Status |
| --- | --- | --- | --- | --- | --- |
| P0 | `S3-001` | Add IAP product config and purchase service wrapper | None | Now | Done |
| P0 | `S3-002` | Implement entitlement repository and cached-state fallback | S3-001 | Now | Done |
| P0 | `S3-003` | Implement `FeatureAccessService` and gate matrix tests | S3-002 | Now | Done |
| P0 | `S3-004` | Build Settings premium section (upgrade + restore) | S3-001, S3-002 | Next | Done |
| P1 | `S3-005` | Integrate ad wrapper and entitlement-driven ad removal | S3-003 | Next | Done |
| P1 | `S3-006` | Add unit tests for entitlement transitions + gate behavior | S3-002, S3-003 | Next | Done |
| P1 | `S3-007` | Add Maestro purchase/restore/ads smoke flows | S3-004, S3-005 | Later | Done |
| P1 | `S3-008` | Wire CI E2E smoke execution | S3-007 | Later | Done |

## Sprint 4 Backlog (Premium AI)
| Priority | Ticket | Description | Dependency | Column | Status |
| --- | --- | --- | --- | --- | --- |
| P0 | `S4-001` | Implement sentiment timeline aggregation + tests | S3-003 | Done | Done |
| P0 | `S4-002` | Implement mood pattern and theme mining + tests | S3-003 | Done | Done |
| P0 | `S4-003` | Implement streak quality, early-warning, weekly reflection + tests | S3-003 | Done | Done |
| P0 | `S4-004` | Build Insights AI cards (locked/unlocked/insufficient-data) | S4-001, S4-002, S4-003 | Done | Done |
| P1 | `S4-005` | Wire Settings AI toggle + disclosure behavior | S4-004 | Done | Done |
| P1 | `S4-006` | Add Maestro AI gating/toggle flows | S4-004, S4-005 | Done | Done |
| P1 | `S4-007` | Expand CI E2E smoke for AI scenarios | S4-006 | Done | Done |

## Execution Notes
1. Sprint 3 P0 items are MVP-critical and gate Sprint 4 execution.
2. Sprint 3 E2E and CI work should be completed before starting Sprint 4 UI rollout.
3. Sprint 4 should start only when entitlement and gate behavior is stable in production-like testing.
