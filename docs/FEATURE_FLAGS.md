# DailyLine Feature Flags (v1)

## 1. Purpose
Define a single source of truth for free vs premium behavior, ad visibility, and AI insight access.

## 2. Entitlement States
1. `free`
2. `premium`
3. `unknown` (temporary state while checking store/cache)

Policy:
1. `unknown` behaves as `free` for premium features.
2. `unknown` uses last cached entitlement for ad visibility when available.

## 3. Feature Access Matrix
`journal.today.write`
- Free: enabled
- Premium: enabled

`journal.history.read`
- Free: enabled
- Premium: enabled

`journal.history.search`
- Free: enabled
- Premium: enabled

`insights.core`
- Free: enabled
- Premium: enabled

`insights.ai.sentimentTimeline`
- Free: locked card
- Premium: enabled

`insights.ai.moodPatterns`
- Free: locked card
- Premium: enabled

`insights.ai.themeMining`
- Free: locked card
- Premium: enabled

`insights.ai.streakQuality`
- Free: locked card
- Premium: enabled

`insights.ai.earlyWarning`
- Free: locked card
- Premium: enabled

`insights.ai.weeklyReflection`
- Free: locked card
- Premium: enabled

`insights.ai.comparePeriods`
- Free: locked card
- Premium: enabled

`settings.restorePurchase`
- Free: hidden
- Premium: visible

`ads.display`
- Free: enabled
- Premium: disabled

## 4. Ad Rules
1. Ads must be unobtrusive and never block writing, saving, or reading entries.
2. No interstitials in core journaling flow.
3. On premium unlock, remove ads immediately.
4. If ad load fails, collapse slot or show non-blocking placeholder.

## 5. AI Toggle Rules
1. `aiInsightsEnabled` defaults to `true` for premium users.
2. When `aiInsightsEnabled = false`, hide AI cards even for premium.
3. Toggle does not affect core journaling features.

## 6. Implementation Guidance
1. Implement a `FeatureAccessService`:
- Inputs: `entitlement`, `aiInsightsEnabled`
- Output: boolean/locked state per feature key
2. Screens should query this service, not encode feature gates directly.
