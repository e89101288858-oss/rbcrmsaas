# Billing Data Model Draft + Migration Path v1

## 1) Data model draft (tenant-aware)

### `tenants`
- `id` (PK)
- `name`
- `created_at`

### `subscriptions`
- `tenant_id` (PK, FK -> tenants.id)
- `plan` (`FREE|BASIC|PRO`)
- `state` (`trial|active|past_due|canceled`)
- `trial_ends_at` (nullable)
- `current_period_ends_at` (nullable)
- `updated_at`

### `usage_counters`
- `tenant_id` (PK, FK -> tenants.id)
- `bikes`
- `active_rentals`
- `documents_this_month`
- `clients`
- `payments_this_month`
- `updated_at`

## 2) Tenant isolation rules
- Every billing row is tenant-scoped by `tenant_id`.
- Read/write access is always bounded by auth tenant context.
- Service/admin APIs may mutate subscription state/plan explicitly per tenant.

## 3) Migration path v1 (incremental, non-breaking)
1. Keep existing in-memory adapters for local/dev fallback.
2. Introduce storage abstraction (`KeyValueStorage`).
3. Introduce persistent repos as primary path for billing usage/subscription logic.
4. Wire APIs to repository interfaces (already async and persistence-ready).
5. Next phase: swap JSON-file adapter with DB adapter implementing same interfaces.
6. Add transactional guarantees when moving to SQL/real DB.

## 4) Integrity checks
- Subscription lifecycle transitions remain constrained by state machine.
- Usage counters increment only after successful gated operation.
- Monthly reset affects only monthly metrics (`documents_this_month`, `payments_this_month`).

## 5) Rollout note
- Current persistent adapter is file-backed and suitable for dev/test skeleton.
- Production persistence should implement same repository interfaces with DB + migrations.
