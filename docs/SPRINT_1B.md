# DailyLine Sprint 1B Plan (Pre-Sprint 2)

**Status:** Planned

## 1. Sprint Outcome
Ship a lightweight UI polish pass that tidies the interface and adds icons to menu buttons to improve scan-ability without expanding feature scope.

## 2. Scope (Sprint 1B)
In:
1. Visual cleanup of primary screens (spacing, typography consistency, and minor alignment fixes).
2. Add icons to menu buttons in navigation/tabs to improve recognition.
3. Ensure iconography aligns with existing theme colors and accessibility contrast.
4. Update documentation to capture UI polish decisions.

Out:
1. Any net-new features or data model changes.
2. Navigation architecture changes (tabs/stack structure stay as-is).
3. Visual redesign or rebranding work.
4. New flows or integrations.

## 3. Build Order
1. Audit existing UI for inconsistencies (spacing, typography, button styles).
2. Select icon set compatible with Expo/React Native and current dependencies.
3. Apply icons to menu buttons and ensure labels remain readable.
4. Validate layout on core screens (Today, History, Insights, Settings).
5. Run unit tests and update sprint status notes.

## 4. Definition of Done
1. Menu buttons display icons consistently across primary navigation.
2. Interface spacing and typography align with the shared theme.
3. No regressions in navigation or screen layouts.
4. Unit tests pass.

## 5. Proposed Tickets
1. `S1B-001`: UI audit + capture spacing/typography inconsistencies across core screens.
2. `S1B-002`: Add icon set and map icons to tab/menu buttons with accessibility review.
3. `S1B-003`: Apply layout polish pass on Today, History, Insights, Settings screens.
4. `S1B-004`: Verify UI polish in simulator/web and document outcomes.
5. `S1B-005`: Normalize typography scale (titles, section headers, metadata) across core screens.
6. `S1B-006`: Align card/input corner radii and spacing rhythm across core screens.
7. `S1B-007`: Replace hard-coded calendar highlight color with theme token.

## 6. Risk / Notes
- Keep changes minimal to avoid scope creep before Sprint 2.
- Ensure icon usage does not introduce additional heavy dependencies.

## 7. Sprint 1B Implementation Review (Latest)

### Status Update
- Sprint 1B plan documented with UI polish scope and definition of done.
- `S1B-001` audit completed; follow-up tickets added for UI consistency cleanup.

### Ticket Status
- `S1B-001`: ✅ Completed (UI audit documented below).
- `S1B-002`: ⏳ Pending.
- `S1B-003`: ⏳ Pending.
- `S1B-004`: ⏳ Pending.
- `S1B-005`: 🆕 Proposed (normalize typography scale on core screens).
- `S1B-006`: 🆕 Proposed (align card/input corner radii and spacing).
- `S1B-007`: 🆕 Proposed (replace hard-coded calendar highlight color with theme token).

### UI Audit Notes (S1B-001)
- Typography scale varies between screens: Today section titles use 16px while Insights title is 20px and Settings title is 18px; entry metadata uses 12px in History while date label uses 14px in Today.
- Card corner radii differ: Today inputs/buttons use 12px, History entry cards use 12px, while Insights and Settings cards use 16px.
- Spacing rhythm differs: Today sections use 16px top margins; History list uses 12px gaps and 16px padding; Insights cards use 12px bottom margins.
- History calendar highlight uses a hard-coded `#DDE6FF` instead of a theme token, which may conflict with global color adjustments.
