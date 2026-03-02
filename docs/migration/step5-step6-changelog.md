# Step-5 + Step-6 Changelog (SaaS beta-ready backend skeleton)

## Added capabilities
- Tenant onboarding flow (`create tenant + subscription bootstrap`) with default policy.
- Service/admin billing endpoints for plan/state management.
- Persistence-ready repository interfaces for subscriptions and usage (tenant-aware contracts).
- Expanded plan-gating across bikes, rentals, documents, clients, payments.
- Usage counters policy with increment/check/reset-monthly skeleton.
- Unified access errors:
  - `TENANT_DENIED`
  - `PLAN_DENIED`
- E2E happy-path and negative lifecycle tests.
- Combined tenant+plan gate ordering tests.

## Test run
- Command: `npm test`
- Result: all tests green (see latest CI/local run output).

## Persistence extension points
- `SubscriptionRepository` (replace in-memory adapter with DB impl)
- `UsageRepository` (replace in-memory adapter with DB impl + monthly reset scheduler)
- Tenant onboarding can be wired to transactional DB flow when persistence is added.
